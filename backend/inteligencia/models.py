from django.conf import settings
from django.db import models


class MuestraAudio(models.Model):
    CLASES = [
        ("golpe", "Golpe"),
        ("puerta", "Puerta"),
        ("alarma", "Alarma"),
        ("aplausos", "Aplausos"),
        ("vidrio", "Vidrio"),
        ("ruido_elevado", "Ruido elevado"),
    ]

    ORIGENES = [
        ("archivo", "Archivo"),
        ("microfono", "Micrófono"),
    ]

    clase = models.CharField(
        max_length=32,
        choices=CLASES,
        db_index=True,
    )

    origen = models.CharField(
        max_length=16,
        choices=ORIGENES,
        default="archivo",
        db_index=True,
    )

    nombre_archivo = models.CharField(
        max_length=255,
    )

    archivo_relativo = models.CharField(
        max_length=500,
        unique=True,
    )

    descripcion = models.TextField(
        blank=True,
        default="",
    )

    duracion_segundos = models.FloatField(
        null=True,
        blank=True,
    )

    sample_rate = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    tamano_bytes = models.PositiveBigIntegerField(
        default=0,
    )

    sha256 = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="muestras_audio_soundguard",
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        ordering = [
            "-fecha_creacion",
        ]

    def __str__(self):
        return (
            f"{self.get_clase_display()} - "
            f"{self.nombre_archivo}"
        )
