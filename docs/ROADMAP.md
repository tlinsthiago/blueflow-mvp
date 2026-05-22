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
- CRUD real de Técnicos;
- CRUD real de Visitas;
- upload real de arquivos de Visitas;
- Dashboard operacional real;
- CRUD real de Contratos;
- upload privado de contrato assinado;
- geração real de Relatório Técnico em PDF.
- compartilhamento assistido de Relatórios e Contratos por WhatsApp/e-mail.

Pendente nesta fase:
- Empresa via API;
- envio automático por e-mail/WhatsApp.

## Fase 3: Operação Técnica Persistida Concluída
Entregue:
- endpoints de Visitas;
- persistência de checklist;
- vínculo real com Condomínios e Técnicos;
- filtros server-side;
- aceite técnico e termo imprimível;
- anexos privados de Visitas no Vercel Blob;
- Dashboard operacional com dados reais.

Entregue nesta fase:
- geração e persistência de Relatórios a partir de Visitas;
- PDF técnico armazenado no Vercel Blob privado;
- download seguro do PDF;
- reemissão versionada;
- exclusão controlada de versões sem excluir a Visita.

## Fase 4: Contratos e Empresa
Entregue:
- CRUD real de Contratos;
- vínculo obrigatório com Condomínio;
- prévia/impressão HTML;
- upload/download privado de contrato assinado.

Pendente:
- persistir `CompanySettings`;
- RBAC backend para Empresa;
- geração server-side de documento/PDF;
- numeração e ciclo de vida contratual;
- alertas de vencimento futuramente.

## Fase 5: Uploads e Documentos
Entregue:
- Vercel Blob privado para anexos de Visitas;
- Vercel Blob privado para contrato assinado;
- metadados em `File`;
- downloads por endpoints autenticados;
- remoção segura conforme permissão.

Pendente:
- uploads de Relatórios, se necessários;
- política de retenção;
- antivírus/verificação de arquivos;
- versionamento documental formal.

## Fase 6: Relatórios e PDF
Entregue:
- geração server-side de PDF;
- metadados em `Report` e `File`;
- download seguro;
- histórico de versões por Visita;
- exclusão controlada.

Pendente:
- templates versionados;
- snapshot formal dos dados usados na emissão;
- envio automático por e-mail;
- envio automático por WhatsApp Business API.

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
