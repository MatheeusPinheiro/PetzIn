from django.db import models
from proprietarios.models import Proprietario
from canis.models import Canil
from pets.models import Pet



class Reserva(models.Model):

    class Status(models.TextChoices):
        PENDENTE = "PENDENTE", "Pendente"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        CANCELADA = "CANCELADA", "Cancelada"
        CONCLUIDA = "CONCLUIDA", "Concluída"

    proprietario = models.ForeignKey(
        Proprietario,
        on_delete=models.PROTECT,
        related_name="reservas"
    )

    data_entrada = models.DateField()
    data_saida = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.proprietario.nome}"



class Alocacao(models.Model):
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name="alocacoes"
    )

    canil = models.ForeignKey(
        Canil,
        on_delete=models.PROTECT,
        related_name="alocacoes"
    )

    valor_diaria = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.reserva} - {self.canil}"



class PetAlocado(models.Model):
    alocacao = models.ForeignKey(
        Alocacao,
        on_delete=models.CASCADE,
        related_name="pets_alocados"
    )

    pet = models.ForeignKey(
        Pet,
        on_delete=models.PROTECT,
        related_name="alocacoes"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["alocacao", "pet"],
                name="unique_pet_por_alocacao"
            )
        ]

    def __str__(self):
        return f"{self.pet.nome} - {self.alocacao.canil}"
