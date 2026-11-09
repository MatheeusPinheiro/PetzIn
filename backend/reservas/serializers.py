
from decimal import Decimal

from rest_framework import serializers

from proprietarios.models import Proprietario
from pets.models import Pet

from .models import Reserva, Alocacao


class ReservaCriacaoSerializer(serializers.Serializer):

    proprietario = serializers.PrimaryKeyRelatedField(
        queryset=Proprietario.objects.all()
    )

    pets = serializers.PrimaryKeyRelatedField(
        queryset=Pet.objects.all(),
        many=True
    )

    data_entrada = serializers.DateField()
    data_saida = serializers.DateField()

    def validate(self, dados):

        proprietario = dados["proprietario"]
        pets = dados["pets"]

        if dados["data_saida"] <= dados["data_entrada"]:
            raise serializers.ValidationError({
                "data_saida": "A data de saída deve ser posterior à entrada."
            })

        ids_pets = [pet.id for pet in pets]

        if len(ids_pets) != len(set(ids_pets)):
            raise serializers.ValidationError({
                "pets": "Não informe o mesmo pet mais de uma vez."
            })

        for pet in pets:
            if pet.proprietario_id != proprietario.id:
                raise serializers.ValidationError({
                    "pets": f"O pet {pet.nome} não pertence ao proprietário informado."
                })

        return dados


class AlocacaoDetalheSerializer(serializers.ModelSerializer):

    numero_canil = serializers.IntegerField(
        source="canil.numero",
        read_only=True
    )

    pets = serializers.SerializerMethodField()

    class Meta:
        model = Alocacao
        fields = [
            "id",
            "numero_canil",
            "valor_diaria",
            "pets"
        ]

    def get_pets(self, obj):

        return [
            {
                "id": item.pet.id,
                "nome": item.pet.nome,
                "raca": item.pet.raca
            }
            for item in obj.pets_alocados.select_related("pet").all()
        ]


class ReservaDetalheSerializer(serializers.ModelSerializer):

    proprietario_nome = serializers.CharField(
        source="proprietario.nome",
        read_only=True
    )

    alocacoes = AlocacaoDetalheSerializer(
        many=True,
        read_only=True
    )

    valor_total = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            "id",
            "proprietario",
            "proprietario_nome",
            "data_entrada",
            "data_saida",
            "status",
            "alocacoes",
            "valor_total",
            "criado_em"
        ]

    def get_valor_total(self, obj):

        quantidade_diarias = (
            obj.data_saida - obj.data_entrada
        ).days

        total = sum(
            (
                alocacao.valor_diaria * quantidade_diarias
                for alocacao in obj.alocacoes.all()
            ),
            Decimal("0.00")
        )

        return total
