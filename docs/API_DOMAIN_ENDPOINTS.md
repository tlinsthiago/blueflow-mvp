# Endpoints de Domínio

## Visão geral
Os endpoints de domínio usam o padrão de resposta:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

Todas as rotas abaixo exigem autenticação JWT via header:

```http
Authorization: Bearer <token>
```

## Permissões
- `admin`: pode visualizar, criar, editar e excluir.
- `manager`: pode visualizar, criar, editar e excluir.
- `collaborator`: pode visualizar, mas não pode criar, editar ou excluir.

## Paginação e filtros
Listagens aceitam:
- `search`: busca textual.
- `status`: filtro por status.
- `page`: página atual. Padrão: `1`.
- `pageSize`: itens por página. Padrão: `20`, máximo: `100`.

Exemplo:

```http
GET /condominiums?search=atlântico&status=Ativo&page=1&pageSize=20
```

## Condomínios

### GET /condominiums
Lista condomínios paginados.

Campos considerados no `search`:
- `name`
- `legalName`
- `cnpj`
- `city`
- `managerName`
- `managerEmail`

### GET /condominiums/:id
Retorna um condomínio por ID.

### POST /condominiums
Cria um condomínio. Requer `admin` ou `manager`.

Payload mínimo:

```json
{
  "name": "Residencial Atlântico"
}
```

Payload completo esperado:

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

### PUT /condominiums/:id
Atualiza um condomínio. Requer `admin` ou `manager`.

### DELETE /condominiums/:id
Exclui um condomínio. Requer `admin` ou `manager`.

Regra de integridade:
- não exclui condomínio com visitas vinculadas;
- não exclui condomínio com contratos vinculados.

## Técnicos

### GET /technicians
Lista técnicos paginados.

Campos considerados no `search`:
- `name`
- `phone`
- `role`
- `notes`

### GET /technicians/:id
Retorna um técnico por ID.

### POST /technicians
Cria um técnico. Requer `admin` ou `manager`.

Payload mínimo:

```json
{
  "name": "Diego Santos"
}
```

Payload completo esperado:

```json
{
  "name": "Diego Santos",
  "phone": "(81) 99999-1010",
  "role": "Técnico Hidráulico Sênior",
  "status": "Ativo",
  "notes": "Atua principalmente em casas de bombas."
}
```

### PUT /technicians/:id
Atualiza um técnico. Requer `admin` ou `manager`.

### DELETE /technicians/:id
Exclui um técnico. Requer `admin` ou `manager`.

Regra de integridade:
- não exclui técnico com visitas vinculadas.
