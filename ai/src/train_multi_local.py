from pathlib import Path
import joblib
import pandas as pd
import numpy as np
import unicodedata
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from sklearn.utils.class_weight import compute_class_weight
from sklearn.feature_extraction import text
import warnings

# Silenciar warnings innecesarios
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn.feature_extraction.text")

# ==========================
# RUTAS
# ==========================
ROOT = Path(__file__).resolve().parents[1]
DATA_CSV = ROOT / "data" / "emotions_es_local.csv"
MODEL_PATH = ROOT / "models" / "emotion_clf.joblib"

# ==========================
# FUNCIONES AUXILIARES
# ==========================
def normalize(text: str) -> str:
    """Elimina acentos y convierte a minúsculas."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    ).lower()

# Stopwords base en inglés + español personalizado
spanish_stopwords = text.ENGLISH_STOP_WORDS.union({
    "un","una","unos","unas","el","la","los","las","de","del","que","en","y","a","con","por","para",
    "como","su","sus","se","al","lo","es","muy","más","mas","pero","sin","ya","le","ha","han","fue",
    "son","ser","esto","esta","estas","estos","también","tambien","me","mi","tu","te","si","no"
})

# Normalizar stopwords para que coincidan con la tokenización
spanish_stopwords = {normalize(w) for w in spanish_stopwords}

# ==========================
# ENTRENAMIENTO
# ==========================
def main():
    if not DATA_CSV.exists():
        raise FileNotFoundError(f"No existe el archivo: {DATA_CSV}")
    
    # Cargar dataset
    df = pd.read_csv(DATA_CSV)
    df["text"] = df["text"].fillna("").str.strip()
    df = df[df["text"] != ""].reset_index(drop=True)

    labels = sorted(df["label"].unique())
    label_to_id = {name: i for i, name in enumerate(labels)}
    id_to_label = {i: name for name, i in label_to_id.items()}

    y = df["label"].map(label_to_id).values
    X = df["text"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Pipeline TF-IDF + Logistic Regression
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            analyzer="word",
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.9,
            stop_words=list(spanish_stopwords)
        )),
        ("clf", LogisticRegression(max_iter=2000, multi_class="auto"))
    ])

    # Calcular pesos balanceados
    classes = np.unique(y_train)
    weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
    class_weight_map = {int(c): float(w) for c, w in zip(classes, weights)}
    pipe.named_steps["clf"].set_params(class_weight=class_weight_map)

    # Entrenar modelo
    print("Entrenando modelo...")
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    # Evaluar desempeño
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.4f}")
    target_names = [id_to_label[i] for i in range(len(labels))]
    print(classification_report(y_test, y_pred, target_names=target_names))

    # Guardar modelo entrenado
    artifact = {"pipeline": pipe, "label_map": id_to_label}
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n💾 Modelo guardado en: {MODEL_PATH}")

# ==========================
# EJECUCIÓN
# ==========================
if __name__ == "__main__":
    main()
