# Next Session Context

## 1. Visão Geral do Projeto
`BlueFlow Gestão Hidráulica` é um sistema web responsivo para gestão operacional, técnica e contratual de uma empresa de manutenção hidráulica em condomínios. O projeto está em fase MVP, com frontend funcional e persistência local.

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
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- `localStorage` para persistência

## 4. Status Atual do MVP
O MVP está funcional, navegável e com CRUD nas principais entidades. Já suporta operação básica de condomínio, visita, relatório e contrato sem backend.

## 5. Principais Módulos Implementados
- Landing page
- Login simulado
- Painel
- Gestão de condomínios
- Gestão de técnicos
- Gestão de visitas técnicas
- Checklist técnico
- Relatórios
- Gestão de contratos
- Configuração da empresa contratada

## 6. Principais Regras de Negócio
- Um condomínio pode ter múltiplos contratos.
- Um contrato pertence a um condomínio.
- Uma visita pertence a um condomínio e a um técnico.
- Um relatório está vinculado a uma visita.
- O status mensal do condomínio é `Concluído` quando há visita concluída no mês atual.
- Não excluir condomínio com visitas ou contratos vinculados.
- Não excluir técnico com visitas vinculadas.
- Upload de contrato assinado fica vinculado ao contrato.

## 7. Decisões Arquiteturais Importantes
- MVP frontend-first.
- Estado global centralizado em `AppContext`.
- Persistência em `localStorage`.
- UI em português, código com variáveis internas em inglês.
- Uso intensivo de componentes reutilizáveis para filtros, modais, ações e estados.
- Contratos modelados como entidade independente.
- Impressão/exportação de contrato em HTML local.

## 8. Documentações Existentes
- `docs/FUNCTIONAL_DOCUMENTATION.md`
- `docs/TECHNICAL_DOCUMENTATION.md`
- `docs/DATA_MODEL.md`
- `docs/COMPONENT_MAP.md`
- `docs/USER_STORIES.md`
- `docs/API_PLANNING.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS_LOG.md`
- `docs/README.md`

## 9. Limitações Atuais
- Sem backend.
- Sem autenticação real.
- Sem controle de permissões.
- Uploads em `base64` no `localStorage`.
- Sem PDF real.
- Sem assinatura eletrônica.
- Sem notificações reais.
- Sem paginação server-side.

## 10. Próximas Fases Planejadas
- Backend REST + banco relacional
- Autenticação real
- Upload persistido em storage externo
- Geração de PDF
- Portal do cliente
- PWA/mobile
- Escalabilidade SaaS

## 11. Prioridades Atuais
- Preservar contexto funcional do sistema
- Preparar a futura migração para backend
- Manter consistência entre módulos
- Reduzir dívida técnica sem quebrar o MVP
- Melhorar robustez da gestão contratual e documental

## 12. Padrões de Implementação Importantes
- CRUDs centralizados no `AppContext`
- Normalização de dados legados na carga do estado
- `FilterPanel` para filtros
- `ActionButtons` para ações rápidas
- `ConfirmationModal` para exclusão
- `ModalShell` para detalhes e prévias
- `StatusBadge` para status
- `SectionCard` e `PageHeader` para estrutura visual

## 13. Convenções de Nomenclatura
- Código interno: inglês
- UI: português do Brasil
- Componentes: `PascalCase`
- Helpers: nomes descritivos orientados ao domínio
- Status e labels: linguagem de negócio em português

## 14. Estratégia Atual de Armazenamento
Tudo é salvo em uma única chave de `localStorage`:
- `blueflow-condo-care`

Estrutura principal:
- `companySettings`
- `condominiums`
- `technicians`
- `visits`
- `reports`
- `contracts`
- `isAuthenticated`

## 15. Estratégia Futura de Backend
Planejamento atual:
- API REST
- PostgreSQL
- upload via storage externo
- autenticação JWT/OAuth2
- filtros e paginação server-side
- geração de contrato e relatório no backend

## 16. Riscos Atuais
- Crescimento excessivo do `AppContext`
- `localStorage` ficando pesado
- uploads em `base64` degradando performance
- filtros client-side em listas grandes
- ausência de auditoria
- contratos e relatórios sem versionamento formal

## 17. Instruções para Futuras IAs
### O que não deve ser alterado sem necessidade clara
- Idioma da interface em português do Brasil
- Estrutura geral dos módulos principais
- Regras de vínculo entre condomínio, visitas, relatórios e contratos
- Padrão de componentes reutilizáveis

### Padrões que devem ser preservados
- CRUD centralizado no contexto
- Modais para detalhes e confirmação
- Filtros reutilizáveis
- Organização por `pages`, `components`, `context`, `data`, `utils`
- Separação entre contexto funcional e documentação em `/docs`

### Dívidas técnicas já existentes
- `AppContext` concentrando muitas responsabilidades
- Persistência local única
- Upload local inadequado para produção
- Impressão/exportação HTML ainda simplificada

### Preocupações futuras de escalabilidade
- Migrar filtros, paginação e ordenação para backend
- Desacoplar estado global em módulos menores ou camadas de cache
- Mover arquivos para storage real
- Implementar autenticação, auditoria e controle de acesso
- Preparar multitenancy para SaaS
