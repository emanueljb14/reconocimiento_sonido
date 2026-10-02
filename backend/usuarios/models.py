from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Roles(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        USUARIO = "USUARIO", "Usuario"

    rol = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.USUARIO,
    )

    def __str__(self):
        return self.username