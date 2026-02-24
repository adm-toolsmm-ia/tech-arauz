# PLANO DE AÇÃO UX/UI 10/10 — STATUS E CONTEXTO SALVÁVEL
**Atualizado**: 2026-02-21  
**Status**: Pronto para execução - FASE 1 em andamento  

---

## RESUMO EXECUTIVO

**Objetivo**: Refatorar módulo de gestão de projetos para UX/UI 10/10 com:
- Dashboards gerenciais acionáveis
- Filtros rápidos e avançados 2.0
- Kanban com cards redesenhados (sem corte de informação)
- Visão 360° e lista tática sincronizadas

**Limite**: Manter estrutura de dados atual (tabelas e vínculos), apenas refatorar apresentação

**Prazo**: 6 fases sequenciais + validação + documentação

---

## FASES DO PLANO (7 FASES TOTAIS)

### ✅ FASE 1: UX Audit + Blueprint (Pronta para executar)
**Responsável**: @aios-master + @ux-design-expert  
**Duração**: 4-6 horas  
**Saída**: 
- Diagnóstico de 50+ gaps (severidade: crítico/alto/médio/baixo)
- Blueprint de informação (IA alvo com 4 blocos: dashboard → filtros → kanban → cockpit)
- Matriz de decisão de componentes (reusar/evoluir/substituir/novo)
- Backlog priorizado (P0-P3) com critérios de impacto x esforço

### ⏳ FASE 2: Dashboard de Gestão
**Responsável**: @dev + @po  
**Escopo**: 5 KPIs gerenciais (Em Risco, Sem Movimento, Alta Prioridade, Concluídos 30d, Alto Impacto) com clique→filtro  
**Arquivo-alvo**: `src/app/projetos/projects-content.tsx`

### ⏳ FASE 3: Filtros Rápidos 2.0
**Responsável**: @dev + @po  
**Escopo**: 4 novos filtros + 3 presets operacionais + busca estendida  
**Arquivo-alvo**: `src/components/filters/ProjectFilters.tsx`

### ⏳ FASE 4: Kanban 10/10
**Responsável**: @dev + @ux-design-expert  
**Escopo**: Redesenho total de ProjectKanbanCard + KanbanBoard, sem truncamento de info  
**Arquivo-alvo**: `src/components/project/ProjectKanbanCard.tsx`, `src/components/views/KanbanBoard.tsx`

### ⏳ FASE 5: Visão 360° e Lista
**Responsável**: @dev + @po  
**Escopo**: Reorganizar cockpit em blocos decisão + criar modo lista tática  
**Arquivo-alvo**: `src/components/project/ProjectCockpit.tsx`, criar novo `ProjectListView.tsx`

### ⏳ FASE 6: Hardening de Qualidade
**Responsável**: @qa + @security + @devops  
**Escopo**: WCAG AA, responsividade, performance, quality gates

### ⏳ FASE 7: Documentação e Publicação
**Responsável**: @devops  
**Escopo**: Publicar para validação do usuário

---

## ARQUIVOS-CHAVE (NÃO MEXER SEM PLANEJAR)

| Arquivo | Papel | Status |
|---------|-------|--------|
| `src/app/projetos/page.tsx` | Server component, busca dados | Referência |
| `src/app/projetos/projects-content.tsx` | Client, orquestração | FASE 2 |
| `src/components/views/KanbanBoard.tsx` | Board drag-drop | FASE 4 |
| `src/components/project/ProjectKanbanCard.tsx` | Card do kanban | FASE 4 ⚠️ CRÍTICO |
| `src/components/filters/ProjectFilters.tsx` | Filtros rápidos/avançados | FASE 3 |
| `src/components/views/SplitView.tsx` | Painel lateral 360° | FASE 5 |
| `src/components/project/ProjectCockpit.tsx` | Visão detalhada | FASE 5 |
| `src/lib/transformers/project.ts` | Mapeamento DB→UI | ⚠️ NÃO ALTERAR |
| `.context/03-specs/tokens_brand.json` | Design tokens | Referência |
| `src/lib/constants/phase-labels.ts` | Status/cores | Referência |

---

## GATEKEEPERS POR FASE

