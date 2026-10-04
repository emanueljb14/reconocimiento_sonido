import json
from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Roles(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        USUARIO = "USUARIO", "Usuario"

    dni = models.CharField(
        max_length=8,
        unique=True,
        null=True,
        blank=True,
        help_text="DNI del trabajador/usuario",
    )
    cargo = models.CharField(max_length=100, blank=True, null=True)
    area = models.CharField(max_length=100, blank=True, null=True)
    rol = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.USUARIO,
    )
    # Guarda la imagen capturada en formato Base64
    foto = models.TextField(null=True, blank=True)
    # Guarda el vector de 128 floats (array) en formato JSON para búsquedas y comparación ultrarrápida
    encoding_facial = models.TextField(null=True, blank=True)

    def set_encoding(self, encoding_array):
        """Convierte el array de floats de face_recognition a una cadena JSON"""
        if encoding_array is not None:
            self.encoding_facial = json.dumps(encoding_array.tolist())

    def get_encoding(self):
        """Recupera el array de floats desde el JSON almacenado"""
        if self.encoding_facial:
            return json.loads(self.encoding_facial)
        return None

    def __str__(self):
        nombre_completo = f"{self.first_name} {self.last_name}".strip()
        identificador = nombre_completo if nombre_completo else self.username
        if self.dni:
            return f"{self.dni} - {identificador} ({self.get_rol_display()})"
        return f"{identificador} ({self.get_rol_display()})"