from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .filters import DeteccionFilter
from .models import Deteccion
from .serializers import DeteccionSerializer


class DeteccionViewSet(viewsets.ModelViewSet):

    serializer_class = DeteccionSerializer

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

    ordering = [
        "-fecha"
    ]

    def get_queryset(self):
        """
        Todos los usuarios autenticados pueden
        consultar las detecciones registradas
        en el backend.
        """

        return (
            Deteccion.objects
            .select_related("usuario")
            .all()
        )

    def perform_create(self, serializer):
        """
        Las nuevas detecciones se guardan
        asociadas al usuario que las generó.
        """

        serializer.save(
            usuario=self.request.user
        )