import os
import tempfile

from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from detecciones.models import Deteccion

from .prediccion import clasificar_audio
from .riesgo import calcular_riesgo
from .serializers import AudioSerializer


class AnalizarAudioView(APIView):

    permission_classes = [AllowAny]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):

        serializer = AudioSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        archivo = serializer.validated_data["audio"]

        extension = os.path.splitext(
            archivo.name
        )[1]

        ruta_temporal = None

        try:

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=extension,
            ) as temporal:

                for fragmento in archivo.chunks():
                    temporal.write(fragmento)

                ruta_temporal = temporal.name

            resultado = clasificar_audio(
                ruta_temporal
            )

            tipo = resultado["tipo_sonido"]

            confianza = resultado["confianza"]

            riesgo = calcular_riesgo(
                tipo,
                confianza,
            )

            usuario = (
                request.user
                if request.user.is_authenticated
                else None
            )

            deteccion = Deteccion.objects.create(
                usuario=usuario,
                tipo_sonido=tipo,
                confianza=confianza,
                nivel_riesgo=riesgo,
                duracion_segundos=3,
                origen="archivo",
            )

            return Response({
                "id": deteccion.id,
                "tipo_sonido": tipo,
                "confianza": confianza,
                "nivel_riesgo": riesgo,
                "fecha": deteccion.fecha,
            })

        finally:

            if (
                ruta_temporal
                and os.path.exists(ruta_temporal)
            ):
                os.remove(ruta_temporal)