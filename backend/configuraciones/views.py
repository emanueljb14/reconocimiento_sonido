from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ConfiguracionUsuario
from .serializers import (
    ConfiguracionUsuarioSerializer,
)


class MiConfiguracionView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_objeto(self, usuario):

        configuracion, _ = (
            ConfiguracionUsuario.objects.get_or_create(
                usuario=usuario
            )
        )

        return configuracion


    def get(self, request):

        configuracion = self.get_objeto(
            request.user
        )

        serializer = (
            ConfiguracionUsuarioSerializer(
                configuracion
            )
        )

        return Response(
            serializer.data
        )


    def patch(self, request):

        configuracion = self.get_objeto(
            request.user
        )

        serializer = (
            ConfiguracionUsuarioSerializer(
                configuracion,
                data=request.data,
                partial=True,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )


    def put(self, request):

        configuracion = self.get_objeto(
            request.user
        )

        serializer = (
            ConfiguracionUsuarioSerializer(
                configuracion,
                data=request.data,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )