# User Stories

## Épicos
- Gestão da carteira de condomínios
- Gestão da equipe técnica
- Gestão de visitas técnicas
- Checklist e evidências
- Relatórios técnicos
- Gestão contratual
- Configuração institucional

## Histórias de Usuário
### Gestão da carteira de condomínios
Como administrador operacional, quero cadastrar condomínios com dados jurídicos e de contato para manter a base de clientes completa.

**Critérios de aceitação**
- CRUD completo;
- razão social, endereço, responsável e contatos;
- exibição em listagem e detalhe.

Como administrador operacional, quero buscar e filtrar condomínios para localizar rapidamente registros em uma carteira grande.

**Critérios de aceitação**
- busca textual;
- filtro por status mensal;
- estado vazio.

### Gestão da equipe técnica
Como coordenador técnico, quero cadastrar técnicos com status e função para controlar a capacidade operacional.

**Critérios de aceitação**
- CRUD completo;
- status ativo/inativo;
- observações livres.

### Gestão de visitas técnicas
Como coordenador, quero registrar uma visita técnica completa para manter rastreabilidade operacional.

**Critérios de aceitação**
- selecionar condomínio e técnico;
- definir tipo de serviço e status;
- preencher checklist;
- anexar fotos;
- salvar visita.

Como coordenador, quero filtrar visitas por múltiplos critérios para acompanhar a operação em escala.

**Critérios de aceitação**
- filtros por condomínio, técnico, status, serviço e datas;
- ações de ver, editar, excluir e gerar relatório.

### Checklist e evidências
Como técnico, quero registrar o status de cada equipamento para documentar a condição da visita.

**Critérios de aceitação**
- status por item;
- observação por item;
- consolidação de criticidade.

Como técnico, quero anexar fotos da vistoria para reforçar a evidência do atendimento.

**Critérios de aceitação**
- upload múltiplo;
- associação à visita;
- exibição em relatório.

### Relatórios técnicos
Como coordenador, quero consultar relatórios com filtros e resumo para não sobrecarregar a navegação com listas extensas.

**Critérios de aceitação**
- resumo em cards;
- filtros avançados;
- ordenação;
- carregamento progressivo.

Como gestor, quero abrir o relatório completo para apresentar tecnicamente o atendimento.

**Critérios de aceitação**
- visualização detalhada;
- checklist, fotos e responsável incluídos.

Status atual:
- implementado com geração de PDF real a partir da visita e download seguro.

### Gestão contratual
Como administrativo, quero cadastrar contratos vinculados ao condomínio para controlar a base contratual.

**Critérios de aceitação**
- múltiplos contratos por condomínio;
- CRUD completo;
- status contratual.

Como administrativo, quero gerar uma prévia e imprimir o contrato para formalizar a relação comercial.

**Critérios de aceitação**
- prévia preenchida;
- impressão;
- exportação.

Como administrativo, quero anexar o contrato assinado para manter o histórico documental do cliente.

**Critérios de aceitação**
- upload privado do arquivo;
- atualização do status;
- exibição no contrato.

### Configuração institucional
Como administrador, quero configurar os dados da empresa contratada para reutilizar essas informações em contratos e documentos.

**Critérios de aceitação**
- tela própria;
- persistência global via backend;
- uso automático em contratos.

Status atual:
- planejado; Empresa/Configuração da empresa ainda não persiste no banco.

## Backlog Futuro
- portal do cliente;
- renovação contratual automática;
- alerta de vencimento;
- agenda operacional;
- notificações reais;
- PDF jurídico definitivo;
- assinatura eletrônica;
- PWA/mobile offline;
- multitenancy.
