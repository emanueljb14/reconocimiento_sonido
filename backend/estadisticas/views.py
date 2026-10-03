from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    EstadisticaDiaSerializer,
    EstadisticaHoraSerializer,
    EstadisticaRiesgoSerializer,
    EstadisticaSonidoSerializer,
    ResumenEstadisticasSerializer,
)

from .services import (
    obtener_por_dia,
    obtener_por_hora,
    obtener_por_riesgo,
    obtener_por_sonido,
    obtener_resumen,
)


class ResumenEstadisticasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = obtener_resumen(
            request.user
        )

        serializer = ResumenEstadisticasSerializer(
            datos
        )

        return Response(
            serializer.data
        )


class EstadisticasPorSonidoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = obtener_por_sonido(
            request.user
        )

        serializer = EstadisticaSonidoSerializer(
            datos,
            many=True,
        )

        return Response(
            serializer.data
        )


class EstadisticasPorRiesgoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = obtener_por_riesgo(
            request.user
        )

        serializer = EstadisticaRiesgoSerializer(
            datos,
            many=True,
        )

        return Response(
            serializer.data
        )


class EstadisticasPorHoraView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = obtener_por_hora(
            request.user
        )

        serializer = EstadisticaHoraSerializer(
            datos,
            many=True,
        )

        return Response(
            serializer.data
        )


class EstadisticasPorDiaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dias = request.query_params.get(
            "dias",
            7,
        )

        try:
            dias = int(dias)
        except (ValueError, TypeError):
            dias = 7

        dias = max(
            1,
            min(dias, 365),
        )

        datos = obtener_por_dia(
            request.user,
            dias=dias,
        )

        serializer = EstadisticaDiaSerializer(
            datos,
            many=True,
        )

        return Response(
            serializer.data
        )