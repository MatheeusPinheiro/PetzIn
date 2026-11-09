# PetzIn

Sistema de gestão para hotel de pets com cadastro de proprietários, pets, canis e reservas.

## Visão geral

O PetzIn foi desenvolvido para controlar a hospedagem de animais em um hotel, permitindo:

- cadastrar proprietários
- cadastrar pets vinculados a cada proprietário
- cadastrar canis
- registrar reservas de hospedagem
- validar disponibilidade e regras de negócio
- calcular o valor total da estadia

## Objetivo do projeto

O sistema tem como foco atender a gestão operativa de um hotel para pets, com controle de ocupação por período e organização de cada hóspede em canis disponíveis.

## Funcionalidades implementadas

### Cadastro de proprietários
- nome
- telefone
- e-mail opcional

### Cadastro de pets
- nome
- raça
- vínculo com o proprietário

### Cadastro de canis
- número do canil
- status ativo/inativo

### Cadastro de reservas
- proprietário responsável
- pets selecionados
- data de entrada
- data de saída
- cálculo do valor total da reserva

## Regras de negócio

A aplicação valida regras importantes antes de confirmar a reserva:

- a data de saída deve ser maior que a data de entrada
- o proprietário deve existir
- deve haver pelo menos um pet na reserva
- não pode repetir o mesmo pet na mesma solicitação
- o pet deve pertencer ao proprietário informado
- não pode haver conflito de ocupação para o mesmo pet em um período
- a quantidade de canis disponíveis deve ser suficiente
- cada canil pode receber até dois pets da mesma família
- o valor da hospedagem é calculado conforme a quantidade de diárias e canis necessários

## Arquitetura

### Backend

Tecnologias:
- Python
- Django
- Django REST Framework
- PostgreSQL

Aplicações principais:
- proprietarios
- pets
- canis
- reservas

### Frontend

Tecnologias:
- React
- TypeScript
- Vite
- React Router

Estrutura principal:
- páginas em src/pages
- serviços de API em src/services/api.ts
- rotas em src/App.tsx

### Padrão arquitetural aplicado

O frontend não usa MVC clássico de framework web tradicional. O padrão adotado é mais próximo de:

- View: páginas e componentes React
- Service Layer: funções de comunicação com a API
- Model: tipos e estruturas de dados do frontend

Essa abordagem é a mais natural para SPAs em React, mantendo a interface separada da camada de acesso aos dados.

## Estrutura do projeto

```text
petzIn/
├── backend/
│   ├── canis/
│   ├── config/
│   ├── pets/
│   ├── proprietarios/
│   ├── reservas/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── docker-compose.yml
├── README.md
├── .gitignore
└── venv/
```

## Tecnologias utilizadas

### Backend
- Django
- Django REST Framework
- PostgreSQL

### Frontend
- React
- TypeScript
- Vite
- React Router

## Como executar o projeto em qualquer máquina com Docker

### 1. Clone o projeto

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
```

### 2. Suba todos os serviços

```bash
docker compose up -d --build
```

Esse comando cria automaticamente:
- banco PostgreSQL
- backend Django
- frontend React
- execução das migrações
- carga inicial de dados fictícios

### 3. Acesse a aplicação

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api/

### 4. Se quiser rodar sem Docker

```bash
cd c:\Sistemas\petzIn\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

```bash
cd c:\Sistemas\petzIn\frontend
npm install
npm run dev
```

## Acesso local

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api/

## Endpoints principais

### Proprietários
- GET /api/proprietarios/
- POST /api/proprietarios/

### Pets
- GET /api/pets/
- POST /api/pets/

### Canis
- GET /api/canis/
- POST /api/canis/

### Reservas
- GET /api/reservas/
- POST /api/reservas/

## Fluxo principal do sistema

1. cadastrar proprietário
2. cadastrar pets do proprietário
3. cadastrar canis
4. criar reserva com pets, entrada e saída
5. validar disponibilidade
6. registrar a reserva e calcular o valor

## Status atual

O projeto está estruturado e funcional para atender ao desafio solicitado, com backend validado por testes e frontend em React + TypeScript com páginas de cadastro e navegação.

## Observação

Este README foi elaborado com base no projeto implementado e na regra de negócio já validada no backend.
