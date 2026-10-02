from rest_framework import serializers

from .models import Deteccion


class DeteccionSerializer(serializers.ModelSerializer):

    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Deteccion

        fields = [
            "id",
            "usuario",
            "usuario_nombre",
            "tipo_sonido",
            "confianza",
            "nivel_riesgo",
            "duracion_segundos",
            "origen",
            "fecha",
        ]

        read_only_fields = [
            "id",
            "usuario",
            "usuario_nombre",
            "fecha",
        ]

    def get_usuario_nombre(self, obj):
        if obj.usuario is None:
            return None

        return obj.usuario.get_username()