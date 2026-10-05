from django.urls import path

from .views import MiConfiguracionView


urlpatterns = [
    path(
        "me/",
        MiConfiguracionView.as_view(),
        name="mi-configuracion",
    ),
]