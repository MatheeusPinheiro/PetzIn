
from rest_framework import viewsets
from .models import Proprietario
from .serializers import ProprietarioSerializer


class ProprietarioViewSet(viewsets.ModelViewSet):
    queryset = Proprietario.objects.all()
    serializer_class = ProprietarioSerializer
