# FASE 2 — Dashboard de Gestão Executável
## Refatoração de KPIs para Visão Gerencial Acionável

**Data Início**: 2026-02-21  
**Fase**: 2/6  
**Executor**: @dev (com validação @po)  
**Duração Estimada**: 3-4 horas  

---

## 1. OBJETIVO

Refatorar a camada de KPIs em `src/app/projetos/projects-content.tsx` para transformar métricas genéricas (Total, Em Execução, Concluído, Valor) em **KPIs gerenciais acionáveis** (Em Risco, Sem Movimento, Alta Prioridade, Concluídos 30d, Impacto Estratégico) onde cada KPI dispara um filtro específico no board.

---

## 2. ESCOPO

### O que ENTRA
- ✅ Recalcular 4 KPIs existentes com lógica gerencial (Em Risco, Sem Movimento, Concluídos 30d, Impacto)
- ✅ Adaptar `KPICard` para ser clicável e aplicar filtro automaticamente
- ✅ Reorganizar layout de KPIs para grid responsivo (4 desktop, 2x2 tablet, 1 mobile)
- ✅ Adicionar indicadores visuais (ícones, cores semânticas)
- ✅ Sincronização automática KPI → filtro aplicado

### O que NÃO ENTRA
- ❌ Implementar novos filtros avançados (Fase 3)
- ❌ Alterar contrato de dados em transformers
- ❌ Refatorar componentes de Kanban/Lista (Fase 4-5)

---

## 3. ARQUIVOS-ALVO

| Arquivo | Mudança | Tipo |
|---|---|---|
| [src/app/projetos/projects-content.tsx](src/app/projetos/projects-content.tsx) | Recalcular KPIs; adicionar handlers de clique; aplicar filtro | MODIFICAR |
| [src/components/dashboard/KPICard.tsx](src/components/dashboard/KPICard.tsx) | Melhorar interação (hover, active, tooltip) | EVOLUIR |
| [src/lib/constants/phase-labels.ts](src/lib/constants/phase-labels.ts) | Adicionar ícones/cores para novos KPIs (opcional) | REFERÊNCIA |

---

## 4. ESPECIFICAÇÃO FUNCIONAL DOS KPIs

### KPI 1: EM RISCO
- **Métrica**: Projetos com prazo vencido OU prazo < 7 dias
- **Campos usados**: `end_date`, `prazo_fase`, `prazo_cronograma`, `status`
- **Lógica**:
  ```typescript
  const atRisk = projects.filter(p => {
    const now = new Date();
    const endDate = p.end_date ? new Date(p.end_date) : null;
    const praziFase = p.prazo_fase ? new Date(p.prazo_fase) : null;
    const prazoCronograma = p.prazo_cronograma ? new Date(p.prazo_cronograma) : null;
    
    // Ignorar concluídos e cancelados
    if (['concluído', 'cancelado'].includes((p.status || '').toLowerCase())) return false;
    
    // Vencido ou próximo de vencer (7 dias)
    const prazosCriticos = [endDate, praziFase, prazoCronograma].filter(Boolean);
    return prazosCriticos.some(prazo => {
      const diasRestantes = (prazo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diasRestantes <= 7;
    });
  }).length;
  ```
- **Ícone**: `AlertTriangle` (lucide-react)
- **Cor**: `destructive` (vermelho)
- **Ação ao clicar**: Aplicar filtro `prazo_vencido: true`
- **Subtitle**: `${atRisk} projeto(s)`

### KPI 2: SEM MOVIMENTAÇÃO
- **Métrica**: Projetos sem movimentação há 30+ dias
- **Campos usados**: `data_movimentacao`, `last_update`, `updated_at`
- **Lógica**:
  ```typescript
  const withoutMovement = projects.filter(p => {
    const now = new Date();
    const lastMove = p.data_movimentacao || p.last_update || p.updated_at;
    if (!lastMove) return true; // Sem data = estagnado
    
    const diasSemMovimento = (now.getTime() - new Date(lastMove).getTime()) / (1000 * 60 * 60 * 24);
    return diasSemMovimento > 30;
  }).length;
  ```
- **Ícone**: `Clock` (lucide-react)
- **Cor**: `warning` (âmbar/amarelo)
- **Ação ao clicar**: Custom filter `sem_movimento: true` (será implementado Fase 3)
- **Subtitle**: `${withoutMovement} estagnado(s)`

### KPI 3: ALTA PRIORIDADE
- **Métrica**: Projetos com prioridade Urgente + Alta (já existe, melhorar visual)
- **Campos usados**: `priority`
- **Lógica**:
  ```typescript
  const highPriority = projects.filter(p => 
    ['urgente', 'alta'].includes((p.priority || '').toLowerCase())
  ).length;
  ```
- **Ícone**: `Zap` (lucide-react)
- **Cor**: `warning` (âmbar)
- **Ação ao clicar**: Aplicar filtro `prioridade: ['urgente', 'alta']`
- **Subtitle**: `${highPriority} crítico(s)`

