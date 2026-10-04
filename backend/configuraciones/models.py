from django.conf import settings
from django.db import models


class ConfiguracionUsuario(models.Model):

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="configuracion",
    )

    notificaciones = models.BooleanField(
        default=True
    )

    alertas_riesgo_alto = models.BooleanField(
        default=True
    )

    inicio_automatico = models.BooleanField(
        default=True
    )

    acceso_microfono = models.BooleanField(
        default=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"Configuración de "
            f"{self.usuario.username}"
        )