| Gate | Aprovadores | O que validam |
|------|-------------|--------------|
| Gate 1 (IA + UX) | @architect + @ux-design-expert | Layout, design system, componentes |
| Gate 2 (Implementação) | @dev | Dados, usabilidade, compatibilidade |
| Gate 3 (Qualidade) | @qa + @security | Regressão, a11y, robustez |
| Gate 4 (Dados) | @data-engineer | Filtros cobertem campos reais |
| Gate 5 (Produção) | @devops | Quality gates, build, publicação |

---

## PRÓXIMOS PASSOS IMEDIATOS

### 1️⃣ EXECUTAR FASE 1 (NOW)
```
@aios-master @ux-design-expert
Analisar imagens do Kanban em anexo + código dos 7 arquivos-chave
Produzir:
  - FASE-1-audit-blueprint.md (no .context/_memory/)
  - Diagnóstico consolidado
  - Blueprint visual (em markdown)
  - Matriz de componentes
  - Backlog priorizado
```

### 2️⃣ VALIDAR BLUEPRINT
```
@po + @architect revisam FASE-1
Se OK → Proceder FASE 2
Se ajustes → Iterar
```

### 3️⃣ EXECUTAR FASES 2-5 SEQUENCIAL
```
FASE 2 → Gate 2 → FASE 3 → Gate 2 → FASE 4 → Gate 2 → FASE 5 → Gate 2
Cada fase:
  - @dev implementa
  - @qa valida
  - Documento gerado em .context/_memory/
```

### 4️⃣ HARDENING (FASE 6)
```
@qa + @security + @devops
WCAG AA, responsividade, build
```

### 5️⃣ PUBLICAR (FASE 7)
```
@devops executa:
  - npm run lint/typecheck/test/build
  - git push origin main
  - Deploy automático (Vercel)
```

### 6️⃣ VALIDAÇÃO DO USUÁRIO
```
User revisa em produção
Se OK → Documentar tudo em project.md
Se ajustes → Iteração controlada
```

---

## CRITÉRIOS DE SUCESSO FINAL (10/10)

✅ Leitura macro em < 5 segundos  
✅ 1-2 cliques para ação  
✅ Kanban sem truncamento de info  
✅ Sem conflito drag/click  
✅ WCAG AA + responsividade  
✅ Filtros rápidos operacionais  
✅ Design system consistente  
✅ Cross-agent validation antes de publicar  

---

## IMAGENS ANEXADAS (DO USUÁRIO)

**Problema identificado**: Cards do Kanban com informações cortadas/truncadas

Campos a manter no card (dados reais disponíveis):
- Título projeto + código Espaider
- Responsável
- Fase atual
- Prazo final (com destaque se atrasado)
- Área
- Status badge
- Alerta: Importância especial, Atrasado, Prazo crítico (7d)

Campos a REMOVER do card (poluição visual):
- Solicitante
- "Controle de projetos" / tipo chamado
- Impacto estratégico/operacional (mover para tooltip/cockpit)
- Legenda "Próximo (Aprovador)" → "Próximo prazo"

---

## COMANDOS RÁPIDOS (PRÓXIMA JANELA)

```bash
# Verificar status git
git status

# Próxima fase
# Ler FASE-1-audit-blueprint.md
cat .context/_memory/FASE-1-audit-blueprint.md

# Publicar após tudo pronto
git add . && git commit -m "feat(kanban-refactor): phase X complete" && git push origin main
```

---

## MEMÓRIA CRÍTICA PARA PRÓXIMA JANELA

1. **Não alterar**: `src/lib/transformers/project.ts` (contrato de dados)
2. **Base de componentes**:
   - `KPICard` (já existe, usar em FASE 2)
   - `KanbanBoard` com @dnd-kit (evoluir, não substituir)
   - `ProjectFilters` (expandir, não reescrever)
3. **Design tokens**: `tokens_brand.json` é verdade única
4. **Validação final**: Todas 5 fases precisam passar nos gates antes de publicar
5. **User feedback loop**: Após publicação, user valida e aprova docs finais

---

## STATUS ATUAL

- ✅ Plano elaborado e aprovado pelo usuário
- ✅ 7 fases documentadas com responsáveis
- ✅ Gatekeepers e critérios definidos
- ✅ Próximo: FASE 1 execution by @aios-master + @ux-design-expert
- ⏸️ **Esperando: Iniciar FASE 1 na nova janela de contexto**

---

**Próxima ação esperada na nova janela**:
```
FASE 1: Consolidar UX Audit + Blueprint
Output: .context/_memory/FASE-1-audit-blueprint.md
```
