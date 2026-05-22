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
- Geração de PDF com `pdfkit`

### Storage
- Vercel Blob privado para anexos de Visitas.
- Vercel Blob privado para contrato assinado em Contratos.
- Vercel Blob privado para PDFs de Relatórios técnicos.
- Uploads de anexos adicionais de Relatórios ainda serão evoluídos por módulo.

## Estrutura de Pastas
### Frontend
- `src/App.jsx`: rotas, `ProtectedRoute` e autorização por role.
- `src/main.jsx`: bootstrap React.
- `src/layout`: layout autenticado e navegação.
- `src/pages`: páginas de negócio.
- `src/components`: componentes reutilizáveis.
- `src/context`: `AppContext` como sessão, permissões, notificações e cache.
- `src/services`: cliente de API e services de domínio.
- `src/services/userService.js`: consumo dos endpoints administrativos de Usuários.
- `src/auth`: regras de permissões do frontend.
- `src/utils`: helpers de formatação, visitas e contratos.
- `src/utils/shareHelpers.js`: geração de links `wa.me` e `mailto:` para compartilhamento assistido.
- `src/data`: catálogos e estruturas herdadas do MVP.

### Backend
- `backend/src/app.js`: criação do app Fastify, plugins e registro de rotas.
- `backend/src/server.js`: inicialização do servidor.
- `backend/api/index.js`: entrypoint serverless para deploy do backend na Vercel.
- `backend/src/routes`: rotas HTTP.
- `backend/src/routes/users.js`: CRUD administrativo de usuários, restrito a `admin`.
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
- Gestão administrativa de usuários por `admin`.
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
- `admin`: acesso total, incluindo Gestão de Usuários.
- `manager`: acesso total operacional, sem Gestão de Usuários.
- `admin` e `manager`: escrita em Condomínios/Técnicos, Visitas, Contratos e Relatórios conforme módulo.
- `collaborator`: visualiza Condomínios/Técnicos, sem criar/editar/excluir.
- `collaborator`: não vê Contratos nem Empresa no menu.
- Backend valida escrita de Condomínios/Técnicos com role `admin` ou `manager`.
- Backend restringe `/users` exclusivamente a `admin`.

## AppContext
O `AppContext` deixou de ser persistência principal e passou a atuar como fachada frontend:
- mantém sessão atual;
- expõe `currentUser`, `token`, `isAuthenticated`, `authLoading`;
- centraliza notificações;
- expõe helpers de permissão;
- carrega Condomínios, Técnicos, Visitas, Contratos e Relatórios via API;
- mantém cache em memória para os dados carregados;
- atualiza cache após operações confirmadas pela API;
- mantém compatibilidade temporária para módulos ainda não integrados, como Empresa e Relatórios.

Essa abordagem evita quebrar as páginas existentes enquanto a migração completa dos CRUDs ocorre por etapas.

## Endpoints Implementados
### Health
- `GET /health`

### Auth
- `POST /auth/login`
- `GET /auth/me`

