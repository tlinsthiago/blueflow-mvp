# Next Session Context

## 1. Visão Geral
`BlueFlow Gestão Hidráulica` é uma aplicação web para gestão operacional, técnica e contratual de manutenção hidráulica em condomínios.

O projeto saiu do MVP frontend-only e agora está em uma V1 fullstack parcial:
- frontend React + Vite + Tailwind;
- backend Fastify;
- PostgreSQL Neon;
- Prisma ORM;
- autenticação JWT;
- RBAC;
- CRUD real de Condomínios e Técnicos.

## 2. Contexto de Negócio
O sistema atende a operação da empresa **F TEC AUTOMAÇÃO**, centralizando:
- carteira de condomínios;
- equipe técnica;
- visitas técnicas;
- checklist hidráulico;
- relatórios;
- contratos;
- dados institucionais da empresa contratada.

## 3. Stack Atual
### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React

### Backend
- Node.js
- Fastify
- Prisma
- PostgreSQL Neon
- JWT
- Argon2
- Zod

## 4. Status Atual
### Implementado
- Login real via `POST /auth/login`.
- Bootstrap de sessão via `GET /auth/me`.
- Interceptor de `401` no frontend.
- RBAC frontend e backend.
- Menu filtrado por perfil.
- CRUD real de Condomínios.
- CRUD real de Técnicos.
- Migrations Prisma.
- Seed de usuários iniciais.

### Ainda Não Integrado
- Empresa.
- Visitas.
- Checklist persistido.
- Fotos/uploads.
- Relatórios.
- Contratos.
- Geração de PDF.
- Portal do cliente.

## 5. Perfis
- `admin`: acesso total.
- `manager`: acesso total.
- `collaborator`: visualiza módulos operacionais permitidos; não cria/edita/exclui Condomínios e Técnicos; não acessa Contratos nem Empresa.

## 6. Armazenamento no Frontend
O frontend persiste apenas:
- `blueflow-auth-token`;
- `blueflow-current-user`.

A persistência operacional principal é o backend.

## 7. Papel Atual do AppContext
`AppContext` atua como fachada:
- sessão;
- permissões;
- notificações;
- cache em memória;
- carregamento de Condomínios e Técnicos via API;
- compatibilidade temporária para módulos ainda não migrados.

Não deve voltar a ser banco local.

## 8. Endpoints Implementados
### Auth
- `POST /auth/login`
- `GET /auth/me`

### Condomínios
- `GET /condominiums`
- `GET /condominiums/:id`
- `POST /condominiums`
- `PUT /condominiums/:id`
- `DELETE /condominiums/:id`

### Técnicos
- `GET /technicians`
- `GET /technicians/:id`
- `POST /technicians`
- `PUT /technicians/:id`
- `DELETE /technicians/:id`

## 9. Regras Importantes
- `admin` e `manager` podem escrever em Condomínios e Técnicos.
- `collaborator` apenas visualiza Condomínios e Técnicos.
- Não excluir Condomínio com Visitas ou Contratos.
- Não excluir Técnico com Visitas.
- Contratos e Empresa devem permanecer restritos a `admin` e `manager`.
- Uploads futuros devem usar Vercel Blob ou storage equivalente.

## 10. Próxima Sequência Recomendada
1. Implementar e integrar `CompanySettings`.
2. Implementar endpoints de Visitas.
3. Integrar VisitForm e VisitsPage à API.
4. Persistir checklist.
5. Implementar Relatórios vinculados a Visitas.
6. Implementar Contratos via API com RBAC.
7. Implementar uploads com `File` + storage externo.
8. Avaliar React Query para server-state.
9. Adicionar auditoria, soft delete e logs estruturados.

## 11. Instruções Para Futuras IAs
- Não documentar funcionalidades como implementadas sem verificar código.
- Não reintroduzir persistência operacional em `localStorage`.
- Preservar UI em português do Brasil.
- Manter nomes internos em inglês.
- Respeitar RBAC em frontend e backend.
- Não liberar Contratos ou Empresa para `collaborator`.
- Preferir evolução incremental por módulo.
- Preservar componentes visuais existentes.
- Antes de alterar arquitetura, ler `DECISIONS_LOG.md`.
