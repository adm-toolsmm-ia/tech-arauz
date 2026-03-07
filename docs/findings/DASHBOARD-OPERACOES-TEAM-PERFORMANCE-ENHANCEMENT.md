# Enhancement Finding — Dashboard de Operações: Team Performance Analytics

**Data:** 2026-03-07
**Descoberto em:** Revisão de Dashboard durante AIOX Brownfield Discovery
**Tipo:** Product Enhancement / Feature Gap
**Severidade:** ALTA (oportunidade estratégica de BI)
**Status:** DOCUMENTED FOR FASE 10 IMPLEMENTATION PLANNING
**Revisado por:** Aria (@architect)

---

## Sumário Executivo

**Oportunidade:** Dashboard de Operações está focado em **fluxo de projetos** mas não em **desempenho da equipe**.

**Necessidade:** Criar camada executiva de **BI de Desempenho de Equipe** para diretoria, com:
- Métricas por responsável (velocidade, carga, eficiência)
- Comparações por período (semanal, mensal, trimestral, semestral, anual)
- Tempo médio de permanência por pessoa
- Rankings e tendências
- Isolamento: Própria equipe vs. Colaboradores envolvidos

**Impacto:** Enable decisões de RH, alocação de recursos e reconhecimento de equipe baseadas em dados.

**Esforço Estimado:** 40-60h (FASE 2/3 do roadmap)
**Risco:** BAIXO (dados existem, novo dashboard, sem mudança em operacoes atuais)
**Prioridade:** ALTA (estratégica)

---

## Contexto Atual

### Dashboard Operações Hoje

**Arquivo:** `src/app/dashboard/operacoes/operacoes-content.tsx`

**Escopo Atual — Fluxo de Projetos:**
- ✅ KPIs de operação: funil, aprovação, WIP, lead time
- ✅ Charts: pipeline por status, movimentações, volume, transições
- ✅ Drill-down: clique em projeto → ProjectCockpit
- ✅ Filtro: por status de projeto

**Limitações Atuais — Desempenho de Equipe:**
- ❌ Sem métricas individuais por responsável
- ❌ Sem comparações de período (semanal vs mensal vs anual)
- ❌ Sem tempo médio de permanência por pessoa
- ❌ Sem histórico de velocidade/trending
- ❌ Sem isolamento: própria equipe vs colaboradores externos
- ❌ Sem rankings ou benchmarking

---

## Análise de Dados Disponíveis

### 1. Dados Existentes no Supabase ✅

**Tabela: `project_histories`**
```
id, tenant_id, project_id, espaider_id,
type, responsible_to, responsible_from,
step_to, step_from, procedure_number,
message, date, espaider_raw, created_at
```

**Uso potencial:**
- `date` → período (agrupamento por semana/mês/trimestre)
- `responsible_to` → pessoa que recebeu (entrada na fase)
- `responsible_from` → pessoa que passou (saída da fase)
- `step_to` → fase de entrada
- `step_from` → fase de saída
- Contagem de movimentações = velocidade da pessoa

**Tabela: `project_tempo_permanencia`** (novo — Mig 048)
```
id, tenant_id, project_id, espaider_id,
fase, responsavel, situacao,
tempo_permanencia_dias,
data_inicio, data_fim, espaider_raw
```

**Uso potencial:**
- `responsavel` → pessoa responsável naquela fase
- `tempo_permanencia_dias` → dias gastos
- `data_inicio / data_fim` → período exato
- Agregação: Média por pessoa → "Tempo médio na fase X"

**Tabela: `profiles`**
```
id, tenant_id, email, full_name,
role, settings, is_active, created_at
```

**Uso potencial:**
- Mapeamento `responsavel` (texto Espaider) → `profiles.full_name` (join por tenant)

---

### 2. Dados NÃO Existentes ❌

**Campo: Horas Trabalhadas**
- ❌ Não existe tabela de time tracking
- ⚠️ Alternativa: Pode ser calculado heuristicamente (duração em fase × velocidade média)
- 📝 **Nota para FASE 10:** Considerar adicionar se houver integração com sistema de ponto/timesheet

---

## Especificação de Melhoria

### New Tab: "Performance da Equipe" → Dashboard Operações

#### 1. Layout Proposto

