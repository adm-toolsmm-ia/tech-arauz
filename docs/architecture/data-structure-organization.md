# Estrutura de Dados — Organização e Vínculos da Empresa

**Data:** 2026-03-08  
**Fonte:** Migrations 001, 060, 061, 062, 077 e código em `src/`

Este documento descreve a estrutura atual dos dados de organização e vínculos da empresa **existentes no projeto**.

---

## 1. Visão Geral

### 1.1 Conceito de Empresa

No projeto, **não existe tabela `empresa`**. A entidade "empresa" é representada pela tabela **`tenants`**:

- Cada tenant é uma empresa (ex.: Araúz & Advogados)
- A página `/organizacao/empresa` exibe dados do tenant atual e seus vínculos organizacionais

### 1.2 Vínculos da Empresa

Os **vínculos** são entidades organizacionais vinculadas ao tenant, agregadas na UI em 6 grupos:

| Tipo de vínculo | Tabela DB | Descrição |
|-----------------|-----------|-----------|
| Áreas | `org_areas` | Grandes domínios da organização |
| Processos | `org_processes` | Fluxos operacionais completos |
| Sistemas | `org_systems` | Softwares utilizados |
| Fornecedores | `org_suppliers` | Empresas externas (correspondentes, contabilidade, etc.) |
| Serviços | `org_services` | Serviços operacionais (diligência, protocolo, etc.) |
| Documentos | `org_documents` | Modelos e templates organizacionais |

---

## 2. Tabela Base: tenants

**Migration:** `001_initial_schema.sql`

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| slug | TEXT | NOT NULL, UNIQUE |
| name | TEXT | NOT NULL |
| settings | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**Seed:** Migration 003 — tenant `arauz` (Araúz & Advogados)

---

## 3. Tabelas de Organização (org_*)

**Migration:** `060_org_bootstrap_schema.sql`

Todas as tabelas `org_*` possuem:

- `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`
- RLS habilitado com isolamento por tenant
- Trigger `updated_at` automático

### 3.1 Hierarquia Operacional

```text
org_areas (grandes domínios)
    └── org_nuclei (especializações dentro da área)
            └── org_processes (fluxos operacionais)
                    └── org_routines (rotinas recorrentes)
                            └── org_activities (atividades executadas)
```

### 3.2 org_areas

Grandes domínios da organização (ex.: Recuperação de Crédito, Legal Operations).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| name | TEXT | NOT NULL |
| description | TEXT | |
| objective | TEXT | |
| responsible_roles | JSONB | DEFAULT '[]' |
| documentation | JSONB | DEFAULT '{}' |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`

### 3.3 org_nuclei

Especializações dentro das áreas (ex.: Núcleo de Ajuizamento, Núcleo de Protocolos).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| area_id | UUID | FK → org_areas, NOT NULL |
| name | TEXT | NOT NULL |
| description, objective | TEXT | |
| responsible_roles, documentation | JSONB | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `area_id`

### 3.4 org_processes

Fluxos operacionais completos (ex.: Gestão de Processos Contenciosos).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| area_id | UUID | FK → org_areas, nullable |
| nucleus_id | UUID | FK → org_nuclei, nullable |
| name | TEXT | NOT NULL |
| description, objective | TEXT | |
| inputs, outputs | JSONB | DEFAULT '[]' |
| responsible_roles, risks, impacts | JSONB | DEFAULT '[]' |
| documentation | JSONB | DEFAULT '{}' |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `area_id`, `nucleus_id`

### 3.5 org_routines

Conjunto recorrente de atividades dentro de um processo.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| process_id | UUID | FK → org_processes, NOT NULL |
| name | TEXT | NOT NULL |
| description, objective | TEXT | |
| responsible_roles, documentation | JSONB | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `process_id`

### 3.6 org_activities

Unidade operacional executada por colaboradores.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| routine_id | UUID | FK → org_routines, NOT NULL |
| name | TEXT | NOT NULL |
| description, objective | TEXT | |
| complexity | org_activity_complexity | ENUM: low, medium, high |
| priority | org_activity_priority | ENUM: low, normal, high |
| required_role | TEXT | |
| average_execution_time | INTEGER | minutos |
| inputs, outputs, risks, impacts | JSONB | DEFAULT '[]' |
| documentation | JSONB | DEFAULT '{}' |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `routine_id`

### 3.7 org_systems

Softwares utilizados na operação (ex.: sistema jurídico, CRM).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| name | TEXT | NOT NULL |
| description, purpose | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`

