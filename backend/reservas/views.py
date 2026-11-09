from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status, viewsets, mixins, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Reserva
from .services import criar_reserva
from .serializers import (
    ReservaCriacaoSerializer,
    ReservaDetalheSerializer
)


class ReservaViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):

    queryset = Reserva.objects.select_related(
        "proprietario"
    ).prefetch_related(
        "alocacoes__canil",
        "alocacoes__pets_alocados__pet"
    ).all().order_by("-criado_em")

    serializer_class = ReservaDetalheSerializer

    def get_serializer_class(self):

        if self.action == "create":
            return ReservaCriacaoSerializer

        return ReservaDetalheSerializer

    def create(self, request):

        serializer = ReservaCriacaoSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        dados = serializer.validated_data

        try:

            reserva, valor_total = criar_reserva(
                proprietario_id=dados["proprietario"].id,
                pet_ids=[pet.id for pet in dados["pets"]],
                data_entrada=dados["data_entrada"],
                data_saida=dados["data_saida"]
            )

        except DjangoValidationError as erro:

            raise serializers.ValidationError(erro.messages)

        resposta = ReservaDetalheSerializer(reserva)

        return Response(
            resposta.data,
            status=status.HTTP_201_CREATED
        )
