# Memory Log: Reestruturação de Campos Espaider

**Data**: 2026-02-11
**Task**: Refazer estrutura de campos da API Espaider para o banco de dados e UI
**Agentes**: orchestrator, database-architect, backend-specialist, frontend-specialist

---

## Contexto

O projeto Tech Arauz integra-se com o ERP Espaider via WCF API. A API retorna ~135 campos, mas apenas ~40 estavam sendo mapeados para colunas do banco. O resto ia para `espaider_raw` (JSONB) e não era acessível de forma estruturada.

**Problemas identificados**:
1. Campos críticos como `APROVADORATUAL` (fase atual) estavam sendo ignorados
2. Kanban agrupava por `status` ao invés da fase do projeto
3. `PRIORIDADE` em Entregas estava mapeado como `status` (confuso)
4. Front-end lia dados de `espaider_raw` ao invés de colunas dedicadas

---

## Solução Implementada

### Fase 1: Database (Migrations 009-012)

**Migration 009** (`009_add_project_phase_fields.sql`):
- Adicionadas 10 colunas em `projects`:
  - `fase_atual` ← APROVADORATUAL (usado para agrupar Kanban)
  - `prazo_fase` ← PRAZOAPROVADOR
  - `cronograma_atual` ← CRONOGRAMAATUAL
  - `prazo_cronograma` ← PRAZOCRONOGRAMAATUAL
  - `area` ← ASSUNTOAREA
  - `pasta_consultivo` ← PASTACONSULTIVO
  - `solucao_aplicada` ← SOLUCAOAPLICADAEM
  - `data_movimentacao` ← DATAMOVIMENTACAO
  - `data_encerramento` ← ENCERRADOEM
  - `data_inicio_aprovacao` ← DATAINICIOAPROVACAO
- Índices: `idx_projects_fase_atual`, `idx_projects_data_movimentacao`, `idx_projects_area`

**Migration 010** (`010_add_schedule_phase_fields.sql`):
- Adicionadas 9 colunas em `project_schedules`:
  - `fase_atividade` ← FASEATIVIDADE
  - `atrasado` ← ATRASADO (BOOLEAN)
  - `setor_responsavel` ← SETORRESPONSAVEL
  - `item` ← ITEM
  - `detalhamento` ← DETALHAMENTO
  - `data_prazo` ← DATAPRAZO
  - `data_novo_prazo` ← DATANOVOPRAZO
  - `data_alerta_prazo` ← DATAALERTAPRAZO
  - `prazo_confirmado` ← PRAZOCONFIRMADO

**Migration 011** (`011_add_delivery_fields.sql`):
- Adicionadas 3 colunas em `project_deliveries`:
  - `ordem` ← ORDEM
  - `detalhamento` ← DETALHAMENTO
  - `prioridade` ← PRIORIDADE (separado de status!)

**Migration 012** (`012_add_requirement_fields.sql`):
- Adicionadas 5 colunas em `project_requirements`:
  - `impacto` ← IMPACTO
  - `detalhamento` ← DETALHAMENTOREQUISITO
  - `entrega_id_espaider` ← IDENTIFICADOR_ENTREGA
  - `entrega_nome` ← ENTREGA
  - `data_conclusao` ← DATACONCLUSAO

---

### Fase 2: Types e Mapper

**`src/integrations/espaider/types.ts`**:
- Expandidas interfaces `ProjetoMapeado`, `EntregaMapeada`, `CronogramaMapeado`, `RequisitoMapeado`
- Cada interface agora inclui todos os campos mapeados da API

**`src/integrations/espaider/mapper.ts`**:
- Atualizado `CAMPOS_PROJETO` com 21 campos (era 8)
- Atualizado `CAMPOS_CRONOGRAMA` com 16 campos (era 10)
- `mapearProjeto()` agora extrai `fase_atual`, `prazo_fase`, `area`, etc.
- `mapearEntrega()` corrigido: `status` deriva de datas, `prioridade` é campo separado
- `mapearCronograma()` extrai `fase_atividade`, `atrasado` (boolean), etc.
- Adicionada função `parseSimNao()` para converter "Sim"/"Nao" → boolean

---