### Usuários
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id/password`
- `PATCH /users/:id/status`

Observação: endpoints de Usuários exigem JWT e role `admin`. A API nunca retorna `passwordHash`; criação e reset de senha usam Argon2 no backend.

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
- `GET /visits/:id/files/:fileId/download`
- `DELETE /visits/:id/files/:fileId`

Observação: endpoints de Visitas existem no backend, com checklist operacional básico, e o frontend já está integrado para listar, criar, editar e excluir conforme permissão.

### Relatórios
- `GET /reports`
- `GET /reports/:id`
- `GET /reports/:id/download`
- `POST /visits/:id/generate-report`
- `DELETE /reports/:id`

Observação: relatórios técnicos são gerados a partir de Visitas, persistem metadados em `Report`/`File` e armazenam o PDF no Vercel Blob privado. O download passa por endpoint autenticado. Uma Visita pode possuir múltiplas versões de relatório; reemissão cria novo registro e mantém histórico.

### Contratos
- `GET /contracts`
- `GET /contracts/:id`
- `POST /contracts`
- `PUT /contracts/:id`
- `DELETE /contracts/:id`
- `POST /contracts/:id/signed-file`
- `GET /contracts/:id/signed-file/download`
- `DELETE /contracts/:id/signed-file`

Observação: endpoints de Contratos existem no backend, com persistência em PostgreSQL/Neon, vínculo obrigatório com Condomínio e acesso restrito a `admin` e `manager`. O frontend já consome o CRUD real via `contractService` e `AppContext`. O contrato assinado usa Vercel Blob privado, metadados em `File` e download por endpoint autenticado.

## Endpoints Planejados
- Empresa: `GET /company`, `PUT /company`.
- Relatórios: exclusão, anexos adicionais, templates avançados e envio.
- Contratos: geração server-side de documento/PDF e versionamento formal.
- Uploads: anexos de Relatórios e demais categorias futuras.

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
- `BLOB_READ_WRITE_TOKEN`: token do Vercel Blob usado pelos uploads privados de Visitas, contrato assinado e PDFs de Relatórios.

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
- usuários e gestão administrativa de usuários;
- condomínios;
- técnicos;
- visitas;
- itens de checklist de visita.
- campos de aceite técnico da visita.
- arquivos de Visitas, com conteúdo no Vercel Blob e metadados em `File`.
- contratos, incluindo referência ao contrato assinado atual.
- contrato assinado, com conteúdo no Vercel Blob e metadados em `File`.
- relatórios técnicos gerados a partir de Visitas, com PDF no Vercel Blob e metadados em `Report`/`File`.
- indicadores operacionais do Dashboard via agregações do backend.

Empresa ainda está modelada, mas os endpoints e a integração frontend ainda não foram concluídos. Contratos já possuem CRUD real integrado e upload/download privado de contrato assinado.

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

## Upload de Contrato Assinado
Implementado com o mesmo princípio de privacidade dos anexos de Visitas:
- o arquivo fica no Vercel Blob privado;
- metadados são salvos em `File`;
- `Contract.signedFileId` referencia o arquivo assinado atual;
- visualização/download passam por `GET /contracts/:id/signed-file/download`;
- `admin` e `manager` podem enviar, visualizar/baixar e remover;
- `collaborator` não acessa Contratos.

## Relatórios Técnicos em PDF
Implementado com:
- `POST /visits/:id/generate-report` para transformar uma Visita em relatório técnico;
- `pdfkit` para montar o PDF no backend;
- `@vercel/blob` em store privado para armazenar o PDF;
- Prisma `Report` para vínculo com a Visita, versão e data de geração;
- Prisma `File` para metadados do PDF;
- `GET /reports` e `GET /reports/:id` para consulta;
- `GET /reports/:id/download` para download/visualização segura.
- `DELETE /reports/:id` para exclusão controlada do relatório e do PDF vinculado, sem excluir a Visita.

Escopo atual:
- usa dados temporários centralizados da F TEC AUTOMAÇÃO em `backend/src/config/company.js`;
- inclui dados do condomínio, técnico, visita, checklist, ações executadas, problemas, melhorias, aceite técnico e relação de anexos;
- tenta incorporar fotos JPEG/PNG da visita ao PDF;
- permite reemissão versionada após correção da Visita;
- permite compartilhamento assistido por WhatsApp/e-mail via links gerados no frontend;
- não envia automaticamente via WhatsApp Business API, SMTP ou serviço transacional;
- não implementa assinatura eletrônica.

## Compartilhamento Assistido
Implementado apenas no frontend:
- Relatórios e Contratos possuem ações "Enviar por WhatsApp" e "Enviar por e-mail";
- WhatsApp usa `https://wa.me/?text=...`;
- e-mail usa `mailto:?subject=...&body=...`;
- as mensagens incluem dados do condomínio, visita/contrato e assinatura institucional da F TEC AUTOMAÇÃO;
- quando aplicável, o texto inclui link de download autenticado do backend;
- não há envio automático, fila, webhook, SMTP, WhatsApp Business API ou histórico de envio.

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

## Gestão de Usuários
Implementada com:
- `backend/src/routes/users.js`;
- `src/services/userService.js`;
- `src/pages/UsersPage.jsx`;
- rota protegida `/app/users`;
- item de menu visível apenas para `admin`.

Escopo atual:
- listar, buscar e filtrar usuários;
- criar usuário com senha temporária;
- editar nome, e-mail, perfil e status;
- ativar/inativar usuários;
- resetar senha temporária;
- impedir inativação do próprio usuário;
- validar e-mail único.

Fora do escopo atual:
- recuperação de senha por e-mail;
- convite automático;
- auditoria de alterações de perfil/senha.

## Convenções
- Código interno em inglês.
- UI e documentação em português do Brasil.
- Labels e status exibidos na UI em português; enums internos novos podem usar inglês quando fazem parte da API.
- API REST JSON.
- Permissões sempre devem ser validadas no backend, mesmo quando já filtradas no frontend.

## Riscos Técnicos Atuais
- Empresa ainda não persiste via API.
- Gestão de Usuários ainda não possui auditoria nem recuperação de senha por e-mail.
- Envio automático de Relatórios por WhatsApp/e-mail ainda não foi implementado.
- Uploads adicionais de Relatórios ainda não foram integrados.
- Assinatura eletrônica ainda não foi implementada.
- `AppContext` ainda contém compatibilidade temporária para módulos não migrados.
- Falta React Query ou camada dedicada de cache server-state.
- Tokens são armazenados em `localStorage`; no futuro pode ser desejável usar cookie HTTP-only/refresh token.
- Falta auditoria de ações.
- Falta estratégia de soft delete.
- Contratos e relatórios ainda não têm versionamento formal avançado.
- Falta observabilidade estruturada no backend.

## Próximas Etapas Técnicas
1. Integrar Empresa ao backend com RBAC.
2. Implementar auditoria para ações administrativas, incluindo Usuários.
3. Implementar envio automático de Relatórios por e-mail/WhatsApp.
4. Evoluir templates/versionamento de PDFs.
5. Evoluir aceite técnico para assinatura eletrônica.
6. Evoluir Dashboard com gráficos e filtros por período.
7. Avaliar React Query para server-state.
8. Adicionar logs estruturados e soft delete.
9. Preparar multitenancy para SaaS.
