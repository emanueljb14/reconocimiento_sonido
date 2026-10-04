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
    permission_classes = [permissions.AllowAny]


class LoginView(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        usuario = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=usuario)
        usuario_data = UsuarioSerializer(usuario).data

        return Response({
            "status": "success",
            "message": f"¡Bienvenido {usuario.first_name or usuario.username}!",
            "token": token.key,
            "user": usuario_data,
            "usuario": usuario_data,
            "rol": usuario.rol,
            "role": usuario.rol,
        })