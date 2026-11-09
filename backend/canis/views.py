from rest_framework import viewsets

from .models import Canil
from .serializers import CanilSerializer


class CanilViewSet(viewsets.ModelViewSet):
    queryset = Canil.objects.all().order_by("numero")
    serializer_class = CanilSerializer
