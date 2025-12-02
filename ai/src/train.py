from __future__ import annotations
import sys
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction import text
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# Rutas del proyecto
ROOT = Path(__file__).resolve().parents[1]
DATA_POS = ROOT / "data" / "raw" / "positive.txt"
DATA_NEG = ROOT / "data" / "raw" / "negative.txt"
MODEL_PATH = ROOT / "models" / "sentiment_clf.joblib"

# Stopwords personalizadas en español (añadidas a las inglesas)
spanish_stopwords = text.ENGLISH_STOP_WORDS.union({
    "un", "una", "unos", "unas", "el", "la", "los", "las",
    "de", "del", "que", "en", "y", "a", "con", "por", "para",
    "como", "su", "sus", "se", "al", "lo", "es", "muy", "más",
    "pero", "sin", "ya", "le", "ha", "han", "fue", "son", "ser",
    "esto", "esta", "estas", "estos", "también", "me", "mi", "tu", "te", "si", "no"
})

def load_dataset() -> pd.DataFrame:
    """Carga los textos positivos y negativos desde data/raw"""
    if not DATA_POS.exists() or not DATA_NEG.exists():
        raise FileNotFoundError("No se encuentran positive.txt y/o negative.txt en data/raw/")
    pos = [line.strip() for line in DATA_POS.read_text(encoding="utf-8").splitlines() if line.strip()]
    neg = [line.strip() for line in DATA_NEG.read_text(encoding="utf-8").splitlines() if line.strip()]
    texts = pos + neg
    labels = [1] * len(pos) + [0] * len(neg)
    return pd.DataFrame({"text": texts, "label": labels})

def build_pipeline() -> Pipeline:
    """Crea el pipeline de procesamiento y modelo"""
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            analyzer="word",
            ngram_range=(1, 2),
            min_df=1,
            max_df=1.0,
            stop_words=list(spanish_stopwords)  # ✅ convertido a lista
        )),
        ("clf", LogisticRegression(max_iter=1000))
    ])

def main():
    df = load_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"].values, df["label"].values,
        test_size=0.25, random_state=42, stratify=df["label"].values
    )

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print("Reporte de clasificación:")
    print(classification_report(y_test, y_pred, target_names=["Negativo", "Positivo"]))

    artifact = {
        "pipeline": pipe,
        "label_map": {0: "Negativo", 1: "Positivo"}
    }
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print(f"✅ Modelo guardado en: {MODEL_PATH}")

if __name__ == "__main__":
    main()
