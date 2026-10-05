from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inteligencia.modelo import obtener_metadata

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


class ResumenPublicoView(APIView):
    """
    Información pública para SplashScreen,
    Login y Registro.

    No devuelve información personal
    ni historial detallado.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        resumen = obtener_resumen(
            request.user
        )

        metadata = obtener_metadata()

        metricas = metadata.get(
            "metricas",
            {},
        )

        accuracy = metricas.get(
            "accuracy"
        )

        precision_ia = None

        if accuracy is not None:
            precision_ia = round(
                float(accuracy) * 100,
                2,
            )

        return Response({
            "total_detecciones":
                resumen.get(
                    "total_detecciones",
                    0,
                ),

            "precision_ia":
                precision_ia,

            "riesgo_alto":
                resumen.get(
                    "riesgos",
                    {},
                ).get(
                    "alto",
                    0,
                ),

            "modelo": {
                "modelo_disponible":
                    metadata.get(
                        "modelo_disponible",
                        False,
                    ),

                "estado":
                    metadata.get(
                        "estado",
                        "sin_entrenar",
                    ),

                "nombre":
                    metadata.get(
                        "modelo",
                        "Clasificador acústico",
                    ),

                "version":
                    metadata.get(
                        "version"
                    ),

                "accuracy":
                    metricas.get(
                        "accuracy"
                    ),

                "precision_macro":
                    metricas.get(
                        "precision_macro"
                    ),

                "recall_macro":
                    metricas.get(
                        "recall_macro"
                    ),

                "f1_macro":
                    metricas.get(
                        "f1_macro"
                    ),

                "muestras_totales":
                    metadata.get(
                        "muestras_totales"
                    ),

                "caracteristicas":
                    metadata.get(
                        "caracteristicas"
                    ),

                "clases":
                    metadata.get(
                        "clases",
                        [],
                    ),
            },
        })


class ResumenEstadisticasView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        datos = obtener_resumen(
            request.user
        )

        serializer = (
            ResumenEstadisticasSerializer(
                datos
            )
        )

        return Response(
            serializer.data
        )


class EstadisticasPorSonidoView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        datos = obtener_por_sonido(
            request.user
        )

        serializer = (
            EstadisticaSonidoSerializer(
                datos,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


class EstadisticasPorRiesgoView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        datos = obtener_por_riesgo(
            request.user
        )

        serializer = (
            EstadisticaRiesgoSerializer(
                datos,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


class EstadisticasPorHoraView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        datos = obtener_por_hora(
            request.user
        )

        serializer = (
            EstadisticaHoraSerializer(
                datos,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


class EstadisticasPorDiaView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

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
            min(
                dias,
                365,
            ),
        )

        datos = obtener_por_dia(
            request.user,
            dias=dias,
        )

        serializer = (
            EstadisticaDiaSerializer(
                datos,
                many=True,
            )
        )

        return Response(
            serializer.data
        )