### KPI 4: CONCLUÍDOS (últimos 30 dias)
- **Métrica**: Projetos com status "Concluído" nos últimos 30 dias
- **Campos usados**: `status`, `data_encerramento` (ou `updated_at`)
- **Lógica**:
  ```typescript
  const completedRecent = projects.filter(p => {
    if ((p.status || '').toLowerCase() !== 'concluído') return false;
    
    const now = new Date();
    const endDate = p.data_encerramento || p.updated_at;
    if (!endDate) return false;
    
    const diasAtrás = (now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24);
    return diasAtrás <= 30;
  }).length;
  ```
- **Ícone**: `CheckCircle2` (lucide-react)
- **Cor**: `success` (verde)
- **Ação ao clicar**: Aplicar filtro `concluidos: true` + filtro de data 30d
- **Subtitle**: `nos últimos 30d`

### KPI 5: IMPACTO ESTRATÉGICO (Adicional)
- **Métrica**: Projetos com impacto estratégico = "Alto"
- **Campos usados**: `impacto_estrategico`
- **Lógica**:
  ```typescript
  const highImpact = projects.filter(p => 
    (p.impacto_estrategico || '').toLowerCase() === 'alto'
  ).length;
  ```
- **Ícone**: `TrendingUp` (lucide-react)
- **Cor**: `primary` (azul/verde)
- **Ação ao clicar**: Custom filter `impacto_estrategico: ['Alto']`
- **Subtitle**: `portfólio crítico`

---

## 5. MATRIZ: KPI → FILTRO

| KPI | Campo | Filtro | Implementação | Fase |
|---|---|---|---|---|
| Em Risco | `prazo_*`, `status` | `prazo_vencido: true` | Em projects-content.tsx | Fase 2 |
| Sem Movimento | `data_movimentacao` | Novo: `sem_movimento: true` | Implementar em Fase 3 | Fase 3 |
| Alta Prioridade | `priority` | `prioridade: ['urgente', 'alta']` | Já existe | Fase 2 |
| Concluídos 30d | `status` + `updated_at` | `concluidos: true` + range | Estender em Fase 3 | Fase 3 |
| Impacto Estratégico | `impacto_estrategico` | Novo: `impacto_estrategico: ['Alto']` | Implementar em Fase 3 | Fase 3 |

---

## 6. MUDANÇAS CONCRETAS

### 6.1 Em `projects-content.tsx` (linhas 186-193)

**ANTES**:
```typescript
// Calculate KPIs
const totalValue = projects.reduce((sum, p) => sum + (p.total_value || 0), 0);
const activeProjects = projects.filter(
  (p) => (p.status || '').trim().toLowerCase() === 'em execução',
).length;
const completedProjects = projects.filter(
  (p) => (p.status || '').trim().toLowerCase() === 'concluído',
).length;
```

**DEPOIS** (adicionar novo bloco de cálculo):
```typescript
// ===== CALCULATE KPIS (GERENCIAL) =====
// KPI 1: Em Risco
const atRiskProjects = projects.filter(p => {
  const now = new Date();
  const endDate = p.end_date ? new Date(p.end_date) : null;
  const praziFase = p.prazo_fase ? new Date(p.prazo_fase) : null;
  const prazoCronograma = p.prazo_cronograma ? new Date(p.prazo_cronograma) : null;
  
  if (['concluído', 'cancelado'].includes((p.status || '').toLowerCase())) return false;
  
  const prazosCriticos = [endDate, praziFase, prazoCronograma].filter(Boolean);
  return prazosCriticos.some(prazo => {
    const diasRestantes = (prazo!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diasRestantes <= 7;
  });
}).length;

// KPI 2: Sem Movimentação (30+ dias)
const withoutMovementProjects = projects.filter(p => {
  const now = new Date();
  const lastMove = p.data_movimentacao || p.last_update || p.updated_at;
  if (!lastMove) return true;
  
  const diasSemMovimento = (now.getTime() - new Date(lastMove).getTime()) / (1000 * 60 * 60 * 24);
  return diasSemMovimento > 30;
}).length;

// KPI 3: Alta Prioridade (Urgente + Alta)
const highPriorityProjects = projects.filter(p => 
  ['urgente', 'alta'].includes((p.priority || '').toLowerCase())
).length;

// KPI 4: Concluídos (últimos 30 dias)
const completedRecent = projects.filter(p => {
  if ((p.status || '').toLowerCase() !== 'concluído') return false;
  
  const now = new Date();
  const endDate = p.data_encerramento || p.updated_at;
  if (!endDate) return false;
  
  const diasAtrás = (now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24);
  return diasAtrás <= 30;
}).length;

// KPI 5: Impacto Estratégico Alto
const highImpactProjects = projects.filter(p => 
  (p.impacto_estrategico || '').toLowerCase() === 'alto'
).length;
```

### 6.2 Em `projects-content.tsx` (seção de renderização de KPIs)

**Localizar** (linhas ~300-350): a seção onde os KPIs são renderizados (dentro do `<Card>` com `<div className="grid..."`).

