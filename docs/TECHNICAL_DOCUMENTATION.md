# Documentação Técnica

## Arquitetura Atual
O projeto está organizado como uma aplicação fullstack parcial:
- frontend React + Vite + Tailwind;
- backend Node.js + Fastify;
- API REST JSON;
- Prisma ORM;
- PostgreSQL Neon;
- autenticação JWT;
- RBAC por perfil.

O MVP original era frontend-only com `localStorage`. Na V1 atual, `localStorage` não é mais persistência operacional principal: o frontend mantém apenas token JWT e usuário atual.

## Stack
### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Fastify
- Prisma ORM
- PostgreSQL Neon
- JWT com `@fastify/jwt`
- Hash de senha com Argon2
- Validação com Zod

### Storage Futuro
- Vercel Blob ou storage externo equivalente.
- Uploads ainda não foram implementados.

## Estrutura de Pastas
### Frontend
- `src/App.jsx`: rotas, `ProtectedRoute` e autorização por role.
- `src/main.jsx`: bootstrap React.
- `src/layout`: layout autenticado e navegação.
- `src/pages`: páginas de negócio.
- `src/components`: componentes reutilizáveis.
- `src/context`: `AppContext` como sessão, permissões, notificações e cache.
- `src/services`: cliente de API e services de domínio.
- `src/auth`: regras de permissões do frontend.
- `src/utils`: helpers de formatação, visitas e contratos.
- `src/data`: catálogos e estruturas herdadas do MVP.

### Backend
- `backend/src/app.js`: criação do app Fastify, plugins e registro de rotas.
- `backend/src/server.js`: inicialização do servidor.
- `backend/src/routes`: rotas HTTP.
- `backend/src/lib`: Prisma, respostas HTTP, autorização e helpers.
- `backend/prisma/schema.prisma`: modelo relacional.
- `backend/prisma/migrations`: migrations do banco.
- `backend/prisma/seed.js`: seed de usuários iniciais.

### Documentação
- `docs`: documentação funcional, técnica, roadmap, modelo de dados, decisões e planejamento de API.

## Autenticação
### Implementado
- `POST /auth/login`
- `GET /auth/me`
- JWT Bearer token.
- Usuários com senha hasheada por Argon2.
- Seed inicial com usuários `admin`, `manager` e `collaborator`.
- Frontend restaura sessão chamando `/auth/me`.
- Interceptor no frontend trata `401` e limpa sessão.

### Armazenamento no Frontend
Chaves atuais:
- `blueflow-auth-token`
- `blueflow-current-user`

A chave legada `blueflow-condo-care` é removida pelo frontend.

## RBAC
Perfis internos:
- `admin`
- `manager`
- `collaborator`

Regras atuais:
- `admin` e `manager`: acesso total na UI e escrita em Condomínios/Técnicos.
- `collaborator`: visualiza Condomínios/Técnicos, sem criar/editar/excluir.
- `collaborator`: não vê Contratos nem Empresa no menu.
- Backend valida escrita de Condomínios/Técnicos com role `admin` ou `manager`.

## AppContext
O `AppContext` deixou de ser persistência principal e passou a atuar como fachada frontend:
- mantém sessão atual;
- expõe `currentUser`, `token`, `isAuthenticated`, `authLoading`;
- centraliza notificações;
- expõe helpers de permissão;
- carrega Condomínios e Técnicos via API;
- mantém cache em memória para os dados carregados;
- atualiza cache após operações confirmadas pela API;
- mantém métodos temporários em memória para módulos ainda não integrados.

Essa abordagem evita quebrar as páginas existentes enquanto a migração completa dos CRUDs ocorre por etapas.

## Endpoints Implementados
### Health
- `GET /health`

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

## Endpoints Planejados
- Empresa: `GET /company`, `PUT /company`.
- Visitas: CRUD, checklist, fotos e geração de relatório.
- Relatórios: listagem, detalhe, atualização, exclusão e download/PDF.
- Contratos: CRUD, documento, impressão/PDF e upload de assinado.
- Uploads: envio, consulta e remoção de arquivos.

## Banco de Dados
Banco atual:
- PostgreSQL Neon.

ORM:
- Prisma.

Entidades já modeladas no Prisma:
- `User`
- `CompanySettings`
- `Condominium`
- `Technician`
- `Visit`
- `VisitChecklistItem`
- `VisitPhoto`
- `Report`
- `Contract`
- `File`

Persistência operacional real implementada até agora:
- usuários;
- condomínios;
- técnicos.

Demais entidades estão modeladas, mas os endpoints e a integração frontend ainda não foram concluídos.

## Resposta Padrão da API
```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

Listagens usam `meta` para paginação quando aplicável.

## Validação
O backend usa Zod para validar payloads e parâmetros em rotas novas.

## Convenções
- Código interno em inglês.
- UI e documentação em português do Brasil.
- Status de negócio em português.
- API REST JSON.
- Permissões sempre devem ser validadas no backend, mesmo quando já filtradas no frontend.

## Riscos Técnicos Atuais
- Visitas, relatórios, contratos e empresa ainda não persistem via API.
- `AppContext` ainda contém compatibilidade temporária para módulos não migrados.
- Falta React Query ou camada dedicada de cache server-state.
- Uploads ainda não foram migrados para storage externo.
- Tokens são armazenados em `localStorage`; no futuro pode ser desejável usar cookie HTTP-only/refresh token.
- Falta auditoria de ações.
- Falta estratégia de soft delete.
- Contratos e relatórios ainda não têm versionamento formal.
- Falta observabilidade estruturada no backend.

## Próximas Etapas Técnicas
1. Integrar Empresa ao backend com RBAC.
2. Implementar endpoints e integração de Visitas.
3. Implementar checklist e fotos com storage externo.
4. Implementar Relatórios persistidos e geração de PDF.
5. Implementar Contratos persistidos e upload de assinado.
6. Avaliar React Query para server-state.
7. Adicionar auditoria, logs estruturados e soft delete.
8. Preparar multitenancy para SaaS.
