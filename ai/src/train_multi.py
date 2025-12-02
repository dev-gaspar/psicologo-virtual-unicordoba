from __future__ import annotations
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict

from datasets import load_dataset
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
from sklearn.feature_extraction import text

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "emotion_clf.joblib"

# ---------- Configura aquí el dataset ----------
DATASET = "fmplaza/EmoEvent"   # ↔ para 27 emociones usa: "mrm8488/go_emotions-es-mt"
LANG_FILTER = "es"             # filtramos español en EmoEvent
TEXT_COL = "tweet"             # EmoEvent: 'tweet'; GoEmotions-ES: 'text'
LABEL_COL = "label"            # columna de etiqueta (ambos datasets la exponen como 'label')
# ----------------------------------------------

# Stopwords ES simples (combinadas con EN por seguridad)
spanish_stopwords = text.ENGLISH_STOP_WORDS.union({
    "un","una","unos","unas","el","la","los","las","de","del","que","en","y","a","con","por","para",
    "como","su","sus","se","al","lo","es","muy","más","pero","sin","ya","le","ha","han","fue","son",
    "ser","esto","esta","estas","estos","también","me","mi","tu","te","si","no"
})

def load_emoevent_es() -> pd.DataFrame:
    ds = load_dataset(DATASET)  # train/test
    # Mantener solo español
    def is_es(example):
        # EmoEvent expone 'lang' o 'language' según versión; probamos ambos
        lang = example.get("lang", example.get("language", ""))
        return (lang or "").lower().startswith(LANG_FILTER)
    train = ds["train"].filter(is_es)
    test  = ds["test"].filter(is_es)

    # Asegura columnas
    for split in (train, test):
        if TEXT_COL not in split.column_names:
            raise ValueError(f"No encuentro columna de texto '{TEXT_COL}' en {DATASET}.")
        if LABEL_COL not in split.column_names:
            raise ValueError(f"No encuentro columna de etiqueta '{LABEL_COL}' en {DATASET}.")

    # A DataFrame
    dtrain = pd.DataFrame({ "text": train[TEXT_COL], "label": train[LABEL_COL] })
    dtest  = pd.DataFrame({ "text": test[TEXT_COL],  "label": test[LABEL_COL] })

    # Unimos para permitir split estratificado reproducible
    df = pd.concat([dtrain, dtest], ignore_index=True)
    # Limpieza mínima
    df["text"] = df["text"].fillna("").str.strip()
    df = df[df["text"] != ""].reset_index(drop=True)
    return df

def load_goemotions_es() -> pd.DataFrame:
    ds = load_dataset(DATASET)  # sólo 'train' con 54k instancias
    data = ds["train"]
    if TEXT_COL not in data.column_names:
        # GoEmotions-ES suele usar 'text'
        raise ValueError("No encuentro columna de texto 'text' en GoEmotions-ES.")
    if LABEL_COL not in data.column_names:
        raise ValueError("No encuentro columna 'label' en GoEmotions-ES.")

    df = pd.DataFrame({ "text": data["text"], "label": data["label"] })
    df["text"] = df["text"].fillna("").str.strip()
    df = df[df["text"] != ""].reset_index(drop=True)
    return df

def load_data() -> tuple[pd.DataFrame, List[str]]:
    if DATASET == "fmplaza/EmoEvent":
        df = load_emoevent_es()
        class_names = ["anger","disgust","fear","joy","sadness","surprise","others"]
    else:
        # 27 emociones de GoEmotions; el propio dataset trae mapeo id->nombre
        builder = load_dataset(DATASET)
        features = builder["train"].features
        class_names = features[LABEL_COL].names  # lista de nombres de clase
        df = load_goemotions_es()
    return df, class_names

def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            analyzer="word",
            ngram_range=(1,2),
            min_df=2,              # ligeramente más robusto
            max_df=0.9,
            stop_words=list(spanish_stopwords)
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            multi_class="auto",
            n_jobs=None
        ))
    ])

def main():
    df, class_names = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"].values, df["label"].values,
        test_size=0.2, random_state=42, stratify=df["label"].values
    )

    # Ponderación por clase para enfrentar desbalance
    classes = np.unique(y_train)
    weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
    class_weight_map: Dict[int, float] = { int(c): float(w) for c, w in zip(classes, weights) }

    pipe = build_pipeline()
    # Pasamos class_weight al estimador interno
    clf: LogisticRegression = pipe.named_steps["clf"]
    clf.set_params(class_weight=class_weight_map)

    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=[class_names[i] for i in range(len(class_names))]))

    artifact = {
        "pipeline": pipe,
        "label_map": { int(i): name for i, name in enumerate(class_names) }
    }
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print(f"✅ Modelo multicategoría guardado en: {MODEL_PATH}")

if __name__ == "__main__":
    main()
