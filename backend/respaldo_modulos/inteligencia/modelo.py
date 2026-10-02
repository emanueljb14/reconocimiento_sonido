from pathlib import Path

import joblib


RUTA_MODELO = (
    Path(__file__).resolve().parent
    / "modelos"
    / "clasificador.joblib"
)


def cargar_modelo():

    if not RUTA_MODELO.exists():

        raise FileNotFoundError(
            "El modelo todavía no ha sido entrenado. "
            "No existe inteligencia/modelos/clasificador.joblib"
        )

    return joblib.load(RUTA_MODELO)