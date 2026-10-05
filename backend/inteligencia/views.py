import base64
import io
import json
import face_recognition
import numpy as np

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .modelo import modelo_existe, obtener_metadata
from .serializers import AnalisisAudioSerializer
from .services import analizar_y_registrar

Usuario = get_user_model()


class RegisterFaceView(APIView):
    permission_classes = [IsAuthenticated]

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

            encoding_json = json.dumps(encodings[0].tolist())
            usuario = request.user
            usuario.encoding_facial = encoding_json
            usuario.save()

            return Response(
                {"detail": "Rostro registrado exitosamente."},
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