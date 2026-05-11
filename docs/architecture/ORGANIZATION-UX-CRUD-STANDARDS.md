# Organization UX/CRUD Standards

**Status:** Active baseline  
**Updated:** 2026-05-11  
**Scope:** `docs/architecture` reference for the organizational module  
**Baseline Sources:** `docs/architecture/module-standards.md`, `docs/architecture/data-structure-organization.md`, `docs/architecture/ORGANIZATION-SCHEMA.md`, `docs/architecture/dashboards.md`, `docs/architecture/BPM-PATTERNS.md`, `docs/stories/EPIC-9-INDEX.md`, `docs/stories/EPIC-10-Org-Knowledge-Graph-Refinement.md`, `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md`

---

## 1. Objetivo

Consolidar um padrão único de UX/UI e CRUD para o módulo de organização, cobrindo:

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

Este documento complementa `docs/architecture/module-standards.md` com foco específico no domínio organizacional e reduz a fragmentação hoje distribuída entre EPIC 9, EPIC 10, EPIC 11 e guias de dashboard/schema.

## 1.1 Implementation Status — 2026-05-10

Este baseline já passou a orientar a primeira onda de convergência do runtime:

- edição internalizada em `AreaCockpit360`, `NucleusCockpit360`, `ProcessCockpit360` e `RoutineCockpit360`
- `ActivityCockpit360` convergido para o mesmo padrão de edição e gestão de vínculos documentais
- `OrgEntityFormSheet` expandido para suportar vínculos parentais no próprio formulário
- páginas de `processos` e `rotinas` deixando de depender de dialogs paralelos para edição
- rota hierárquica de `atividades` convergida para `SplitView + ActivityCockpit360 + OrgEntityFormSheet`
- correção do roteamento errado de edição de `área` e `processo` dentro de `empresa`
- `empresa` e `recursos` convergidos para sheets compartilhadas de `sistemas`, `fornecedores`, `serviços`, `documentos` e `recursos de sistema`
- cockpits de recursos enriquecidos para explicitar resumo, relacionamentos e responsáveis

---

## 2. Problema

O módulo de organização já possui base funcional e documentação técnica relevante, mas a padronização transversal ainda está espalhada:

- o contrato estrutural do módulo está em `module-standards.md`
- a hierarquia e o schema estão em `data-structure-organization.md` e `ORGANIZATION-SCHEMA.md`
- a experiência de Cockpit360 está em `dashboards.md`
- regras de responsible roles e BPM estão em `BPM-PATTERNS.md`
- decisões de rollout e refinamento estão distribuídas entre EPIC 9, 10 e 11

O efeito prático é falta de uma fonte curta e operacional para responder, de forma consistente:

1. qual é a superfície padrão de leitura, criação, edição e exclusão por entidade
2. quais campos e relações devem aparecer em lista, detalhe e formulário
3. como preservar a hierarquia organizacional sem criar UX divergente entre módulos
4. como aplicar o padrão multi-tenant, auth guard, Server Actions, SplitView e Cockpit360 sem exceções ad hoc

---

## 3. Princípios de Padronização

### 3.1 Fonte de verdade arquitetural

- O baseline estrutural continua sendo `docs/architecture/module-standards.md`.
- Para organização, o baseline de implementação é o padrão já usado em `src/app/organizacao/`.
- Nenhuma nova página ou CRUD do módulo deve introduzir um fluxo próprio se o mesmo comportamento já existir em Cockpit360, SplitView, filtros ou formulários compartilhados.

### 3.2 Hierarquia primeiro

- A navegação deve preservar o encadeamento `Empresa -> Área -> Núcleo -> Processo -> Rotina -> Atividade`.
- Recursos transversais (`Fornecedores`, `Serviços`, `Sistemas`, `Documentos`) podem existir em superfícies próprias, mas devem manter vínculo explícito com o contexto organizacional quando houver relação com processo, rotina ou atividade.
- `Empresa` deve ser tratada como visão do `tenant` atual, conforme `docs/architecture/data-structure-organization.md`; não há tabela `empresa`.

### 3.3 Padrão mínimo de tela

Cada superfície principal do módulo deve seguir a ordem:

