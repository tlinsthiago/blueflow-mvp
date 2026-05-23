# Planejamento de API

## Estratégia Geral
A API atual segue REST JSON com autenticação Bearer Token, respostas padronizadas e validação com Zod nas rotas novas.

Formato de resposta:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

Todas as rotas de domínio implementadas exigem JWT.

## Permissões
- `admin`: leitura e escrita.
- `manager`: leitura e escrita.
- `collaborator`: leitura, sem criação, edição ou exclusão.

Contratos e Empresa são restritos a `admin` e `manager`.

Gestão de Usuários é restrita a `admin`.

## Implementado
### Health
- `GET /health`

### Auth
- `POST /auth/login`
- `GET /auth/me`

Observação: `refresh token` e `logout` server-side ainda não foram implementados.

### Users
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id/password`
- `PATCH /users/:id/status`

Filtros:
- `search`
- `role`
- `isActive`
- `page`
- `pageSize`

Permissões:
- somente `admin`;
- `manager` e `collaborator` não acessam a gestão de usuários.

Regras:
- senhas são armazenadas apenas como hash Argon2;
- `passwordHash` nunca é retornado pela API;
- e-mail deve ser único;
- administrador não pode inativar o próprio usuário;
- reset de senha recebe uma senha temporária definida pelo administrador;
- recuperação de senha por e-mail ainda não foi implementada.

### Dashboard
- `GET /dashboard/summary`

Retorna:
- total de condomínios ativos;
- total de técnicos ativos;
- visitas do mês atual;
- visitas pendentes;
- visitas concluídas no mês;
- visitas agendadas;
- checklist com status `critical`;
- checklist com status `attention`;
- condomínios ativos sem visita concluída no mês;
- últimas visitas concluídas.

Permissão:
- `admin`, `manager` e `collaborator`.

### Company
- `GET /company`
- `PUT /company`

Permissões:
- `admin` e `manager` podem visualizar e editar;
- `collaborator` não acessa.

Regras:
- existe apenas uma configuração institucional principal;
- quando não há registro salvo, o sistema retorna os dados padrão da F TEC AUTOMAÇÃO;
- `PUT /company` cria o registro quando ele ainda não existe ou atualiza o registro principal existente;
- os dados são usados em contratos, relatórios técnicos em PDF e mensagens assistidas de WhatsApp/e-mail.

### Condominiums
- `GET /condominiums`
- `GET /condominiums/:id`
- `POST /condominiums`
- `PUT /condominiums/:id`
- `DELETE /condominiums/:id`

Filtros:
- `search`
- `status`
- `page`
- `pageSize`

Regra de integridade:
- não excluir condomínio com visitas ou contratos vinculados.

### Technicians
- `GET /technicians`
- `GET /technicians/:id`
- `POST /technicians`
- `PUT /technicians/:id`
- `DELETE /technicians/:id`

Filtros:
- `search`
- `status`
- `page`
- `pageSize`

Regra de integridade:
- não excluir técnico com visitas vinculadas.

### Visits
- `GET /visits`
- `GET /visits/:id`
- `POST /visits`
- `PUT /visits/:id`
- `DELETE /visits/:id`
- `POST /visits/:id/generate-report`
- `GET /visits/:id/files`
- `POST /visits/:id/files`
- `GET /visits/:id/files/:fileId/download`
- `DELETE /visits/:id/files/:fileId`

Filtros:
- `condominiumId`
- `technicianId`
- `status`
- `serviceType`
- `startDate`
- `endDate`
- `page`
- `pageSize`

Permissões:
- `admin` e `manager`: CRUD completo.
- `collaborator`: visualizar, criar e editar; não pode excluir.
- arquivos: `admin` e `manager` enviam, listam e excluem; `collaborator` envia e lista, mas não exclui.

Regras:
- não criar ou editar visita com condomínio inexistente;
- não criar ou editar visita com técnico inexistente;
- checklist básico pode ser enviado junto da visita.
- upload usa `multipart/form-data` com campo `file` e `fileType`;
- arquivos são armazenados em Vercel Blob privado;
- o banco salva apenas metadados do arquivo;
- visualização/download exigem autenticação e passam pelo endpoint seguro;
- limite atual de upload: 10 MB;
- tipos permitidos: imagens e PDF.

Tipos aceitos em `fileType`:
- `reservoir_photo`
- `pump_photo`
- `electrical_panel_photo`
- `signed_acceptance_term`
- `other`

### Reports
- `GET /reports`
- `GET /reports/:id`
- `GET /reports/:id/download`
- `POST /visits/:id/generate-report`
- `DELETE /reports/:id`

Filtros:
- `condominiumId`
- `technicianId`
- `page`
- `pageSize`

Permissões:
- `admin` e `manager`: gerar, reemitir, listar, baixar e excluir.
- `collaborator`: listar e baixar; não gera, reemite nem exclui.

Regras:
- relatório sempre pertence a uma Visita;
- uma Visita pode possuir múltiplos Relatórios versionados;
- gerar novamente um relatório da mesma Visita cria nova versão e mantém histórico;
- a combinação `visitId + version` é única;
- o PDF é armazenado em Vercel Blob privado;
- metadados do PDF são salvos em `File` com `fileType`/`category` `technical_report_pdf`;
- download exige autenticação e passa por endpoint seguro;
- exclusão remove o Report, tenta remover o PDF do Blob e remove metadados `File`, sem excluir a Visita;
- envio por e-mail/WhatsApp ainda não foi implementado.

### Contracts
- `GET /contracts`
- `GET /contracts/:id`
- `POST /contracts`
- `PUT /contracts/:id`
- `DELETE /contracts/:id`
- `POST /contracts/:id/signed-file`
- `GET /contracts/:id/signed-file/download`
- `DELETE /contracts/:id/signed-file`

Filtros:
- `condominiumId`
- `status`
- `serviceType`
- `page`
- `pageSize`

Permissões:
- somente `admin` e `manager`;
- `collaborator` não acessa o módulo de Contratos.

Regras:
- contrato sempre pertence a um Condomínio;
- não criar ou editar contrato com Condomínio inexistente;
- não excluir contrato inexistente;
- `signedFileId` referencia o arquivo atual de contrato assinado, quando houver;
- upload/download de contrato assinado usa Vercel Blob privado e endpoint autenticado;
- o banco salva apenas metadados em `File`, com `fileType`/`category` `signed_contract`.

## Planejado
### Reports - próximas extensões
- envio por e-mail/WhatsApp;
- templates/versionamento avançado.

### Contracts - próximas extensões
- `GET /contracts/:id/document`
- `GET /contracts/:id/print`

Permissão planejada:
- somente `admin` e `manager`.

### Uploads
Uploads específicos de Visitas já existem em `/visits/:id/files`.
Upload/download de contrato assinado já existe em `/contracts/:id/signed-file`.

Endpoints genéricos ainda planejados:
- `POST /uploads`
- `GET /uploads/:id`
- `DELETE /uploads/:id`

Storage atual para Visitas e contrato assinado:
- Vercel Blob privado.

Storage atual para Relatórios:
- Vercel Blob privado para PDFs gerados.

Categorias previstas:
- `reservoir_photo`
- `pump_photo`
- `electrical_panel_photo`
- `signed_acceptance_term`
- `signed_contract`
- `technical_report_pdf`
- `other`
- `report-attachment`

## Payloads Atuais
### POST /condominiums
```json
{
  "name": "Residencial Atlântico",
  "legalName": "Condomínio Residencial Atlântico",
  "cnpj": "03.602.548/0001-08",
  "addressLine": "Av. Boa Viagem, 1200",
  "city": "Recife",
  "state": "PE",
  "managerName": "Marcos Lima",
  "managerCpf": "123.123.123-10",
  "managerPhone": "(81) 99911-2233",
  "managerEmail": "marcos@condominio.com.br",
  "units": 84,
  "monthlyWindow": "Primeira semana",
  "status": "Ativo"
}
```

### POST /technicians
```json
{
  "name": "Diego Santos",
  "phone": "(81) 99999-1010",
  "role": "Técnico Hidráulico Sênior",
  "status": "Ativo",
  "notes": "Atua principalmente em casas de bombas."
}
```

### POST /visits
```json
{
  "condominiumId": "uuid-do-condominio",
  "technicianId": "uuid-do-tecnico",
  "serviceType": "Manutenção Preventiva",
  "status": "scheduled",
  "visitDate": "2026-05-20T13:00:00.000Z",
  "responsibleName": "Marcos Lima",
  "responsibleRole": "Síndico",
  "notes": "Visita mensal preventiva.",
  "actionsPerformed": "Inspeção visual e testes operacionais.",
  "issuesFound": "Sem ocorrências críticas.",
  "improvementsSuggested": "Reforçar sinalização da casa de bombas.",
  "checklistItems": [
    {
      "equipment": "Bomba de Recalque 1",
      "status": "normal",
      "notes": "Operando normalmente."
    }
  ]
}
```

Status aceitos para visita:
- `scheduled`
- `in_progress`
- `completed`
- `pending`
- `cancelled`

Status aceitos para checklist:
- `normal`
- `attention`
- `critical`

## Integração Frontend
O frontend já consome:
- `authService`;
- `userService`, restrito ao módulo administrativo de Usuários.
- `condominiumService`;
- `technicianService`.
- `visitService`, incluindo anexos reais de visitas.
- `contractService`, com CRUD real de Contratos e contrato assinado privado.
- `reportService`, com listagem, geração a partir de Visita e download de PDF privado.
