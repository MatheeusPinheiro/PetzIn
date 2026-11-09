from rest_framework import serializers
from .models import Proprietario


class ProprietarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proprietario
        fields = [
            "id",
            "nome",
            "telefone",
            "email",
            "criado_em",
        ]
        read_only_fields = ["id", "criado_em"]
