import os
import tempfile
from pathlib import Path

from detecciones.services import (
    registrar_deteccion,
)

from .prediccion import (
    clasificar_audio,
)

from .riesgo import (
    calcular_riesgo,
)


def analizar_y_registrar(
    archivo,
    usuario=None,
    origen="archivo",
):
    extension = (
        Path(archivo.name)
        .suffix
        .lower()
    )

    ruta_temporal = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temporal:

            for fragmento in archivo.chunks():
                temporal.write(
                    fragmento
                )

            ruta_temporal = (
                temporal.name
            )

        resultado = clasificar_audio(
            ruta_temporal
        )

        riesgo = calcular_riesgo(
            resultado["tipo_sonido"],
            resultado["confianza"],
        )

        deteccion = registrar_deteccion(
            usuario=usuario,
            tipo_sonido=(
                resultado["tipo_sonido"]
            ),
            confianza=(
                resultado["confianza"]
            ),
            nivel_riesgo=(
                riesgo["nivel"]
            ),
            duracion_segundos=(
                resultado[
                    "duracion_segundos"
                ]
            ),
            origen=origen,
        )

        return {
            "deteccion_id": deteccion.id,
            "tipo_sonido": (
                resultado["tipo_sonido"]
            ),
            "clase_modelo": (
                resultado["clase_modelo"]
            ),
            "confianza": (
                resultado["confianza"]
            ),
            "nivel_riesgo": (
                riesgo["nivel"]
            ),
            "puntuacion_riesgo": (
                riesgo["puntuacion"]
            ),
            "duracion_segundos": (
                resultado[
                    "duracion_segundos"
                ]
            ),
            "probabilidades": (
                resultado["probabilidades"]
            ),
            "fecha": deteccion.fecha,
        }

    finally:
        if (
            ruta_temporal
            and os.path.exists(
                ruta_temporal
            )
        ):
            os.remove(
                ruta_temporal
            )