**ANTES**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard title="Total de Projetos" value={projects.length} icon={FolderOpen} />
  <KPICard title="Em Andamento" value={activeProjects} icon={TrendingUp} />
  <KPICard title="Concluídos" value={completedProjects} icon={CheckCircle2} />
  <KPICard title="Valor Total" value={`R$ ${totalValue.toLocaleString('pt-BR')}`} icon={DollarSign} />
</div>
```

**DEPOIS**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard 
    title="Em Risco" 
    value={atRiskProjects} 
    icon={AlertTriangle}
    subtitle={`${atRiskProjects} projeto(s)`}
    active={filters.prazo_vencido === true}
    onClick={() => setFilters(prev => ({ ...prev, prazo_vencido: !prev.prazo_vencido }))}
  />
  <KPICard 
    title="Sem Movimentação" 
    value={withoutMovementProjects} 
    icon={Clock}
    subtitle="30+ dias"
    active={false}  // Será acionável em Fase 3
  />
  <KPICard 
    title="Alta Prioridade" 
    value={highPriorityProjects} 
    icon={Zap}
    subtitle={`${highPriorityProjects} crítico(s)`}
    active={filters.prioridade?.includes('urgente') || filters.prioridade?.includes('alta')}
    onClick={() => {
      const isActive = filters.prioridade?.includes('urgente') || filters.prioridade?.includes('alta');
      setFilters(prev => ({ 
        ...prev, 
        prioridade: isActive ? [] : ['urgente', 'alta'] 
      }));
    }}
  />
  <KPICard 
    title="Concluídos (30d)" 
    value={completedRecent} 
    icon={CheckCircle2}
    subtitle="últimos 30 dias"
    active={false}  // Será acionável em Fase 3
  />
</div>
```

### 6.3 Em `KPICard.tsx` (melhorar interação visual)

**ADICIONAR** imports no topo:
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
```

**MODIFICAR** o componente para adicionar tooltip opcional:
```jsx
<Card
  className={cn(
    'shadow-soft transition-all duration-300 hover:shadow-card-hover',
    'animate-scale-in hover:-translate-y-0.5',
    onClick && 'cursor-pointer hover:bg-accent',
    active && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
    className,
  )}
  onClick={onClick}
  role={onClick ? 'button' : undefined}
  tabIndex={onClick ? 0 : undefined}
  onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
>
```

---

## 7. CRITÉRIOS DE ACEITE

- ✅ Os 5 KPIs calculam corretamente baseado nas regras de negócio acima
- ✅ Clicar em KPI aplica filtro correspondente (En Risco, Alta Prioridade)
- ✅ KPI visual fica destacado (ring) quando filtro está ativo
- ✅ Layout responsivo: 4 cards desktop, 2x2 tablet, 1 mobile (grid dinâmico)
- ✅ Sem alterar contrato de dados (transformers não modificados)
- ✅ Testes: `npm run lint`, `npm run typecheck`, `npm test` passam
- ✅ Build: `npm run build` completa sem errors/warnings

---

## 8. RISCOS & MITIGAÇÃO

| Risco | Mitigação |
|---|---|
| **Contrato de dados alterado** | Usar apenas campos já existentes em `Project` interface |
| **Performance com 1000+ projetos** | Mover cálculos para useMemo (já existe); validar em testes |
| **Inconsistência com filtros Fase 3** | Documentar matriz KPI → filtro; coordenar com @dev |
| **Regressão em filtragem** | Validar que applyProjectFilters ainda funciona após mudanças |

---

## 9. PLANO DE VALIDAÇÃO

### UX
- [ ] Ler 5 KPIs em < 5 segundos (visual scan)
- [ ] Click KPI aplica filtro visualmente (ring + card destacado)
- [ ] Hover em KPI mostra cursor e pequena elevação

### A11y
- [ ] KPICard com role="button" quando clicável
- [ ] Navegação por Tab/Enter funciona
- [ ] aria-live ou aria-label informar mudança de filtro

### Performance
- [ ] KPIs calculam em < 50ms (useMemo)
- [ ] Renderização de 5 cards em < 100ms
- [ ] Build sem warnings

### Funcional
- [ ] Filtro "prazo_vencido: true" funciona após click
- [ ] Filtro "prioridade: ['urgente', 'alta']" funciona após click
- [ ] Toggle OFF filtro após segundo click

---

## 10. ENTREGÁVEIS FASE 2

- ✅ Arquivo modificado: `projects-content.tsx` (bloco de KPIs + handlers)
- ✅ Arquivo melhorado: `KPICard.tsx` (interação, acessibilidade)
- ✅ Documento: Especificação de cálculo dos KPIs (este arquivo)
- ✅ Testes: lint, typecheck, build passando
- ✅ Evidência: Screenshot/video mostrando os 5 KPIs com interação

---

## 11. PRÓXIMO PASSO

**Fase 3**: Implementar filtros rápidos 2.0 (4 filtros novos: Próximos 7 dias, Sem movimentação, Com atrasos, Impacto Alto).

**Gate**: @po valida regras de cálculo dos KPIs antes de iniciar Fase 3.

---
