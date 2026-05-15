# Documentação do Projeto

Esta pasta centraliza a documentação funcional, técnica e de planejamento do `BlueFlow Gestão Hidráulica`.

## Estado Atual
O projeto está em V1 fullstack parcial:
- frontend React;
- backend Fastify;
- Prisma ORM;
- PostgreSQL Neon;
- JWT auth;
- RBAC;
- CRUD real de Condomínios, Técnicos e Visitas.
- backend preparado para deploy separado na Vercel.

O histórico do MVP frontend-only permanece documentado, mas não representa mais a arquitetura alvo.

## Arquivos Principais
- `FUNCTIONAL_DOCUMENTATION.md`: visão funcional e estado dos módulos.
- `TECHNICAL_DOCUMENTATION.md`: arquitetura, stack, autenticação, RBAC e riscos.
- `DATA_MODEL.md`: entidades Prisma e status de integração.
- `API_PLANNING.md`: endpoints implementados e planejados.
- `API_DOMAIN_ENDPOINTS.md`: documentação dos endpoints de Condomínios e Técnicos.
- `ROADMAP.md`: sequência incremental do produto.
- `DECISIONS_LOG.md`: decisões arquiteturais em formato leve de ADR.
- `NEXT_SESSION_CONTEXT.md`: contexto curto para continuidade em novas sessões.
- `COMPONENT_MAP.md`: mapa dos componentes frontend.
- `USER_STORIES.md`: histórias de usuário.

## Deploy Atual
O frontend e o backend devem ser publicados como projetos Vercel separados:
- frontend: raiz do repositório, com `VITE_API_BASE_URL` apontando para a API pública;
- backend: pasta `backend`, com `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGINS` configurados no ambiente da Vercel.

O healthcheck público do backend fica em `https://<backend-project>.vercel.app/health`.

## Objetivo
Preservar contexto de produto e arquitetura para continuidade por desenvolvedores, analistas e assistentes de IA, reduzindo dependência do histórico de conversa.

## Regra de Manutenção
Ao implementar uma funcionalidade relevante, atualizar pelo menos:
- documentação técnica;
- planejamento de API, quando houver endpoint;
- roadmap, quando mudar o status de uma fase;
- decisions log, quando houver decisão arquitetural.
