# Documentação Funcional

## Visão Geral do Projeto
O projeto `BlueFlow Gestão Hidráulica` é uma aplicação web responsiva para gestão operacional de serviços de manutenção hidráulica em condomínios. O sistema foi concebido inicialmente como um MVP sem backend, utilizando `localStorage` para persistência local, com foco em navegação funcional, validação de fluxos de negócio e apresentação comercial do produto.

O sistema centraliza a operação de:
- cadastro de condomínios;
- cadastro de técnicos;
- planejamento e execução de visitas técnicas;
- checklists hidráulicos;
- geração de relatórios;
- simulação de notificações;
- gestão contratual por condomínio;
- configuração cadastral da empresa contratada.

## Contexto de Negócio
Empresas que prestam manutenção hidráulica para condomínios precisam controlar:
- a carteira de clientes;
- a recorrência das visitas preventivas;
- as evidências técnicas das inspeções;
- os responsáveis presentes em cada atendimento;
- os contratos ativos e vencidos;
- a emissão de documentos formais para relacionamento comercial e jurídico.

O projeto atende esse contexto ao organizar o ciclo completo entre contrato, visita, checklist, relatório e documentação assinada.

## Contexto da Empresa
O sistema está modelado para a empresa:
- **Nome:** F TEC AUTOMAÇÃO
- **Papel no sistema:** empresa contratada para prestação de serviços técnicos em condomínios

Os dados da empresa são utilizados em:
- prévia contratual;
- impressão do contrato;
- exportação de documento contratual;
- identificação institucional nas rotinas futuras do sistema.

## Objetivos Principais
- Estruturar a operação da empresa em um único sistema.
- Garantir controle sobre visitas técnicas mensais e serviços emergenciais.
- Reduzir perda de informação entre atendimento de campo e documentação administrativa.
- Permitir geração rápida de relatórios e contratos.
- Preparar o sistema para futura evolução com backend, autenticação, banco de dados e portal do cliente.

## Perfis de Usuário
### Administrador Operacional
Responsável por cadastrar condomínios, técnicos, contratos e acompanhar os indicadores do painel.

### Coordenador Técnico
Responsável por distribuir visitas, acompanhar pendências, revisar checklists e validar relatórios.

### Técnico de Campo
Responsável por executar visitas, preencher checklist, anexar fotos e registrar o aceite do responsável no local.

### Comercial / Administrativo
Responsável por manter os contratos, gerar documentos, enviar contratos e armazenar versões assinadas.

### Cliente Futuro
Perfil ainda não implementado, mas considerado no roadmap para portal do condomínio.

## Módulos Funcionais
- Landing page institucional
- Login simulado
- Painel de indicadores
- Gestão de condomínios
- Gestão de técnicos
- Gestão de visitas técnicas
- Formulário operacional da visita
- Checklist técnico
- Gestão de relatórios
- Gestão de contratos
- Configuração da empresa contratada

## Fluxos Principais
### Fluxo de Cadastro de Condomínio
1. Usuário acessa a tela de condomínios.
2. Preenche dados cadastrais, jurídicos e de contato.
3. Salva o condomínio.
4. O registro passa a participar dos filtros, indicadores e vínculos contratuais e operacionais.

### Fluxo de Cadastro de Técnico
1. Usuário acessa a tela de técnicos.
2. Cadastra nome, telefone, cargo/função, status e observações.
3. O técnico passa a poder ser vinculado às visitas.

### Fluxo de Visita Técnica
1. Selecionar condomínio.
2. Selecionar técnico.
3. Informar tipo de serviço e status da visita.
4. Registrar responsável presente no condomínio.
5. Preencher checklist técnico.
6. Registrar ações realizadas, problemas fora da alçada e melhorias sugeridas.
7. Anexar fotos.
8. Marcar aceite digital do termo de responsabilidade.
9. Salvar visita.
10. Se a visita estiver concluída, o sistema pode gerar relatório.

### Fluxo de Contrato
1. Selecionar condomínio.
2. Informar número do contrato, tipo de serviço e parâmetros comerciais.
3. Definir prazo, SLAs, foro e observações.
4. Salvar contrato.
5. Visualizar prévia preenchida.
6. Imprimir ou exportar o contrato.
7. Fazer upload da versão assinada.
8. Acompanhar status contratual.

### Fluxo de Relatório
1. Relatórios são vinculados a visitas.
2. Usuário filtra relatórios por condomínio, técnico, serviço, status e datas.
3. A listagem mostra apenas resumo.
4. Ao abrir o relatório completo, o sistema exibe todos os dados da visita consolidada.

