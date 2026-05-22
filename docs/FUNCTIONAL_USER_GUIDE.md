# Guia Funcional do Usuário - F TEC AUTOMAÇÃO

## 1. Visão geral do sistema
O sistema F TEC AUTOMAÇÃO é uma ferramenta para organizar a operação de automação e manutenção hidráulica em condomínios.

Ele centraliza informações sobre condomínios atendidos, equipe técnica, visitas, checklist operacional, fotos, termos de aceite, relatórios técnicos e contratos.

O objetivo é reduzir controles manuais, padronizar o registro das visitas e facilitar a entrega de documentos profissionais aos clientes.

[INSERIR PRINT DA TELA LOGIN]

## 2. Objetivo do sistema
O sistema foi criado para apoiar a rotina da F TEC AUTOMAÇÃO em atividades como:

- manter a carteira de condomínios organizada;
- cadastrar e acompanhar técnicos;
- registrar visitas técnicas;
- documentar checklist, ações realizadas, problemas encontrados e melhorias sugeridas;
- anexar fotos e termos relacionados à visita;
- gerar relatório técnico em PDF;
- consultar, baixar e compartilhar relatórios;
- cadastrar contratos por condomínio;
- anexar contratos assinados;
- controlar o acesso conforme o perfil do usuário.

## 3. Perfis de acesso
Cada usuário acessa o sistema com um perfil. Esse perfil define quais telas e ações estarão disponíveis.

### admin
Perfil administrativo completo.

Pode:
- acessar todas as áreas do sistema;
- cadastrar, editar, ativar, inativar e resetar senha de usuários;
- cadastrar, editar e excluir condomínios;
- cadastrar, editar e excluir técnicos;
- cadastrar, editar e excluir visitas;
- anexar e remover arquivos de visitas;
- gerar, reemitir, baixar e excluir relatórios técnicos;
- cadastrar, editar e excluir contratos;
- anexar, baixar e remover contrato assinado;
- acessar a tela Empresa.

### manager
Perfil de gestão operacional.

Pode:
- acessar o painel operacional;
- cadastrar, editar e excluir condomínios;
- cadastrar, editar e excluir técnicos;
- cadastrar, editar e excluir visitas;
- anexar e remover arquivos de visitas;
- gerar, reemitir, baixar e excluir relatórios técnicos;
- cadastrar, editar e excluir contratos;
- anexar, baixar e remover contrato assinado;
- acessar a tela Empresa.

Não pode:
- acessar a gestão de usuários.

### collaborator
Perfil operacional limitado.

Pode:
- acessar o painel operacional;
- visualizar condomínios;
- visualizar técnicos;
- cadastrar e editar visitas;
- preencher checklist;
- anexar arquivos na visita;
- visualizar e baixar relatórios técnicos.

Não pode:
- cadastrar, editar ou excluir condomínios;
- cadastrar, editar ou excluir técnicos;
- excluir visitas;
- excluir anexos;
- gerar, reemitir ou excluir relatórios;
- acessar Contratos;
- acessar Empresa;
- acessar Usuários.

## 4. Fluxo operacional recomendado
Este é o fluxo sugerido para uso diário do sistema.

### 1. Cadastrar condomínio
Acesse a tela Condomínios e cadastre os dados do condomínio atendido.

Registre, sempre que possível:
- nome do condomínio;
- razão social;
- CNPJ;
- endereço;
- cidade e estado;
- responsável ou síndico;
- telefone e e-mail;
- quantidade de unidades;
- janela mensal de atendimento;
- status.

[INSERIR PRINT DA TELA CONDOMÍNIOS]

### 2. Cadastrar técnico
Acesse a tela Técnicos e cadastre os profissionais que realizam os atendimentos.

Informe:
- nome;
- telefone;
- função ou especialidade;
- status;
- observações relevantes.

[INSERIR PRINT DA TELA TÉCNICOS]

