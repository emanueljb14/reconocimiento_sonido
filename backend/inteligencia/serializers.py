from pathlib import Path

from rest_framework import serializers


EXTENSIONES_PERMITIDAS = {
    ".wav",
    ".flac",
    ".ogg",
}

TAMANO_MAXIMO = (
    15 * 1024 * 1024
)


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

        return archivo