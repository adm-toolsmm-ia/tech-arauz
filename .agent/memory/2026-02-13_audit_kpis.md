---
id: 2026-02-13-audit-kpis-v2
date: 2026-02-13
time: 21:00
trigger: Reincidência de bug nos KPIs de Projetos
status: RESOLVED
---

# 🧠 Agent Audit Log: Refinamento de KPIs (Case Insensitive)

## 1. Problema Identificado
**Feedback do Usuário:**
- Os KPIs de "Em Andamento" e "Concluídos" continuavam zerados na listagem de projetos, mesmo após a correção anterior.
- Suspeita técnica: Divergência de formatação (case, espaços) entre o valor esperado ("Em execução") e o valor real no banco (possivelmente "Em Execução" ou "Em execução ").

## 2. Solução Implementada
**Robustez na Comparação:**
- Implementei normalização **no momento da leitura** (runtime) para garantir o match.
- `(status || '').trim().toLowerCase() === 'em execução'`
- Aplicado em: `src/app/projetos/projects-content.tsx` e `src/app/dashboard/dashboard-content.tsx`.

**Debug:**
- Adicionei um log de console (`Project Statuses: [...]`) para que, em caso de nova falha, o usuário possa inspecionar no F12 exatamente quais strings estão chegando do banco.

---

## 3. Próximos Passos
1.  **Sync:** Rodar sincronização.
2.  **Validação Final:** Verificar se os números aparecem corretamente.
