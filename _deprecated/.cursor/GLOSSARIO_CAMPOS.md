# Glossário de Campos — Tech Arauz

**Última atualização:** 2025-02-25  
**Responsável:** Arquitetura

---

## Status do Projeto

Existem múltiplos campos relacionados a "status" na tabela `projects`. Esta seção clarifica quando usar cada um.

### `status_original` ⭐ **USE ESTE**

- **Localização:** Tabela `projects`, campo `status_original`
- **Origem:** Métrica verificada do Espaider (campo `SITUACAOATUAL`)
- **Propósito:** Status oficial do projeto para lógica de negócio e visualizações
- **Valores comuns:** `"Iniciado"`, `"Em Execução"`, `"Concluído"`, `"Cancelado"`, `"Suspenso"`
- **Case:** Inicial maiúscula (ex.: `"Em Execução"`)
- **Comparação:** Use `trim().toLowerCase()` para comparações seguras

**Quando usar:**
- ✅ Filtros e lógica condicional (ex.: "mostrar apenas projetos em execução")
- ✅ Gantt chart, Kanban, dashboards
- ✅ Cálculos KPI
- ✅ Validações de fluxo de negócio

**Exemplo (código):**
```typescript
const status = (project.status_original || '').trim().toLowerCase();
if (status === 'em execução') {
  // Logic for active projects
}
```

### `situacao_original` — NÃO USE (DEPRECATED)

- **Localização:** Tabela `projects`, campo `situacao_original`
- **Origem:** Status bruto do Espaider, antes da normalização
- **Propósito:** Histórico e sincronia com Espaider
- **Status:** DEPRECATED desde Migration 015 (2026-02-13)
- **Motivo:** Campo legado, sem normalização; usar `status_original`

**Quando usar:**
- ❌ NUNCA em lógica de negócio nova
- ⚠️ Apenas em scripts de migração/sincronização histórica

---

## Campos de Cronograma (project_schedules)

### `status` (Cronograma)

- **Localização:** Tabela `project_schedules`, campo `status`
- **Origem:** Status da atividade dentro do cronograma
- **Propósito:** Acompanhar estado individual da tarefa
- **Valores:** `"Pendente"`, `"Em Andamento"`, `"Concluído"`, `"Cancelado"`
- **Distinção importante:** ⚠️ **DIFERENTE DE `project.status_original`**

**Usar para:**
- Status da atividade (ex.: "Esta tarefa está Em Andamento")
- Não confundir com status do projeto

**Comparação:** Status do Projeto vs Status do Cronograma

| Aspecto | project.status_original | project_schedule.status |
|---------|------------------------|----------------------|
| O quê | Estado do projeto inteiro | Estado de uma atividade dentro do projeto |
| Quem define | Projeto (nível estratégico) | Cronograma/Atividade (nível tático) |
| Exemplo | "Em Execução" | "Em Andamento" |
| Uso | Filtros globais, dashboard | Detalhes de tarefas, Gantt |

---

## Campos Relacionados a Datas

| Campo | Tabela | Propósito |
|-------|--------|----------|
| `data_inicio` | project_schedules | Data de início da atividade |
| `data_fim` | project_schedules | Data prevista de conclusão |
| `data_prazo` | project_schedules | Prazo acordado para a atividade |
| `data_novo_prazo` | project_schedules | Prazo renegociado (se houver) |
| `prazo_final` | projects | Data de conclusão do projeto |
| `prazo_fase` | projects | Prazo da fase atual |

---

## Mapeamento UI ↔ DB

Referência de como campos DB são mapeados para a UI em diferentes views:

### Cronogramas (CronogramasContent)

```typescript
const project = {
  id: project.id,
  titulo: project.titulo,          // DB: titulo
  codigo: project.codigo,          // DB: codigo
  status: project.status_original, // DB: status_original (USAR ESTE!)
  fase_atual: project.fase_atual,  // DB: fase_atual
};
```

### Gantt (CronogramaGantt)

```typescript
// Filtro: incluir apenas projetos "iniciado" ou "em execução"
const isProjectActiveForGantt = (s: Schedule) => {
  const status = (s.project?.status || '').trim().toLowerCase();
  return status === 'iniciado' || status === 'em execução';
};
```

### Projetos (projects-content.tsx)

```typescript
const status = (project.status_original || '').trim().toLowerCase();
// Usar para lógica condicional e filtros
```

---

## Padrão de Comparação de Status

Para evitar erros de case e espaçamento, sempre use este padrão:

```typescript
// ✅ CORRETO
const status = (project.status_original || '').trim().toLowerCase();
if (status === 'em execução' || status === 'iniciado') {
  // Safe comparison
}

// ❌ INCORRETO
if (project.status_original === 'Em Execução') {
  // Falha se houver variação de case ou espaços
}
```

---

## Referências

- **Migration 015:** `.aios-core/migrations/015_project_status_rename.sql`
- **Transformer:** `src/lib/transformers/project.ts` (lines 310–326)
- **Cronogramas:** `src/app/cronogramas/page.tsx`
- **Gantt:** `src/components/cronogramas/CronogramaGantt.tsx`

---

## Checklist para Novos Desenvolvedores

- [ ] Usar `status_original` para lógica de projeto
- [ ] Usar `status` (project_schedules) para lógica de cronograma/atividade
- [ ] Sempre fazer `trim().toLowerCase()` antes de comparar status
- [ ] Se precisar do status bruto do Espaider, documentar o motivo

---

## Contato para Dúvidas

Se encontrar inconsistências ou campos não documentados, abra issue com label `[docs]`.