### 3.8 org_system_resources

Funcionalidades específicas dentro de um sistema.

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| system_id | UUID | FK → org_systems, NOT NULL |
| name | TEXT | NOT NULL |
| description | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `system_id`

### 3.9 org_suppliers

Fornecedores externos (ex.: correspondentes jurídicos, contabilidade).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| name | TEXT | NOT NULL |
| description | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`

### 3.10 org_services

Serviços utilizados nas operações (ex.: diligência externa, protocolo físico).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| name | TEXT | NOT NULL |
| description | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`

### 3.11 org_documents

Modelos ou documentos organizacionais (ex.: modelo de petição, checklist). Distinto da tabela `documents` (Markdown docs).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| name | TEXT | NOT NULL |
| type | TEXT | ex.: modelo_peticao, checklist |
| description | TEXT | |
| associated_process_id | UUID | FK → org_processes, nullable |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `tenant_id`, `associated_process_id`

---

## 4. Tabelas N:N

### 4.1 org_process_systems

Associação processo ↔ sistema.

| Coluna | Tipo |
|--------|------|
| tenant_id | UUID, FK → tenants |
| process_id | UUID, FK → org_processes |
| system_id | UUID, FK → org_systems |

**PK:** (process_id, system_id)

**Nota:** tenant_id foi adicionado na migration 077 para suportar RLS tenant-aware e validação same-tenant entre processo e sistema.

### 4.2 org_activity_documents

Associação atividade ↔ documento organizacional.

| Coluna | Tipo |
|--------|------|
| tenant_id | UUID, FK → tenants |
| activity_id | UUID, FK → org_activities |
| org_document_id | UUID, FK → org_documents |

**PK:** (activity_id, org_document_id)

**Nota:** tenant_id foi adicionado na migration 077 para suportar RLS tenant-aware e validação same-tenant entre atividade e documento.

---

## 5. AI Bootstrap Engine

### 5.1 org_company_types

Tipos de empresa para bootstrap (ex.: escritório jurídico).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| tenant_id | UUID | FK → tenants |
| slug | TEXT | NOT NULL |
| name | TEXT | NOT NULL |
| description | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

**UNIQUE:** (tenant_id, slug)

**Seed (061):** `escritorio_juridico` — Escritório Jurídico

### 5.2 org_bootstrap_templates

Templates de entidades por tipo de empresa (para popular org_* automaticamente).

| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | UUID | PK |
| company_type_id | UUID | FK → org_company_types, NOT NULL |
| entity_type | TEXT | NOT NULL |
| payload | JSONB | NOT NULL DEFAULT '{}' |
| created_at, updated_at | TIMESTAMPTZ | |

**Índices:** `company_type_id`

---

## 6. Diagrama de Relacionamentos

```text
tenants
  ├── org_areas
  │     └── org_nuclei
  ├── org_processes (area_id?, nucleus_id?)
  │     └── org_routines
  │           └── org_activities
  ├── org_systems
  │     └── org_system_resources
  ├── org_suppliers
  ├── org_services
  ├── org_documents (associated_process_id?)
  ├── org_company_types
  │     └── org_bootstrap_templates
  │
  ├── org_process_systems (tenant_id, process_id, system_id)
  └── org_activity_documents (tenant_id, activity_id, org_document_id)
```

---

## 7. Módulos e Estrutura do Frontend

### 7.1 Layout e Navegação

- **Layout:** `src/app/organizacao/layout.tsx` — SidebarProvider + AppSidebar + SidebarInset
- **Rota raiz:** `/organizacao` → redirect para `/organizacao/empresa`
- **Sidebar (Organização):** `src/components/layout/sidebar-config.ts` — Empresa, Áreas, Núcleos, Processos, Rotinas, Sistemas, Fornecedores, Serviços, Documentos
- **Middleware:** `/organizacao` protegido (auth)

### 7.2 Módulos e Rotas

