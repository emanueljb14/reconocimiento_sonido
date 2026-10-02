from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Deteccion
from .serializers import DeteccionSerializer


class DeteccionViewSet(viewsets.ModelViewSet):
    serializer_class = DeteccionSerializer

    # Temporal mientras tu compañero termina usuarios/login
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Deteccion.objects.select_related("usuario").all()

        usuario = self.request.user

        # Mientras no exista autenticación, mostramos todas
        if not usuario.is_authenticated:
            return queryset

        rol = getattr(usuario, "rol", None)

        if rol in ["ADMINISTRADOR", "SUPERVISOR"]:
            return queryset

        return queryset.filter(usuario=usuario)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(usuario=self.request.user)
        else:
            serializer.save(usuario=None)