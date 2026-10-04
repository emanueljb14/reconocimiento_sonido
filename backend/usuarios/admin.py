from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = (
        "username",
        "dni",
        "email",
        "first_name",
        "last_name",
        "rol",
        "cargo",
        "area",
        "tiene_rostro",
        "is_active",
    )
    list_filter = ("rol", "is_active", "is_staff", "is_superuser")
    search_fields = ("username", "dni", "first_name", "last_name", "email")

    fieldsets = UserAdmin.fieldsets + (
        (
            "Información Personal y Datos SoundGuard",
            {
                "fields": (
                    "dni",
                    "rol",
                    "cargo",
                    "area",
                )
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Información Personal y Datos SoundGuard",
            {
                "fields": (
                    "dni",
                    "rol",
                    "cargo",
                    "area",
                )
            },
        ),
    )

    def tiene_rostro(self, obj):
        return bool(obj.foto)

    tiene_rostro.boolean = True
    tiene_rostro.short_description = "Rostro Registrado"