from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from canis.models import Canil
from pets.models import Pet
from proprietarios.models import Proprietario
from reservas.models import Reserva
from reservas.services import criar_reserva


class Command(BaseCommand):
    help = "Popula o sistema com dados fictícios para desenvolvimento e testes."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Gerando dados fictícios do PetzIn..."))

        proprietarios = [
            {
                "nome": "João da Silva",
                "telefone": "11999990001",
                "email": "joao.silva@email.com",
            },
            {
                "nome": "Maria Oliveira",
                "telefone": "11999990002",
                "email": "maria.oliveira@email.com",
            },
            {
                "nome": "Carlos Mendes",
                "telefone": "11999990003",
                "email": "carlos.mendes@email.com",
            },
        ]

        proprietario_map = {}
        for dados in proprietarios:
            obj, created = Proprietario.objects.get_or_create(
                nome=dados["nome"],
                telefone=dados["telefone"],
                defaults={"email": dados["email"]},
            )
            proprietario_map[dados["nome"]] = obj
            if created:
                self.stdout.write(f"Proprietário criado: {obj.nome}")

        pets_por_proprietario = {
            "João da Silva": [
                ("Rex", "Pastor Alemão"),
                ("Luna", "Labrador"),
            ],
            "Maria Oliveira": [
                ("Thor", "Bulldog"),
                ("Nina", "Poodle"),
            ],
            "Carlos Mendes": [
                ("Milo", "Shih Tzu"),
                ("Coco", "Yorkshire"),
            ],
        }

        pet_map = {}
        for proprietario_nome, pets in pets_por_proprietario.items():
            proprietario = proprietario_map[proprietario_nome]
            for nome, raca in pets:
                pet, created = Pet.objects.get_or_create(
                    nome=nome,
                    proprietario=proprietario,
                    defaults={"raca": raca},
                )
                pet_map[(proprietario_nome, nome)] = pet
                if created:
                    self.stdout.write(f"Pet criado: {pet.nome} ({pet.raca})")

        canis = [
            (1, True),
            (2, True),
            (3, True),
            (4, False),
        ]

        for numero, ativo in canis:
            canil, created = Canil.objects.get_or_create(
                numero=numero,
                defaults={"ativo": ativo},
            )
            if created:
                self.stdout.write(f"Canil criado: Canil {canil.numero}")
            else:
                canil.ativo = ativo
                canil.save(update_fields=["ativo"])

        hoje = date.today()

        reservas_base = [
            (
                "João da Silva",
                ["Rex", "Luna"],
                hoje + timedelta(days=5),
                hoje + timedelta(days=10),
            ),
            (
                "Maria Oliveira",
                ["Thor"],
                hoje + timedelta(days=12),
                hoje + timedelta(days=17),
            ),
            (
                "Carlos Mendes",
                ["Milo", "Coco"],
                hoje + timedelta(days=20),
                hoje + timedelta(days=25),
            ),
        ]

        for proprietario_nome, nomes_pets, data_entrada, data_saida in reservas_base:
            proprietario = proprietario_map[proprietario_nome]
            pet_ids = []
            for nome_pet in nomes_pets:
                pet = pet_map[(proprietario_nome, nome_pet)]
                pet_ids.append(pet.id)

            exists = Reserva.objects.filter(
                proprietario=proprietario,
                data_entrada=data_entrada,
                data_saida=data_saida,
            ).exists()

            if not exists:
                reserva, _ = criar_reserva(
                    proprietario_id=proprietario.id,
                    pet_ids=pet_ids,
                    data_entrada=data_entrada,
                    data_saida=data_saida,
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Reserva criada para {proprietario_nome}: {reserva.id}"
                    )
                )
            else:
                self.stdout.write(
                    f"Reserva já existente para {proprietario_nome} no período solicitado."
                )

        self.stdout.write(
            self.style.SUCCESS("Seed concluído com sucesso. Dados fictícios carregados.")
        )
