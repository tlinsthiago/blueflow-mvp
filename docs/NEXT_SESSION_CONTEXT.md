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
- CRUD real de Condomínios, Técnicos, Visitas e Contratos.
- backend preparado para deploy separado na Vercel.

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
- Dashboard operacional real via `GET /dashboard/summary`.
- CRUD real de Condomínios.
- CRUD real de Técnicos.
- CRUD real de Visitas no backend e frontend.
- CRUD real de Contratos no backend e frontend.
- Termo de instalação e aceite técnico imprimível em Visitas.
- Upload real de arquivos de Visitas com Vercel Blob.
- Upload/download privado de contrato assinado com Vercel Blob.
- Geração real de Relatório Técnico em PDF a partir de Visitas.
- Download seguro de PDF de Relatório via Vercel Blob privado.
- Entry point serverless do backend para Vercel.
- Migrations Prisma.
- Seed de usuários iniciais.

### Ainda Não Integrado
- Empresa.
- Envio real de e-mail/WhatsApp.
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
- carregamento de Condomínios, Técnicos, Visitas e Contratos via API;
- compatibilidade temporária para módulos ainda não migrados.

Não deve voltar a ser banco local.

## 8. Endpoints Implementados
### Auth
- `POST /auth/login`
- `GET /auth/me`

### Dashboard
- `GET /dashboard/summary`

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

### Visitas
- `GET /visits`
- `GET /visits/:id`
- `POST /visits`
- `PUT /visits/:id`
- `DELETE /visits/:id`
- `POST /visits/:id/generate-report`
- `GET /visits/:id/files`
- `POST /visits/:id/files`
- `DELETE /visits/:id/files/:fileId`

### Relatórios
- `GET /reports`
- `GET /reports/:id`
- `GET /reports/:id/download`

### Contratos
- `GET /contracts`
- `GET /contracts/:id`
- `POST /contracts`
- `PUT /contracts/:id`
- `DELETE /contracts/:id`
- `POST /contracts/:id/signed-file`
- `GET /contracts/:id/signed-file/download`
- `DELETE /contracts/:id/signed-file`

## 9. Regras Importantes
- `admin` e `manager` podem escrever em Condomínios e Técnicos.
- `collaborator` apenas visualiza Condomínios e Técnicos.
- Não excluir Condomínio com Visitas ou Contratos.
- Não excluir Técnico com Visitas.
- Contratos e Empresa devem permanecer restritos a `admin` e `manager`.
- Uploads de Visitas, contrato assinado e PDFs de Relatórios usam Vercel Blob privado e exigem `BLOB_READ_WRITE_TOKEN` no backend.
- O banco salva apenas metadados de arquivo; não salvar base64, bytes no PostgreSQL ou arquivos no filesystem da Vercel.
- Frontend publicado deve usar `VITE_API_BASE_URL` apontando para a URL pública do backend.
- Backend publicado deve ter `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGINS` configurados na Vercel.
- Para uploads, backend publicado também deve ter `BLOB_READ_WRITE_TOKEN`.

## 10. Deploy
Backend:
- projeto Vercel separado com root directory `backend`;
- build command `npm run build`;
- handler serverless em `backend/api/index.js`;
- healthcheck público em `https://<backend-project>.vercel.app/health`.

Frontend:
- configurar `VITE_API_BASE_URL=https://<backend-project>.vercel.app`;
- redeploy após alterar variáveis de ambiente.

## 11. Próxima Sequência Recomendada
1. Implementar e integrar `CompanySettings`.
2. Implementar envio real de Relatórios por e-mail/WhatsApp.
3. Evoluir templates/versionamento de PDF.
4. Implementar uploads adicionais de Relatórios, se o fluxo funcional exigir anexos.
6. Evoluir Dashboard com gráficos simples e filtros por período.
7. Avaliar React Query para server-state.
8. Adicionar auditoria, soft delete e logs estruturados.

## 12. Instruções Para Futuras IAs
- Não documentar funcionalidades como implementadas sem verificar código.
- Não reintroduzir persistência operacional em `localStorage`.
- Preservar UI em português do Brasil.
- Manter nomes internos em inglês.
- Respeitar RBAC em frontend e backend.
- Não liberar Contratos ou Empresa para `collaborator`.
- Preferir evolução incremental por módulo.
- Preservar componentes visuais existentes.
- Antes de alterar arquitetura, ler `DECISIONS_LOG.md`.
