from datetime import timedelta

from django.db.models import Avg, Count
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone

from detecciones.models import Deteccion


def obtener_queryset(usuario):
    """
    Devuelve todas las detecciones del sistema.

    ADMINISTRADOR, SUPERVISOR y USUARIO podrán
    visualizar los datos registrados en el backend.
    """
    return Deteccion.objects.all()


def obtener_resumen(usuario):
    queryset = obtener_queryset(usuario)

    ahora = timezone.now()

    inicio_dia = ahora.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    hace_24_horas = ahora - timedelta(
        hours=24
    )

    detecciones_hoy = queryset.filter(
        fecha__gte=inicio_dia
    )

    ultimas_24_horas = queryset.filter(
        fecha__gte=hace_24_horas
    )

    promedio = queryset.aggregate(
        promedio=Avg("confianza")
    )["promedio"] or 0

    riesgo_bajo = queryset.filter(
        nivel_riesgo="bajo"
    ).count()

    riesgo_medio = queryset.filter(
        nivel_riesgo="medio"
    ).count()

    riesgo_alto = queryset.filter(
        nivel_riesgo="alto"
    ).count()

    riesgo_critico = queryset.filter(
        nivel_riesgo="critico"
    ).count()

    return {
        "total_detecciones": queryset.count(),

        "detecciones_hoy":
            detecciones_hoy.count(),

        "ultimas_24_horas":
            ultimas_24_horas.count(),

        "confianza_promedio":
            round(
                float(promedio),
                4,
            ),

        "riesgos": {
            "bajo": riesgo_bajo,
            "medio": riesgo_medio,
            "alto": riesgo_alto,
            "critico": riesgo_critico,
        },

        "actualizado_en":
            ahora.isoformat(),
    }


def obtener_por_sonido(usuario):
    queryset = obtener_queryset(usuario)

    datos = (
        queryset
        .values("tipo_sonido")
        .annotate(
            total=Count("id")
        )
        .order_by("-total")
    )

    return list(datos)


def obtener_por_riesgo(usuario):
    queryset = obtener_queryset(usuario)

    datos = (
        queryset
        .values("nivel_riesgo")
        .annotate(
            total=Count("id")
        )
        .order_by("-total")
    )

    return list(datos)


def obtener_por_hora(usuario):
    queryset = obtener_queryset(usuario)

    desde = timezone.now() - timedelta(
        hours=24
    )

    datos = (
        queryset
        .filter(
            fecha__gte=desde
        )
        .annotate(
            hora=TruncHour("fecha")
        )
        .values("hora")
        .annotate(
            total=Count("id")
        )
        .order_by("hora")
    )

    return [
        {
            "hora":
                item["hora"].isoformat(),

            "total":
                item["total"],
        }
        for item in datos
    ]


def obtener_por_dia(
    usuario,
    dias=7,
):
    queryset = obtener_queryset(usuario)

    desde = timezone.now() - timedelta(
        days=dias
    )

    datos = (
        queryset
        .filter(
            fecha__gte=desde
        )
        .annotate(
            dia=TruncDate("fecha")
        )
        .values("dia")
        .annotate(
            total=Count("id")
        )
        .order_by("dia")
    )

    return [
        {
            "dia":
                item["dia"].isoformat(),

            "total":
                item["total"],
        }
        for item in datos
    ]