### 3. Registrar visita
Acesse a tela Visitas e crie uma nova visita técnica.

Selecione:
- condomínio;
- técnico responsável;
- tipo de serviço;
- data da visita;
- status da visita;
- responsável pelo acompanhamento no condomínio;
- cargo ou função do responsável.

[INSERIR PRINT DA TELA NOVA VISITA]

### 4. Preencher checklist
Durante ou após a visita, preencha o checklist operacional.

Para cada item verificado, informe:
- equipamento;
- status;
- observações.

Use os status de forma consistente:
- Normal: item funcionando corretamente;
- Atenção: item exige acompanhamento ou manutenção futura;
- Crítico: item com problema importante ou risco operacional.

### 5. Registrar aceite técnico
Quando aplicável, marque o aceite técnico confirmado e preencha:
- nome do responsável;
- cargo ou função;
- local da instalação;
- valor do equipamento;
- observações do aceite.

O sistema permite visualizar e imprimir o Termo de Instalação, Aceite Técnico e Responsabilidade Operacional.

[INSERIR PRINT DO TERMO DE ACEITE]

### 6. Anexar fotos e termo
Na visita, anexe os arquivos relacionados ao atendimento:

- foto do reservatório;
- foto da bomba;
- foto do quadro;
- termo assinado;
- outros arquivos permitidos.

Boas práticas:
- usar fotos nítidas;
- evitar fotos duplicadas;
- anexar o termo assinado na categoria correta;
- revisar os arquivos antes de gerar o relatório técnico.

### 7. Gerar relatório técnico
Após conferir os dados da visita, gere o relatório técnico.

O relatório pode incluir:
- dados do condomínio;
- técnico responsável;
- data da visita;
- tipo de serviço;
- checklist;
- ações executadas;
- problemas encontrados;
- melhorias sugeridas;
- aceite técnico;
- anexos e evidências compatíveis.

Se uma visita for corrigida depois da geração, usuários autorizados podem reemitir o relatório. O sistema mantém histórico de versões.

[INSERIR PRINT DA AÇÃO GERAR RELATÓRIO]

### 8. Baixar ou enviar relatório
Na tela Relatórios, o usuário pode:
- abrir o PDF;
- baixar o relatório;
- enviar mensagem pronta por WhatsApp;
- criar e-mail com assunto e texto preenchidos.

Importante: o sistema prepara a mensagem, mas o envio final é feito pelo aplicativo de WhatsApp ou e-mail do usuário.

[INSERIR PRINT DA TELA RELATÓRIOS]

### 9. Cadastrar contrato
Na tela Contratos, cadastre os contratos vinculados ao condomínio.

Informe:
- condomínio;
- número do contrato;
- tipo de serviço;
- valor mensal;
- dia de vencimento;
- prazo;
- data de início;
- data de assinatura;
- visitas preventivas mensais;
- SLA;
- foro;
- status;
- observações.

[INSERIR PRINT DA TELA CONTRATOS]

### 10. Anexar contrato assinado
Depois que o contrato estiver assinado, anexe o arquivo na área Contrato assinado.

O sistema permite:
- anexar arquivo;
- visualizar ou baixar o contrato assinado;
- remover o arquivo, conforme permissão;
- gerar mensagem pronta por WhatsApp ou e-mail.

## 5. Explicação por tela
### Painel
Tela inicial da operação.

Mostra indicadores como:
- carteira ativa;
- técnicos ativos;
- visitas do mês;
- visitas pendentes;
- visitas concluídas;
- visitas agendadas;
- itens críticos ou em atenção no checklist;
- condomínios sem visita concluída no mês;
- últimas visitas realizadas.

Use o Painel para acompanhar prioridades do mês.

[INSERIR PRINT DA TELA PAINEL]

### Condomínios
Tela para manter a carteira de condomínios atendidos.

Permite:
- visualizar condomínios cadastrados;
- buscar registros;
- cadastrar novos condomínios;
- editar dados;
- excluir quando não houver vínculos com visitas ou contratos.

