import numpy as np

from .modelo import (
    cargar_modelo,
    obtener_metadata,
)

from .procesamiento import (
    cargar_y_preparar_audio,
    extraer_caracteristicas,
)


def clasificar_audio(ruta_audio):
    modelo = cargar_modelo()

    metadata = obtener_metadata()

    audio, duracion = (
        cargar_y_preparar_audio(
            ruta_audio
        )
    )

    caracteristicas = (
        extraer_caracteristicas(
            audio
        )
    )

    entrada = caracteristicas.reshape(
        1,
        -1,
    )

    if hasattr(
        modelo,
        "n_features_in_",
    ):
        if (
            entrada.shape[1]
            != modelo.n_features_in_
        ):
            raise RuntimeError(
                "Las características del audio "
                "no coinciden con las utilizadas "
                "durante el entrenamiento."
            )

    if not hasattr(
        modelo,
        "predict_proba",
    ):
        raise RuntimeError(
            "El modelo no proporciona "
            "probabilidades."
        )

    probabilidades = modelo.predict_proba(
        entrada
    )[0]

    clases = [
        str(clase)
        for clase in modelo.classes_
    ]

    indice = int(
        np.argmax(probabilidades)
    )

    clase_modelo = clases[
        indice
    ]

    confianza = float(
        probabilidades[indice]
    )

    umbral = float(
        metadata.get(
            "umbral_desconocido",
            0.55,
        )
    )

    if confianza < umbral:
        tipo_sonido = "desconocido"
    else:
        tipo_sonido = clase_modelo

    probabilidades_por_clase = {
        clase: float(probabilidad)
        for clase, probabilidad
        in zip(
            clases,
            probabilidades,
        )
    }

    return {
        "tipo_sonido": tipo_sonido,
        "clase_modelo": clase_modelo,
        "confianza": confianza,
        "umbral_desconocido": umbral,
        "duracion_segundos": duracion,
        "probabilidades": (
            probabilidades_por_clase
        ),
    }