---
id: 2026-02-13-audit-filters-v1
date: 2026-02-13
time: 21:25
trigger: Filtro de clique no Dashboard trazendo resultados divergentes do Card
status: RESOLVED
---

# 🧠 Agent Audit Log: Correção de Filtros Interativos (Dashboard)

## 1. Problema Identificado
**Discrepância:**
- O Card de KPI "Em Andamento" exibia o valor correto (ex: 28) usando a nova lógica estrita (`status === 'Em execução'`).
- Ao clicar no card, a lista abaixo exibia um número diferente de projetos (ex: 30), pois usava uma lógica antiga e frouxa (`status !== 'Concluido'`).

## 2. Solução Implementada
**Alinhamento Lógico em `dashboard-content.tsx`:**
1.  **Filtro `active`:** Atualizado para corresponder exatamente ao KPI "Em Andamento".
    - `(status || '').trim().toLowerCase() === 'em execução'`
2.  **Filtro `completed`:** Atualizado para corresponder exatamente ao KPI "Concluídos".
    - `(status || '').trim().toLowerCase() === 'concluído'`
3.  **Helpers:** Funções auxiliares como `isOverdue` e os contadores de "concluídos neste mês" também foram atualizados para usar a comparação estrita (case-insensitive).

## 3. Resultado Esperado
- Ao clicar no KIP "Em Andamento" (28), a lista filtrada deve mostrar exatamente 28 projetos.
- A consistência visual entre os números dos cards e a lista detalhada deve ser de 100%.
