import django_filters

from .models import Deteccion


class DeteccionFilter(django_filters.FilterSet):

    fecha_desde = django_filters.IsoDateTimeFilter(
        field_name="fecha",
        lookup_expr="gte",
    )

    fecha_hasta = django_filters.IsoDateTimeFilter(
        field_name="fecha",
        lookup_expr="lte",
    )

    confianza_minima = django_filters.NumberFilter(
        field_name="confianza",
        lookup_expr="gte",
    )

    class Meta:
        model = Deteccion

        fields = [
            "tipo_sonido",
            "nivel_riesgo",
            "origen",
            "usuario",
        ]