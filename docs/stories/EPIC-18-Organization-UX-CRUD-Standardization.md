# EPIC 18: Organization UX/UI and CRUD Standardization

**Status:** In Progress  
**Owner:** Organization UX/CRUD refactor  
**Scope:** `docs/stories` + `docs/architecture` + `src/app/organizacao` + `src/components/organization`  
**Priority:** HIGH  
**Updated:** 2026-05-11

---

## Contexto

O módulo de organização já passou por ondas relevantes de estruturação:

- **EPIC 9** definiu a navegação hierárquica contextual e o padrão de Cockpit360/FormSheet
- **EPIC 10** refinou responsible roles e consistência de exibição
- **EPIC 11** completou relações BPM, busca, bulk operations, wizard e documentação de schema

Mesmo assim, a padronização transversal de UX/UI e CRUD para o conjunto completo do módulo ainda não está consolidada em um único artefato operacional. Hoje a regra fica distribuída entre:

- `docs/architecture/module-standards.md`
- `docs/architecture/data-structure-organization.md`
- `docs/architecture/ORGANIZATION-SCHEMA.md`
- `docs/architecture/dashboards.md`
- `docs/architecture/BPM-PATTERNS.md`
- `docs/stories/EPIC-9-INDEX.md`
- `docs/stories/EPIC-10-Org-Knowledge-Graph-Refinement.md`
- `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md`

Este epic existe para fechar esse gap documental e servir como referência única de padronização para:

- Empresa
- Áreas
- Núcleos
- Processos
- Rotinas
- Fornecedores
- Serviços
- Sistemas
- Documentos
- Atividades

---

## Implementation Update — 2026-05-10

Primeira fase de implementação executada junto com a consolidação da epic:

- `OrgEntityFormSheet` passou a suportar relações pai-filho no próprio formulário (`area`, `nucleus`, `process`, `routine`) e a mesma surface agora cobre melhor a edição completa.
- `AreaCockpit360`, `NucleusCockpit360`, `ProcessCockpit360` e `RoutineCockpit360` passaram a internalizar a edição canônica em vez de delegar para dialogs paralelos.
- `ActivityCockpit360` passou a concentrar edição, vínculo de documentos e atualização local da atividade dentro do mesmo contrato visual.
- `processos`, `rotinas` e rotas hierárquicas relevantes deixaram de depender de superfícies externas para editar processo/rotina.
- `atividades` em rota hierárquica passou a usar o cockpit compartilhado e o mesmo `OrgEntityFormSheet` para criação.
- `empresa` deixou de encaminhar `área` e `processo` para o dialog genérico de recurso, reduzindo o principal bug funcional de roteamento de edição.
- `empresa` e `recursos` passaram a usar surfaces compartilhadas para `sistemas`, `fornecedores`, `serviços`, `documentos` e `recursos de sistema`.
- `SupplierCockpit360`, `ServiceCockpit360`, `SystemCockpit360` e `DocumentCockpit360` foram enriquecidos para expor contexto, resumo e responsáveis com o mesmo idioma visual do domínio organizacional.
- Os testes da `OrgEntityFormSheet`, `OrganizationSearchBar` e `ProcessSlaList` foram endurecidos para suportar a carga da suíte completa sem timeouts falsos.
- As sheets canônicas de create/edit (`OrgEntityFormSheet`, `ResourceEntityFormSheet`, `SystemResourceFormSheet`) passaram a forçar `dialog-light-theme`, eliminando fundos escuros na operação do módulo de organização.
- `processos` e `rotinas` passaram por alinhamento de paridade com `núcleos` e `recursos`: adoção de `ViewModeBar + FilterBar`, KPI cards, surfaces compartilhadas de criação e detalhes laterais com largura e overflow corrigidos.
- O fluxo de criação de `processo` deixou de depender do dialog legado com `SelectItem` vazio e foi convergido para `OrgEntityFormSheet`, eliminando a principal causa provável do erro operacional nessa tela.
- O drill-down de atividades em `rotinas` voltou a ficar navegável nas páginas globais e por processo com sheet dedicado de atividade.

Validação após a implementação:

- `npm run lint`
- `npm run typecheck`
- `npm test`

Resultado da suíte: `56` arquivos de teste passando, `460` testes passando e `4` pulados.

## Problema

Sem uma referência consolidada, o módulo corre os seguintes riscos:

1. divergência de UX entre entidades hierárquicas e recursos transversais
2. reaparição de CRUDs isolados, sem reaproveitar Cockpit360, SplitView e formulários compartilhados
3. inconsistência de campos equivalentes (`name`, `description`, `objective`, `responsible_roles`, `documentation`)
4. decisões ad hoc sobre empresa vs tenant, relações pai-filho e exibição de vínculos
5. documentação difícil de operar por futuras stories, revisões e handoffs entre agentes

