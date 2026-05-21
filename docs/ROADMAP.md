# Roadmap

## Fase 1: MVP Frontend-Only Concluído
Objetivo histórico: validar produto, navegação e regras iniciais sem backend.

Entregue:
- frontend navegável;
- páginas de condomínios, técnicos, visitas, relatórios, contratos e empresa;
- componentes reutilizáveis;
- fluxo de visitas/checklist;
- prévia e impressão HTML de contratos;
- persistência local em `localStorage`.

Status: concluído como etapa histórica. Não é mais a arquitetura alvo.

## Fase 2: Base Fullstack V1 Em Andamento
Entregue:
- backend Fastify;
- Prisma ORM;
- PostgreSQL Neon;
- migrations;
- seed de usuários;
- autenticação JWT;
- RBAC;
- frontend com login real;
- `AppContext` como fachada de sessão/cache;
- CRUD real de Condomínios;
- CRUD real de Técnicos.
- CRUD real de Visitas;
- upload real de arquivos de Visitas;
- Dashboard operacional real;
- CRUD real de Contratos;
- upload privado de contrato assinado.

Pendente nesta fase:
- Empresa via API;
- Relatórios via API;
- Empresa via API;
- Relatórios via API.

## Fase 3: Operação Técnica Persistida
Próximo foco recomendado:
- endpoints de Visitas;
- persistência de checklist;
- vínculo real com Condomínios e Técnicos;
- filtros server-side;
- geração inicial de Relatórios a partir de Visitas;
- preparação para fotos sem implementar upload local em base64.

## Fase 4: Contratos e Empresa
- persistir `CompanySettings`;
- RBAC backend para Empresa;
- documento contratual gerado a partir de dados persistidos;
- numeração e ciclo de vida contratual;
- alertas de vencimento futuramente.

## Fase 5: Uploads e Documentos
- Vercel Blob ou storage externo equivalente;
- fotos de visita;
- contrato assinado;
- metadados em `File`;
- URLs protegidas ou assinadas;
- remoção segura de arquivos.

## Fase 6: Relatórios e PDF
- geração server-side de PDF;
- templates versionados;
- snapshot dos dados usados na emissão;
- download;
- envio por e-mail futuramente.

## Fase 7: Segurança, Auditoria e Qualidade
- refresh token ou estratégia de sessão mais robusta;
- logs estruturados;
- auditoria de ações;
- soft delete;
- testes automatizados;
- observabilidade;
- tratamento padronizado de erros.

## Fase 8: SaaS
- multitenancy;
- isolamento de dados por empresa/tenant;
- papéis mais granulares;
- billing;
- portal do cliente;
- alta disponibilidade.

## Fase 9: Mobile/PWA
- PWA;
- uso de câmera;
- experiência de campo para técnicos;
- offline parcial com sincronização futura.
