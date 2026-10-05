from django.contrib import admin

from .models import (
    MuestraAudio,
)


@admin.register(
    MuestraAudio
)
class MuestraAudioAdmin(
    admin.ModelAdmin
):
    list_display = [
        "id",
        "clase",
        "origen",
        "nombre_archivo",
        "duracion_segundos",
        "sample_rate",
        "fecha_creacion",
    ]

    list_filter = [
        "clase",
        "origen",
        "fecha_creacion",
    ]

    search_fields = [
        "nombre_archivo",
        "descripcion",
        "sha256",
    ]

    readonly_fields = [
        "archivo_relativo",
        "duracion_segundos",
        "sample_rate",
        "tamano_bytes",
        "sha256",
        "fecha_creacion",
    ]
