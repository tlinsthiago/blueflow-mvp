# Decisions Log

## Objetivo
Este arquivo registra decisões arquiteturais, funcionais e estruturais relevantes do projeto, em formato leve inspirado em ADR.

As decisões antigas do MVP são mantidas como histórico. As decisões mais recentes refletem a V1 fullstack parcial atual.

---

## DEC-001: Construção inicial como MVP frontend-first
### Status
Aceita como decisão histórica

### Contexto
O produto precisava validar rapidamente fluxo operacional, navegação e apresentação comercial antes do investimento em backend.

### Decisão
Construir a primeira versão como SPA React com persistência em `localStorage`.

### Consequências
**Positivas**
- acelerou prototipação;
- reduziu custo inicial;
- permitiu validar telas, regras e componentes.

**Negativas**
- não era adequada para produção real;
- não suportava múltiplos usuários;
- não oferecia autenticação, autorização, auditoria ou concorrência de dados.

---

## DEC-002: Uso de React + Vite + Tailwind CSS
### Status
Aceita

### Decisão
Usar React como base da interface, Vite como bundler/dev server e Tailwind CSS para composição visual.

### Consequências
**Positivas**
- boa velocidade de desenvolvimento;
- build rápido;
- componentes reutilizáveis;
- interface responsiva com baixo atrito.

**Negativas**
- exige disciplina para evitar excesso de classes utilitárias difíceis de manter.

---

## DEC-003: Código interno em inglês e UI em português
### Status
Aceita

### Decisão
Manter variáveis, funções, componentes e nomes internos em inglês, enquanto a interface e a documentação permanecem em português do Brasil.

### Consequências
**Positivas**
- melhora legibilidade técnica;
- preserva UX local;
- facilita integração futura com padrões de backend.

**Negativas**
- exige disciplina para separar nomenclatura interna de labels exibidos ao usuário.

---

## DEC-004: AppContext como estado global inicial
### Status
Aceita como decisão histórica, revisada na V1

### Decisão original
Centralizar estado, CRUDs, normalização e toasts em `AppContext`.

### Revisão atual
Na V1, `AppContext` não é mais persistência principal. Ele atua como fachada de sessão, permissões, notificações e cache em memória, enquanto os dados migrados passam a vir do backend.

### Consequências
**Positivas**
- preservou continuidade das páginas existentes;
- permitiu migração incremental.

**Negativas**
- ainda concentra compatibilidade temporária de módulos não migrados;
- pode ser substituído parcialmente por React Query ou solução equivalente no futuro.

---

## DEC-005: Componentes reutilizáveis para filtros, ações e modais
### Status
Aceita

### Decisão
Criar e preservar componentes reutilizáveis como:
- `FilterPanel`;
- `ActionButtons`;
- `ConfirmationModal`;
- `ModalShell`;
- `EmptyState`;
- `StatusBadge`;
- `SectionCard`;
- `PageHeader`.

### Consequências
**Positivas**
- consistência visual;
- menor duplicação;
- manutenção mais simples.

**Negativas**
- mudanças estruturais nesses componentes impactam várias telas.

---

## DEC-006: Relatórios resumidos com abertura detalhada
### Status
Aceita

### Decisão
Exibir relatórios em formato resumido, com filtros e abertura detalhada sob demanda.

### Consequências
**Positivas**
- reduz poluição visual;
- aproxima a experiência de sistemas operacionais reais.

**Negativas**
- aumenta a necessidade de estados auxiliares e endpoints específicos no backend.

---

## DEC-007: Contratos como entidade independente
### Status
Aceita

### Decisão
Modelar `Contract` como entidade própria, vinculada a `Condominium`.

### Consequências
**Positivas**
- modelagem mais correta do domínio;
- prepara gestão comercial e documental.

**Negativas**
- aumenta complexidade de telas, permissões, documentos e uploads.

---

## DEC-008: Contrato imprimível em HTML no MVP
### Status
Aceita como solução temporária

### Decisão
Gerar prévia e impressão de contrato em HTML no frontend durante o MVP.

### Consequências
**Positivas**
- permitiu demonstração rápida;
- funcionou sem backend ou PDF server-side.

**Negativas**
- não substitui PDF jurídico definitivo;
- não oferece versionamento documental robusto.

### Direção atual
Migrar futuramente para geração server-side com template versionado.

---