---

## Objetivos

### Objetivo principal

Padronizar, em nível de epic, o contrato de UX/UI e CRUD do módulo de organização e guiar a convergência progressiva do runtime para esse contrato.

### Objetivos específicos

- consolidar o baseline funcional do módulo em um único epic
- explicitar princípios obrigatórios de UX/UI e CRUD para todas as entidades cobertas
- alinhar o entendimento de `empresa` como representação do `tenant`
- estabelecer critérios de aceite reutilizáveis para futuras stories de implementação e refino
- organizar a evolução do módulo em fases coerentes com a hierarquia e com os recursos transversais

### Não objetivos

- alterar schema
- redefinir comportamento já validado por EPIC 9, 10 e 11 sem justificativa arquitetural

---

## Princípios de Padronização

Os princípios detalhados estão documentados em `docs/architecture/ORGANIZATION-UX-CRUD-STANDARDS.md`. Em nível de epic, os princípios obrigatórios são:

1. **Baseline único:** `module-standards.md` permanece como fonte estrutural; este epic especializa o domínio organização.
2. **Hierarquia explícita:** `Empresa -> Área -> Núcleo -> Processo -> Rotina -> Atividade` deve ser sempre legível.
3. **Mesmo contrato de superfície:** header, KPIs, filtros, view principal, SplitView e Cockpit360.
4. **CRUD consistente:** criar/editar com superfície compartilhada; visualizar em detalhe lateral; excluir com confirmação explícita.
5. **Sem invenção de campos:** apenas o que já está descrito no schema e nas stories do módulo.
6. **Tenant-first:** `empresa` é a visão do `tenant` atual e todo CRUD permanece multi-tenant com auth guard e RLS.
7. **Recursos também fazem parte do módulo:** fornecedores, serviços, sistemas e documentos devem obedecer ao mesmo idioma de UX do núcleo hierárquico.

---

## Critérios de Aceite do Epic

- [x] Existe uma referência arquitetural única para padronização UX/UI e CRUD do módulo de organização
- [x] A referência cobre `Empresa`, `Áreas`, `Núcleos`, `Processos`, `Rotinas`, `Fornecedores`, `Serviços`, `Sistemas`, `Documentos` e `Atividades`
- [x] O contrato de tela do módulo está documentado como `DashboardHeader -> KPIs -> Filtros -> View -> SplitView -> Cockpit360`
- [x] O contrato de CRUD está documentado para criar, editar, visualizar e excluir
- [x] O papel de `empresa` como representação de `tenant` está documentado sem ambiguidade
- [x] Os recursos transversais estão incluídos no mesmo padrão, e não tratados como exceção de UX
- [x] O plano por fases está documentado para futuras stories
- [x] Este epic mantém checklist e file list atualizados

---

## Plano por Fases

### Fase 1: Consolidação documental

**Objetivo:** transformar material disperso em baseline operacional único.

**Saídas esperadas:**

- epic de padronização criado em `docs/stories`
- referência arquitetural criada em `docs/architecture`
- escopo fechado para as 10 entidades cobertas

### Fase 2: Padronização da camada institucional e hierárquica

**Objetivo:** garantir coerência entre empresa, áreas e núcleos.

**Cobertura mínima:**

- empresa como visão do tenant
- áreas como topo da hierarquia operacional
- núcleos como especialização da área
- consistência de navegação, detalhe e ações contextuais

**Status atual:** em execução parcial

### Fase 3: Padronização da cadeia BPM

**Objetivo:** consolidar o contrato de UX para processos, rotinas e atividades.

**Cobertura mínima:**

- processo como unidade BPM completa
- rotina como agrupador recorrente
- atividade como menor unidade operacional
- responsible roles, documentação e blocos BPM expostos de forma consistente

**Status atual:** convergida nesta rodada para filtros, modos de visualização, criação compartilhada e drill-down de atividades

### Fase 4: Padronização dos recursos transversais

**Objetivo:** alinhar fornecedores, serviços, sistemas e documentos ao mesmo idioma de UX do restante do módulo.

**Cobertura mínima:**

- lista + filtros + detalhe lateral
- formulários coerentes com o padrão compartilhado
- vínculos com processo/atividade destacados quando existirem

**Status atual:** concluída nesta rodada para `sistemas`, `fornecedores`, `serviços`, `documentos` e `recursos de sistema`

### Fase 5: Validação e governança

**Objetivo:** deixar o material pronto para orientar stories futuras.

