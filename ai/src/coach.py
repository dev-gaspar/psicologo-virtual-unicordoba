# src/coach.py
from typing import Dict, List, Optional
from dataclasses import dataclass
import threading
import os
import unicodedata

try:
    from llama_cpp import Llama
except Exception as e:
    raise RuntimeError(
        "Falta la dependencia 'llama-cpp-python'. "
        "Instala con: pip install llama-cpp-python==0.2.76"
    ) from e


# =========================
# Configuración / Estrategia
# =========================

SYSTEM_PROMPT = (
    "Eres un coach emocional breve y empático. Responde en 2 a 5 oraciones, "
    "en español claro y tono humano. No hagas diagnósticos ni promesas. "
    "Si detectas riesgo (autolesiones, suicidio, violencia), indica que no puedes manejar emergencias "
    "y sugiere buscar ayuda profesional y hablar con alguien de confianza."
)

def strategy_for(emotion: str) -> str:
    strategies = {
        "alegria":  "Refuerza logros y sugiere un siguiente pequeño paso para mantener el impulso.",
        "tristeza": "Valida la emoción, ofrece un paso pequeño y alcanzable ahora mismo.",
        "enojo":    "Reconoce la molestia, separa hechos de juicios y ofrece una acción concreta para recuperar control.",
        "miedo":    "Normaliza el temor, enseña respiración 4-4-4 en una línea y define un paso seguro.",
        "asco":     "Reconoce el rechazo, sugiere límites/higiene y una alternativa práctica.",
        "sorpresa": "Explora qué cambió, resume lo positivo/lo aprendido y sugiere siguiente paso.",
        "neutral":  "Haz 1 pregunta aclaratoria y propone un micro-objetivo.",
    }
    return strategies.get(emotion, "Sé empático y ofrece un paso pequeño y útil.")


# =========================
# Inicialización del modelo
# =========================

@dataclass
class LlamaConfig:
    model_path: str
    n_ctx: int = 4096
    n_threads: Optional[int] = None  # None => auto (os.cpu_count())
    n_gpu_layers: int = 0            # 0 = CPU puro; >0 si tienes GPU compatible
    verbose: bool = False

