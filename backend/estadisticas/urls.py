from django.urls import path

from .views import (
    EstadisticasPorDiaView,
    EstadisticasPorHoraView,
    EstadisticasPorRiesgoView,
    EstadisticasPorSonidoView,
    ResumenEstadisticasView,
    ResumenPublicoView,
)


urlpatterns = [
    path(
        "publico/",
        ResumenPublicoView.as_view(),
        name="estadisticas-publico",
    ),

    path(
        "resumen/",
        ResumenEstadisticasView.as_view(),
        name="estadisticas-resumen",
    ),

    path(
        "por-sonido/",
        EstadisticasPorSonidoView.as_view(),
        name="estadisticas-por-sonido",
    ),

    path(
        "por-riesgo/",
        EstadisticasPorRiesgoView.as_view(),
        name="estadisticas-por-riesgo",
    ),

    path(
        "por-hora/",
        EstadisticasPorHoraView.as_view(),
        name="estadisticas-por-hora",
    ),

    path(
        "por-dia/",
        EstadisticasPorDiaView.as_view(),
        name="estadisticas-por-dia",
    ),
]