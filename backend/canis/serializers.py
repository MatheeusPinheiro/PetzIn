from rest_framework import serializers

from .models import Canil


class CanilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Canil
        fields = ["id", "numero", "ativo"]
        read_only_fields = ["id"]
