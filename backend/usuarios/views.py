from rest_framework import generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response

from .serializers import (
    RegistroSerializer,
    UsuarioSerializer,
)


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [
        permissions.AllowAny
    ]


class LoginView(ObtainAuthToken):
    permission_classes = [
        permissions.AllowAny
    ]

    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
<<<<<<< HEAD
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=usuario)

        return Response(
            {
                "token": token.key,
                "user_id": usuario.pk,
                "username": usuario.username,
                "email": usuario.email,
                "rol": usuario.rol,  # "ADMINISTRADOR", "SUPERVISOR", o "USUARIO"
            }
        )
=======
            data=request.data,
            context={
                "request": request
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        usuario = serializer.validated_data[
            "user"
        ]

        token, _ = Token.objects.get_or_create(
            user=usuario
        )

        usuario_data = UsuarioSerializer(
            usuario
        ).data

        return Response({
            "token": token.key,
            "user": usuario_data,
        })
>>>>>>> f836f3ac73fdc11b2d6c052f74b7bf9392c3e0d2