## Funcionalidades Detalhadas
### Painel
- métricas de condomínios e visitas;
- status mensal por condomínio;
- indicadores rápidos para apresentação.

### Gestão de Condomínios
- CRUD completo;
- busca por nome, endereço ou responsável;
- filtro por status mensal;
- detalhes do condomínio;
- seção interna de contratos vinculados.

### Gestão de Técnicos
- CRUD completo;
- busca e filtro por status;
- manutenção de disponibilidade operacional.

### Gestão de Visitas Técnicas
- CRUD completo;
- filtros por condomínio, técnico, status, tipo de serviço e datas;
- geração de relatório;
- visualização detalhada em modal.

### Checklist Técnico
- inspeção por equipamento;
- status por item;
- observações por item;
- campos livres para ações, problemas e melhorias.

### Relatórios
- resumo em cards;
- filtros avançados;
- ordenação;
- carregamento progressivo;
- visualização completa.

### Contratos
- múltiplos contratos por condomínio;
- status contratual;
- prévia funcional;
- impressão;
- exportação em HTML;
- upload do contrato assinado.

### Configuração da Empresa
- dados institucionais usados na composição contratual.

## Escopo Atual do MVP
### Incluído
- Frontend navegável completo
- Persistência via `localStorage`
- CRUDs principais
- Rotina operacional de visita
- Gestão contratual inicial
- Simulação de relatórios e impressão

### Não incluído
- Autenticação real
- Controle de permissões
- Banco de dados
- API
- Versionamento documental
- Assinatura eletrônica integrada
- Envio real de WhatsApp/e-mail

## Regras de Negócio
- Cada condomínio deve possuir acompanhamento mensal de visita preventiva.
- Um condomínio pode possuir múltiplos contratos.
- Um contrato pertence a um condomínio.
- Uma visita pertence a um condomínio e a um técnico.
- Um relatório pertence a uma visita.
- A exclusão de condomínio é bloqueada se houver visitas ou contratos vinculados.
- A exclusão de técnico é bloqueada se houver visitas vinculadas.
- Ao concluir uma visita, o sistema pode gerar relatório.
- O contrato assinado é armazenado dentro do próprio registro do contrato.

## Definições de Status
### Status da Visita
- `Agendada`
- `Em andamento`
- `Concluída`
- `Pendente`
- `Cancelada`

### Status do Checklist
- `Normal`
- `Atenção`
- `Crítico`

### Status do Contrato
- `Rascunho`
- `Gerado`
- `Enviado`
- `Assinado`
- `Vencido`
- `Cancelado`

### Status do Técnico
- `Ativo`
- `Inativo`

### Status Mensal do Condomínio
- `Concluído`: existe visita concluída no mês atual.
- `Pendente`: não existe visita concluída no mês atual.

## Workflow de Visita
1. Cadastro ou seleção do condomínio.
2. Seleção do técnico responsável.
3. Definição do tipo de serviço.
4. Registro da data e status da visita.
5. Registro do responsável presente no local.
6. Aceite digital do termo.
7. Preenchimento do checklist.
8. Registro textual de ações, problemas e melhorias.
9. Inclusão de fotos.
10. Geração de relatório.

## Workflow de Contrato
1. Cadastro dos dados do condomínio.
2. Configuração dos dados da empresa.
3. Criação do contrato.
4. Geração da prévia.
5. Impressão ou exportação.
6. Envio externo para assinatura.
7. Upload do arquivo assinado.
8. Acompanhamento do status até vencimento ou cancelamento.

## Workflow de Checklist
1. O checklist é inicializado automaticamente para os equipamentos padrão.
2. O técnico define um status para cada equipamento.
3. O técnico adiciona observações por item.
4. O sistema consolida o status geral com base na criticidade mais alta encontrada.

## Workflow de Relatório
1. O relatório nasce a partir da visita.
2. O resumo mostra apenas dados essenciais.
3. O relatório completo compila condomínio, técnico, responsável, checklist, fotos, aceite e textos operacionais.

## Ideias de Roadmap Futuro
- autenticação real;
- portal do cliente;
- exportação PDF verdadeira;
- assinatura eletrônica integrada;
- envio automático por e-mail e WhatsApp;
- agenda operacional;
- indicadores financeiros;
- multitenancy para operação SaaS;
- aplicativo mobile/PWA para técnicos.
