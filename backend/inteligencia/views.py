import base64
import io
import json
import face_recognition
import numpy as np

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .dataset_service import (
    eliminar_muestra_dataset,
    guardar_muestra_dataset,
)
from .modelo import modelo_existe, obtener_metadata
from .models import MuestraAudio
from .serializers import (
    AnalisisAudioSerializer,
    MuestraAudioCrearSerializer,
    MuestraAudioSerializer,
)
from .services import analizar_y_registrar

Usuario = get_user_model()


class RegisterFaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image_data = request.data.get("image")
        dni = request.data.get("dni")

        if not image_data:
            return Response(
                {"detail": "No se proporcionó imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if "," in image_data:
                image_data_clean = image_data.split(",")[1]
            else:
                image_data_clean = image_data

            image_bytes = base64.b64decode(image_data_clean)
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            encodings = face_recognition.face_encodings(image)

            if not encodings:
                return Response(
                    {"detail": "No se detectó ningún rostro en la imagen."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            encoding_json = json.dumps(encodings[0].tolist())

            if dni:
                try:
                    usuario = Usuario.objects.get(dni=dni)
                except Usuario.DoesNotExist:
                    return Response(
                        {"detail": f"No se encontró un usuario con el DNI: {dni}"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            else:
                usuario = request.user

            usuario.foto = image_data
            usuario.encoding_facial = encoding_json
            usuario.save()

            return Response(
                {
                    "detail": f"Rostro registrado exitosamente para {usuario.username} ({usuario.get_rol_display()}).",
                    "rol": usuario.rol,
                    "dni": usuario.dni,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RegisterFaceDobleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image_data = request.data.get("image")
        dni_usuario = request.data.get("dni_usuario")
        dni_supervisor = request.data.get("dni_supervisor")

        if not image_data:
            return Response(
                {"detail": "No se proporcionó imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not dni_usuario and not dni_supervisor:
            return Response(
                {"detail": "Debe especificar al menos un DNI (Usuario o Supervisor)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if "," in image_data:
                image_data_clean = image_data.split(",")[1]
            else:
                image_data_clean = image_data

            image_bytes = base64.b64decode(image_data_clean)
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            encodings = face_recognition.face_encodings(image)

            if not encodings:
                return Response(
                    {"detail": "No se detectó ningún rostro en la imagen."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            encoding_json = json.dumps(encodings[0].tolist())
            actualizados = []

            if dni_usuario:
                try:
                    u_obj = Usuario.objects.get(dni=dni_usuario)
                    u_obj.foto = image_data
                    u_obj.encoding_facial = encoding_json
                    u_obj.save()
                    actualizados.append(f"Usuario DNI {dni_usuario}")
                except Usuario.DoesNotExist:
                    return Response(
                        {"detail": f"No se encontró un usuario con el DNI: {dni_usuario}"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            if dni_supervisor:
                try:
                    s_obj = Usuario.objects.get(dni=dni_supervisor)
                    s_obj.foto = image_data
                    s_obj.encoding_facial = encoding_json
                    s_obj.save()
                    actualizados.append(f"Supervisor DNI {dni_supervisor}")
                except Usuario.DoesNotExist:
                    return Response(
                        {"detail": f"No se encontró un supervisor con el DNI: {dni_supervisor}"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            return Response(
                {
                    "detail": f"Rostro registrado con éxito para: {', '.join(actualizados)}.",
                    "registrados": actualizados,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginFaceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        image_data = request.data.get("image")
        if not image_data:
            return Response(
                {"detail": "No se proporcionó imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if "," in image_data:
                image_data = image_data.split(",")[1]

            image_bytes = base64.b64decode(image_data)
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            encodings = face_recognition.face_encodings(image)

            if not encodings:
                return Response(
                    {"detail": "No se detectó ningún rostro en la imagen."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            unknown_encoding = encodings[0]

            usuarios = Usuario.objects.exclude(encoding_facial__isnull=True).exclude(encoding_facial="")
            for usuario in usuarios:
                try:
                    known_encoding = np.array(json.loads(usuario.encoding_facial))
                    results = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.5)

                    if results[0]:
                        token, _ = Token.objects.get_or_create(user=usuario)
                        return Response({
                            "token": token.key,
                            "user": {
                                "id": usuario.id,
                                "username": usuario.username,
                                "email": usuario.email,
                                "rol": getattr(usuario, "rol", None),
                                "dni": usuario.dni,
                            }
                        })
                except Exception:
                    continue

            return Response(
                {"detail": "Rostro no reconocido."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        except Exception as e:
            return Response(
                {"detail": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AnalizarAudioView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

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
            "estado": metadata.get("estado", "sin_entrenar"),
            "version": metadata.get("version"),
            "fecha_entrenamiento": metadata.get("fecha_entrenamiento"),
            "modelo": metadata.get("modelo"),
            "umbral_desconocido": metadata.get("umbral_desconocido"),
            "clases": metadata.get("clases", []),
        })


class MetricasModeloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(obtener_metadata())


class DatasetAudioListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        queryset = MuestraAudio.objects.all()
        clase = request.query_params.get("clase")
        origen = request.query_params.get("origen")

        if clase:
            queryset = queryset.filter(clase=clase)

        if origen:
            queryset = queryset.filter(origen=origen)

        serializer = MuestraAudioSerializer(queryset, many=True)

        return Response({
            "total": queryset.count(),
            "resultados": serializer.data,
        })

    def post(self, request):
        serializer = MuestraAudioCrearSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        usuario = request.user if request.user.is_authenticated else None

        try:
            muestra = guardar_muestra_dataset(
                archivo=serializer.validated_data["audio"],
                clase=serializer.validated_data["clase"],
                origen=serializer.validated_data["origen"],
                descripcion=serializer.validated_data.get("descripcion", ""),
                usuario=usuario,
            )

            return Response(
                MuestraAudioSerializer(muestra).data,
                status=status.HTTP_201_CREATED,
            )

        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DatasetAudioDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return MuestraAudio.objects.get(pk=pk)
        except MuestraAudio.DoesNotExist:
            return None

    def get(self, request, pk):
        muestra = self.get_object(pk)

        if not muestra:
            return Response(
                {"detail": "Muestra de audio no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(MuestraAudioSerializer(muestra).data)

    def delete(self, request, pk):
        muestra = self.get_object(pk)

        if not muestra:
            return Response(
                {"detail": "Muestra de audio no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            eliminar_muestra_dataset(muestra)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )