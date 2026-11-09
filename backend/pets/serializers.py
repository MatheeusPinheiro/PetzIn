from rest_framework import serializers
from .models import Pet


class PetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Pet
        fields = [
            "id",
            "nome",
            "raca",
            "proprietario",
            "criado_em",
        ]
        read_only_fields = ["id", "criado_em"]
