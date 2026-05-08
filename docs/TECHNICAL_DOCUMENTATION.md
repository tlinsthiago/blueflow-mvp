# Documentação Técnica

## Arquitetura Atual
O projeto é uma SPA em React organizada em camadas:
- `pages`: telas de negócio;
- `components`: componentes reutilizáveis;
- `context`: estado global e operações CRUD;
- `data`: dados mockados e catálogos;
- `utils`: formatação, normalização e regras auxiliares;
- `layout`: shell da área autenticada.

Toda a persistência atual é feita em `localStorage`.

## Stack Frontend
- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Lucide React

## Arquitetura de Backend Planejada
Sugestão futura:
- API REST
- banco relacional (PostgreSQL)
- storage de arquivos
- autenticação JWT/OAuth2
- geração server-side de relatórios e contratos

## Estratégia Atual de Estado
O estado global fica em `AppContext`.

Responsabilidades:
- leitura do `localStorage`;
- normalização de estruturas legadas;
- exposição de listas e entidades;
- CRUDs;
- notificações de sucesso/erro;
- persistência automática da árvore de estado.

## Estrutura Atual do LocalStorage
Chave:
- `blueflow-condo-care`

Objeto persistido:
- `isAuthenticated`
- `companySettings`
- `condominiums`
- `technicians`
- `visits`
- `reports`
- `contracts`

## Banco de Dados Planejado
Banco sugerido:
- PostgreSQL

Motivos:
- forte modelagem relacional;
- flexibilidade para contratos, visitas e relatórios;
- capacidade de escalar para SaaS.

## API Planejada
Padrão:
- REST JSON

Boas práticas esperadas:
- paginação;
- filtros server-side;
- autenticação Bearer token;
- uploads `multipart/form-data`;
- separação de DTOs de leitura e escrita.

## Estrutura de Pastas
- `src/App.jsx`: rotas.
- `src/main.jsx`: bootstrap.
- `src/layout`: estrutura principal autenticada.
- `src/pages`: páginas do sistema.
- `src/components`: UI reutilizável.
- `src/context`: estado compartilhado.
- `src/data`: mocks e catálogos.
- `src/utils`: helpers.
- `docs`: documentação do projeto.

## Componentes Reutilizáveis
- `PageHeader`
- `SectionCard`
- `FormField`
- `FilterPanel`
- `ActionButtons`
- `ConfirmationModal`
- `ModalShell`
- `EmptyState`
- `StatusBadge`
- `StatCard`
- `ToastStack`
- `PhotoUploader`
- `FileUploader`
- `ReportPreview`
- `ContractPreview`

## Páginas Principais
- `LandingPage`
- `LoginPage`
- `DashboardPage`
- `CondominiumsPage`
- `TechniciansPage`
- `VisitsPage`
- `VisitFormPage`
- `ReportsPage`
- `ContractsPage`
- `CompanySettingsPage`

## Convenções de Nomenclatura
- Variáveis e funções em inglês.
- UI em português do Brasil.
- Componentes em `PascalCase`.
- Helpers com nomes orientados ao domínio.
- Status de negócio em português.

## Decisões Técnicas
- `localStorage` para acelerar validação do MVP.
- contexto único para simplificar a primeira versão.
- modais para detalhes e confirmações.
- contrato gerado em HTML para impressão local.

## Riscos de Escalabilidade
- estado único em `localStorage`;
- filtros client-side;
- uploads em `base64`;
- ausência de backend e paginação real;
- relatórios e contratos sem versionamento formal.

## Considerações de Segurança
Estado atual:
- sem autenticação real;
- sem autorização por perfil;
- sem storage seguro;
- sem auditoria.

Futuro necessário:
- controle de acesso;
- proteção de arquivos;
- logs estruturados;
- trilha de auditoria;
- criptografia em trânsito;
- sanitização de entradas.

## Plano de Migração para Backend
1. Introduzir API mantendo a mesma UX.
2. Migrar leituras/escritas para requests assíncronos.
3. Substituir cache local por React Query ou equivalente.
4. Mover uploads para storage externo.
5. Adicionar autenticação real.
6. Mover geração de relatórios e contratos para o servidor.