1. `DashboardHeader`
2. KPIs
3. filtros e busca
4. view principal (lista, cards, kanban ou combinação equivalente)
5. `SplitView` para detalhe
6. `Cockpit360` para leitura aprofundada e ações contextuais

Esse contrato deriva diretamente de `module-standards.md`.

### 3.4 Padrão mínimo de CRUD

- **Criar/editar:** superfície única e reutilizável por família de entidade, alinhada ao padrão já documentado em `OrgEntityFormSheet`
- **Visualizar:** `SplitView` + `Cockpit360`
- **Excluir:** confirmação explícita via `Dialog`
- **Persistência:** Server Actions e RLS; nenhuma regra crítica deve existir apenas na UI
- **Refresh:** revalidação de rotas afetadas do módulo `/organizacao`

### 3.5 Consistência de informação

Campos equivalentes devem ocupar o mesmo papel em toda a experiência:

- `name`: identificador primário
- `description`: resumo operacional
- `objective`: intenção ou resultado esperado
- `responsible_roles`: papéis responsáveis, com representação consistente
- `documentation`: bloco estruturado de instruções, regras e observações
- `inputs`, `outputs`, `risks`, `impacts`: somente onde o schema já suporta BPM

### 3.6 Acessibilidade e responsividade

- WCAG AA como mínimo
- navegação completa por teclado
- estados vazios, loading e erro documentados
- sem dependência de hover para ações essenciais
- mobile e desktop com a mesma sequência lógica de leitura e ação

### 3.7 Multi-tenant e segurança

- `page.tsx` server com auth guard
- queries escopadas ao tenant atual
- RLS como requisito obrigatório de qualquer CRUD do módulo
- links, filtros e formulários nunca devem expor contexto de outro tenant

---

## 4. Matriz de Cobertura por Entidade

| Entidade | Representação de dados | Papel na UX | Superfície de detalhe | Superfície de criar/editar | Relações obrigatórias |
|----------|------------------------|-------------|------------------------|----------------------------|-----------------------|
| Empresa | `tenants` | visão institucional do tenant + agregados | `SplitView` com resumo organizacional | superfície dedicada do módulo empresa | áreas, processos, sistemas, fornecedores, serviços, documentos |
| Área | `org_areas` | topo da hierarquia operacional | `AreaCockpit360` | formulário compartilhado | núcleos, processos |
| Núcleo | `org_nuclei` | especialização da área | `NucleusCockpit360` | formulário compartilhado | área pai, processos |
| Processo | `org_processes` | fluxo operacional completo | `ProcessCockpit360` | formulário compartilhado | área/núcleo, rotinas, sistemas, SLAs, métricas, documentos relacionados |
| Rotina | `org_routines` | agrupador recorrente de atividades | `RoutineCockpit360` | formulário compartilhado | processo pai, atividades |
| Atividade | `org_activities` | menor unidade operacional | `ActivityCockpit360` | formulário compartilhado | rotina pai, sistemas, documentos, responsible roles |
| Fornecedor | `org_suppliers` | recurso externo da operação | cockpit de recurso seguindo contrato de detalhe | formulário compartilhado de recurso | papéis responsáveis, relação operacional quando existir |
| Serviço | `org_services` | capacidade/serviço consumido pela operação | cockpit de recurso seguindo contrato de detalhe | formulário compartilhado de recurso | papéis responsáveis, relação operacional quando existir |
| Sistema | `org_systems` | software usado na execução | cockpit de recurso seguindo contrato de detalhe | formulário compartilhado de recurso | processos, atividades, recursos do sistema |
| Documento | `org_documents` | modelo, template ou artefato operacional | cockpit de recurso seguindo contrato de detalhe | formulário compartilhado de recurso | processo associado, atividades associadas, papéis responsáveis |

---

## 5. Requisitos de UX/UI por Camada

### 5.1 Lista e exploração

Toda entidade do módulo deve oferecer:

- busca textual
- filtros coerentes com o domínio
- ordenação previsível
- estado vazio com próximo passo claro
- clique em linha/card abrindo detalhe lateral

### 5.2 Detalhe lateral

O detalhe lateral deve:

