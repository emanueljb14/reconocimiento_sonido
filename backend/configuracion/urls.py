from django.contrib import admin
from django.urls import include, path


urlpatterns = [

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/usuarios/",
        include("usuarios.urls"),
    ),

    path(
        "api/detecciones/",
        include("detecciones.urls"),
    ),

    path(
        "api/estadisticas/",
        include("estadisticas.urls"),
    ),

    path(
        "api/inteligencia/",
        include("inteligencia.urls"),
    ),

    path(
        "api/configuraciones/",
        include("configuraciones.urls"),
    ),
]