| Rota | Página | Content | Descrição |
|------|--------|---------|-----------|
| `/organizacao/empresa` | `page.tsx` | `empresa-content.tsx` | Visão 360º da empresa + vínculos (Kanban/Lista) |
| `/organizacao/areas` | `page.tsx` | `areas-content.tsx` | Áreas com núcleos e processos |
| `/organizacao/areas/[areaId]/nucleos` | `page.tsx` | `nucleos-content.tsx` | Núcleos de uma área |
| `/organizacao/nucleos` | `page.tsx` | `nucleos-content.tsx` | Núcleos (visão global) |
| `/organizacao/processos` | `page.tsx` | `processos-content.tsx` | Processos |
| `/organizacao/processos/[processId]/rotinas` | `page.tsx` | `rotinas-content.tsx` | Rotinas de um processo |
| `/organizacao/rotinas` | `page.tsx` | `rotinas-content.tsx` | Rotinas (visão global) |
| `/organizacao/processos/[processId]/rotinas/[routineId]/atividades` | `page.tsx` | `atividades-content.tsx` | Atividades de uma rotina |
| `/organizacao/recursos` | `page.tsx` | `recursos-content.tsx` | Tabs: Sistemas, Fornecedores, Serviços, Documentos |

### 7.3 Componentes de Cockpit (SplitView)

| Componente | Usado em | Entidade |
|-----------|----------|----------|
| `AreaCockpit360` | empresa, areas | OrgArea |
| `AreaCockpit` | areas (SplitView) | OrgArea |
| `NucleusCockpit360` | nucleos | OrgNucleus |
| `ProcessCockpit360` | empresa, processos | OrgProcess |
| `ProcessCockpit` | processos (SplitView) | OrgProcess |
| `SystemCockpit360` | empresa | OrgSystem |
| `SystemCockpit` | recursos (link) | OrgSystem |
| `SupplierCockpit360` | empresa | OrgSupplier |
| `SupplierCockpit` | recursos (link) | OrgSupplier |
| `ServiceCockpit360` | empresa | OrgService |
| `ServiceCockpit` | recursos (link) | OrgService |
| `DocumentCockpit360` | empresa | OrgDocument |
| `DocumentCockpit` | recursos (link) | OrgDocument |
| `OrgBreadcrumb` | processos, rotinas, atividades, nucleos, recursos | Navegação |

### 7.4 Filtros e Hooks

| Hook | Módulo | Search fields | Filtros |
|------|--------|---------------|---------|
| `useAreasFilters` | organizacao-areas | name, description, objective | com_nucleos |
| `useNucleosFilters` | organizacao-nucleos | name, description, objective, area_name | area_id, com_processos |

**Arquivo:** `src/lib/filters/filters-organizacao.ts` — filterDefinitionsAreas, filterDefinitionsNucleos, filterRegistryAreas, filterRegistryNucleos

**Nota:** Processos, Rotinas e Atividades não possuem hooks de filtro dedicados no código atual.

### 7.5 Views por Módulo

| Módulo | Kanban | Lista | Cards |
|--------|--------|-------|-------|
| Empresa | EmpresaKanbanView | EmpresaListView | — |
| Áreas | AreasKanbanView | — | AreasCardView |
| Núcleos | NucleosKanbanView | — | NucleosCardView |
| Processos | — | Lista (Card + divide-y) | SplitView + ProcessCockpit |
| Rotinas | — | Lista (Card + divide-y) | SplitView + RoutineCockpit360 |
| Atividades | — | Lista (Card + divide-y) | SplitView + cockpit inline |
| Recursos | — | Lista | Cards |

---

## 8. Backend e Acesso a Dados

### 8.1 Server Actions — Tenant

**Arquivo:** `src/app/actions/tenant.ts`

| Action | Tabelas | Operação |
|--------|---------|----------|
| `getTenant360Action` | tenants, org_areas, org_processes, org_systems, org_suppliers, org_services, org_documents | SELECT (tenant + contagens) |
| `updateTenantAction` | tenants | UPDATE (apenas admin) |

### 8.2 Server Actions — Organization

**Arquivo:** `src/app/actions/organization.ts`

Todas as actions usam `getAuthContext()` (auth + tenant_id do profile). Retorno: `OrgActionResult<T>`.

