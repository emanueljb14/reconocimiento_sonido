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


urlpatterns = [
    path(
        "registro/",
        RegistroView.as_view(),
        name="registro",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "",
        include(router.urls),
    ),
]