## DEC-009: Upload base64 no MVP
### Status
Aceita como decisão histórica, não recomendada para V1

### Decisão original
Armazenar fotos e contratos assinados como base64 no estado local.

### Revisão atual
Uploads de Visitas foram implementados na V1 com Vercel Blob. A regra permanece: não salvar base64, bytes no PostgreSQL ou arquivos no filesystem da Vercel. O banco guarda apenas metadados na entidade `File`.

---

## DEC-010: Bloqueio de exclusão com vínculos
### Status
Aceita

### Decisão
Bloquear exclusão de:
- Condomínio com Visitas ou Contratos vinculados;
- Técnico com Visitas vinculadas.

### Estado atual
A regra já foi implementada no backend para Condomínios e Técnicos.

---

## DEC-011: Status mensal do Condomínio
### Status
Aceita como regra funcional inicial

### Decisão
Considerar `Concluído` quando existir ao menos uma visita `Concluída` no mês atual.

### Estado atual
O backend e o frontend de Visitas já estão integrados. A regra pode evoluir conforme a UI de indicadores mensais for refinada.

---

## DEC-012: Documentação persistente em `/docs`
### Status
Aceita

### Decisão
Manter documentação funcional, técnica, roadmap, modelo de dados e decisões dentro de `/docs`.

### Consequências
**Positivas**
- facilita continuidade;
- reduz dependência do histórico de conversa;
- orienta futuras IAs e desenvolvedores.

**Negativas**
- exige atualização contínua para não ficar desatualizada.

---

## DEC-013: Backend em Node.js com Fastify
### Status
Aceita

### Decisão
Criar backend separado em `backend`, usando Node.js, Fastify e API REST JSON.

### Consequências
**Positivas**
- separa frontend e backend;
- permite evolução incremental;
- combina com o ecossistema Vite/React;
- prepara deploy em ambiente Node/Vercel.

**Negativas**
- adiciona uma segunda aplicação no repositório;
- exige disciplina em contratos de API e permissões.

---

## DEC-014: PostgreSQL Neon com Prisma ORM
### Status
Aceita

### Decisão
Usar PostgreSQL Neon como banco relacional e Prisma como ORM/migrations.

### Consequências
**Positivas**
- modelagem relacional adequada ao domínio;
- migrations versionadas;
- compatibilidade com estratégia futura SaaS;
- boa experiência de desenvolvimento.

**Negativas**
- exige cuidado com datas, tipos financeiros e mapeamento frontend/backend.

---

## DEC-015: Autenticação JWT e perfis
### Status
Aceita

### Decisão
Implementar autenticação com e-mail/senha, hash Argon2 e JWT.

Perfis:
- `admin`;
- `manager`;
- `collaborator`.

### Regras
- `admin`: acesso total.
- `manager`: acesso total.
- `collaborator`: acesso operacional limitado, sem Contratos e Empresa.

### Consequências
**Positivas**
- habilita uso real por múltiplos usuários;
- cria base para auditoria e permissões mais granulares.

**Negativas**
- armazenamento de JWT em `localStorage` é uma decisão pragmática inicial;
- estratégia futura pode exigir refresh token/cookie HTTP-only.

---

## DEC-016: Upload futuro em Vercel Blob ou equivalente
### Status
Aceita como decisão histórica, revisada na V1

### Decisão
Não implementar upload na base inicial. Preparar o modelo `File` para metadados e usar futuramente Vercel Blob ou storage externo equivalente.

### Revisão atual
Uploads de arquivos de Visitas foram implementados com Vercel Blob. Uploads de Contratos, Relatórios e demais anexos continuam planejados.

### Consequências
**Positivas**
- evita misturar autenticação/API inicial com complexidade de arquivos;
- mantém caminho claro para fotos, contratos assinados e anexos.

**Negativas**
- módulos de Contratos e Relatórios que dependem de arquivo ainda não estão prontos para produção.

---

## DEC-017: Frontend V1 com autenticação real e cache de sessão
### Status
Aceita

### Decisão
Migrar o frontend para autenticação real:
- `POST /auth/login`;
- `GET /auth/me`.

Persistir no navegador apenas:
- token JWT;
- usuário atual.

Transformar `AppContext` em camada de sessão, permissões, notificações e cache frontend.

### Consequências
**Positivas**
- remove login simulado;
- reduz dependência de `localStorage` como banco local;
- prepara conexão dos CRUDs aos endpoints reais.

