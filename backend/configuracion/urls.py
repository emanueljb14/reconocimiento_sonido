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
<<<<<<< HEAD
   # path(
      #  "api/configuraciones/",
       # include("configuraciones.urls"),
    #),
=======

>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
    path(
        "api/inteligencia/",
        include("inteligencia.urls"),
    ),
<<<<<<< HEAD
=======

    path(
        "api/configuraciones/",
        include("configuraciones.urls"),
    ),
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
]