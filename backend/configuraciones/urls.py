from django.urls import path
<<<<<<< HEAD
from . import views

urlpatterns = [
    # Aquí iremos agregando las rutas de configuración.
    # Ejemplo:
    # path('', views.ObtenerConfiguracionesView.as_view(), name='configuraciones'),
=======

from .views import MiConfiguracionView


urlpatterns = [
    path(
        "me/",
        MiConfiguracionView.as_view(),
        name="mi-configuracion",
    ),
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
]