from django.urls import path

from .views import (
    AnalizarAudioView,
    EstadoModeloView,
    MetricasModeloView,
)


urlpatterns = [
    path(
        "analizar/",
        AnalizarAudioView.as_view(),
        name="inteligencia-analizar",
    ),

    path(
        "estado-modelo/",
        EstadoModeloView.as_view(),
        name="inteligencia-estado-modelo",
    ),

    path(
        "metricas-modelo/",
        MetricasModeloView.as_view(),
        name="inteligencia-metricas-modelo",
    ),
]