**Saídas esperadas:**

- checklist de aderência reutilizável
- file list documental encerrada
- referências explícitas para schema, dashboards e module standards

---

## Dependências

### Artefatos-base

- `docs/architecture/module-standards.md`
- `docs/architecture/data-structure-organization.md`
- `docs/architecture/ORGANIZATION-SCHEMA.md`
- `docs/architecture/dashboards.md`
- `docs/architecture/BPM-PATTERNS.md`

### Histórico do módulo

- `docs/stories/EPIC-9-INDEX.md`
- `docs/stories/EPIC-10-Org-Knowledge-Graph-Refinement.md`
- `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md`

---

## Riscos e Observações

- O módulo possui documentação extensa, mas distribuída; a padronização depende de manter esta consolidação como referência preferencial.
- `Empresa` não deve ser reinterpretada como nova entidade de banco; a base atual é `tenants`.
- O epic não substitui `module-standards.md`; ele delimita como aplicar aquele contrato no domínio organização.
- Este ciclo é estritamente documental; qualquer implementação futura deve nascer de stories específicas.

---

## Checklist

### Checklist do artefato

- [x] Problema documentado
- [x] Objetivos documentados
- [x] Princípios de padronização documentados
- [x] Critérios de aceite documentados
- [x] Plano por fases documentado
- [x] Dependências e riscos documentados
- [x] File list atualizada
- [x] Epic alinhada ao runtime implementado nesta fase

### Checklist para futuras stories derivadas

- [ ] Validar aderência a `docs/architecture/ORGANIZATION-UX-CRUD-STANDARDS.md`
- [ ] Validar aderência a `docs/architecture/module-standards.md`
- [ ] Confirmar auth guard server-side na page do módulo afetado
- [ ] Confirmar RLS e tenant isolation para o CRUD afetado
- [ ] Confirmar `DashboardHeader`, KPIs, filtros, view principal e detalhe lateral
- [ ] Confirmar `SplitView` + `Cockpit360` para visualização
- [ ] Confirmar superfície compartilhada de criação/edição
- [ ] Atualizar checklist e file list da story derivada antes de concluir

---

## File List

### Criados

- `docs/stories/EPIC-18-Organization-UX-CRUD-Standardization.md`
- `docs/architecture/ORGANIZATION-UX-CRUD-STANDARDS.md`

### Modificados

- `src/components/organization/OrgEntityFormSheet.tsx`
- `src/components/organization/ActivityCockpit360.tsx`
- `src/components/organization/AreaCockpit360.tsx`
- `src/components/organization/DocumentCockpit360.tsx`
- `src/components/organization/NucleusCockpit360.tsx`
- `src/components/organization/ProcessCockpit360.tsx`
- `src/components/organization/ResourceEntityFormSheet.tsx`
- `src/components/organization/RoutineCockpit360.tsx`
- `src/components/organization/ServiceCockpit360.tsx`
- `src/components/organization/SupplierCockpit360.tsx`
- `src/components/organization/SystemCockpit360.tsx`
- `src/components/organization/SystemResourceFormSheet.tsx`
- `src/app/organizacao/areas/[areaId]/nucleos/nucleos-content.tsx`
- `src/app/organizacao/areas/areas-content.tsx`
- `src/app/organizacao/nucleos/nucleos-content.tsx`
- `src/app/organizacao/processos/processos-content.tsx`
- `src/app/organizacao/processos/[processId]/rotinas/[routineId]/atividades/atividades-content.tsx`
- `src/app/organizacao/rotinas/rotinas-content.tsx`
- `src/app/organizacao/processos/[processId]/rotinas/rotinas-content.tsx`
- `src/hooks/useOrganizacaoFilters.ts`
- `src/lib/filters/filters-organizacao.ts`
- `src/app/organizacao/empresa/empresa-content.tsx`
- `src/app/organizacao/recursos/recursos-content.tsx`
- `src/components/organization/__tests__/OrgEntityFormSheet.test.tsx`
- `src/components/organization/__tests__/OrganizationSearchBar.test.tsx`
- `src/components/organization/__tests__/ProcessSlaList.test.tsx`

---

## Referências

- `docs/architecture/ORGANIZATION-UX-CRUD-STANDARDS.md`
- `docs/architecture/module-standards.md`
- `docs/architecture/data-structure-organization.md`
- `docs/architecture/ORGANIZATION-SCHEMA.md`
- `docs/architecture/dashboards.md`
- `docs/architecture/BPM-PATTERNS.md`
- `docs/stories/EPIC-9-INDEX.md`
- `docs/stories/EPIC-10-Org-Knowledge-Graph-Refinement.md`
- `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md`
