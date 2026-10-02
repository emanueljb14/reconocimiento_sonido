from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Deteccion(models.Model):

    class TipoSonido(models.TextChoices):
        GOLPE = "golpe", "Golpe"
        PUERTA = "puerta", "Puerta"
        ALARMA = "alarma", "Alarma"
        APLAUSOS = "aplausos", "Aplausos"
        VIDRIO = "vidrio", "Vidrio roto"
        RUIDO_ELEVADO = "ruido_elevado", "Ruido elevado"
        DESCONOCIDO = "desconocido", "Desconocido"

    class NivelRiesgo(models.TextChoices):
        BAJO = "bajo", "Bajo"
        MEDIO = "medio", "Medio"
        ALTO = "alto", "Alto"
        CRITICO = "critico", "Crítico"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="detecciones",
    )

    tipo_sonido = models.CharField(
        max_length=30,
        choices=TipoSonido.choices,
        default=TipoSonido.DESCONOCIDO,
    )

    confianza = models.FloatField(
        default=0.0,
        validators=[
            MinValueValidator(0.0),
            MaxValueValidator(1.0),
        ],
    )

    nivel_riesgo = models.CharField(
        max_length=10,
        choices=NivelRiesgo.choices,
        default=NivelRiesgo.BAJO,
    )

    duracion_segundos = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0)],
    )

    origen = models.CharField(
        max_length=30,
        default="microfono",
    )

    fecha = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-fecha"]
        verbose_name = "Detección"
        verbose_name_plural = "Detecciones"

    def __str__(self):
        return (
            f"{self.tipo_sonido} - "
            f"{self.confianza:.2f} - "
            f"{self.nivel_riesgo}"
        )