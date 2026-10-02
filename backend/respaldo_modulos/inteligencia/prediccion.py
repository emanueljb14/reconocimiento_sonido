import numpy as np

from .modelo import cargar_modelo
from .procesamiento import (
    preparar_audio,
    extraer_caracteristicas,
)


def clasificar_audio(ruta_audio):

    modelo = cargar_modelo()

    audio = preparar_audio(
        ruta_audio
    )

    caracteristicas = extraer_caracteristicas(
        audio
    )

    entrada = caracteristicas.reshape(
        1,
        -1,
    )

    tipo_sonido = modelo.predict(
        entrada
    )[0]

    confianza = 0.0

    if hasattr(modelo, "predict_proba"):

        probabilidades = modelo.predict_proba(
            entrada
        )[0]

        confianza = float(
            np.max(probabilidades)
        )

    return {
        "tipo_sonido": str(tipo_sonido),
        "confianza": confianza,
    }