Disponível para edição apenas para `admin` e `manager`.

### Técnicos
Tela para manter a equipe técnica.

Permite:
- visualizar técnicos;
- filtrar por status;
- cadastrar técnico;
- editar dados;
- excluir quando não houver visitas vinculadas.

Disponível para edição apenas para `admin` e `manager`.

### Visitas
Tela central da operação técnica.

Permite:
- listar visitas;
- criar nova visita;
- editar visita;
- registrar checklist;
- registrar aceite técnico;
- anexar fotos e documentos;
- visualizar termo de aceite;
- gerar relatório técnico.

Permissões:
- `admin` e `manager`: podem criar, editar e excluir;
- `collaborator`: pode criar e editar, mas não excluir.

### Relatórios
Tela para consultar relatórios técnicos gerados.

Permite:
- listar relatórios;
- abrir PDF;
- consultar versões;
- enviar mensagem pronta por WhatsApp;
- criar e-mail com texto preenchido;
- excluir relatório, conforme permissão.

Permissões:
- `admin` e `manager`: podem gerar, reemitir, baixar e excluir;
- `collaborator`: pode visualizar e baixar.

### Contratos
Tela para gestão contratual dos condomínios.

Permite:
- cadastrar contratos;
- editar contratos;
- excluir contratos;
- imprimir ou gerar documento do contrato;
- anexar contrato assinado;
- visualizar ou baixar contrato assinado;
- enviar mensagem pronta por WhatsApp ou e-mail.

Disponível apenas para `admin` e `manager`.

### Empresa
Tela destinada aos dados institucionais da empresa.

Status atual:
- a tela existe;
- deve ser tratada como área em evolução;
- ainda não deve ser usada como cadastro oficial definitivo da empresa.

Disponível para `admin` e `manager`.

### Usuários
Tela administrativa para controle de acesso.

Permite:
- listar usuários;
- criar usuário;
- editar nome, e-mail, perfil e status;
- ativar ou inativar usuários;
- resetar senha temporária.

Disponível apenas para `admin`.

[INSERIR PRINT DA TELA USUÁRIOS]

## 6. Regras de negócio importantes
- Cada visita deve estar vinculada a um condomínio e a um técnico.
- Não é possível excluir condomínio com visitas ou contratos vinculados.
- Não é possível excluir técnico com visitas vinculadas.
- Contratos sempre pertencem a um condomínio.
- Colaboradores não acessam Contratos, Empresa ou Usuários.
- Colaboradores podem criar e editar visitas, mas não podem excluir.
- Relatórios técnicos são gerados a partir de visitas.
- Uma visita pode ter mais de uma versão de relatório técnico.
- Excluir um relatório não exclui a visita.
- O contrato assinado fica vinculado ao contrato correspondente.
- O termo assinado pode ser anexado na visita.
- Senhas temporárias devem ser guardadas e compartilhadas com cuidado.
- Administrador não consegue inativar o próprio usuário.

## 7. Permissões por perfil
| Área | admin | manager | collaborator |
| --- | --- | --- | --- |
| Painel | Acessa | Acessa | Acessa |
| Usuários | Acessa e administra | Não acessa | Não acessa |
| Condomínios | Cria, edita e exclui | Cria, edita e exclui | Visualiza |
| Técnicos | Cria, edita e exclui | Cria, edita e exclui | Visualiza |
| Visitas | Cria, edita e exclui | Cria, edita e exclui | Cria e edita |
| Anexos de visitas | Anexa, visualiza e remove | Anexa, visualiza e remove | Anexa e visualiza |
| Relatórios | Gera, reemite, baixa e exclui | Gera, reemite, baixa e exclui | Visualiza e baixa |
| Contratos | Cria, edita, exclui e anexa contrato assinado | Cria, edita, exclui e anexa contrato assinado | Não acessa |
| Empresa | Acessa | Acessa | Não acessa |