```
Dashboard Operações
├─ Tab 1: FLUXO (existente, mantém)
│  └─ KPIs, Pipeline, Histórico, etc
│
└─ Tab 2: PERFORMANCE (NOVO)
   ├─ Period Selector: [Semanal] [Mensal] [Trimestral] [Semestral] [Anual]
   ├─ Team Filter: [Minha Equipe] [Todos os Envolvidos] [Colaborador Específico]
   │
   ├─ Section 1: KPIs por Pessoa
   │  ├─ Card: Número de movimentações
   │  ├─ Card: Tempo médio por fase
   │  ├─ Card: Projetos entregues
   │  ├─ Card: Lead time médio
   │
   ├─ Section 2: Charts de Comparação
   │  ├─ Bar Chart: Movimentações por Responsável (ranking)
   │  ├─ Bar Chart: Tempo médio de permanência por Pessoa
   │  ├─ Line Chart: Tendência de movimentações ao longo do período
   │  ├─ Heatmap: Atividade por dia da semana (para identificar padrões)
   │
   ├─ Section 3: Table Detalhada
   │  ├─ Columns: Nome, Movimentações, Tempo Médio (dias), Projetos, Lead Time, Período
   │  ├─ Sorting: Clicável por qualquer coluna
   │  ├─ Exportar: CSV para relatório mensal
   │
   └─ Section 4: Drill-Down
      └─ Clique em pessoa → histórico detalhado (todas as movimentações naquele período)
```

---

#### 2. Dados Específicos por Métrica

| Métrica | Fórmula | Fonte | Granularidade |
|---------|---------|-------|---|
| **Movimentações** | COUNT(project_histories WHERE responsible_to = person) | project_histories | Por período, por pessoa |
| **Tempo Médio Permanência** | AVG(tempo_permanencia_dias) GROUP BY responsible | project_tempo_permanencia | Por período, por pessoa, por fase |
| **Projetos Entregues** | COUNT(DISTINCT project_id WHERE status IN ('concluído', 'entregue')) | projects + project_histories | Por período, por pessoa |
| **Lead Time Médio** | AVG(DATEDIFF(data_fim, data_inicio)) GROUP BY responsible | project_histories | Por período, por pessoa |
| **Velocidade (movimentações/período)** | movimentações / dias_no_periodo | Derivado | Por período, por pessoa |

---

#### 3. Filtros & Seletores

**Period Selector (obrigatório):**
- [ ] Semanal (últimas 4 semanas)
- [ ] Mensal (últimos 12 meses)
- [ ] Trimestral (últimos 4 trimestres)
- [ ] Semestral (últimas 2 semestres)
- [ ] Anual (últimos 5 anos)
- [ ] Custom Range (date picker)

**Team Filter (obrigatório):**
- [ ] Minha Equipe (apenas pessoas com `team_id = current_user.team_id`)
- [ ] Todos os Envolvidos (qualquer pessoa que mexeu em projetos no tenant)
- [ ] Colaborador Específico (dropdown de todos os envolvidos)

**Optional Filters:**
- [ ] Por Fase (filtrar movimentações de uma fase específica)
- [ ] Por Área (filtrar projetos de uma área)

---

#### 4. Componentes Necessários

**Novos Componentes React:**
1. **PeriodSelector** — Radio group ou segmented control (semanal/mensal/etc)
2. **TeamFilterSelect** — Dropdown para escolher minha equipe ou todos
3. **ResponsablePerformanceTable** — Tabela com sorting e export
4. **ResponsableMovementsChart** — Bar chart: movimentações por pessoa (ranked)
5. **ResponsableTempoPermanenciaChart** — Bar chart: tempo médio por pessoa
6. **MovementsVelocityChart** — Line chart: tendência ao longo do período
7. **ActivityHeatmap** — Heatmap: atividade por dia da semana
8. **ResponsableDetailModal** — Drill-down com histórico detalhado

**Componentes Existentes a Reutilizar:**
- ✅ `KPICard` (para métricas simples)
- ✅ `Card / CardHeader / CardContent` (layout)
- ✅ Recharts (para gráficos)

---

#### 5. API / Query Necessária

**Nova Server Action:** `src/app/dashboard/operacoes/actions.ts`

```typescript
// Função para buscar desempenho por período e pessoa
export async function getTeamPerformanceData(params: {
  tenantId: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'semestral' | 'annual' | { from: Date, to: Date };
  teamFilter: 'own_team' | 'all' | 'specific_user';
  userId?: string;
  specificUserId?: string;
  phaseFilter?: string;
  areaFilter?: string;
}) => {
  // Query complexa:
  // 1. Buscar project_histories no período
  // 2. Agregar por responsible_to
  // 3. Buscar project_tempo_permanencia, agregar por responsavel
  // 4. Join com profiles para nome
  // 5. Calcular médias e velocidades
  // Return: PerformanceMetrics[]
}
```

**Dados Retornados:**
```typescript
interface ResponsableMetrics {
  id: string;
  name: string;
  email: string;
  movementCount: number;
  avgTempoDias: number;
  projectsCompleted: number;
  avgLeadTimeDays: number;
  velocity: number; // movimentos/período
  period: { from: Date; to: Date };
  movements: HistoryDetail[];
}
```

---

## RLS & Security Considerations

### ✅ Isolamento Multi-Tenant
- Query already filtered by `tenant_id`
- No cross-tenant data leakage

