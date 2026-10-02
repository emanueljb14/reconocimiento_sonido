from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from detecciones.models import Deteccion


class ResumenEstadisticasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        ahora = timezone.now()
        hace_24_horas = ahora - timedelta(hours=24)

        detecciones = Deteccion.objects.all()

        usuario = request.user

        if usuario.is_authenticated:
            rol = getattr(usuario, "rol", None)

            if rol not in ["ADMINISTRADOR", "SUPERVISOR"]:
                detecciones = detecciones.filter(usuario=usuario)

        ultimas_24_horas = detecciones.filter(
            fecha__gte=hace_24_horas
        )

        por_tipo = list(
            detecciones
            .values("tipo_sonido")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        por_riesgo = list(
            detecciones
            .values("nivel_riesgo")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        promedio = detecciones.aggregate(
            promedio=Avg("confianza")
        )["promedio"]

        return Response({
            "total_detecciones": detecciones.count(),
            "ultimas_24_horas": ultimas_24_horas.count(),
            "confianza_promedio": round(promedio or 0, 4),
            "por_tipo": por_tipo,
            "por_riesgo": por_riesgo,
            "actualizado_en": ahora.isoformat(),
        })