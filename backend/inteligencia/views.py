from rest_framework import status

from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)

from rest_framework.permissions import (
    AllowAny,
)

from rest_framework.response import (
    Response,
)

from rest_framework.views import (
    APIView,
)

from .modelo import (
    modelo_existe,
    obtener_metadata,
)

from .serializers import (
    AnalisisAudioSerializer,
)

from .services import (
    analizar_y_registrar,
)


class AnalizarAudioView(APIView):
    permission_classes = [
        AllowAny
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = (
            AnalisisAudioSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        usuario = (
            request.user
            if request.user.is_authenticated
            else None
        )

        try:
            resultado = (
                analizar_y_registrar(
                    archivo=(
                        serializer
                        .validated_data[
                            "audio"
                        ]
                    ),
                    usuario=usuario,
                    origen=(
                        serializer
                        .validated_data[
                            "origen"
                        ]
                    ),
                )
            )

            return Response(
                resultado,
                status=status.HTTP_201_CREATED,
            )

        except FileNotFoundError as error:
            return Response(
                {
                    "detail": str(error)
                },
                status=(
                    status
                    .HTTP_503_SERVICE_UNAVAILABLE
                ),
            )

        except ValueError as error:
            return Response(
                {
                    "detail": str(error)
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )


class EstadoModeloView(APIView):
    permission_classes = [
        AllowAny
    ]

    def get(self, request):
        metadata = obtener_metadata()

        return Response({
            "modelo_disponible": (
                modelo_existe()
            ),
            "estado": metadata.get(
                "estado",
                "sin_entrenar",
            ),
            "version": metadata.get(
                "version"
            ),
            "fecha_entrenamiento": (
                metadata.get(
                    "fecha_entrenamiento"
                )
            ),
        })


class MetricasModeloView(APIView):
    permission_classes = [
        AllowAny
    ]

    def get(self, request):
        return Response(
            obtener_metadata()
        )