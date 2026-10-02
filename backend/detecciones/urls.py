from rest_framework.routers import DefaultRouter

from .views import DeteccionViewSet


router = DefaultRouter()

router.register(
    "",
    DeteccionViewSet,
    basename="deteccion",
)

urlpatterns = router.urls