### Fase 3: Sync Service

**`src/lib/sync/espaider-sync.ts`**:
- Adicionada função `normalizeFase()` para normalizar fases para slugs
- `syncProjects()` agora persiste todos os novos campos
- `syncDeliveries()`, `syncSchedules()`, `syncRequirements()` atualizados
- Versões `FromRegistros` também atualizadas

---

### Fase 4: Transformers

**`src/lib/transformers/project.ts`**:
- `DBProject` expandido com novas colunas
- `DBSchedule` e `DBDelivery` expandidos
- `UIProject` expandido com `fase_atual`, `prazo_fase`, etc.
- `dbProjectToUI()` agora usa colunas diretas do BD (fallback para `espaider_raw` em dados legados)

---

### Fase 5: Front-end

**`src/app/projetos/projects-content.tsx`**:
- Interface `Project` expandida com `fase_atual`, `prazo_fase`, etc.
- `kanbanItems` usa `fase_atual` para agrupamento (não mais `status`)
- `dynamicColumns` calcula colunas baseadas em fases com ordem definida:
  1. Fila de Projetos
  2. Levantamentos Iniciais
  3. Análise e Definição
  4. Aprovação
  5. Execução - Homologação
  6. Validação - Homologação
  7. Execução - Produção
  8. Validação - Produção
  9. Monitoramento - Produção
- Adicionada função `normalizeFaseSlug()` para normalizar fases
- Labels e cores por fase configurados

**`src/components/project/ProjectCockpit.tsx`**:
- Interface `UIProject` expandida
- Seção "Situação Atual" usa `fase_atual` e `prazo_fase`
- Exibe `data_encerramento` quando projeto está encerrado

---

## Arquivos Modificados

| Arquivo | Tipo |
|---------|------|
| `supabase/migrations/009_add_project_phase_fields.sql` | Criado |
| `supabase/migrations/010_add_schedule_phase_fields.sql` | Criado |
| `supabase/migrations/011_add_delivery_fields.sql` | Criado |
| `supabase/migrations/012_add_requirement_fields.sql` | Criado |
| `src/integrations/espaider/types.ts` | Editado |
| `src/integrations/espaider/mapper.ts` | Editado |
| `src/lib/sync/espaider-sync.ts` | Editado |
| `src/lib/transformers/project.ts` | Editado |
| `src/app/projetos/projects-content.tsx` | Editado |
| `src/components/project/ProjectCockpit.tsx` | Editado |

---

## Decisões de Design

1. **`fase_atual` vs `status`**:
   - `fase_atual` (de APROVADORATUAL) = posição no fluxo do projeto (ex: "Execução - Produção")
   - `status` = estado de execução (ex: "Ativo", "Concluído")
   - Kanban agrupa por `fase_atual`, não por `status`

2. **Entregas: PRIORIDADE vs status**:
   - Antes: PRIORIDADE era mapeado como `status` (incorreto)
   - Agora: PRIORIDADE → `prioridade`, status deriva de `data_realizada`

3. **Fallbacks para dados legados**:
   - `dbProjectToUI()` tenta ler da coluna primeiro, depois de `espaider_raw`
   - Garante retrocompatibilidade com dados anteriores às migrations

4. **Normalização de fases**:
   - Função `normalizeFaseSlug()` converte "Execução - Produção" → "execucao_producao"
   - Permite agrupamento consistente no Kanban

---

## Verificação

- [x] TypeScript compila sem erros
- [ ] Migrations aplicadas (pendente: executar em produção)
- [ ] Sync testado (pendente: executar sincronização)
- [ ] Kanban agrupa por fase (pendente: teste visual)

---

## Próximos Passos

1. Aplicar migrations 009-012 em produção
2. Executar sincronização completa
3. Validar agrupamento do Kanban por fase
4. Criar action `updateProjectPhaseAction` para drag-and-drop atualizar `fase_atual`

---

## Lições Aprendidas

1. Sempre mapear campos críticos para colunas dedicadas ao invés de JSON genérico
2. Separar conceitos: "fase" (posição no fluxo) vs "status" (estado de execução)
3. Testar TypeScript durante desenvolvimento para evitar erros acumulados
