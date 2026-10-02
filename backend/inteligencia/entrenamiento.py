import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import sklearn

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split

from .procesamiento import (
    cargar_y_preparar_audio,
    extraer_caracteristicas,
)


CLASES = [
    "golpe",
    "puerta",
    "alarma",
    "aplausos",
    "vidrio",
    "ruido_elevado",
]

EXTENSIONES = {
    ".wav",
    ".flac",
    ".ogg",
}

MINIMO_POR_CLASE = 10

RAIZ_PROYECTO = (
    Path(__file__).resolve().parents[2]
)

RUTA_DATASET = (
    RAIZ_PROYECTO
    / "inteligencia-artificial"
    / "dataset"
)

RUTA_MODELOS = (
    Path(__file__).resolve().parent
    / "modelos"
)

RUTA_MODELO = (
    RUTA_MODELOS
    / "clasificador.joblib"
)

RUTA_METADATA = (
    RUTA_MODELOS
    / "metadata.json"
)


def obtener_archivos(clase):
    carpeta = RUTA_DATASET / clase

    if not carpeta.exists():
        raise FileNotFoundError(
            f"No existe la carpeta: {carpeta}"
        )

    return sorted([
        ruta
        for ruta in carpeta.rglob("*")
        if ruta.is_file()
        and ruta.suffix.lower() in EXTENSIONES
    ])


def cargar_dataset():
    X = []
    y = []

    errores = []

    for clase in CLASES:
        archivos = obtener_archivos(
            clase
        )

        if len(archivos) < MINIMO_POR_CLASE:
            raise ValueError(
                f"La clase '{clase}' tiene "
                f"{len(archivos)} audios. "
                f"Se necesitan al menos "
                f"{MINIMO_POR_CLASE}."
            )

        print(
            f"\nProcesando {clase}: "
            f"{len(archivos)} archivos"
        )

        for numero, ruta in enumerate(
            archivos,
            start=1,
        ):
            try:
                audio, _ = cargar_y_preparar_audio(
                    ruta
                )

                caracteristicas = (
                    extraer_caracteristicas(
                        audio
                    )
                )

                X.append(
                    caracteristicas
                )

                y.append(
                    clase
                )

                print(
                    f"  [{numero}/{len(archivos)}] "
                    f"{ruta.name}"
                )

            except Exception as error:
                errores.append({
                    "archivo": str(ruta),
                    "error": str(error),
                })

                print(
                    f"  ERROR: {ruta.name}: "
                    f"{error}"
                )

    if not X:
        raise ValueError(
            "No fue posible procesar ningÃºn audio."
        )

    X = np.vstack(X)
    y = np.array(y)

    return X, y, errores


def entrenar():
    print("=" * 60)
    print("SOUNDGUARD AI - ENTRENAMIENTO")
    print("=" * 60)

    print(
        f"\nDataset: {RUTA_DATASET}"
    )

    X, y, errores = cargar_dataset()

    print(
        f"\nMuestras vÃ¡lidas: {len(y)}"
    )

    print(
        f"CaracterÃ­sticas por audio: "
        f"{X.shape[1]}"
    )

    print(
        f"DistribuciÃ³n: {dict(Counter(y))}"
    )

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y,
        )
    )

    modelo = RandomForestClassifier(
        n_estimators=400,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )

    print("\nEntrenando modelo...")

    modelo.fit(
        X_train,
        y_train,
    )

    predicciones = modelo.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predicciones,
    )

    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            y_test,
            predicciones,
            average="macro",
            zero_division=0,
        )
    )

    reporte = classification_report(
        y_test,
        predicciones,
        labels=CLASES,
        output_dict=True,
        zero_division=0,
    )

    matriz = confusion_matrix(
        y_test,
        predicciones,
        labels=CLASES,
    )

    RUTA_MODELOS.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        modelo,
        RUTA_MODELO,
    )

    ahora = datetime.now(
        timezone.utc
    )

    metadata = {
        "estado": "entrenado",
        "version": ahora.strftime(
            "%Y%m%d-%H%M%S"
        ),
        "fecha_entrenamiento": (
            ahora.isoformat()
        ),
        "modelo": (
            "RandomForestClassifier"
        ),
        "scikit_learn": sklearn.__version__,
        "muestras_totales": int(
            len(y)
        ),
        "muestras_entrenamiento": int(
            len(y_train)
        ),
        "muestras_prueba": int(
            len(y_test)
        ),
        "caracteristicas": int(
            X.shape[1]
        ),
        "clases": CLASES,
        "distribucion_clases": dict(
            Counter(y)
        ),
        "metricas": {
            "accuracy": float(
                accuracy
            ),
            "precision_macro": float(
                precision
            ),
            "recall_macro": float(
                recall
            ),
            "f1_macro": float(
                f1
            ),
        },
        "reporte_clasificacion": reporte,
        "matriz_confusion": {
            "clases": CLASES,
            "valores": matriz.tolist(),
        },
        "umbral_desconocido": 0.65,
        "errores_dataset": errores,
    }

    with open(
        RUTA_METADATA,
        "w",
        encoding="utf-8",
    ) as archivo:
        json.dump(
            metadata,
            archivo,
            indent=4,
            ensure_ascii=False,
        )

    print("\nEntrenamiento terminado.")

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"Precision macro: "
        f"{precision:.4f}"
    )

    print(
        f"Recall macro: {recall:.4f}"
    )

    print(
        f"F1 macro: {f1:.4f}"
    )

    print(
        f"\nModelo guardado en:\n"
        f"{RUTA_MODELO}"
    )

    print(
        f"\nMetadata guardada en:\n"
        f"{RUTA_METADATA}"
    )


if __name__ == "__main__":
    entrenar()
