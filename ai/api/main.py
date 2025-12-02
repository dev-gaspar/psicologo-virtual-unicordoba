# api/main.py
from pathlib import Path
import os
import sys

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ----- Rutas del proyecto para importar src/* -----
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))


MODEL_PATH = ROOT / "models" / "llama3-8b-instruct-Q5_K_M.gguf"


# ----- Importa clasificador y coach (con memoria) -----
from src.predict import predict_emotion, load_model
from src.coach import init_llama, coach_reply_llamacpp, reset_session

# ================================
# Configuración de la aplicación
# ================================
app = FastAPI(title="Emotion Classifier + Coach API", version="3.1.0")

# CORS abierto para desarrollo (ajusta en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # <- especifica tu dominio en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# Esquemas Pydantic
# ================================
class PredictIn(BaseModel):
    text: str
    top_k: int | None = 3

class PredictOut(BaseModel):
    label: str
    probability: float
    top_k: list

class CoachIn(BaseModel):
    text: str
    session_id: str | None = "default"  # permite hilos de conversación

class CoachOut(BaseModel):
    emotion: str
    advice: str
    session_id: str

# ================================
# Eventos de ciclo de vida
# ================================
@app.on_event("startup")
def _startup() -> None:
    """
    Carga el clasificador y el modelo Llama (GGUF) al iniciar la API.
    """
    # 1) Cargar clasificador multicategoría
    try:
        load_model()  # levanta models/emotion_clf.joblib
        print("[OK] Clasificador cargado.")
    except Exception as e:
        print(f"[AVISO] Clasificador no cargado aún: {e}")

    # 2) Inicializar Llama incrustado (llama-cpp-python)
    # Ruta por variable de entorno o por defecto en carpeta models/
    '''
    default_model_path = (ROOT / "models" / "llama3-8b-instruct-Q5_K_M.gguf")
    env_path = os.getenv("LLAMA_MODEL_PATH")  # str | None
    model_path = env_path if env_path else str(default_model_path)
    '''
    model_path = str(MODEL_PATH)

    # Ajustes de rendimiento: GPU parcial + 3 hilos
    try:
        init_llama(
            model_path=model_path,  # str (no Path)
            n_ctx=4096,
            n_threads=3,       # usa 3 núcleos; puedes probar 4–6
            n_gpu_layers=12,   # mueve ~20 capas a la GPU (ajusta según VRAM)
            verbose=False,
        )
        print(f"[OK] Llama inicializado con: {model_path}")
    except Exception as e:
        print(f"[AVISO] No se pudo inicializar Llama: {e}")

# ================================
# Rutas
# ================================
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictOut)
def predict(payload: PredictIn):
    """
    Devuelve emoción principal + top_k probabilidades.
    """
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="El campo 'text' es requerido.")
    try:
        res = predict_emotion(text, top_k=payload.top_k or 3)
        return res
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al predecir: {e}")

@app.post("/coach", response_model=CoachOut)
def coach(payload: CoachIn):
    """
    Usa el clasificador para detectar emoción y luego Llama (incrustado)
    para generar una respuesta empática y breve. Mantiene memoria por session_id.
    """
    text = (payload.text or "").strip()
    session_id = (payload.session_id or "default").strip() or "default"

    if not text:
        raise HTTPException(status_code=400, detail="El campo 'text' es requerido.")

    try:
        emo = predict_emotion(text, top_k=1)["label"]
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Modelo de emociones no disponible: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detectando emoción: {e}")

    try:
        reply = coach_reply_llamacpp(text, emo, session_id=session_id)
        return {"emotion": emo, "advice": reply, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando respuesta del coach: {e}")

@app.delete("/coach/session")
def coach_reset_session(session_id: str = Query("default", description="ID de la sesión a limpiar")):
    """
    Limpia el historial de conversación de una sesión (reinicia la memoria).
    """
    try:
        reset_session(session_id)
        return {"status": "ok", "message": f"Sesión '{session_id}' reiniciada."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo reiniciar la sesión: {e}")
