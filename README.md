# F TEC AUTOMAÇÃO - Gestão Hidráulica

Aplicação web responsiva para gestão operacional de uma empresa de manutenção hidráulica condominial, com foco em carteira de condomínios, visitas técnicas, relatórios, contratos e documentação comercial.

## Visão geral

O projeto foi construído inicialmente como MVP frontend-first para validar fluxos de negócio da empresa `F TEC AUTOMAÇÃO`. A versão atual já opera como V1 fullstack parcial, com frontend React, backend Fastify, autenticação JWT, RBAC, Prisma ORM e PostgreSQL Neon.

O `localStorage` não é mais a persistência operacional principal. Ele guarda apenas dados de sessão do frontend, como token JWT e usuário atual.

## Stack atual

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Node.js + Fastify
- Prisma ORM
- PostgreSQL Neon
- JWT + Argon2
- Zod

## Funcionalidades atuais

- Landing page institucional
- Login real via API
- Painel com indicadores
- Gestão real de condomínios via API
- Gestão real de técnicos via API
- Gestão real de visitas técnicas via API
- Gestão real de contratos via API
- Upload privado de contrato assinado via Vercel Blob
- Geração real de relatório técnico em PDF a partir de visitas
- Download seguro de relatórios via Vercel Blob privado
- Checklist técnico hidráulico persistido
- Termo de instalação e aceite técnico imprimível
- RBAC com perfis `admin`, `manager` e `collaborator`
- Healthcheck do backend em `/health`

## Funcionalidades futuras

- Empresa via API
- Uploads de Relatórios
- Envio de notificações por WhatsApp e e-mail
- Portal do cliente
- PWA/mobile para equipe de campo
- Escalabilidade SaaS

## Instalação do frontend

```bash
npm install
```

## Execução do frontend em desenvolvimento

```bash
npm run dev
```

Abra a URL local exibida pelo Vite no terminal.

## Execução do backend em desenvolvimento

```bash
cd backend
npm install
npm run dev
```

Por padrão, a API local usa `http://localhost:3333`.

## Build de produção do frontend

```bash
npm run build
```

## Deploy

O frontend e o backend devem ser publicados como projetos Vercel separados.

Backend:
- root directory: `backend`;
- build command: `npm run build`;
- variáveis obrigatórias: `DATABASE_URL` e `JWT_SECRET`;
- healthcheck: `https://<backend-project>.vercel.app/health`.

Frontend:
- configurar `VITE_API_BASE_URL=https://<backend-project>.vercel.app`;
- fazer novo deploy após alterar variáveis de ambiente.

## Estrutura de documentação

A pasta [docs](./docs/README.md) concentra a documentação funcional, técnica, de dados, componentes, API e roadmap.

## Observações importantes

- O backend já existe em `backend`.
- A autenticação real usa JWT.
- Condomínios, Técnicos, Visitas e Contratos já usam API e PostgreSQL.
- Visitas, contrato assinado e PDFs de Relatórios já usam Vercel Blob privado para arquivos.
- Empresa, envio de Relatórios e uploads adicionais de Relatórios ainda seguem como próximas etapas.
- O projeto está preparado para evolução incremental, sem perda do contexto funcional atual.
