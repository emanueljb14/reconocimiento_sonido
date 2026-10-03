from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .filters import DeteccionFilter
from .models import Deteccion
from .serializers import DeteccionSerializer


class DeteccionViewSet(viewsets.ModelViewSet):

    serializer_class = DeteccionSerializer

    # TEMPORAL mientras usuarios/login no esté integrado.
    permission_classes = [
    IsAuthenticated
]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = DeteccionFilter

    search_fields = [
        "tipo_sonido",
        "origen",
    ]

    ordering_fields = [
        "fecha",
        "confianza",
        "nivel_riesgo",
    ]

    ordering = ["-fecha"]

    def get_queryset(self):

        queryset = (
            Deteccion.objects
            .select_related("usuario")
            .all()
        )

        usuario = self.request.user

        if not usuario.is_authenticated:
            return queryset

        rol = getattr(usuario, "rol", None)

        if rol in [
            "ADMINISTRADOR",
            "SUPERVISOR",
        ]:
            return queryset

        return queryset.filter(
            usuario=usuario
        )

    def perform_create(self, serializer):

        usuario = (
            self.request.user
            if self.request.user.is_authenticated
            else None
        )

        serializer.save(
            usuario=usuario
        )