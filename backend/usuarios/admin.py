from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    # Columnas a mostrar en la lista de usuarios
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "rol",
        "is_staff",
    )
    list_filter = ("rol", "is_staff", "is_superuser", "is_active")

    # Agregamos el campo 'rol' a los formularios de edición
    fieldsets = UserAdmin.fieldsets + (
        ("Rol y Permisos SoundGuard", {"fields": ("rol",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Rol y Permisos SoundGuard", {"fields": ("rol",)}),
    )