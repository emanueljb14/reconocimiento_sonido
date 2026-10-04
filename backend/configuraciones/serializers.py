from rest_framework import serializers

from .models import ConfiguracionUsuario


class ConfiguracionUsuarioSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ConfiguracionUsuario

        fields = [
            "notificaciones",
            "alertas_riesgo_alto",
            "inicio_automatico",
            "acceso_microfono",
            "actualizado_en",
        ]

        read_only_fields = [
            "actualizado_en",
        ]