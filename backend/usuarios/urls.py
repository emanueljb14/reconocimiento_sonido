<<<<<<< HEAD
from django.urls import path

from .views import (
    LoginView,
    RegistroView,
)
=======
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    RegistroView,
    LoginView,
    UsuarioViewSet,
)


router = DefaultRouter()

router.register(
    "",
    UsuarioViewSet,
    basename="usuario",
)

>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0

urlpatterns = [
    path(
        "registro/",
        RegistroView.as_view(),
        name="registro",
    ),
<<<<<<< HEAD
=======

>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
<<<<<<< HEAD
=======

    path(
        "",
        include(router.urls),
    ),
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
]