**Negativas**
- frontend passa a depender da API para autenticar e restaurar sessão.

---

## DEC-018: RBAC no frontend e backend
### Status
Aceita

### Decisão
Aplicar RBAC no frontend para rotas/menu e no backend para escrita em rotas de domínio.

### Regras atuais
- `collaborator` não vê Contratos nem Empresa.
- `collaborator` não cria, edita nem exclui Condomínios/Técnicos.
- `admin` e `manager` têm acesso total.

### Consequências
**Positivas**
- melhora experiência por perfil;
- reduz exposição visual indevida;
- reforça segurança no backend.

**Negativas**
- permissões futuras podem exigir granularidade maior por módulo/ação.

---

## DEC-019: Integração real de Condomínios e Técnicos
### Status
Aceita

### Decisão
Integrar `CondominiumsPage` e `TechniciansPage` aos endpoints reais de backend.

Endpoints integrados:
- `GET /condominiums`
- `POST /condominiums`
- `PUT /condominiums/:id`
- `DELETE /condominiums/:id`
- `GET /technicians`
- `POST /technicians`
- `PUT /technicians/:id`
- `DELETE /technicians/:id`

### Consequências
**Positivas**
- inicia persistência operacional real em PostgreSQL;
- define padrão para migração dos próximos módulos;
- mantém UI existente com cache em memória.

**Negativas**
- Relatórios, Contratos e Empresa ainda precisam ser migrados;
- `AppContext` ainda contém compatibilidade temporária.

---

## DEC-020: Backend de Visitas com checklist operacional
### Status
Aceita

### Decisão
Implementar endpoints REST de Visitas no backend, com checklist operacional básico persistido em `VisitChecklistItem`.

Endpoints:
- `GET /visits`
- `GET /visits/:id`
- `POST /visits`
- `PUT /visits/:id`
- `DELETE /visits/:id`

Enums:
- `VisitStatus`: `scheduled`, `in_progress`, `completed`, `pending`, `cancelled`.
- `ChecklistStatus`: `normal`, `attention`, `critical`.

### Regras
- `admin` e `manager`: CRUD completo.
- `collaborator`: visualizar, criar e editar; não excluir.
- Não criar ou editar visita com Condomínio inexistente.
- Não criar ou editar visita com Técnico inexistente.

### Consequências
**Positivas**
- cria a base persistida para a operação técnica;
- prepara relatórios futuros a partir de visitas reais;
- mantém checklist junto da visita em uma transação.

**Negativas**
- geração de relatório ainda não foi implementada.

---

## DEC-021: Integração frontend de Visitas
### Status
Aceita

### Decisão
Integrar `VisitsPage` e `VisitFormPage` aos endpoints reais de Visitas, mantendo o `AppContext` como fachada de API/cache.

### Regras
- `admin` e `manager`: criar, editar e excluir.
- `collaborator`: visualizar, criar e editar; não excluir.
- Relatórios continuam fora do escopo desta etapa.

### Consequências
**Positivas**
- Visitas deixam de depender de persistência local;
- checklist operacional passa a ser salvo no backend;
- a operação técnica principal já usa banco real.

**Negativas**
- relatórios permanecem planejados;
- ainda há mapeamento temporário entre labels em português da UI e enums em inglês da API.

---

## DEC-022: Aceite técnico e termo imprimível em Visitas
### Status
Aceita

### Decisão
Reintroduzir o aceite técnico no módulo de Visitas, persistindo campos de aceite no backend e adicionando uma prévia imprimível do Termo de Instalação, Aceite Técnico e Responsabilidade Operacional.

Campos adicionados:
- `acceptanceConfirmed`;
- `acceptanceResponsibleName`;
- `acceptanceResponsibleRole`;
- `installationLocation`;
- `equipmentValue`;
- `acceptanceNotes`.

### Escopo
- O termo usa texto adaptado para F TEC AUTOMAÇÃO.
- A impressão é feita via HTML no navegador.
- Não há assinatura eletrônica.
- O upload do termo assinado foi implementado posteriormente como arquivo de Visita.

### Consequências
**Positivas**
- recupera um fluxo operacional importante removido na migração;
- registra responsabilidade sobre equipamento e valor comercial;
- prepara futura assinatura eletrônica.

