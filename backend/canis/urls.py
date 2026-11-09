from rest_framework.routers import DefaultRouter

from .views import CanilViewSet

router = DefaultRouter()
router.register("canis", CanilViewSet)

urlpatterns = router.urls