class _LlamaSingleton:
    _instance: Optional[Llama] = None
    _lock = threading.Lock()
    _cfg: Optional[LlamaConfig] = None

    @classmethod
    def init(cls, cfg: LlamaConfig) -> None:
        with cls._lock:
            if cls._instance is None:
                n_threads = cfg.n_threads or max(2, (os.cpu_count() or 4) // 2)
                cls._instance = Llama(
                    model_path=str(cfg.model_path),
                    n_ctx=cfg.n_ctx,
                    n_threads=n_threads,
                    n_gpu_layers=cfg.n_gpu_layers,
                    verbose=cfg.verbose,
                    logits_all=False,
                )
                cls._cfg = cfg

    @classmethod
    def get(cls) -> Llama:
        if cls._instance is None:
            raise RuntimeError("Llama no inicializado. Llama a init_llama(...) antes de usar coach_reply_llamacpp.")
        return cls._instance

    @classmethod
    def cfg(cls) -> LlamaConfig:
        if cls._cfg is None:
            raise RuntimeError("Config no inicializada.")
        return cls._cfg


def init_llama(
    model_path: str,
    n_ctx: int = 4096,
    n_threads: Optional[int] = None,
    n_gpu_layers: int = 0,
    verbose: bool = False,
) -> None:
    """Inicializa una única instancia de Llama en el proceso (llamar una vez al arrancar)."""
    cfg = LlamaConfig(
        model_path=str(model_path),
        n_ctx=n_ctx,
        n_threads=n_threads,
        n_gpu_layers=n_gpu_layers,
        verbose=verbose,
    )
    _LlamaSingleton.init(cfg)


# =========================
# Memoria conversacional
# =========================

# Diccionario de sesiones: cada clave es un session_id y el valor es el historial de mensajes
# Cada mensaje: {"role": "user" | "assistant", "content": "..."}
_CONVERSATIONS: Dict[str, List[Dict[str, str]]] = {}
_MAX_TURNS_PER_SESSION = 8  # mantener el prompt acotado (user+assistant pares)

def _ensure_session(session_id: str) -> None:
    if session_id not in _CONVERSATIONS:
        _CONVERSATIONS[session_id] = []  # historial vacío

def reset_session(session_id: str = "default") -> None:
    """Borra el historial de una sesión."""
    _CONVERSATIONS.pop(session_id, None)

def list_sessions() -> List[str]:
    return list(_CONVERSATIONS.keys())


# =========================
# Salvaguardas mínimas
# =========================

RISK_KEYWORDS = (
    "suicid", "autoles", "me quiero morir", "matarme", "quitarme la vida",
    "lastimarme", "hacerme daño", "dañar a alguien", "matar a alguien",
)

def detect_risk(text: str) -> bool:
    t = unicodedata.normalize("NFKD", text).casefold()
    return any(k in t for k in RISK_KEYWORDS)


# =========================
# Interfaz principal
# =========================

def coach_reply_llamacpp(
    user_text: str,
    emotion: str,
    session_id: str = "default",
    temperature: float = 0.7,
    top_p: float = 0.9,
    max_tokens: int = 256,
) -> str:
    """
    Genera una respuesta breve y empática con memoria por sesión.
    - session_id: permite múltiples conversaciones paralelas.
    - Llama debe estar inicializado con init_llama(...) previamente.
    """
    _ensure_session(session_id)

    # Pauta según emoción
    guide = strategy_for(emotion)

    # Guardrail básico: si se detecta riesgo, forzar pauta segura
    if detect_risk(user_text):
        guide += (
            " Importante: detecto posibles señales de riesgo. "
            "Indica con claridad que no puedes manejar emergencias y sugiere buscar ayuda profesional "
            "y hablar con alguien de confianza."
        )

    # Agregar entrada del usuario al historial de la sesión
    _CONVERSATIONS[session_id].append({"role": "user", "content": user_text})

    # Recortar historial si excede el máximo (mantener últimos turnos)
    if len(_CONVERSATIONS[session_id]) > 2 * _MAX_TURNS_PER_SESSION:
        _CONVERSATIONS[session_id] = _CONVERSATIONS[session_id][-2 * _MAX_TURNS_PER_SESSION :]

    # Construir mensajes para el chat
    history_msgs = []
    for m in _CONVERSATIONS[session_id]:
        if m["role"] == "user":
            history_msgs.append({"role": "user", "content": m["content"]})
        else:
            history_msgs.append({"role": "assistant", "content": m["content"]})

    # Contexto de sistema + guía
    system_context = (
        SYSTEM_PROMPT
        + "\n---\n"
        + f"Emoción actual detectada: {emotion}.\n"
        + f"Estrategia: {guide}\n"
        + "Responde en 2–5 oraciones, en español, manteniendo continuidad con el historial."
    )

    llm = _LlamaSingleton.get()

    out = llm.create_chat_completion(
        messages=[{"role": "system", "content": system_context}] + history_msgs,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
    )

    try:
        reply = out["choices"][0]["message"]["content"].strip()
    except Exception:
        reply = str(out).strip()

    # Añadir respuesta al historial
    _CONVERSATIONS[session_id].append({"role": "assistant", "content": reply})
    return reply


# =========================
# Ejemplo de uso directo
# =========================
if __name__ == "__main__":
    # 1) Inicializa una sola vez (ajusta la ruta a tu GGUF)
    # Recomendación para CPU: usa 3B para latencia baja; 8B es más pesado.
    init_llama(
        model_path=r"C:\modelos\llama3-3b-instruct-Q5_K_M.gguf",  # <-- CAMBIA A TU RUTA
        n_ctx=4096,
        n_threads=3,  # auto
        n_gpu_layers=10,  # 0 = CPU; >0 si tienes GPU compatible
        verbose=False,
    )

    # 2) Conversación con memoria (session_id="demo")
    sid = "demo"
    print(coach_reply_llamacpp("Hoy me fue mal en el examen y me siento desanimado.", "tristeza", session_id=sid))
    print(coach_reply_llamacpp("¿Qué hago mañana para mejorar?", "tristeza", session_id=sid))
    print(coach_reply_llamacpp("Gracias. ¿Algún consejo rápido más?", "tristeza", session_id=sid))
