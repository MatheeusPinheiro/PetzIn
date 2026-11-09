
from rest_framework.routers import DefaultRouter
from .views import ProprietarioViewSet

router = DefaultRouter()
router.register("proprietarios", ProprietarioViewSet)

urlpatterns = router.urls