### ⚠️ Acesso a Dados Pessoais
- **Pergunta:** Qualquer pessoa pode ver métricas de todos os colaboradores?
- **Recomendação:**
  - ✅ Admin/Manager role → Pode ver todos
  - ⚠️ Contributor role → Pode ver apenas sua equipe
  - ❌ Viewer role → Sem acesso

### 📝 Implementação FASE 10
- Adicionar role check em server action
- Retornar erro 403 se acesso negado
- Audit log: quem acessou que relatórios

---

## Data Modeling Questions (para FASE 10)

1. **Como mapear `responsavel` (texto Espaider) → `profiles.full_name`?**
   - Espaider traz nome em string solto (ex: "João Silva")
   - Profiles tem `full_name`
   - Solução: JOIN por `tenant_id` + fuzzy match no `full_name`?
   - Alternativa: Adicionar campo `espaider_name` em `project_tempo_permanencia`?

2. **Histórico com >1 ano:**
   - Query pode ficar pesada com 5 anos de histórico
   - Solução: Adicionar índice em `(tenant_id, date)` em project_histories
   - Considerar particionamento por ano

3. **"Minha Equipe" - como definir team_id?**
   - Profiles tem `tenant_id` mas não tem `team_id`
   - Solução FASE 10:
     - Opção A: Adicionar `team_id` em profiles
     - Opção B: Usar `area` como proxy de team
     - Opção C: Sempre mostrar todos (sem filtro de equipe)

---

## Roadmap de Implementação

### FASE 1: Foundation (2-3 semanas)
- [ ] Criar novo Tab "Performance" em Dashboard Operações
- [ ] Implementar Period Selector + Team Filter
- [ ] Criar server action para buscar dados
- [ ] Implementar ResponsablePerformanceTable

**Esforço:** 20h

### FASE 2: Analytics Charts (2-3 semanas)
- [ ] Implementar 4 main charts (movementosChart, tempoChart, velocityChart, heatmap)
- [ ] Drill-down modal para detalha detalhado
- [ ] Export para CSV

**Esforço:** 20h

### FASE 3: Polish & Performance (1-2 semanas)
- [ ] Otimizações de query (índices, caching)
- [ ] Teste de RLS e segurança
- [ ] A/B testing com stakeholders (diretoria)
- [ ] Feedback iteration

**Esforço:** 10-20h

**Total FASE 10:** 50-60h
**Timeline:** 4-6 semanas com paralelismo

---

## Validation Checklist

### Antes de Implementação (FASE 10 Planning)
- [ ] Confirmar estrutura de "Minha Equipe" (team_id, area, etc)
- [ ] Validar RLS rules para acesso a métricas pessoais
- [ ] Confirmar índices em project_histories para performance
- [ ] Definir se "horas trabalhadas" é heurística ou field novo
- [ ] Aprovação de stakeholder (diretoria/RH)

### Durante Implementação
- [ ] CodeRabbit review em todas as queries (performance, RLS)
- [ ] Teste de carga: 5 anos de histórico, 50 pessoas
- [ ] Teste de RLS: manager vs contributor vs viewer roles
- [ ] Manual testing: todos os periods × filters

### Após Implementação
- [ ] Feedback de usuários (diretoria, RH)
- [ ] Analytics: qual métrica é mais consultada?
- [ ] Performance: query response time < 2s
- [ ] Acessibilidade: keyboards, screen readers

---

## Referências

| Documento | Link | Escopo |
|-----------|------|--------|
| Dashboard Architecture | `docs/architecture/dashboards.md` | Padrões de dashboard |
| Project Schema | `docs/architecture/data/schema.prisma` | Tables: project_histories, project_tempo_permanencia |
| Current Dashboard | `src/app/dashboard/operacoes/operacoes-content.tsx` | Estado atual |
| KPI Calculations | `src/lib/domain/kpi-calculations.ts` | Padrão de cálculo |

---

## Next Steps (FASE 10)

1. **Aprovação:** Review desta enhancement + buy-in de stakeholder (diretoria)
2. **Data Validation:** Confirmar estrutura de "team" e RLS rules
3. **Planning:** Break into 3 phases com timeline definido
4. **Roadmap:** Integrar ao sprint de FASE 10 (implementação planning)
5. **Implementation:** Executar fases em paralelo se possível

---

**Status:** PRONTO PARA FASE 10 — ENHANCEMENT PLANNING

**Estratégia:** ALTA
**Esforço:** 50-60h
**Risco:** BAIXO (novo dashboard, dados existem)
**Impacto Executivo:** ALTO (BI para RH + alocação de recursos)

---

*Documento criado durante revisão de Dashboard durante AIOX Brownfield Discovery*
*Data: 2026-03-07 | Revisado por: Aria (@architect)*
*Tipo: Product Enhancement / Team Performance Analytics*
