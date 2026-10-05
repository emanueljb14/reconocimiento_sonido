from pathlib import Path

from rest_framework import serializers

from .models import MuestraAudio


EXTENSIONES_PERMITIDAS = {
    ".wav",
    ".flac",
    ".ogg",
}

TAMANO_MAXIMO = (
    15 * 1024 * 1024
)


def validar_archivo_audio(
    archivo,
):
    extension = (
        Path(
            archivo.name
        )
        .suffix
        .lower()
    )

    if (
        extension
        not in EXTENSIONES_PERMITIDAS
    ):
        raise serializers.ValidationError(
            "Formato no permitido. "
            "Usa WAV, FLAC u OGG."
        )

    if archivo.size > TAMANO_MAXIMO:
        raise serializers.ValidationError(
            "El archivo supera los 15 MB."
        )

    if archivo.size <= 0:
        raise serializers.ValidationError(
            "El archivo está vacío."
        )

    return archivo


class AnalisisAudioSerializer(
    serializers.Serializer
):
    audio = serializers.FileField()

    origen = serializers.ChoiceField(
        choices=[
            "archivo",
            "microfono",
        ],
        default="archivo",
    )

    def validate_audio(
        self,
        archivo,
    ):
        return validar_archivo_audio(
            archivo
        )


class MuestraAudioCrearSerializer(
    serializers.Serializer
):
    audio = serializers.FileField()

    clase = serializers.ChoiceField(
        choices=[
            item[0]
            for item
            in MuestraAudio.CLASES
        ]
    )

    origen = serializers.ChoiceField(
        choices=[
            item[0]
            for item
            in MuestraAudio.ORIGENES
        ],
        default="archivo",
    )

    descripcion = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
        default="",
    )

    def validate_audio(
        self,
        archivo,
    ):
        return validar_archivo_audio(
            archivo
        )


class MuestraAudioSerializer(
    serializers.ModelSerializer
):
    clase_display = serializers.CharField(
        source="get_clase_display",
        read_only=True,
    )

    origen_display = serializers.CharField(
        source="get_origen_display",
        read_only=True,
    )

    usuario_id = serializers.IntegerField(
        source="usuario.id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = MuestraAudio

        fields = [
            "id",
            "clase",
            "clase_display",
            "origen",
            "origen_display",
            "nombre_archivo",
            "archivo_relativo",
            "descripcion",
            "duracion_segundos",
            "sample_rate",
            "tamano_bytes",
            "sha256",
            "usuario_id",
            "fecha_creacion",
        ]

        read_only_fields = fields