| Entidade | create | update | delete |
|----------|--------|--------|--------|
| Área | createAreaAction | updateAreaAction | deleteAreaAction |
| Núcleo | createNucleusAction | updateNucleusAction | deleteNucleusAction |
| Processo | createProcessAction | updateProcessAction | deleteProcessAction |
| Rotina | createRoutineAction | updateRoutineAction | deleteRoutineAction |
| Atividade | createActivityAction | updateActivityAction | deleteActivityAction |
| Sistema | createSystemAction | updateSystemAction | deleteSystemAction |
| Recurso de sistema | createSystemResourceAction | updateSystemResourceAction | deleteSystemResourceAction |
| Fornecedor | createSupplierAction | updateSupplierAction | deleteSupplierAction |
| Serviço | createServiceAction | updateServiceAction | deleteServiceAction |
| Documento org | createOrgDocumentAction | updateOrgDocumentAction | deleteOrgDocumentAction |

**Bootstrap:** `runBootstrapAction(companyTypeSlug)` — insere áreas padrão (escritorio_juridico). Só executa se org_areas vazia.

### 8.3 Data Fetching — Pages (SSR)

| Página | createClient | Queries Supabase |
|--------|--------------|------------------|
| `empresa/page.tsx` | sim | getTenant360Action + 9x supabase.from (org_areas, org_processes, org_nuclei, org_routines, org_systems, org_system_resources, org_suppliers, org_services, org_documents) |
| `areas/page.tsx` | sim | org_areas, org_nuclei, org_processes |
| `areas/[areaId]/nucleos/page.tsx` | sim | org_areas, org_nuclei |
| `nucleos/page.tsx` | sim | org_nuclei, org_areas, org_processes (nucleus_id) |
| `processos/page.tsx` | sim | org_processes, org_areas, org_nuclei |
| `processos/[processId]/rotinas/page.tsx` | sim | org_processes, org_routines |
| `rotinas/page.tsx` | sim | org_routines, org_processes |
| `processos/.../atividades/page.tsx` | sim | org_routines, org_processes, org_activities |
| `recursos/page.tsx` | sim | org_systems, org_suppliers, org_services, org_documents |

### 8.4 Transformers

**Arquivo:** `src/lib/transformers/organization.ts`

- `dbAreaToUI`, `dbNucleusToUI`, `dbProcessToUI`, `dbRoutineToUI`, `dbActivityToUI`
- `dbSystemToUI`, `dbSystemResourceToUI`, `dbSupplierToUI`, `dbServiceToUI`, `dbOrgDocumentToUI`, `dbCompanyTypeToUI`
- Parse de JSONB: responsible_roles, inputs, outputs, risks, impacts, documentation

### 8.5 revalidatePath (cache)

| Action | Paths revalidados |
|--------|-------------------|
| Area | /organizacao/areas, /organizacao/empresa |
| Nucleus | /organizacao/areas, /organizacao/nucleos, /organizacao/processos, /organizacao/empresa |
| Process | /organizacao/processos |
| Routine | /organizacao/processos, /organizacao/rotinas |
| Activity | /organizacao/processos |
| System, Resource, Supplier, Service, Document | /organizacao/recursos |
| Tenant | /organizacao/empresa, /organizacao |

---

## 9. Mapeamento UI ↔ DB (resumo)

| Página / Componente | Tabelas utilizadas |
|--------------------|--------------------|
| `/organizacao/empresa` | tenants, org_areas, org_processes, org_nuclei, org_routines, org_systems, org_suppliers, org_services, org_documents |
| `/organizacao/areas` | org_areas, org_nuclei, org_processes |
| `/organizacao/nucleos` | org_nuclei, org_areas, org_processes |
| `/organizacao/processos` | org_processes, org_areas, org_nuclei |
| `/organizacao/rotinas` | org_routines, org_processes |
| `/organizacao/.../atividades` | org_activities, org_routines, org_processes |
| `/organizacao/recursos` | org_systems, org_suppliers, org_services, org_documents |
| `getTenant360Action` | tenants + contagens em org_areas, org_processes, org_systems, org_suppliers, org_services, org_documents |

---

