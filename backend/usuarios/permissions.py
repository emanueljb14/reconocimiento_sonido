from rest_framework import permissions


class EsAdministrador(permissions.BasePermission):
    """
    Permite acceso total solo a Administradores.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol == "ADMINISTRADOR"
        )


class EsSupervisorOAdmin(permissions.BasePermission):
    """
    Permite acceso a Supervisores y Administradores.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol in ["ADMINISTRADOR", "SUPERVISOR"]
        )


class EsUsuarioOSuperior(permissions.BasePermission):
    """
    Permite acceso a cualquier usuario autenticado (Usuario, Supervisor, Administrador).
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated