from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.core.exceptions import ValidationError

from proprietarios.models import Proprietario
from pets.models import Pet
from canis.models import Canil

from .models import Reserva
from .services import criar_reserva

from rest_framework.test import APITestCase
from django.urls import reverse


class ReservaServiceTests(TestCase):

    def setUp(self):

        # Criar proprietário
        self.proprietario = Proprietario.objects.create(
            nome="João Silva",
            telefone="92999999999",
            email="joao@email.com"
        )

        # Criar pets do proprietário
        self.pet1 = Pet.objects.create(
            nome="Rex",
            raca="Labrador",
            proprietario=self.proprietario
        )

        self.pet2 = Pet.objects.create(
            nome="Thor",
            raca="Golden Retriever",
            proprietario=self.proprietario
        )

        self.pet3 = Pet.objects.create(
            nome="Bob",
            raca="Beagle",
            proprietario=self.proprietario
        )

        # Criar os 15 canis do hotel
        for numero in range(1, 16):
            Canil.objects.get_or_create(numero=numero)

    def test_reserva_de_um_pet_utiliza_um_canil(self):

        reserva, total = criar_reserva(
            self.proprietario.id,
            [self.pet1.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        self.assertEqual(reserva.alocacoes.count(), 1)
        self.assertEqual(total, Decimal("400.00"))

    def test_dois_pets_utilizam_um_canil(self):

        reserva, total = criar_reserva(
            self.proprietario.id,
            [self.pet1.id, self.pet2.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        self.assertEqual(reserva.alocacoes.count(), 1)
        self.assertEqual(total, Decimal("400.00"))

    def test_tres_pets_utilizam_dois_canis(self):

        reserva, total = criar_reserva(
            self.proprietario.id,
            [self.pet1.id, self.pet2.id, self.pet3.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        self.assertEqual(reserva.alocacoes.count(), 2)
        self.assertEqual(total, Decimal("800.00"))

    def test_data_invalida_nao_cria_reserva(self):

        with self.assertRaises(ValidationError):
            criar_reserva(
                self.proprietario.id,
                [self.pet1.id],
                date(2026, 12, 15),
                date(2026, 12, 10)
            )

        self.assertEqual(Reserva.objects.count(), 0)

    def test_canil_nao_pode_ser_reutilizado_no_mesmo_periodo(self):

        primeira_reserva, _ = criar_reserva(
            self.proprietario.id,
            [self.pet1.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        outro_proprietario = Proprietario.objects.create(
            nome="Maria Souza",
            telefone="92988888888"
        )

        outro_pet = Pet.objects.create(
            nome="Luna",
            raca="Poodle",
            proprietario=outro_proprietario
        )

        segunda_reserva, _ = criar_reserva(
            outro_proprietario.id,
            [outro_pet.id],
            date(2026, 12, 12),
            date(2026, 12, 18)
        )

        primeiro_canil = primeira_reserva.alocacoes.first().canil_id
        segundo_canil = segunda_reserva.alocacoes.first().canil_id

        self.assertNotEqual(primeiro_canil, segundo_canil)

    def test_pet_nao_pode_ter_duas_reservas_no_mesmo_periodo(self):

        criar_reserva(
            self.proprietario.id,
            [self.pet1.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        with self.assertRaises(ValidationError):
            criar_reserva(
                self.proprietario.id,
                [self.pet1.id],
                date(2026, 12, 12),
                date(2026, 12, 18)
            )

        self.assertEqual(Reserva.objects.count(), 1)

    
    def test_hotel_nao_aceita_reserva_quando_todos_os_canis_estao_ocupados(self):

        data_entrada = date(2026, 12, 10)
        data_saida = date(2026, 12, 15)

        # O primeiro proprietário ocupa o primeiro canil
        criar_reserva(
            self.proprietario.id,
            [self.pet1.id],
            data_entrada,
            data_saida
        )

        # Criar outros 14 proprietários, cada um com um pet
        for numero in range(2, 16):

            proprietario = Proprietario.objects.create(
                nome=f"Proprietario {numero}",
                telefone=f"929999999{numero:02d}"
            )

            pet = Pet.objects.create(
                nome=f"Pet {numero}",
                raca="SRD",
                proprietario=proprietario
            )

            criar_reserva(
                proprietario.id,
                [pet.id],
                data_entrada,
                data_saida
            )

        # Neste momento, os 15 canis estão ocupados.
        # Vamos tentar criar a 16ª reserva.
        outro_proprietario = Proprietario.objects.create(
            nome="Proprietario 16",
            telefone="92999999916"
        )

        outro_pet = Pet.objects.create(
            nome="Pet 16",
            raca="Poodle",
            proprietario=outro_proprietario
        )

        with self.assertRaises(ValidationError):
            criar_reserva(
                outro_proprietario.id,
                [outro_pet.id],
                data_entrada,
                data_saida
            )

        # As 15 reservas anteriores devem continuar registradas.
        self.assertEqual(Reserva.objects.count(), 15)

    
    def test_canil_pode_ser_reutilizado_no_dia_da_saida(self):

        # Primeira hospedagem: dia 10 até dia 15
        primeira_reserva, _ = criar_reserva(
            self.proprietario.id,
            [self.pet1.id],
            date(2026, 12, 10),
            date(2026, 12, 15)
        )

        # Segundo proprietário e outro pet
        outro_proprietario = Proprietario.objects.create(
            nome="Maria Souza",
            telefone="92988888888"
        )

        outro_pet = Pet.objects.create(
            nome="Luna",
            raca="Poodle",
            proprietario=outro_proprietario
        )

        # Segunda hospedagem começa exatamente no dia da saída da primeira
        segunda_reserva, _ = criar_reserva(
            outro_proprietario.id,
            [outro_pet.id],
            date(2026, 12, 15),
            date(2026, 12, 20)
        )

        primeiro_canil = primeira_reserva.alocacoes.first().canil_id
        segundo_canil = segunda_reserva.alocacoes.first().canil_id

        # O mesmo canil pode ser utilizado novamente
        self.assertEqual(primeiro_canil, segundo_canil)

        self.assertEqual(Reserva.objects.count(), 2)



class ReservaAPITests(APITestCase):

    def setUp(self):

        self.proprietario = Proprietario.objects.create(
            nome="Carlos Souza",
            telefone="92999999999"
        )

        self.pet = Pet.objects.create(
            nome="Max",
            raca="Labrador",
            proprietario=self.proprietario
        )

        # Garantir que os 15 canis estejam cadastrados
        for numero in range(1, 16):
            Canil.objects.get_or_create(numero=numero)

        self.url = reverse("reservas-list")

    def test_api_cria_reserva_com_sucesso(self):

        dados = {
            "proprietario": self.proprietario.id,
            "pets": [self.pet.id],
            "data_entrada": "2026-12-10",
            "data_saida": "2026-12-15"
        }

        resposta = self.client.post(
            self.url,
            dados,
            format="json"
        )

        self.assertEqual(resposta.status_code, 201)

        self.assertEqual(
            resposta.data["proprietario"],
            self.proprietario.id
        )

        self.assertEqual(
            Decimal(str(resposta.data["valor_total"])),
            Decimal("400.00")
        )

        self.assertEqual(Reserva.objects.count(), 1)

    def test_api_rejeita_data_de_saida_invalida(self):

        dados = {
            "proprietario": self.proprietario.id,
            "pets": [self.pet.id],
            "data_entrada": "2026-12-15",
            "data_saida": "2026-12-10"
        }

        resposta = self.client.post(
            self.url,
            dados,
            format="json"
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Reserva.objects.count(), 0)

    def test_api_rejeita_pet_de_outro_proprietario(self):

        outro_proprietario = Proprietario.objects.create(
            nome="Maria Souza",
            telefone="92988888888"
        )

        outro_pet = Pet.objects.create(
            nome="Luna",
            raca="Poodle",
            proprietario=outro_proprietario
        )

        dados = {
            "proprietario": self.proprietario.id,
            "pets": [outro_pet.id],
            "data_entrada": "2026-12-10",
            "data_saida": "2026-12-15"
        }

        resposta = self.client.post(
            self.url,
            dados,
            format="json"
        )

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(Reserva.objects.count(), 0)

