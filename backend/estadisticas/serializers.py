from rest_framework import serializers


class RiesgosSerializer(serializers.Serializer):
    bajo = serializers.IntegerField()
    medio = serializers.IntegerField()
    alto = serializers.IntegerField()
    critico = serializers.IntegerField()


class ResumenEstadisticasSerializer(
    serializers.Serializer
):
    total_detecciones = serializers.IntegerField()
    detecciones_hoy = serializers.IntegerField()
    ultimas_24_horas = serializers.IntegerField()

    confianza_promedio = serializers.FloatField()

    riesgos = RiesgosSerializer()

    actualizado_en = serializers.CharField()


class EstadisticaSonidoSerializer(
    serializers.Serializer
):
    tipo_sonido = serializers.CharField()
    total = serializers.IntegerField()


class EstadisticaRiesgoSerializer(
    serializers.Serializer
):
    nivel_riesgo = serializers.CharField()
    total = serializers.IntegerField()


class EstadisticaHoraSerializer(
    serializers.Serializer
):
    hora = serializers.CharField()
    total = serializers.IntegerField()


class EstadisticaDiaSerializer(
    serializers.Serializer
):
    dia = serializers.CharField()
    total = serializers.IntegerField()