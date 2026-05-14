# Modelo de Dados

## Estado Atual
O modelo relacional está definido em `backend/prisma/schema.prisma` e usa PostgreSQL via Prisma ORM.

Entidades modeladas:
- `User`
- `CompanySettings`
- `Condominium`
- `Technician`
- `Visit`
- `VisitChecklistItem`
- `VisitPhoto`
- `Report`
- `Contract`
- `File`

Persistência real já usada pela aplicação:
- usuários;
- condomínios;
- técnicos.

As demais entidades estão modeladas para próximas etapas, mas ainda não possuem fluxo completo integrado no frontend/backend.

## Perfis
### UserRole
- `admin`
- `manager`
- `collaborator`

## Entidades
### User
- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Uso atual:
- autenticação;
- autorização por perfil;
- seed inicial.

### CompanySettings
- `id`
- `legalName`
- `cnpj`
- `addressLine`
- `city`
- `state`
- `legalRepresentative`
- `representativeCpf`
- `phone`
- `email`
- `createdAt`
- `updatedAt`

Status:
- modelado;
- endpoint e integração frontend ainda pendentes.

### Condominium
- `id`
- `name`
- `legalName`
- `cnpj`
- `addressLine`
- `city`
- `state`
- `managerName`
- `managerCpf`
- `managerPhone`
- `managerEmail`
- `units`
- `monthlyWindow`
- `status`
- `createdAt`
- `updatedAt`

Relacionamentos:
- possui muitas `Visit`;
- possui muitos `Contract`.

Status:
- CRUD backend implementado;
- frontend integrado via API.

### Technician
- `id`
- `name`
- `phone`
- `role`
- `status`
- `notes`
- `createdAt`
- `updatedAt`

Relacionamentos:
- possui muitas `Visit`.

Status:
- CRUD backend implementado;
- frontend integrado via API.

### Visit
- `id`
- `condominiumId`
- `technicianId`
- `serviceType`
- `visitStatus`
- `visitDate`
- `responsibleName`
- `responsiblePhone`
- `responsibleRole`
- `equipmentValue`
- `acknowledged`
- `acknowledgedAt`
- `actionsPerformed`
- `outsideScope`
- `improvements`
- `createdAt`
- `updatedAt`

Relacionamentos:
- pertence a `Condominium`;
- pertence a `Technician`;
- possui muitos `VisitChecklistItem`;
- possui muitas `VisitPhoto`;
- pode possuir um `Report`.

Status:
- modelado;
- endpoints e integração frontend ainda pendentes.

### VisitChecklistItem
- `id`
- `visitId`
- `equipmentLabel`
- `status`
- `observations`

Status:
- modelado;
- integração pendente junto com Visitas.

### VisitPhoto
- `id`
- `visitId`
- `fileId`
- `fileName`
- `fileUrl`
- `createdAt`

Status:
- modelado;
- upload/storage ainda pendente.

### Report
- `id`
- `visitId`
- `createdAt`
- `updatedAt`

Relacionamentos:
- pertence a uma `Visit`.

Status:
- modelado;
- endpoints e geração de PDF ainda pendentes.

### Contract
- `id`
- `condominiumId`
- `contractNumber`
- `serviceType`
- `monthlyValue`
- `dueDay`
- `termMonths`
- `startDate`
- `signatureDate`
- `monthlyPreventiveVisits`
- `emergencySlaHours`
- `nonEmergencySlaHours`
- `jurisdiction`
- `status`
- `notes`
- `signedFileId`
- `createdAt`
- `updatedAt`

Relacionamentos:
- pertence a `Condominium`;
- pode referenciar `File` como contrato assinado.

Status:
- modelado;
- endpoints e integração frontend ainda pendentes.

### File
- `id`
- `fileName`
- `mimeType`
- `storageKey`
- `publicUrl`
- `sizeBytes`
- `category`
- `createdAt`

Uso planejado:
- fotos de visita;
- contratos assinados;
- anexos de relatório.

Status:
- modelado;
- upload/storage ainda pendente.

## Regras de Integridade
Implementadas no backend:
- não excluir Condomínio com Visitas ou Contratos vinculados;
- não excluir Técnico com Visitas vinculadas.

Planejadas:
- soft delete;
- auditoria;
- versionamento documental;
- políticas de retenção de arquivos.

## Observações de Nomenclatura
- Prisma usa nomes internos em inglês.
- UI e documentação usam português.
- Status de negócio permanecem em português para compatibilidade com a interface.
