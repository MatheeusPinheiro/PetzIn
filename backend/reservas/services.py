from decimal import Decimal

from django.db import transaction
from django.core.exceptions import ValidationError

from proprietarios.models import Proprietario
from pets.models import Pet
from canis.models import Canil

from .models import Reserva, Alocacao, PetAlocado


VALOR_DIARIA_PADRAO = Decimal("80.00")


@transaction.atomic
def criar_reserva(proprietario_id, pet_ids, data_entrada, data_saida):

    # 1. Validar período da reserva
    if data_saida <= data_entrada:
        raise ValidationError(
            "A data de saída deve ser posterior à entrada."
        )

    # 2. Verificar se o proprietário existe
    try:
        proprietario = Proprietario.objects.get(id=proprietario_id)
    except Proprietario.DoesNotExist:
        raise ValidationError("Proprietário não encontrado.")

    # 3. Verificar se foram informados pets
    if not pet_ids:
        raise ValidationError("Informe pelo menos um pet para a reserva.")

    # 4. Impedir pets repetidos na mesma solicitação
    if len(pet_ids) != len(set(pet_ids)):
        raise ValidationError("Não informe o mesmo pet mais de uma vez.")

    # 5. Verificar se os pets existem e pertencem ao proprietário
    pets = list(
        Pet.objects.filter(
            id__in=pet_ids,
            proprietario=proprietario
        ).order_by("id")
    )

    if len(pets) != len(pet_ids):
        raise ValidationError(
            "Um ou mais pets não existem ou não pertencem ao proprietário."
        )

    # 6. Verificar se algum pet já possui hospedagem no período
    pets_com_reserva = PetAlocado.objects.filter(
        pet_id__in=pet_ids,
        alocacao__reserva__data_entrada__lt=data_saida,
        alocacao__reserva__data_saida__gt=data_entrada
    ).exclude(
        alocacao__reserva__status=Reserva.Status.CANCELADA
    )

    if pets_com_reserva.exists():
        raise ValidationError(
            "Um ou mais pets já possuem hospedagem nesse período."
        )

    # 7. Consultar e bloquear os canis ativos durante a transação
    canis = list(
        Canil.objects.filter(ativo=True)
        .order_by("numero")
        .select_for_update()
    )

    # 8. Identificar canis ocupados no período solicitado
    canis_ocupados = Alocacao.objects.filter(
        canil__in=canis,
        reserva__data_entrada__lt=data_saida,
        reserva__data_saida__gt=data_entrada
    ).exclude(
        reserva__status=Reserva.Status.CANCELADA
    ).values_list(
        "canil_id",
        flat=True
    ).distinct()

    canis_ocupados = set(canis_ocupados)

    # 9. Separar os canis disponíveis
    canis_disponiveis = [
        canil
        for canil in canis
        if canil.id not in canis_ocupados
    ]

    # 10. Calcular quantos canis serão necessários
    # Cada canil pode receber até dois pets da mesma família.
    quantidade_canis = (len(pets) + 1) // 2

    if len(canis_disponiveis) < quantidade_canis:
        raise ValidationError(
            "Não existem canis suficientes disponíveis para esse período."
        )

    # 11. Calcular o valor da hospedagem
    quantidade_diarias = (data_saida - data_entrada).days

    valor_total = (
        Decimal(quantidade_canis)
        * Decimal(quantidade_diarias)
        * VALOR_DIARIA_PADRAO
    )

    # 12. Criar a reserva
    reserva = Reserva.objects.create(
        proprietario=proprietario,
        data_entrada=data_entrada,
        data_saida=data_saida,
        status=Reserva.Status.CONFIRMADA
    )

    # 13. Distribuir os pets nos canis disponíveis
    for indice in range(quantidade_canis):

        canil = canis_disponiveis[indice]

        alocacao = Alocacao.objects.create(
            reserva=reserva,
            canil=canil,
            valor_diaria=VALOR_DIARIA_PADRAO
        )

        # Cada canil recebe no máximo dois pets
        pets_do_canil = pets[indice * 2:(indice + 1) * 2]

        for pet in pets_do_canil:
            PetAlocado.objects.create(
                alocacao=alocacao,
                pet=pet
            )

    return reserva, valor_total
