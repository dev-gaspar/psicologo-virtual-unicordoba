from __future__ import annotations
from pathlib import Path
import joblib
import numpy as np
from typing import Dict, Any

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "emotion_clf.joblib"

_artifact = None

def load_model():
    global _artifact
    if _artifact is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError("No se encontró el modelo multicategoría. Entrena con: python src/train_multi.py")
        _artifact = joblib.load(MODEL_PATH)
    return _artifact

def predict_emotion(text: str, top_k: int = 3) -> Dict[str, Any]:
    art = load_model()
    pipe = art["pipeline"]
    label_map = art["label_map"]

    proba = pipe.predict_proba([text])[0]  # shape (num_classes,)
    order = np.argsort(proba)[::-1]
    top_idx = order[:top_k]

    return {
        "label": label_map[int(top_idx[0])],
        "probability": float(proba[int(top_idx[0])]),
        "top_k": [
            {"label": label_map[int(i)], "prob": float(proba[int(i)])}
            for i in top_idx
        ]
    }
