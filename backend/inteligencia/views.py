from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .modelo import modelo_existe, obtener_metadata
from .models import MuestraAudio
from .serializers import (
    AnalisisAudioSerializer,
    MuestraAudioCrearSerializer,
    MuestraAudioSerializer,
)
from .services import analizar_y_registrar
from .dataset_service import (
    guardar_muestra_dataset,
    eliminar_muestra_dataset,
)


class AnalizarAudioView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = AnalisisAudioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        usuario = request.user

        try:
            resultado = analizar_y_registrar(
                archivo=serializer.validated_data["audio"],
                usuario=usuario,
                origen=serializer.validated_data["origen"],
            )

            return Response(
                resultado,
                status=status.HTTP_201_CREATED,
            )

        except FileNotFoundError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class EstadoModeloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        metadata = obtener_metadata()

        return Response({
            "modelo_disponible": modelo_existe(),
            "estado": metadata.get(
                "estado",
                "sin_entrenar",
            ),
            "version": metadata.get("version"),
            "fecha_entrenamiento": metadata.get(
                "fecha_entrenamiento"
            ),
        })


class MetricasModeloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            obtener_metadata()
        )


class DatasetAudioListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get(self, request):
        muestras = MuestraAudio.objects.all()

        clase = request.query_params.get("clase")
        origen = request.query_params.get("origen")

        if clase:
            muestras = muestras.filter(clase=clase)

        if origen:
            muestras = muestras.filter(origen=origen)

        serializer = MuestraAudioSerializer(
            muestras,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = MuestraAudioCrearSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            muestra = guardar_muestra_dataset(
                archivo=serializer.validated_data["audio"],
                clase=serializer.validated_data["clase"],
                origen=serializer.validated_data["origen"],
                descripcion=serializer.validated_data.get(
                    "descripcion",
                    "",
                ),
                usuario=request.user,
            )

            respuesta = MuestraAudioSerializer(
                muestra
            )

            return Response(
                respuesta.data,
                status=status.HTTP_201_CREATED,
            )

        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DatasetAudioDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            muestra = MuestraAudio.objects.get(pk=pk)
        except MuestraAudio.DoesNotExist:
            return Response(
                {"detail": "Muestra de audio no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MuestraAudioSerializer(muestra)

        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            muestra = MuestraAudio.objects.get(pk=pk)
        except MuestraAudio.DoesNotExist:
            return Response(
                {"detail": "Muestra de audio no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            eliminar_muestra_dataset(muestra)

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )