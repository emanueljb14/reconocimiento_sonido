from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q
from rest_framework import generics, permissions, status, viewsets, serializers
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegistroSerializer,
    UsuarioSerializer,
)

Usuario = get_user_model()


class CustomAuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField(label="Usuario / Email / DNI")
    password = serializers.CharField(
        label="Contraseña",
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        login_input = attrs.get('username', '').strip()
        password = attrs.get('password')

        if not login_input or not password:
            raise serializers.ValidationError('Debe ingresar usuario y contraseña.')

        # Búsqueda por username, correo o DNI (insensible a mayúsculas/minúsculas)
        user_obj = Usuario.objects.filter(
            Q(username__iexact=login_input) | 
            Q(email__iexact=login_input) | 
            Q(dni__iexact=login_input)
        ).first()

        if not user_obj:
            raise serializers.ValidationError(f'No se encontró el usuario "{login_input}".')

        if not user_obj.is_active:
            raise serializers.ValidationError('Esta cuenta de usuario se encuentra inactiva.')

        user = authenticate(
            request=self.context.get('request'),
            username=user_obj.username,
            password=password
        )

        if not user:
            raise serializers.ValidationError('La contraseña ingresada es incorrecta.')

        attrs['user'] = user
        return attrs


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomAuthTokenSerializer(
            data=request.data,
            context={"request": request},
        )
        if not serializer.is_valid():
            errors = serializer.errors
            mensaje_error = "Credenciales inválidas."
            if 'non_field_errors' in errors:
                mensaje_error = errors['non_field_errors'][0]
            elif 'username' in errors:
                mensaje_error = errors['username'][0]
            elif 'password' in errors:
                mensaje_error = errors['password'][0]

            return Response(
                {"non_field_errors": [mensaje_error], "detail": mensaje_error},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=usuario)
        usuario_data = UsuarioSerializer(usuario).data

        return Response({
            "token": token.key,
            "user": usuario_data,
        })


class RegistrarFacialDobleView(APIView):
    """
    Endpoint para registrar el rostro de Usuario y/o Supervisor mediante DNI.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        dni_usuario = request.data.get("dni_usuario")
        dni_supervisor = request.data.get("dni_supervisor")
        foto_base64 = request.data.get("foto")
        encoding_array = request.data.get("encoding")

        if not foto_base64:
            return Response(
                {"detail": "Se requiere la captura de la imagen facial en Base64."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not dni_usuario and not dni_supervisor:
            return Response(
                {"detail": "Debe proporcionar al menos un DNI (Usuario o Supervisor)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        actualizados = []

        if dni_usuario:
            try:
                usuario_obj = Usuario.objects.get(dni=dni_usuario, rol=Usuario.Roles.USUARIO)
                usuario_obj.foto = foto_base64
                if encoding_array:
                    usuario_obj.set_encoding(encoding_array)
                usuario_obj.save()
                actualizados.append(f"Usuario ({dni_usuario})")
            except Usuario.DoesNotExist:
                return Response(
                    {"detail": f"No se encontró un Usuario registrado con el DNI {dni_usuario}."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if dni_supervisor:
            try:
                supervisor_obj = Usuario.objects.get(dni=dni_supervisor, rol=Usuario.Roles.SUPERVISOR)
                supervisor_obj.foto = foto_base64
                if encoding_array:
                    supervisor_obj.set_encoding(encoding_array)
                supervisor_obj.save()
                actualizados.append(f"Supervisor ({dni_supervisor})")
            except Usuario.DoesNotExist:
                return Response(
                    {"detail": f"No se encontró un Supervisor registrado con el DNI {dni_supervisor}."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        return Response(
            {
                "message": f"Biometría facial registrada con éxito para: {', '.join(actualizados)}.",
                "registrados": actualizados,
            },
            status=status.HTTP_200_OK,
        )


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    queryset = Usuario.objects.all().order_by("-date_joined")

    search_fields = ["username", "email", "rol", "dni"]
    ordering_fields = ["username", "email", "rol", "date_joined", "last_login"]

    def get_queryset(self):
        usuario = self.request.user

        if not usuario.is_authenticated:
            return Usuario.objects.none()

        if getattr(usuario, "rol", None) != "ADMINISTRADOR":
            return Usuario.objects.filter(id=usuario.id)

        return Usuario.objects.all().order_by("-date_joined")

    def create(self, request, *args, **kwargs):
        if getattr(request.user, "rol", None) != "ADMINISTRADOR":
            return Response(
                {"detail": "Solo un administrador puede crear usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if getattr(request.user, "rol", None) != "ADMINISTRADOR":
            return Response(
                {"detail": "Solo un administrador puede editar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "rol", None) != "ADMINISTRADOR":
            return Response(
                {"detail": "Solo un administrador puede editar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, "rol", None) != "ADMINISTRADOR":
            return Response(
                {"detail": "Solo un administrador puede eliminar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        objeto = self.get_object()

        if objeto.id == request.user.id:
            return Response(
                {"detail": "No puedes eliminar tu propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)