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

### Storage
- Vercel Blob privado para arquivos de Visitas.
- Uploads de Contratos, Relatórios e demais anexos ainda serão evoluídos por módulo.

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
- `backend/api/index.js`: entrypoint serverless para deploy do backend na Vercel.
- `backend/src/routes`: rotas HTTP.
- `backend/src/lib`: Prisma, respostas HTTP, autorização e helpers.
- `backend/prisma/schema.prisma`: modelo relacional.
- `backend/prisma/migrations`: migrations do banco.
- `backend/prisma/seed.js`: seed de usuários iniciais.
- `backend/vercel.json`: configuração de deploy do backend como projeto Vercel separado.

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
- carrega Condomínios, Técnicos e Visitas via API;
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
- `GET /visits/:id/files`
- `POST /visits/:id/files`
- `GET /visits/:id/files/:fileId/download`
- `DELETE /visits/:id/files/:fileId`

Observação: endpoints de Visitas existem no backend, com checklist operacional básico, e o frontend já está integrado para listar, criar, editar e excluir conforme permissão.

## Endpoints Planejados
- Empresa: `GET /company`, `PUT /company`.
- Visitas: geração de relatório.
- Relatórios: listagem, detalhe, atualização, exclusão e download/PDF.
- Contratos: CRUD, documento, impressão/PDF e upload de assinado.
- Uploads: envio, consulta e remoção de arquivos.

## Deploy
### Backend na Vercel
O backend está preparado para deploy como um projeto Vercel separado, usando a pasta `backend` como root do projeto.

Arquivos relevantes:
- `backend/api/index.js`: adapta o app Fastify para execução serverless.
- `backend/vercel.json`: direciona as requisições para o handler serverless.
- `backend/package.json`: mantém `npm run dev` local e usa `npm run build` para gerar Prisma Client.

Variáveis obrigatórias em produção:
- `DATABASE_URL`: connection string do PostgreSQL Neon.
- `JWT_SECRET`: segredo longo e privado para assinatura dos tokens.
- `BLOB_READ_WRITE_TOKEN`: token do Vercel Blob usado pelos uploads de Visitas.

Variáveis recomendadas:
- `JWT_EXPIRES_IN`: tempo de expiração do token, por exemplo `1h`.
- `CORS_ORIGINS`: lista separada por vírgula com os domínios do frontend.

`PORT` e `HOST` são usados apenas no desenvolvimento local. Na Vercel, a plataforma gerencia a porta.

O endpoint público esperado segue o domínio do projeto de backend na Vercel:
- `https://<backend-project>.vercel.app`

O healthcheck deve responder em:
- `GET https://<backend-project>.vercel.app/health`

### CORS
O backend permite por padrão:
- `http://localhost:5173`
- `http://localhost:4173`
- `http://localhost:3333`
- `https://ftecautomacao.com.br`
- `https://www.ftecautomacao.com.br`
- domínios `https://*.vercel.app`

Também é possível complementar a lista com `CORS_ORIGINS`.

### Frontend publicado
O frontend deve apontar para a API pública via variável:
- `VITE_API_BASE_URL=https://<backend-project>.vercel.app`

Após alterar a variável no projeto do frontend na Vercel, é necessário fazer novo deploy do frontend.

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
- técnicos;
- visitas;
- itens de checklist de visita.
- campos de aceite técnico da visita.
- arquivos de Visitas, com conteúdo no Vercel Blob e metadados em `File`.
- indicadores operacionais do Dashboard via agregações do backend.

Empresa, Relatórios e Contratos estão modelados ou planejados, mas os endpoints e a integração frontend ainda não foram concluídos.

## Uploads de Visitas
Implementado com:
- `@fastify/multipart` para receber `multipart/form-data`;
- `@vercel/blob` em store privado para armazenar o conteúdo dos arquivos;
- Prisma `File` para salvar metadados.

Arquivos suportados:
- foto do reservatório: `reservoir_photo`;
- foto da bomba: `pump_photo`;
- foto do quadro: `electrical_panel_photo`;
- termo assinado: `signed_acceptance_term`;
- outros: `other`.

Regras:
- não salvar base64;
- não salvar arquivo no PostgreSQL;
- não salvar arquivo no filesystem da Vercel;
- não abrir arquivos diretamente por URL pública;
- visualização/download passam por `GET /visits/:id/files/:fileId/download`, com JWT e RBAC;
- limite atual de 10 MB por arquivo;
- mime types permitidos: imagens e PDF;
- `admin` e `manager`: enviam, listam e excluem;
- `collaborator`: envia e lista, mas não exclui.

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
- Labels e status exibidos na UI em português; enums internos novos podem usar inglês quando fazem parte da API.
- API REST JSON.
- Permissões sempre devem ser validadas no backend, mesmo quando já filtradas no frontend.

## Riscos Técnicos Atuais
- Relatórios, contratos e empresa ainda não persistem via API.
- Uploads de Contratos e Relatórios ainda não foram integrados.
- Assinatura eletrônica ainda não foi implementada.
- `AppContext` ainda contém compatibilidade temporária para módulos não migrados.
- Falta React Query ou camada dedicada de cache server-state.
- Tokens são armazenados em `localStorage`; no futuro pode ser desejável usar cookie HTTP-only/refresh token.
- Falta auditoria de ações.
- Falta estratégia de soft delete.
- Contratos e relatórios ainda não têm versionamento formal.
- Falta observabilidade estruturada no backend.

## Próximas Etapas Técnicas
1. Integrar Empresa ao backend com RBAC.
2. Implementar Relatórios persistidos e geração de PDF.
3. Implementar Contratos persistidos e upload de assinado.
4. Evoluir aceite técnico para assinatura eletrônica.
5. Evoluir Dashboard com gráficos e filtros por período.
6. Avaliar React Query para server-state.
7. Adicionar auditoria, logs estruturados e soft delete.
8. Preparar multitenancy para SaaS.
