from .models import Deteccion


def registrar_deteccion(
    tipo_sonido,
    confianza,
    nivel_riesgo,
    duracion_segundos=0.0,
    origen="microfono",
    usuario=None,
):
    return Deteccion.objects.create(
        usuario=usuario,
        tipo_sonido=tipo_sonido,
        confianza=confianza,
        nivel_riesgo=nivel_riesgo,
        duracion_segundos=duracion_segundos,
        origen=origen,
    )