## 10. Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/001_initial_schema.sql` | tenants |
| `supabase/migrations/060_org_bootstrap_schema.sql` | Schema org_* completo |
| `supabase/migrations/061_org_bootstrap_seed.sql` | org_company_types seed |
| `supabase/migrations/062_org_bootstrap_full_seed.sql` | Seed completo (áreas, núcleos, processos, etc.) |
| `src/app/organizacao/empresa/page.tsx` | Agregação de vínculos |
| `src/app/organizacao/empresa/types.ts` | EmpresaVinculo, tipos de vínculo |
| `src/app/actions/tenant.ts` | getTenant360Action, updateTenantAction |
| `src/app/actions/organization.ts` | CRUD org_* (áreas, núcleos, processos, rotinas, atividades, sistemas, fornecedores, serviços, documentos) |
| `src/types/organization.ts` | Interfaces TypeScript |
| `src/lib/transformers/organization.ts` | DB row → UI |
| `src/lib/filters/filters-organizacao.ts` | Filtros Áreas e Núcleos |
| `src/hooks/useOrganizacaoFilters.ts` | useAreasFilters |
| `src/hooks/useNucleosFilters.ts` | useNucleosFilters |
| `src/components/organization/*` | Cockpits (Area, Process, Nucleus, System, Supplier, Service, Document, OrgBreadcrumb) |

---

## 11. Análise: Dados vs Frontend

Comparação entre a estrutura de dados (schema) e o que o frontend reflete.

### 11.1 Tabelas com cobertura completa (CRUD + UI)

| Tabela | Página principal | Create | Update | Delete | Observação |
|--------|------------------|--------|--------|--------|------------|
| tenants | empresa | — | sim (admin) | — | Nome editável via Dialog |
| org_areas | areas, empresa | sim | sim | sim | Área e Núcleo criáveis na Empresa |
| org_nuclei | nucleos, areas/[id]/nucleos, empresa | sim | sim | sim | |
| org_processes | processos | sim | sim | sim | |
| org_routines | rotinas, processos/[id]/rotinas | sim | sim | sim | |
| org_activities | processos/.../atividades | sim | sim | sim | |

### 11.2 Tabelas com cobertura completa (CRUD + UI) — Recursos

| Tabela | Página principal | Create | Update | Delete | Observação |
|--------|------------------|--------|--------|--------|------------|
| org_systems | recursos, empresa | sim | sim | sim | Lista/Cards + SplitView + Cockpit 360 |
| org_suppliers | recursos, empresa | sim | sim | sim | Idem |
| org_services | recursos, empresa | sim | sim | sim | Idem |
| org_documents | recursos, empresa | sim | sim | sim | Idem |
| org_system_resources | SystemCockpit360 (Empresa + Recursos) | sim | sim | sim | Tab Recursos no cockpit |

### 11.3 Tabelas N:N — Cobertura

| Tabela | Uso no schema | Frontend |
|--------|---------------|----------|
| org_process_systems | N:N processo ↔ sistema | **Implementado** — ProcessCockpit360 tab Sistemas; Empresa ProcessCockpit; add/remove via actions |
| org_activity_documents | N:N atividade ↔ documento | **Implementado** — ActivityCockpit com link/unlink; addActivityDocumentAction, removeActivityDocumentAction |

### 11.4 Empresa: vínculos com CRUD completo

Na página Empresa, os vínculos **sistemas, fornecedores, serviços, documentos** têm:

- Formulário para criar (openResourceCreate) e editar (handleResourceCreateOrUpdate)
- Botões Editar/Excluir nos cockpits (onEdit, onDelete passados)
- SystemCockpit360 com CRUD de recursos de sistema (onAddResource, onEditResource, onDeleteResource)

**Áreas** e **Núcleos** também têm formulários de criação na Empresa.

### 11.5 Tabelas sem integração no frontend

| Tabela | Uso no schema | Frontend |
|--------|---------------|----------|
| org_company_types | Tipos de empresa (bootstrap) | runBootstrapAction usa slug hardcoded; tabela populada pelo seed 061 |
| org_bootstrap_templates | Templates por tipo de empresa | runBootstrapAction não lê; usa ESCRITORIO_JURIDICO_AREAS hardcoded |

### 11.6 Lacunas restantes

| Lacuna | Impacto |
|--------|---------|
| org_company_types / org_bootstrap_templates | Bootstrap usa dados fixos; tabelas não integradas ao runBootstrapAction |
| Processos/Rotinas sem hooks de filtro | Filtros e ordenação via useAreasFilters/useNucleosFilters; Processos e Rotinas não têm useProcessosFilters/useRotinasFilters dedicados |
