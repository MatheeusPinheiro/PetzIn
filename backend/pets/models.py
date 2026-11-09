from django.db import models
from proprietarios.models import Proprietario


class Pet(models.Model):
    nome = models.CharField(max_length=100)
    raca = models.CharField(max_length=100)

    proprietario = models.ForeignKey(
        Proprietario,
        on_delete=models.CASCADE,
        related_name="pets"
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.proprietario.nome}"
