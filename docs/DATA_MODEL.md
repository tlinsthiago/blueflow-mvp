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
- usuários, incluindo gestão administrativa por `admin`;
- condomínios;
- técnicos;
- visitas e checklist operacional;
- arquivos de visitas com metadados no PostgreSQL e conteúdo no Vercel Blob privado.
- contratos;
- contrato assinado com metadados no PostgreSQL e conteúdo no Vercel Blob privado.
- relatórios técnicos vinculados a visitas, com PDF no Vercel Blob privado e metadados no banco.
- configuração institucional da empresa.

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
- seed inicial;
- CRUD administrativo de usuários;
- ativação/inativação;
- reset de senha temporária.

Regras:
- `email` é único;
- `passwordHash` nunca deve ser retornado pela API;
- senhas usam Argon2;
- administrador não pode inativar o próprio usuário.

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
- leitura e atualização integradas ao backend e frontend;
- usado em contratos, relatórios técnicos em PDF e mensagens assistidas;
- mantém apenas um registro institucional principal, com fallback para F TEC AUTOMAÇÃO quando não houver cadastro salvo.

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
- pode possuir muitos `Report`.

Status:
- endpoints backend implementados;
- integração frontend implementada;
- uploads de arquivos de visita implementados com Vercel Blob;
- relatórios técnicos versionados implementados.

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
- `fileId`
- `version`
- `generatedAt`
- `createdAt`
- `updatedAt`

Relacionamentos:
- pertence a uma `Visit`.
- pode referenciar `File` como PDF gerado.

Status:
- modelado;
- endpoints de listagem, detalhe, geração, reemissão, download e exclusão implementados;
- PDF gerado a partir da Visita;
- arquivo armazenado em Vercel Blob privado;
- uma Visita pode possuir múltiplos Relatórios;
- `version` é incremental por Visita;
- exclusão de Relatório não exclui a Visita.

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
- CRUD backend implementado;
- frontend integrado via API;
- `signedFileId` referencia o arquivo atual de contrato assinado, quando houver.

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
- contrato assinado.
- PDF de relatório técnico.

Uso planejado:
- anexos de relatório.

Status:
- upload/geração de arquivos de Visitas, contrato assinado e PDF de Relatórios implementados com Vercel Blob privado;
- acesso aos arquivos passa por endpoint autenticado de download/proxy;
- o banco salva apenas metadados;
- nenhum arquivo é salvo no PostgreSQL ou filesystem da Vercel.

## Regras de Integridade
Implementadas no backend:
- não excluir Condomínio com Visitas ou Contratos vinculados;
- não excluir Técnico com Visitas vinculadas.
- não criar ou editar Visita com Condomínio inexistente;
- não criar ou editar Visita com Técnico inexistente.
- não criar ou editar Contrato com Condomínio inexistente.
- não permitir e-mail duplicado em Usuários;
- não permitir que administrador inative o próprio usuário.
- manter apenas uma configuração institucional principal em `CompanySettings`.

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
- `signed_contract`
- `technical_report_pdf`
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
