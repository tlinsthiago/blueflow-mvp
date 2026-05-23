# Documentação Funcional

## Visão Geral
`BlueFlow Gestão Hidráulica` é uma aplicação web para gestão operacional, técnica e contratual de serviços de manutenção hidráulica em condomínios.

O produto nasceu como um MVP frontend-only, com dados em `localStorage`, para validar navegação, formulários, relatórios e contratos. A arquitetura atual já evoluiu para uma V1 fullstack parcial, com frontend React, backend Fastify, autenticação JWT, RBAC e persistência PostgreSQL para Condomínios, Técnicos, Visitas e Contratos.

## Estado Atual do Produto
### Implementado
- Landing page institucional.
- Login real com e-mail e senha via API.
- Bootstrap de sessão com token JWT.
- Controle de acesso por perfil.
- Layout autenticado com menu filtrado por permissão.
- Gestão administrativa de usuários para perfil `admin`.
- Dashboard operacional com indicadores reais do backend.
- Gestão de Condomínios integrada ao backend.
- Gestão de Técnicos integrada ao backend.
- Gestão de Visitas integrada ao backend, com checklist e aceite técnico.
- Gestão de Contratos integrada ao backend.
- Visitas persistem no backend e usam Vercel Blob privado para anexos.
- Contratos persistem no backend e usam Vercel Blob privado para contrato assinado.
- Relatórios técnicos são gerados a partir de Visitas e armazenados como PDF privado.
- Compartilhamento assistido de Relatórios e Contratos por WhatsApp/e-mail com mensagens prontas.
- Gestão de dados institucionais da Empresa integrada ao backend.
- Páginas existentes para Painel, Relatórios, Contratos e Empresa.
- Componentes reutilizáveis para filtros, cards, modais, ações, uploads privados e prévias.

### Parcial ou Ainda Não Integrado ao Backend
- Envio automático via WhatsApp Business API, SMTP ou serviço transacional ainda não foi implementado.

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
- Pode acessar a tela Usuários.
- Pode criar, editar, ativar/inativar usuários e resetar senha temporária.
- Pode visualizar, criar, editar e excluir Condomínios e Técnicos.
- Pode acessar Contratos e Empresa no frontend.

### manager
- Acesso total operacional.
- Pode visualizar, criar, editar e excluir Condomínios e Técnicos.
- Pode acessar Contratos e Empresa no frontend.
- Não acessa a gestão de usuários.

### collaborator
- Pode visualizar módulos operacionais permitidos.
- Pode visualizar listas de Condomínios e Técnicos.
- Não pode criar, editar ou excluir Condomínios e Técnicos.
- Não vê Contratos nem Empresa no menu.
- Não acessa a gestão de usuários.
- Não deve acessar endpoints de Contratos nem endpoints futuros de Empresa.

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
### Dashboard
Implementado com dados reais do backend.

Funcionalidades:
- total de condomínios ativos;
- total de técnicos ativos;
- visitas do mês atual;
- visitas pendentes;
- visitas concluídas no mês;
- visitas agendadas;
- itens de checklist críticos e em atenção;
- alerta de condomínios sem visita concluída no mês;
- últimas visitas realizadas.

Permissão:
- disponível para `admin`, `manager` e `collaborator`.

### Usuários
Implementado com persistência real via API.

Funcionalidades:
- listagem de usuários;
- busca por nome ou e-mail;
- filtro por perfil e status;
- criação de usuário com senha temporária;
- edição de nome, e-mail, perfil e status;
- ativação/inativação controlada;
- reset de senha temporária.

Permissão:
- somente `admin`.

Regras:
- senha é salva no backend apenas como hash Argon2;
- a interface exibe a senha temporária somente no momento da criação ou reset;
- administrador não pode inativar o próprio usuário;
- recuperação de senha por e-mail ainda não foi implementada.

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
- upload por categoria: foto do reservatório, foto da bomba, foto do quadro e termo assinado;
- visualização dos anexos da visita;
- exclusão de anexos por `admin` e `manager`.

Ainda planejado:
- assinatura eletrônica;
- envio real de relatório por e-mail/WhatsApp.

### Relatórios
Implementado com geração real de PDF a partir de Visitas.

Funcionalidades:
- geração a partir da visita técnica;
- vínculo `Visit` → `Report`;
- histórico de múltiplas versões por visita;
- reemissão após correção da visita;
- listagem de relatórios emitidos;
- download/visualização segura do PDF;
- geração de mensagem pronta para WhatsApp;
- geração de e-mail com assunto e corpo preenchidos;
- mensagens não incluem link de download, pois os arquivos são privados;
- usuário deve baixar o PDF e anexar manualmente no WhatsApp ou e-mail;
- exclusão controlada de relatório sem excluir a visita;
- armazenamento do PDF no Vercel Blob privado;
- metadados do arquivo em `File`;
- versão simples do relatório;
- conteúdo com dados do condomínio, técnico, checklist, ações, problemas, melhorias, aceite técnico e anexos/fotos compatíveis.

Ainda planejado:
- envio automático por WhatsApp Business API;
- envio automático por SMTP/serviço transacional;
- templates/versionamento documental mais robustos.

### Contratos
Implementado com persistência real via API e upload privado de contrato assinado.

Funcionalidades:
- listagem;
- cadastro, edição e exclusão para `admin` e `manager`;
- vínculo obrigatório com Condomínio;
- prévia e impressão HTML do contrato;
- geração/exportação HTML do documento;
- upload, visualização/download e remoção de contrato assinado via Vercel Blob privado.
- geração de mensagem pronta para WhatsApp e e-mail, sem envio automático;
- mensagens não incluem link de download, pois contratos assinados são arquivos privados;
- usuário deve baixar o contrato assinado e anexar manualmente no WhatsApp ou e-mail.

Ainda planejado:
- geração server-side de documento/PDF;
- versionamento formal do contrato assinado.

### Empresa
Implementado com persistência real para uma configuração institucional global.

Funcionalidades:
- leitura dos dados da empresa;
- atualização dos dados institucionais;
- fallback para dados padrão da F TEC AUTOMAÇÃO quando ainda não houver cadastro salvo;
- uso dos dados em contratos, relatórios técnicos em PDF e mensagens de WhatsApp/e-mail.

Permissão:
- disponível para `admin` e `manager`;
- `collaborator` não acessa.

## Regras de Negócio
- Um Condomínio pode possuir muitos Contratos.
- Um Condomínio pode possuir muitas Visitas.
- Um Técnico pode possuir muitas Visitas.
- Uma Visita pode gerar um Relatório.
- Uma Visita possui itens de checklist.
- Uma Visita pode possuir fotos.
- Arquivos de Visita são armazenados no Vercel Blob; o banco guarda apenas metadados.
- Arquivos PDF de Relatórios são armazenados no Vercel Blob privado; o banco guarda apenas metadados e vínculo com a Visita.
- Um Contrato pertence a um Condomínio.
- Um Contrato pode possuir um contrato assinado vigente, armazenado no Vercel Blob privado com metadados no banco.
- Existe uma única configuração institucional global da empresa.
- Dados da empresa alimentam contratos, relatórios técnicos e mensagens assistidas.
- Usuários possuem e-mail único e senha hasheada com Argon2.
- Apenas `admin` acessa a gestão de usuários.
- Administrador não pode inativar o próprio usuário.
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