- usar `SplitView`
- delegar a leitura aprofundada ao `Cockpit360`
- evitar repetição redundante de título dentro do cockpit
- expor ações compactas de editar/excluir/criar vínculo
- mostrar contexto de pai/filho quando aplicável

### 5.3 Formulário

O formulário do módulo deve:

- reutilizar a mesma estrutura visual entre entidades equivalentes
- refletir o schema existente, sem campos inventados
- agrupar BPM e documentação apenas onde a entidade já suporta esses blocos
- exibir validação inline
- respeitar dirty state antes de fechar

### 5.4 Recursos transversais

Fornecedores, serviços, sistemas e documentos devem seguir o mesmo contrato visual do núcleo hierárquico, ainda que não façam parte do encadeamento principal:

- header, KPIs, filtros, lista, detalhe
- formulário compartilhado quando possível
- relações explícitas com processos/atividades quando existirem
- responsible roles com a mesma semântica aplicada a áreas, núcleos, processos, rotinas e atividades

No baseline atual, isso se traduz em:

- `ResourceEntityFormSheet` como surface compartilhada para criar/editar `sistemas`, `fornecedores`, `serviços` e `documentos`
- `SystemResourceFormSheet` como surface compartilhada para recursos internos de sistema
- `SupplierCockpit360`, `ServiceCockpit360`, `SystemCockpit360` e `DocumentCockpit360` usando o mesmo idioma de detalhe lateral do restante do módulo

---

## 6. Regras de Conteúdo por Entidade

### 6.1 Empresa

- apresentar resumo do tenant atual
- consolidar vínculos organizacionais e recursos do tenant
- deixar explícito que "empresa" = `tenant`

### 6.2 Áreas e núcleos

- priorizar objetivo, descrição e responsible roles
- mostrar contagem e acesso rápido para entidades filhas
- preservar drill-down sem navegação desnecessária de contexto

### 6.3 Processos, rotinas e atividades

- processos: visão BPM completa, com sistemas, riscos, impactos, SLAs e métricas quando já disponíveis
- rotinas: foco em agrupamento operacional e transição para atividades
- atividades: foco em execução, complexidade, prioridade, tempo médio, sistemas e documentação

### 6.4 Fornecedores, serviços, sistemas e documentos

- tratar como recursos operacionais, não como telas isoladas sem contexto
- exibir relação com operação sempre que houver associação documentada no schema
- evitar UX paralela desconectada do padrão do restante do módulo

---

## 7. Anti-padrões

- criar CRUDs exclusivos por entidade sem reaproveitar o padrão compartilhado
- exibir campos equivalentes em ordens diferentes sem justificativa do domínio
- abrir fluxos de edição fora do contrato de formulário compartilhado já adotado
- esconder vínculos hierárquicos no detalhe
- tratar recursos como páginas desconectadas do contexto organizacional
- descrever "empresa" como tabela própria, contrariando o modelo atual de `tenants`

---

## 8. Critérios de Adoção

Uma implementação do módulo de organização é considerada aderente a este padrão quando:

1. usa o fluxo `DashboardHeader -> KPIs -> Filtros -> View -> SplitView`
2. usa `Cockpit360` como contrato de detalhe
3. mantém CRUD consistente entre hierarquia e recursos
4. respeita auth guard, tenant scope e RLS
5. não inventa campos ou fluxos fora do schema e das stories já documentadas
6. cobre `Empresa`, `Áreas`, `Núcleos`, `Processos`, `Rotinas`, `Fornecedores`, `Serviços`, `Sistemas`, `Documentos` e `Atividades` dentro da mesma linguagem de UX

---

## 9. Referências

- `docs/architecture/module-standards.md`
- `docs/architecture/data-structure-organization.md`
- `docs/architecture/ORGANIZATION-SCHEMA.md`
- `docs/architecture/dashboards.md`
- `docs/architecture/BPM-PATTERNS.md`
- `docs/stories/EPIC-9-INDEX.md`
- `docs/stories/EPIC-10-Org-Knowledge-Graph-Refinement.md`
- `docs/stories/EPIC-11-Organizational-Enrichment-BPM-Mastery.md`
