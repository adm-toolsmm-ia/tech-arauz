---
id: 2026-02-13-audit-charts-dynamic
date: 2026-02-13
time: 20:30
trigger: Correção solicitada pelo usuário (Gráficos dinâmicos)
status: RESOLVED
---

# 🧠 Agent Audit Log: Gráficos Dinâmicos e Status Raw

## 1. Problema Identificado (Revisão)
**Feedback do Usuário:**
- A normalização forçada do campo `status_original` estava incorreta. O campo deve refletir exatamente a informação da API.
- Os gráficos continham rotinas específicas (whitelists) que impediam a exibição de dados não mapeados.

**Análise:**
- `ProjectPipelineChart` e `StatusDistributionChart` dependiam de listas fixas de slugs (ex: `projeto_futuro`).
- Ao receberem status crus ("Em Execução"), os dados eram ignorados.

---

## 2. Solução Implementada: Gráficos Dinâmicos
**Princípio:** Backend fiel à fonte, Frontend adaptável.

**Backend (`src/lib/sync/espaider-sync.ts`):**
- **Revertido:** O campo `status_original` agora recebe diretamente `p.status` (Raw Value), mantendo a integridade da informação original da API.

**Frontend (`src/components/charts/*.tsx`):**
- **Refatorado `StatusDistributionChart` e `ProjectPipelineChart`:**
    - Removida a dependência de `statusLabels` fixos.
    - Implementada lógica dinâmica: O gráfico itera sobre **todos** os status presentes no banco de dados.
    - **Cores:** Utiliza um helper para tentar mapear o status cru (ex: "Em Execução") para a cor correspondente via slugificação, com fallback para cinza caso seja um status inédito.

**Benefícios:**
- **Robustez:** Se surgir um novo status no Espaider (ex: "Em Bloqueio"), ele aparecerá automaticamente no gráfico sem necessidade de alterar código.
- **Integridade:** O dado exibido é exatamente o dado do banco, sem camadas de tradução ocultas.

---

## 3. Ação Requerida
1.  **Sincronização:** É imperativo rodar a sincronização (`npm run sync`) para garantir que o banco seja populado com os valores crus.
2.  **Validação:** Verificar se os gráficos agora exibem barras/fatias com os nomes reais (ex: "Em Execução", "Concluído").

---

## 4. Parecer Técnico
A abordagem dinâmica remove o acoplamento entre os "De-Para" do código e os dados do Espaider. Isso reduz a manutenção futura e garante que o dashboard seja um reflexo fiel do sistema de origem.