**Negativas**
- impressão HTML ainda não equivale a PDF oficial;
- aceite confirmado não substitui assinatura eletrônica formal.

---

## DEC-023: Backend Fastify publicado como projeto Vercel separado
### Status
Aceita

### Decisão
Preparar o backend Fastify para deploy na Vercel em um projeto separado, usando a pasta `backend` como root directory.

Arquivos adicionados/ajustados:
- `backend/api/index.js`: handler serverless que reutiliza o app Fastify.
- `backend/vercel.json`: rewrites para expor a API a partir do domínio do backend.
- `backend/package.json`: `build` e `postinstall` geram Prisma Client.

### Configuração
Variáveis obrigatórias em produção:
- `DATABASE_URL`;
- `JWT_SECRET`.

Variáveis recomendadas:
- `JWT_EXPIRES_IN`;
- `CORS_ORIGINS`.

`PORT` e `HOST` permanecem apenas para execução local.

### Consequências
**Positivas**
- remove dependência de backend local para o frontend publicado;
- mantém `npm run dev` local inalterado;
- expõe `GET /health` para validação de produção;
- preserva separação entre frontend e API.

**Negativas**
- exige configurar dois projetos Vercel ou dois ambientes separados;
- serverless requer atenção a conexões Prisma/PostgreSQL e tempo de cold start.

---

## DEC-024: Uploads de Visitas com Vercel Blob
### Status
Aceita

### Decisão
Implementar uploads reais no módulo de Visitas usando Vercel Blob privado para armazenar arquivos e Prisma/PostgreSQL apenas para metadados.

Arquivos suportados:
- `reservoir_photo`;
- `pump_photo`;
- `electrical_panel_photo`;
- `signed_acceptance_term`;
- `other`.

Endpoints:
- `GET /visits/:id/files`;
- `POST /visits/:id/files`;
- `GET /visits/:id/files/:fileId/download`;
- `DELETE /visits/:id/files/:fileId`.

### Regras
- `admin` e `manager`: upload, listagem e exclusão.
- `collaborator`: upload e listagem, sem exclusão.
- Limite atual: 10 MB por arquivo.
- Mime types permitidos: imagens e PDF.
- Não salvar base64.
- Não salvar arquivo no PostgreSQL.
- Não salvar arquivo no filesystem da Vercel.
- Não expor arquivos por URL pública; visualização/download passam por endpoint autenticado.

### Configuração
O backend precisa da variável:
- `BLOB_READ_WRITE_TOKEN`.

### Consequências
**Positivas**
- elimina a abordagem local/base64 do MVP para Visitas;
- permite uso real em produção serverless;
- mantém metadados relacionais para auditoria futura;
- prepara assinatura/upload documental sem acoplar bytes ao banco.

**Negativas**
- URLs públicas do Blob devem ser avaliadas futuramente caso haja requisito de privacidade;
- ainda falta política de retenção, auditoria e antivírus;
- uploads de Contratos e Relatórios continuam fora desta etapa.

---

## DEC-025: Dashboard operacional com agregações do backend
### Status
Aceita

### Decisão
Implementar o Dashboard operacional com endpoint dedicado no backend:
- `GET /dashboard/summary`.

O frontend deixa de calcular os indicadores principais a partir de mocks/cache local e passa a consumir agregações reais da API.

### Escopo
Indicadores implementados:
- condomínios ativos;
- técnicos ativos;
- visitas do mês;
- visitas pendentes;
- visitas concluídas no mês;
- visitas agendadas;
- checklist crítico;
- checklist em atenção;
- condomínios ativos sem visita concluída no mês;
- últimas visitas concluídas.

### Permissões
- `admin`, `manager` e `collaborator`.

### Consequências
**Positivas**
- painel passa a refletir dados persistidos em PostgreSQL;
- reduz dependência de cálculos locais no frontend;
- cria base para filtros e gráficos futuros.

**Negativas**
- ainda não há filtros por período na UI;
- indicadores são agregações operacionais simples, sem gráficos complexos.

---

## Decisões Futuras Esperadas
- Estratégia de refresh token ou sessão mais robusta.
- Adoção ou não de React Query para server-state.
- Política de soft delete.
- Política de auditoria.
- Estratégia de storage e URL assinada.
- Estratégia multiempresa/multitenancy.
- Geração e versionamento de PDF.
- Observabilidade e logs estruturados.
