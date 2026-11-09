from django.db import models


class Canil(models.Model):
    numero = models.PositiveSmallIntegerField(unique=True)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"Canil {self.numero}"
