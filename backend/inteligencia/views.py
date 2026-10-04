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

from .dataset_service import (
    eliminar_muestra_dataset,
    guardar_muestra_dataset,
)

from .modelo import (
    modelo_existe,
    obtener_metadata,
)

from .models import (
    MuestraAudio,
)

from .serializers import (
    AnalisisAudioSerializer,
    MuestraAudioCrearSerializer,
    MuestraAudioSerializer,
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
                status=(
                    status
                    .HTTP_201_CREATED
                ),
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
        metadata = (
            obtener_metadata()
        )

        return Response({
            "modelo_disponible": (
                modelo_existe()
            ),
            "estado": (
                metadata.get(
                    "estado",
                    "sin_entrenar",
                )
            ),
            "version": (
                metadata.get(
                    "version"
                )
            ),
            "fecha_entrenamiento": (
                metadata.get(
                    "fecha_entrenamiento"
                )
            ),
            "modelo": (
                metadata.get(
                    "modelo"
                )
            ),
            "umbral_desconocido": (
                metadata.get(
                    "umbral_desconocido"
                )
            ),
            "clases": (
                metadata.get(
                    "clases",
                    [],
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


class DatasetAudioListCreateView(
    APIView
):
    permission_classes = [
        AllowAny
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        queryset = (
            MuestraAudio.objects
            .all()
        )

        clase = (
            request.query_params
            .get("clase")
        )

        origen = (
            request.query_params
            .get("origen")
        )

        if clase:
            queryset = (
                queryset.filter(
                    clase=clase
                )
            )

        if origen:
            queryset = (
                queryset.filter(
                    origen=origen
                )
            )

        serializer = (
            MuestraAudioSerializer(
                queryset,
                many=True,
            )
        )

        return Response({
            "total": queryset.count(),
            "resultados": (
                serializer.data
            ),
        })

    def post(self, request):
        serializer = (
            MuestraAudioCrearSerializer(
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
            muestra = (
                guardar_muestra_dataset(
                    archivo=(
                        serializer
                        .validated_data[
                            "audio"
                        ]
                    ),
                    clase=(
                        serializer
                        .validated_data[
                            "clase"
                        ]
                    ),
                    origen=(
                        serializer
                        .validated_data[
                            "origen"
                        ]
                    ),
                    descripcion=(
                        serializer
                        .validated_data
                        .get(
                            "descripcion",
                            "",
                        )
                    ),
                    usuario=usuario,
                )
            )

            return Response(
                MuestraAudioSerializer(
                    muestra
                ).data,
                status=(
                    status
                    .HTTP_201_CREATED
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


class DatasetAudioDetalleView(
    APIView
):
    permission_classes = [
        AllowAny
    ]

    def get_object(
        self,
        pk,
    ):
        try:
            return (
                MuestraAudio.objects
                .get(pk=pk)
            )
        except MuestraAudio.DoesNotExist:
            return None

    def get(
        self,
        request,
        pk,
    ):
        muestra = (
            self.get_object(pk)
        )

        if not muestra:
            return Response(
                {
                    "detail": (
                        "Muestra no encontrada."
                    )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                ),
            )

        return Response(
            MuestraAudioSerializer(
                muestra
            ).data
        )

    def delete(
        self,
        request,
        pk,
    ):
        muestra = (
            self.get_object(pk)
        )

        if not muestra:
            return Response(
                {
                    "detail": (
                        "Muestra no encontrada."
                    )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                ),
            )

        eliminar_muestra_dataset(
            muestra
        )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )
