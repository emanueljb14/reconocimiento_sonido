from django.urls import path

from .views import AnalizarAudioView


urlpatterns = [
    path(
        "analizar/",
        AnalizarAudioView.as_view(),
        name="analizar-audio",
    ),
]