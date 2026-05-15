# Documentação Funcional

## Visão Geral
`BlueFlow Gestão Hidráulica` é uma aplicação web para gestão operacional, técnica e contratual de serviços de manutenção hidráulica em condomínios.

O produto nasceu como um MVP frontend-only, com dados em `localStorage`, para validar navegação, formulários, relatórios e contratos. A arquitetura atual já evoluiu para uma V1 fullstack parcial, com frontend React, backend Fastify, autenticação JWT, RBAC e persistência PostgreSQL para Condomínios e Técnicos.

## Estado Atual do Produto
### Implementado
- Landing page institucional.
- Login real com e-mail e senha via API.
- Bootstrap de sessão com token JWT.
- Controle de acesso por perfil.
- Layout autenticado com menu filtrado por permissão.
- Gestão de Condomínios integrada ao backend.
- Gestão de Técnicos integrada ao backend.
- Gestão de Visitas integrada ao backend, com checklist e aceite técnico.
- Páginas existentes para Painel, Relatórios, Contratos e Empresa.
- Componentes reutilizáveis para filtros, cards, modais, ações, upload local e prévias.

### Parcial ou Ainda Não Integrado ao Backend
- Painel ainda depende do cache frontend e dos módulos já carregados.
- Relatórios ainda não persistem no banco.
- Contratos ainda não persistem no banco.
- Empresa/Configuração da empresa ainda não persiste no banco.
- Uploads ainda não foram migrados para storage externo.
- Geração de PDF real ainda não foi implementada.
- Envio real de e-mail/WhatsApp ainda não foi implementado.

## Contexto de Negócio
O sistema atende empresas que prestam manutenção hidráulica para condomínios, centralizando:
- carteira de condomínios;
- equipe técnica;
- visitas técnicas;
- checklists hidráulicos;
- relatórios;
- contratos;
- dados institucionais da empresa contratada.

O contexto inicial é a operação da empresa **F TEC AUTOMAÇÃO**, contratada para prestação de serviços técnicos em condomínios.

## Perfis e Permissões
Os perfis internos atuais são:

### admin
- Acesso total.
- Pode visualizar, criar, editar e excluir Condomínios e Técnicos.
- Pode acessar Contratos e Empresa no frontend.

### manager
- Acesso total operacional.
- Pode visualizar, criar, editar e excluir Condomínios e Técnicos.
- Pode acessar Contratos e Empresa no frontend.

### collaborator
- Pode visualizar módulos operacionais permitidos.
- Pode visualizar listas de Condomínios e Técnicos.
- Não pode criar, editar ou excluir Condomínios e Técnicos.
- Não vê Contratos nem Empresa no menu.
- Não deve acessar endpoints futuros de Contratos e Empresa.

## Fluxo de Autenticação
1. Usuário acessa `/login`.
2. Frontend envia credenciais para `POST /auth/login`.
3. Backend valida e retorna token JWT e dados do usuário.
4. Frontend armazena apenas:
   - `blueflow-auth-token`;
   - `blueflow-current-user`.
5. Ao recarregar a aplicação, o frontend valida a sessão em `GET /auth/me`.
6. Em caso de token inválido ou expirado, o usuário é deslogado automaticamente.

## Módulos Funcionais
### Condomínios
Implementado com persistência real via API.

Funcionalidades:
- listagem;
- busca client-side sobre dados carregados;
- cadastro para `admin` e `manager`;
- edição para `admin` e `manager`;
- exclusão para `admin` e `manager`;
- bloqueio de exclusão no backend quando há visitas ou contratos vinculados.

### Técnicos
Implementado com persistência real via API.

Funcionalidades:
- listagem;
- busca client-side sobre dados carregados;
- filtro por status;
- cadastro para `admin` e `manager`;
- edição para `admin` e `manager`;
- exclusão para `admin` e `manager`;
- bloqueio de exclusão no backend quando há visitas vinculadas.

### Visitas
Implementado com persistência real via API.

Funcionalidades:
- listagem;
- cadastro e edição para `admin`, `manager` e `collaborator`;
- exclusão para `admin` e `manager`;
- vínculo com Condomínio e Técnico;
- checklist operacional persistido;
- aceite técnico confirmado;
- valor do equipamento;
- local da instalação;
- observações do aceite;
- prévia e impressão de Termo de Instalação, Aceite Técnico e Responsabilidade Operacional.

Ainda planejado:
- upload de fotos;
- assinatura eletrônica;
- upload do termo assinado;
- geração de relatório pelo backend.

### Relatórios
Tela e componentes existem no frontend, mas a persistência real no backend ainda não foi integrada.

Planejado:
- listagem server-side;
- detalhamento a partir de visita;
- geração de PDF real;
- versionamento e download.

### Contratos
Tela e prévia de contrato existem no frontend, mas a persistência real no backend ainda não foi integrada.

Planejado:
- CRUD via API;
- restrição a `admin` e `manager`;
- geração server-side de documento/PDF;
- upload de contrato assinado via Vercel Blob ou storage equivalente.

### Empresa
Tela existe no frontend, mas a persistência real no backend ainda não foi integrada.

Planejado:
- leitura e atualização via API;
- restrição a `admin` e `manager`.

## Regras de Negócio
- Um Condomínio pode possuir muitos Contratos.
- Um Condomínio pode possuir muitas Visitas.
- Um Técnico pode possuir muitas Visitas.
- Uma Visita pode gerar um Relatório.
- Uma Visita possui itens de checklist.
- Uma Visita pode possuir fotos.
- Um Contrato pertence a um Condomínio.
- Não excluir Condomínio com Visitas ou Contratos vinculados.
- Não excluir Técnico com Visitas vinculadas.
- `collaborator` não pode criar, editar ou excluir Condomínios e Técnicos.
- `collaborator` não deve acessar Contratos nem Empresa.

## Status de Negócio
### Técnico
- `Ativo`
- `Inativo`

### Visita
- `Agendada`
- `Em andamento`
- `Concluída`
- `Pendente`
- `Cancelada`

### Checklist
- `Normal`
- `Atenção`
- `Crítico`

### Contrato
- `Rascunho`
- `Gerado`
- `Enviado`
- `Assinado`
- `Vencido`
- `Cancelado`

## Histórico do MVP
O MVP frontend-only foi importante para validar:
- navegação geral;
- estrutura visual;
- formulários principais;
- fluxo operacional de visitas;
- prévia e impressão HTML de contratos;
- componentes reutilizáveis;
- regras iniciais de vínculo entre entidades.

Esse histórico deve ser preservado, mas a estratégia principal atual é backend + PostgreSQL.