## 8. Boas práticas de uso
- Cadastre condomínios e técnicos antes de registrar visitas.
- Revise os dados da visita antes de gerar o relatório.
- Use descrições claras em ações executadas, problemas encontrados e melhorias sugeridas.
- Evite termos genéricos como "ok" ou "feito" quando houver informação técnica relevante.
- Preencha o checklist com atenção, principalmente itens críticos.
- Anexe fotos nítidas e relacionadas ao atendimento.
- Confira se o termo assinado está na visita correta.
- Baixe ou envie o relatório somente depois de revisar os dados.
- Mantenha contratos com número e status atualizados.
- Guarde senhas temporárias em local seguro e envie ao usuário por canal confiável.
- Não compartilhe seu usuário e senha.

## 9. Dúvidas frequentes
### Esqueci minha senha. O que fazer?
Solicite a um usuário `admin` o reset da senha temporária.

Recuperação automática por e-mail ainda não está disponível.

### Posso excluir uma visita?
Depende do seu perfil.

`admin` e `manager` podem excluir visitas. `collaborator` não pode.

### Posso excluir um condomínio?
Somente `admin` e `manager` podem excluir condomínios. O sistema bloqueia a exclusão se houver visitas ou contratos vinculados.

### Por que não vejo a tela Contratos?
Provavelmente seu perfil é `collaborator`. Esse perfil não acessa Contratos.

### Por que não vejo a tela Usuários?
A gestão de usuários é exclusiva do perfil `admin`.

### O envio por WhatsApp é automático?
Não. O sistema prepara a mensagem e abre o WhatsApp para o usuário concluir o envio.

### O envio por e-mail é automático?
Não. O sistema cria um e-mail com assunto e texto preenchidos, mas o usuário precisa revisar e enviar.

### Posso gerar outro relatório da mesma visita?
Sim, se seu perfil permitir. A reemissão cria uma nova versão do relatório.

### Excluir um relatório apaga a visita?
Não. A exclusão remove apenas o relatório selecionado.

### A tela Empresa já é definitiva?
Ainda não. A tela existe, mas a gestão completa dos dados da empresa está planejada para uma próxima etapa.

### O sistema assina documentos eletronicamente?
Ainda não. A assinatura eletrônica é uma funcionalidade futura.

## 10. Glossário simples
### Aceite técnico
Confirmação de que o responsável do condomínio está ciente da instalação, funcionamento ou responsabilidade operacional relacionada ao equipamento.

### Anexo
Arquivo vinculado a uma visita ou contrato, como foto, termo assinado ou contrato assinado.

### Checklist
Lista de equipamentos ou itens verificados durante a visita técnica.

### Condomínio
Cliente atendido pela F TEC AUTOMAÇÃO.

### Contrato assinado
Arquivo do contrato já assinado e vinculado ao contrato cadastrado no sistema.

### Dashboard ou Painel
Tela inicial com indicadores da operação.

### Relatório técnico
Documento em PDF gerado a partir de uma visita técnica.

### Reemissão
Geração de uma nova versão do relatório técnico após ajuste ou revisão da visita.

### SLA
Prazo de atendimento previsto em contrato.

### Status
Situação atual de um registro, como Ativo, Inativo, Agendada, Concluída, Assinado ou Cancelado.

### Técnico
Profissional responsável pelo atendimento em campo.

### Termo de aceite
Documento de aceite técnico e responsabilidade operacional associado à visita.

## 11. Funcionalidades futuras
As funcionalidades abaixo estão planejadas ou em evolução, mas ainda não devem ser consideradas disponíveis como fluxo completo:

- dados definitivos da tela Empresa;
- envio automático de e-mail;
- integração automática com WhatsApp;
- assinatura eletrônica;
- recuperação de senha por e-mail;
- portal do cliente;
- modelos avançados de documentos e contratos.
