# Modelo de Dados

## Entidades Principais
- Empresa Contratada
- Condomínio
- Técnico
- Visita Técnica
- Relatório
- Contrato
- Foto
- Arquivo de Contrato Assinado

## Relacionamentos
- Um condomínio possui muitos contratos.
- Um condomínio possui muitas visitas.
- Um técnico possui muitas visitas.
- Uma visita pode gerar um relatório.
- Uma visita possui muitos itens de checklist.
- Uma visita pode possuir muitas fotos.
- Um contrato pertence a um condomínio.

## Esquema Relacional Sugerido
### companies
- id
- legal_name
- cnpj
- address_line
- city
- state
- legal_representative
- representative_cpf
- phone
- email
- created_at
- updated_at

### condominiums
- id
- display_name
- legal_name
- cnpj
- address_line
- city
- state
- manager_name
- manager_cpf
- manager_phone
- manager_email
- units_count
- monthly_window
- created_at
- updated_at

### technicians
- id
- name
- phone
- role
- status
- notes
- created_at
- updated_at

### contracts
- id
- condominium_id
- contract_number
- service_type
- monthly_value
- due_day
- term_months
- start_date
- signature_date
- monthly_preventive_visits
- emergency_sla_hours
- non_emergency_sla_hours
- jurisdiction
- status
- notes
- signed_file_id
- created_at
- updated_at

### visits
- id
- condominium_id
- technician_id
- service_type
- visit_status
- visit_date
- responsible_name
- responsible_phone
- responsible_role
- equipment_value
- acknowledged
- acknowledged_at
- actions_performed
- outside_scope
- improvements
- created_at
- updated_at

### visit_checklist_items
- id
- visit_id
- equipment_label
- status
- observations

### visit_photos
- id
- visit_id
- file_name
- file_url
- created_at

### reports
- id
- visit_id
- created_at
- updated_at

### files
- id
- file_name
- mime_type
- storage_key
- public_url
- size_bytes
- created_at

## Descrição dos Campos
### Condomínio
- `name`: nome curto de exibição.
- `legalName`: razão social.
- `cnpj`: CNPJ.
- `addressLine`: endereço base.
- `city`: cidade.
- `state`: UF.
- `manager`: responsável legal.
- `managerCpf`: CPF do responsável.
- `managerPhone`: telefone.
- `managerEmail`: e-mail.
- `units`: número de unidades.
- `monthlyWindow`: janela mensal de atendimento.

### Técnico
- `name`
- `phone`
- `role`
- `status`
- `notes`

### Visita
- `condominiumId`
- `technicianId`
- `serviceType`
- `visitStatus`
- `visitDate`
- `responsible`
- `checklist`
- `photos`
- `actionsPerformed`
- `outsideScope`
- `improvements`

### Contrato
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
- `signedFile`

## Obrigatórios vs Opcionais
### Condomínio
Obrigatórios:
- nome de exibição
- razão social
- endereço
- cidade
- UF
- responsável legal

Opcionais:
- CNPJ
- CPF
- telefone
- e-mail
- unidades
- janela mensal

### Técnico
Obrigatórios:
- nome
- telefone
- função

Opcionais:
- observações

### Visita
Obrigatórios:
- condomínio
- técnico
- tipo de serviço
- data
- responsável

Opcionais:
- valor do equipamento
- fotos
- campos textuais

### Contrato
Obrigatórios:
- condomínio
- número do contrato
- tipo de serviço
- status

Opcionais:
- arquivo assinado
- observações
- alguns dados comerciais, conforme fase do cadastro

## Relacionamentos de Contratos
- `contracts.condominium_id -> condominiums.id`
- `contracts.signed_file_id -> files.id`

## Relacionamentos de Visitas
- `visits.condominium_id -> condominiums.id`
- `visits.technician_id -> technicians.id`
- `visit_checklist_items.visit_id -> visits.id`
- `reports.visit_id -> visits.id`

## Relacionamentos de Fotos
- `visit_photos.visit_id -> visits.id`
- no futuro contratos podem ter múltiplos arquivos, sugerindo `contract_files`
