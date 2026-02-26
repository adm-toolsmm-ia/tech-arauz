## UX Specialist Review

Data: 2026-02-26  
Base analisada: `docs/prd/technical-debt-DRAFT.md` e `docs/frontend/frontend-spec.md`.

### Gate da revisao UX

Status: **APPROVED WITH CHANGES**

### Debitos validados

| ID | Debito | Severidade | Horas | Prioridade | Impacto UX |
|---|---|---|---:|---|---|
| UX-01 | Duplicacao de regras em telas chave | Alta | 16 | Alta | Inconsistencia de resultado para o mesmo dado |
| UX-02 | Baseline de acessibilidade inexistente | Alta | 20 | Alta | Barreiras para uso por teclado/leitor de tela |
| UX-03 | Camadas de dados heterogeneas na UI | Media | 18 | Media | Feedback inconsistente de loading/erro |
| UX-04 | Jornadas por persona nao formalizadas | Media | 10 | Media | Decisao de produto mais lenta e difusa |

### Debitos adicionados

| ID | Debito | Severidade | Horas | Prioridade | Impacto UX |
|---|---|---|---:|---|---|
| UX-05 | Arquivos/client components extensos dificultam evolucao de UX refinada | Alta | 24 | Alta | Baixa velocidade de melhoria incremental |
| UX-06 | Falta de padrao unico para mensagens de erro/sucesso async | Media | 10 | Media | Experiencia fragmentada e menos previsivel |

### Respostas ao architect

1. **Fluxos de maior risco UX**: Projetos (kanban + cockpit), Integracoes (sync + logs), Dashboard (KPI decisorio).
2. **Baseline minimo de a11y**:
   - navegacao por teclado;
   - foco visivel consistente;
   - mensagens de erro com `aria-live`;
   - contraste minimo AA.
3. **Padrao de feedback async**:
   - estado `idle/loading/success/error` explicito;
   - toast para evento global e mensagem inline para contexto local;
   - retry guidado.
4. **Quebra de componentes grandes**:
   - separar blocos por responsabilidade (filtros, KPIs, lista, detalhes);
   - aplicar contrato de props orientado por dominio.

### Recomendacoes de design

1. Criar guideline de microinteracoes para sync, save e erro.
2. Definir tokens semanticos para estados de risco/prioridade.
3. Implantar checklist de a11y no PR template.

