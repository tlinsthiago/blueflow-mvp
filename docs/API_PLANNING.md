# Planejamento de API

## Estratégia Geral
Adotar API REST com autenticação Bearer Token, paginação, filtros server-side e upload de arquivos.

## Endpoints Sugeridos
### Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Company
- `GET /company`
- `PUT /company`

### Condominiums
- `GET /condominiums`
- `POST /condominiums`
- `GET /condominiums/{id}`
- `PUT /condominiums/{id}`
- `DELETE /condominiums/{id}`
- `GET /condominiums/{id}/contracts`
- `GET /condominiums/{id}/visits`

### Technicians
- `GET /technicians`
- `POST /technicians`
- `GET /technicians/{id}`
- `PUT /technicians/{id}`
- `DELETE /technicians/{id}`

### Visits
- `GET /visits`
- `POST /visits`
- `GET /visits/{id}`
- `PUT /visits/{id}`
- `DELETE /visits/{id}`
- `POST /visits/{id}/photos`
- `POST /visits/{id}/generate-report`

### Reports
- `GET /reports`
- `GET /reports/{id}`
- `PUT /reports/{id}`
- `DELETE /reports/{id}`
- `GET /reports/{id}/download`

### Contracts
- `GET /contracts`
- `POST /contracts`
- `GET /contracts/{id}`
- `PUT /contracts/{id}`
- `DELETE /contracts/{id}`
- `POST /contracts/{id}/signed-file`
- `GET /contracts/{id}/document`
- `GET /contracts/{id}/print`

### Uploads
- `POST /uploads`
- `GET /uploads/{id}`
- `DELETE /uploads/{id}`

## Payloads Sugeridos
### POST /condominiums
```json
{
  "displayName": "Residencial Atlântico",
  "legalName": "Condomínio Residencial Atlântico",
  "cnpj": "03.602.548/0001-08",
  "addressLine": "Av. Boa Viagem, 1200",
  "city": "Recife",
  "state": "PE",
  "managerName": "Marcos Lima",
  "managerCpf": "123.123.123-10",
  "managerPhone": "(81) 99911-2233",
  "managerEmail": "marcos@condominio.com.br",
  "unitsCount": 84,
  "monthlyWindow": "Primeira semana"
}
```

### POST /contracts
```json
{
  "condominiumId": "cond-1",
  "contractNumber": "FTC-2026-001",
  "serviceType": "Manutenção Preventiva",
  "monthlyValue": 600.0,
  "dueDay": 15,
  "termMonths": 24,
  "startDate": "2026-04-15",
  "signatureDate": "2026-04-15",
  "monthlyPreventiveVisits": 1,
  "emergencySlaHours": 4,
  "nonEmergencySlaHours": 24,
  "jurisdiction": "Jaboatão dos Guararapes/PE",
  "status": "Assinado",
  "notes": "Contrato principal."
}
```

### POST /visits
```json
{
  "condominiumId": "cond-1",
  "technicianId": "tech-1",
  "serviceType": "Manutenção Preventiva",
  "visitStatus": "Concluída",
  "visitDate": "2026-05-02T09:00:00Z",
  "responsible": {
    "name": "Marcos Lima",
    "phone": "(81) 99911-2233",
    "role": "Síndico",
    "equipmentValue": 8000,
    "acknowledged": true,
    "acknowledgedAt": "2026-05-02T09:30:00Z"
  }
}
```

## Resposta Padrão Sugerida
```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

## Autenticação Planejada
- login com e-mail e senha;
- JWT + refresh token;
- perfis: admin, coordenador, técnico, comercial, cliente.

## Upload Planejado
- `multipart/form-data`
- storage externo sugerido: S3 compatível
- categorias:
  - `visit-photo`
  - `contract-signed`
  - `report-attachment`

## Relatórios e Contratos
- geração server-side em HTML/PDF;
- templates versionados;
- possível envio automático por e-mail;
- snapshot dos dados utilizados na emissão.
