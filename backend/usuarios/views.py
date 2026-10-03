from rest_framework import generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response

from .serializers import RegistroSerializer


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
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