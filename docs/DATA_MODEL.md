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
- técnicos;
- visitas e checklist operacional;
- arquivos de visitas com metadados no PostgreSQL e conteúdo no Vercel Blob.

Relatórios, Contratos e Empresa ainda não possuem fluxo completo integrado.

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
- `status`
- `visitDate`
- `responsibleName`
- `responsibleRole`
- `acceptanceConfirmed`
- `acceptanceResponsibleName`
- `acceptanceResponsibleRole`
- `installationLocation`
- `equipmentValue`
- `acceptanceNotes`
- `notes`
- `actionsPerformed`
- `issuesFound`
- `improvementsSuggested`
- `createdAt`
- `updatedAt`

Relacionamentos:
- pertence a `Condominium`;
- pertence a `Technician`;
- possui muitos `VisitChecklistItem`;
- possui muitas `VisitPhoto`;
- possui muitos `File`;
- pode possuir um `Report`.

Status:
- endpoints backend implementados;
- integração frontend implementada;
- uploads de arquivos de visita implementados com Vercel Blob;
- relatórios ainda pendentes.

### VisitChecklistItem
- `id`
- `visitId`
- `equipment`
- `status`
- `notes`

Status:
- modelado;
- persistido junto com Visitas no backend;
- integrado ao frontend.

### VisitPhoto
- `id`
- `visitId`
- `fileId`
- `fileName`
- `fileUrl`
- `createdAt`

Status:
- legado/modelado;
- upload real atual usa `File` vinculado à visita.

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
- `visitId`
- `fileName`
- `fileType`
- `mimeType`
- `storageKey`
- `url`
- `size`
- `uploadedAt`
- `uploadedBy`
- `publicUrl`
- `sizeBytes`
- `category`
- `createdAt`

Uso atual:
- foto do reservatório;
- foto da bomba;
- foto do quadro;
- termo assinado de visita.

Uso planejado:
- contratos assinados;
- anexos de relatório.

Status:
- upload de arquivos de Visitas implementado com Vercel Blob;
- o banco salva apenas metadados;
- nenhum arquivo é salvo no PostgreSQL ou filesystem da Vercel.

## Regras de Integridade
Implementadas no backend:
- não excluir Condomínio com Visitas ou Contratos vinculados;
- não excluir Técnico com Visitas vinculadas.
- não criar ou editar Visita com Condomínio inexistente;
- não criar ou editar Visita com Técnico inexistente.

## Enums
### VisitStatus
- `scheduled`
- `in_progress`
- `completed`
- `pending`
- `cancelled`

### ChecklistStatus
- `normal`
- `attention`
- `critical`

### FileType
- `reservoir_photo`
- `pump_photo`
- `electrical_panel_photo`
- `signed_acceptance_term`
- `other`

Planejadas:
- soft delete;
- auditoria;
- versionamento documental;
- políticas de retenção de arquivos.

## Observações de Nomenclatura
- Prisma usa nomes internos em inglês.
- UI e documentação usam português.
- Status de negócio permanecem em português para compatibilidade com a interface.
