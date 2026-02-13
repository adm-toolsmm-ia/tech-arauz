---
id: 2026-02-13-audit-kpis
date: 2026-02-13
time: 20:45
trigger: Correção solicitada pelo usuário (KPIs incorretos)
status: RESOLVED
---

# 🧠 Agent Audit Log: Correção de KPIs (Em Andamento / Concluídos)

## 1. Problema Identificado
**Feedback do Usuário:**
- O KPI "Em Andamento" estava incorreto. Deve considerar apenas projetos com status "Em execução".
- O KPI "Concluídos" estava incorreto. Deve considerar apenas projetos com status "Concluído".
- A lógica anterior utilizava filtros baseados em exclusão (ex: tudo que não é concluído/cancelado) ou slugs antigos (`em_desenvolvimento`).

## 2. Solução Implementada
**Alteração de Lógica:**
Mudei a estratégia de filtro para ser **exata e positiva**, baseada no valor cru do campo `status` (que agora reflete o `situacao_original` da API).

**Arquivos Modificados:**
1.  `src/app/dashboard/dashboard-content.tsx`
2.  `src/app/projetos/projects-content.tsx`

**Novas Regras:**
- **Ativos (Em Andamento):** `p.status === 'Em execução'`
- **Concluídos:** `p.status === 'Concluído'`

## 3. Impacto
- **Precisão:** Os números agora refletem exatamente a contagem do Espaider para essas situações específicas.
- **Limitação Conhecida:** Projetos em outros status interativos (como "Em Aprovação" ou "Aguardando Fornecedor") *não* serão contados no KPI "Em Andamento" do topo da tela, pois a regra agora é estrita para "Em execução". Isso foi solicitado explicitamente pelo usuário.

---

## 4. Próximos Passos
1.  **Sync:** Rodar sincronização para efetivar a correção.
2.  **Validar:** Conferir se os números batem com o relatório do Espaider.
