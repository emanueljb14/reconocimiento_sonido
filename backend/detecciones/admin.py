from django.contrib import admin

from .models import Deteccion


@admin.register(Deteccion)
class DeteccionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "usuario",
        "tipo_sonido",
        "confianza",
        "nivel_riesgo",
        "origen",
        "fecha",
    )

    list_filter = (
        "tipo_sonido",
        "nivel_riesgo",
        "origen",
        "fecha",
    )

    search_fields = (
        "tipo_sonido",
        "origen",
        "usuario__username",
    )

    readonly_fields = (
        "fecha",
    )