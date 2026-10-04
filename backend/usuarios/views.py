from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response

from .serializers import (
    RegistroSerializer,
    UsuarioSerializer,
)
<<<<<<< HEAD
=======


Usuario = get_user_model()
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [
        permissions.AllowAny
    ]


class LoginView(ObtainAuthToken):
<<<<<<< HEAD
    permission_classes = [permissions.AllowAny]
=======
    permission_classes = [
        permissions.AllowAny
    ]

>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
<<<<<<< HEAD
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
=======
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


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    queryset = Usuario.objects.all().order_by(
        "-date_joined"
    )

    search_fields = [
        "username",
        "email",
        "rol",
    ]

    ordering_fields = [
        "username",
        "email",
        "rol",
        "date_joined",
        "last_login",
    ]

    def get_queryset(self):
        usuario = self.request.user

        if not usuario.is_authenticated:
            return Usuario.objects.none()

        if getattr(
            usuario,
            "rol",
            None,
        ) != "ADMINISTRADOR":
            return Usuario.objects.filter(
                id=usuario.id
            )

        return Usuario.objects.all().order_by(
            "-date_joined"
        )

    def create(self, request, *args, **kwargs):
        if getattr(
            request.user,
            "rol",
            None,
        ) != "ADMINISTRADOR":
            return Response(
                {
                    "detail":
                        "Solo un administrador puede crear usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(
            request,
            *args,
            **kwargs,
        )

    def update(self, request, *args, **kwargs):
        if getattr(
            request.user,
            "rol",
            None,
        ) != "ADMINISTRADOR":
            return Response(
                {
                    "detail":
                        "Solo un administrador puede editar usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs,
    ):
        if getattr(
            request.user,
            "rol",
            None,
        ) != "ADMINISTRADOR":
            return Response(
                {
                    "detail":
                        "Solo un administrador puede editar usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(
            request,
            *args,
            **kwargs,
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        if getattr(
            request.user,
            "rol",
            None,
        ) != "ADMINISTRADOR":
            return Response(
                {
                    "detail":
                        "Solo un administrador puede eliminar usuarios."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        objeto = self.get_object()

        if objeto.id == request.user.id:
            return Response(
                {
                    "detail":
                        "No puedes eliminar tu propia cuenta."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
