# PetzIn Frontend

Frontend do sistema PetzIn em React + TypeScript.

## Arquitetura

O frontend utiliza:

- React + TypeScript
- Vite
- React Router
- camada de serviços em src/services/api.ts

A estrutura segue o padrão de:

- View: páginas em src/pages
- Service Layer: comunicação com a API
- Model: tipos exportados em src/services/api.ts

## Funcionalidades

- cadastro de proprietários
- cadastro de pets
- cadastro de canis
- cadastro de reservas
- dashboard inicial com visão geral

## Execução

```bash
cd c:\Sistemas\petzIn\frontend
npm install
npm run dev
```

## Observação

O projeto não usa MVC clássico em React. A abordagem é mais próxima do padrão View + Service Layer, que é a forma mais natural para SPAs modernas.
