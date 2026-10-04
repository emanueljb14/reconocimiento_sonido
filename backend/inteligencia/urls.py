from django.urls import path

from .views import (
    AnalizarAudioView,
    EstadoModeloView,
    LoginFaceView,
    MetricasModeloView,
    RegisterFaceView,
)

urlpatterns = [
    # Módulo de Análisis de Sonido
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
    # Módulo de Reconocimiento Facial
    path(
        "registro-facial/",
        RegisterFaceView.as_view(),
        name="inteligencia-registro-facial",
    ),
    path(
        "login-facial/",
        LoginFaceView.as_view(),
        name="inteligencia-login-facial",
    ),
]