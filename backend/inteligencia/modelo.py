import json
from pathlib import Path

import joblib


DIRECTORIO_MODELOS = (
    Path(__file__).resolve().parent
    / "modelos"
)

RUTA_MODELO = (
    DIRECTORIO_MODELOS
    / "clasificador.joblib"
)

RUTA_METADATA = (
    DIRECTORIO_MODELOS
    / "metadata.json"
)


def modelo_existe():
    return RUTA_MODELO.exists()


def cargar_modelo():
    if not modelo_existe():
        raise FileNotFoundError(
            "SoundGuard todavía no tiene "
            "un modelo entrenado."
        )

    return joblib.load(
        RUTA_MODELO
    )


def obtener_metadata():
    if not RUTA_METADATA.exists():
        return {
            "estado": "sin_entrenar",
            "modelo_disponible": False,
        }

    with open(
        RUTA_METADATA,
        "r",
        encoding="utf-8",
    ) as archivo:
        metadata = json.load(
            archivo
        )

    metadata["modelo_disponible"] = (
        modelo_existe()
    )

    return metadata