import base64
import io
import json
import re
import face_recognition
import numpy as np

from django.contrib.auth import login
from rest_framework import status
<<<<<<< HEAD
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from usuarios.models import Usuario
from usuarios.serializers import UsuarioSerializer

from .modelo import modelo_existe, obtener_metadata
from .serializers import AnalisisAudioSerializer
from .services import analizar_y_registrar

# Tolerancia predeterminada para face_recognition (0.5 para mayor rigurosidad)
TOLERANCIA_RECONOCIMIENTO = 0.5


def calcular_porcentaje_similitud(distancia, tolerancia=TOLERANCIA_RECONOCIMIENTO):
    """Convierte la distancia euclidiana entre dos rostros en un porcentaje de similitud (0% a 100%)."""
    if distancia > tolerancia:
        rango = 1.0 - tolerancia
        delta = distancia - tolerancia
        similitud = max(0.0, (1.0 - (delta / rango)) * 0.5)
    else:
        rango = tolerancia
        similitud = 1.0 - (distancia / (rango * 2))
    return round(similitud * 100, 2)


def base64_to_cv2(base64_string):
    """Convierte la cadena Base64 recibida desde React en una matriz de imagen procesable."""
    img_data = re.sub("^data:image/.+;base64,", "", base64_string)
    img_bytes = base64.b64decode(img_data)
    image_stream = io.BytesIO(img_bytes)
    return face_recognition.load_image_file(image_stream)


class RegisterFaceView(APIView):
    """Endpoint para registrar la foto biométrica y calcular su encoding facial."""

    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        identifier = str(request.data.get("dni") or request.data.get("username") or "").strip()
        image_data = request.data.get("image")

        if not identifier or not image_data:
            return Response(
                {"detail": "Se requiere el DNI/Usuario y la imagen capturada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validación del formato de DNI (debe ser exactamente 8 dígitos numéricos)
        if not re.match(r"^\d{8}$", identifier):
            return Response(
                {"detail": "El DNI ingresado es inválido. Debe contener exactamente 8 dígitos numéricos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = Usuario.objects.filter(dni=identifier).first()
        if not usuario:
            usuario = Usuario.objects.filter(username=identifier).first()

        if not usuario:
            return Response(
                {"detail": f"El DNI o Usuario '{identifier}' no se encuentra registrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            face_img = base64_to_cv2(image_data)
            encodings = face_recognition.face_encodings(face_img)

            if len(encodings) == 0:
                return Response(
                    {"detail": "No se detectó ningún rostro. Enfoca mejor la cámara e intentalo de nuevo."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            usuario.foto = image_data
            usuario.set_encoding(encodings[0])
            usuario.save()

            return Response(
                {
                    "status": "success",
                    "message": f"Rostro registrado correctamente para {usuario.first_name or usuario.username}.",
                },
                status=status.HTTP_200_OK,
            )
        except Exception as error:
            return Response(
                {"detail": f"Error al procesar la imagen facial: {str(error)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginFaceView(APIView):
    """Endpoint para autenticación biométrica 1 a 1 verificando rostro en vivo contra el DNI."""

    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        dni_ingresado = str(request.data.get("dni", "")).strip()
        image_data = request.data.get("image")
        liveness_passed = request.data.get("liveness_passed", False)

        if not dni_ingresado or not image_data:
            return Response(
                {"detail": "Ingrese su DNI y capture su rostro con la cámara."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validación estricta: DNI debe constar únicamente de 8 dígitos numéricos
        if not re.match(r"^\d{8}$", dni_ingresado):
            return Response(
                {"detail": "DNI inválido. Debe ingresar un número de DNI válido de 8 dígitos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = Usuario.objects.filter(dni=dni_ingresado, is_active=True).first()
        if not usuario:
            usuario = Usuario.objects.filter(username=dni_ingresado, is_active=True).first()

        if not usuario:
            return Response(
                {"detail": f"El DNI o Usuario '{dni_ingresado}' no existe o está inactivo."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not usuario.foto:
            return Response(
                {"detail": f"El usuario {usuario.get_full_name() or usuario.username} no tiene registrado un rostro biométrico."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            login_img = base64_to_cv2(image_data)
            login_encodings = face_recognition.face_encodings(login_img)

            if len(login_encodings) == 0:
                return Response(
                    {"detail": "No se detectó un rostro frente a la cámara.", "similitud": 0.0},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            login_encoding = login_encodings[0]

            # Obtener encoding guardado o calcularlo como fallback
            registered_encoding_list = usuario.get_encoding()
            if registered_encoding_list:
                registered_encoding = np.array(registered_encoding_list)
            else:
                reg_img = base64_to_cv2(usuario.foto)
                reg_encodings = face_recognition.face_encodings(reg_img)
                if len(reg_encodings) == 0:
                    return Response(
                        {"detail": "La imagen registrada guardada no es válida."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                registered_encoding = reg_encodings[0]
                usuario.set_encoding(registered_encoding)
                usuario.save()

            distancia = face_recognition.face_distance([registered_encoding], login_encoding)[0]
            similitud = calcular_porcentaje_similitud(distancia, TOLERANCIA_RECONOCIMIENTO)

            if distancia <= TOLERANCIA_RECONOCIMIENTO:
                login(request, usuario)
                token, _ = Token.objects.get_or_create(user=usuario)
                usuario_data = UsuarioSerializer(usuario).data

                return Response(
                    {
                        "status": "success",
                        "message": f"¡Bienvenido {usuario.first_name or usuario.username}!",
                        "token": token.key,
                        "user": usuario_data,
                        "usuario": usuario_data,
                        "rol": usuario.rol,
                        "role": usuario.rol,
                        "similitud": similitud,
                        "distancia": round(float(distancia), 4),
                        "liveness_verified": liveness_passed,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {
                        "status": "error",
                        "detail": f"Verificación fallida: El rostro capturado no corresponde al DNI {dni_ingresado}.",
                        "similitud": similitud,
                        "distancia": round(float(distancia), 4),
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        except Exception as error:
            return Response(
                {"detail": f"Error interno en el servidor: {str(error)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
=======
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .modelo import modelo_existe, obtener_metadata
from .serializers import AnalisisAudioSerializer
from .services import analizar_y_registrar
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0


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