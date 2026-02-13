---
id: 2026-02-13-audit-charts
date: 2026-02-13
time: 20:00
trigger: Relato de gráficos desatualizados
status: RESOLVED
---

# 🧠 Agent Audit Log: Correção dos Gráficos do Dashboard

## 1. Problema Identificado
**Sintoma:** Os gráficos "Pipeline de Projetos" e "Distribuição por Status" não exibiam dados ou exibiam dados incorretos ("Em Andamento: 0") após a migração.
**Causa Raiz:**
- O campo `status_original` (criado para métricas) estava sendo populado com o **valor cru** da API (ex: "Em Execução") ao invés do **slug normalizado** (ex: `em_execucao`).
- Os componentes de gráfico (`StatusDistributionChart`, etc.) esperam chaves específicas (slugs) para agrupar e colorir os dados. Como recebiam chaves desconhecidas (o texto cru), ignoravam ou classificavam incorretamente os registros.

---

## 2. Correção Aplicada
**Arquivos Modificados:**
1.  `src/lib/sync/espaider-sync.ts`:
    - **Antes:** `status_original: p.status` (Raw)
    - **Depois:** `status_original: normalizeStatus(p.situacao_atual || p.status)` (Normalized Slug)

**Impacto:**
- O campo `situacao_original` continua armazenando o texto fiel à API ("Em Execução").
- O campo `status_original` agora armazena o slug padrão (`em_execucao`), permitindo que os gráficos computem as métricas corretamente.

---

## 3. Ação Requerida (Team Follow-up)
1.  **Deploy:** O fix foi aplicado no backend.
2.  **Sincronização de Dados:** Para que os gráficos voltem a funcionar, **é necessário rodar a sincronização dos projetos novamente** (botão "Sincronizar" no sistema ou aguardar cron). Isso atualizará o campo `status_original` no banco de dados com os valores normalizados corretos.
3.  **Auditoria Contínua:** Monitorar se novos status surgirem no Espaider que não tenham mapeamento no `normalizeStatus` (estes cairão no fallback de slugificação ou 'projeto_futuro').

---

## 4. Parecer Técnico
A arquitetura de separação entre "Dado de Apresentação" (`situacao`) e "Dado de Negócio/Métrica" (`status_metric`) é correta e robusta. O erro foi pontual na lógica de preenchimento durante a refatoração. Com a correção, o sistema mantém a fidelidade dos dados (Audit trail) e a funcionalidade dos dashboards (Analytics).
