from django.urls import path

from .views import (
    AnalizarAudioView,
    DatasetAudioDetalleView,
    DatasetAudioListCreateView,
    EstadoModeloView,
    LoginFaceView,
    MetricasModeloView,
    RegisterFaceView,
    RegisterFaceDobleView,
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
        "registro-facial-doble/",
        RegisterFaceDobleView.as_view(),
        name="inteligencia-registro-facial-doble",
    ),
    path(
        "login-facial/",
        LoginFaceView.as_view(),
        name="inteligencia-login-facial",
    ),

    # Módulo de Dataset Audio
    path(
        "dataset/",
        DatasetAudioListCreateView.as_view(),
        name="inteligencia-dataset",
    ),
    path(
        "dataset/<int:pk>/",
        DatasetAudioDetalleView.as_view(),
        name="inteligencia-dataset-detalle",
    ),
]