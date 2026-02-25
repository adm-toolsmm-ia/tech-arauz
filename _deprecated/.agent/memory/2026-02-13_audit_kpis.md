---
id: 2026-02-13-audit-kpis-v3
date: 2026-02-13
time: 21:15
trigger: Reincidência e inconsistência entre Dashboard (OK) e Projetos (NOK)
status: RESOLVED
---

# 🧠 Agent Audit Log: Alinhamento de Dados (Dashboard vs Projetos)

## 1. Problema Identificado
**Sintoma:**
- O módulo de **Dashboard** exibia os dados corretamente (usando `status_original`).
- O módulo de **Projetos** (Card Vermelho) exibia zero (usando `situacao_original`).

**Causa Raiz:**
- Havia uma divergência na fonte de dados:
    - `Dashboard` utiliza diretamente `p.status_original` (que mapeia para `STATUSPROJETO` da API).
    - `Projetos` utilizava `p.situacao_original` (que mapeia para `SITUACAOATUAL` da API).
- Aparentemente, a API do Espaider retorna valores diferentes nesses campos, ou `SITUACAOATUAL` não reflete o status "Em Execução" da mesma forma que `STATUSPROJETO`.

## 2. Solução Implementada
**Unificação da Fonte de Verdade:**
- Alterei o transformador central (`src/lib/transformers/project.ts`), que alimenta o módulo de projetos.
- **Antes:** `status: row.situacao_original`
- **Agora:** `status: row.status_original || row.situacao_original`
- **Efeito:** Força o módulo de projetos a usar o mesmo dado que o dashboard já usa com sucesso (`STATUSPROJETO`), mantendo `SITUACAOATUAL` apenas como fallback.

## 3. Próximos Passos
1.  **Sync:** Rodar sincronização.
2.  **Validar:** Ambos os módulos devem agora apresentar números idênticos.
