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

Contratos e Empresa devem ser restritos a `admin` e `manager` quando seus endpoints forem implementados.

## Implementado
### Health
- `GET /health`

### Auth
- `POST /auth/login`
- `GET /auth/me`

Observação: `refresh token` e `logout` server-side ainda não foram implementados.

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
- `GET /visits/:id/files`
- `POST /visits/:id/files`
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
- arquivos são armazenados no Vercel Blob;
- o banco salva apenas metadados do arquivo;
- limite atual de upload: 10 MB;
- tipos permitidos: imagens e PDF.

Tipos aceitos em `fileType`:
- `reservoir_photo`
- `pump_photo`
- `electrical_panel_photo`
- `signed_acceptance_term`
- `other`

## Planejado
### Company
- `GET /company`
- `PUT /company`

Permissão planejada:
- somente `admin` e `manager`.

### Visits - Próximas extensões
- `POST /visits/:id/generate-report`

### Reports
- `GET /reports`
- `GET /reports/:id`
- `PUT /reports/:id`
- `DELETE /reports/:id`
- `GET /reports/:id/download`

### Contracts
- `GET /contracts`
- `POST /contracts`
- `GET /contracts/:id`
- `PUT /contracts/:id`
- `DELETE /contracts/:id`
- `POST /contracts/:id/signed-file`
- `GET /contracts/:id/document`
- `GET /contracts/:id/print`

Permissão planejada:
- somente `admin` e `manager`.

### Uploads
Uploads específicos de Visitas já existem em `/visits/:id/files`.

Endpoints genéricos ainda planejados:
- `POST /uploads`
- `GET /uploads/:id`
- `DELETE /uploads/:id`

Storage atual para Visitas:
- Vercel Blob.

Categorias previstas:
- `reservoir_photo`
- `pump_photo`
- `electrical_panel_photo`
- `signed_acceptance_term`
- `other`
- `contract-signed`
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
- `condominiumService`;
- `technicianService`.
- `visitService`, incluindo anexos reais de visitas.

Services de Contratos e Relatórios já existem como estrutura base, mas ainda não estão conectados a endpoints implementados.
