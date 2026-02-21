# Otimização UI/10 - Kanban Card (2026-02-21)

## Mudanças Implementadas

### ✅ Campos Removidos
- **Solicitante** (UserPlus icon) — informação duplicada/menos crítica
- **Tipo Chamado** (Tag/categoria) — cluttering visual desnecessário
- **Impacto Operacional** (Op: Alto/Médio/Baixo) — informação secundária
- **Impacto Estratégico** (Est: Alto/Médio/Baixo) — informação secundária

### ✅ Simplificações
- **Rótulo:** "Próximo (Aprovador)" → **"Próximo prazo"** (mais conciso)
- **Linhas de detalhamento:** line-clamp-2 → **line-clamp-1** (mais compacto)
- **Altura de badges de alerta:** h-5 → **h-4** (mais compacto)
- **Font size:** text-[11px] → **text-[10px]** em metadados (economiza espaço)

### ✅ Estrutura Otimizada do Card

**Antes:**
```
Header (Título + Código + Alertas)
  ↓
Área + Tipo Chamado
  ↓
Responsável + Prazo (grid 2 col comprimido)
  ↓
Solicitante + Fase
  ↓
Próximo Prazo (Aprovador/Cronograma)
  ↓
Objetivo/Justificativa
  ↓
Badges de Impacto (Op, Est, Complexidade)
  ↓
Status
```

**Depois (Clean & Focused):**
```
Header (Título + Código)
  ↓
Alertas (Especial, Atrasado, Prazo)
  ↓
Área (se houver)
  ↓
Responsável
  ↓
Prazo Final (destacado em vermelho se atrasado)
  ↓
Fase Atual
  ↓
Próximo prazo (compacto)
  ↓
Objetivo/Justificativa (line-clamp-1)
  ↓
Complexidade Técnica (badge)
  ↓
Status
```

### ✅ Benefícios Visuais

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Altura do card** | ~280px | ~200px (−28%) |
| **Informações visíveis** | 10+ campos | 6 campos críticos |
| **Densidade espacial** | Apertado | Limpo e respirável |
| **Cliques necessários** | Menos (mas truncado) | Menos (sem truncamento) |
| **Legibilidade** | Média (muito texto) | Excelente (direto) |
| **Uso de espaço h** | Desperdiçado | Otimizado (+1 card por coluna) |

### ✅ Campos Mantidos (Essenciais)

- ✅ **Título do projeto** — o que é
- ✅ **Código Espaider** — identificação
- ✅ **Alertas** — ações urgentes (Especial, Atrasado, Prazo)
- ✅ **Responsável** — quem executa
- ✅ **Prazo Final** — quando vence (com destaque se atrasado)
- ✅ **Fase Atual** — onde está no workflow
- ✅ **Próximo prazo** — próxima data crítica
- ✅ **Objetivo** — contexto do projeto
- ✅ **Complexidade Técnica** — esforço estimado
- ✅ **Status** — estado atual

### ✅ Qualidade

- **TypeScript:** ✅ 0 errors
- **Lint:** ✅ 0 warnings
- **Acessibilidade:** ✅ Tooltips em todos os campos truncados
- **Dark Mode:** ✅ Cores e contraste mantidos

## Commit

```
e00dc73 refactor(kanban-card): optimize UI density and remove non-essential fields
```

## Próximas Otimizações (Futuro)

- [ ] Ajustar largura de coluna (flex-1 ou min-w) para usar mais espaço horizontal
- [ ] Aumentar número de colunas visíveis em desktop (desktop 5 → 6 colunas?)
- [ ] Adicionar modo "compact" para Kanban em mobile
- [ ] Validar com usuários se a remoção de "Solicitante" é ok

---

**Status:** ✅ Pronto para deploy via @devops (*pre-push → *push)
