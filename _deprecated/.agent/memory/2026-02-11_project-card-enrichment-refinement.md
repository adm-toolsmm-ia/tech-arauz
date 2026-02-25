---
id: project-card-enrichment-2026-02-11
date: 2026-02-11
time: 19:55
trigger: USER_REQUEST_ENRICHMENT_REFINEMENT
status: SUCCESS
---

# 🧠 Agent Memory Log: Project Card Enrichment & Refinement

## 1. Contexto & Objetivo
**O que foi solicitado?**
> Enriquecer o Card do Projeto com novos dados do Espaider (Cronograma, Pasta Consultivo, Aprovador, Solução) e refinar a interface visual (layout, legendas, acentuação). Também solicitada auditoria das rotinas.

**Por que isso é necessário?**
- [x] O card anterior não mostrava dados críticos para a gestão (Fase Atual, Pasta).
- [x] O mapeamento de status estava genérico ("Em Desenvolvimento" vs "Em Execução").
- [x] A interface precisava de limpeza (remoção de badges redundantes) e correção de português.

---

## 2. Planejamento (Architecture & Strategy)
**Agentes Envolvidos:**
- [x] `@orchestrator`: Coordenação e Auditoria
- [x] `@backend-specialist`: Ajuste em Sync e Mapper (`espaider-sync.ts`, `mapper.ts`)
- [x] `@frontend-specialist`: Refinamento de UI (`ProjectCockpit.tsx`)

**Plano de Execução:**
1.  **Backend**: Ajustar `mapper.ts` para capturar campos extras corretamente e corrigir duplicações.
2.  **Sync**: Atualizar `espaider-sync.ts` para mapear status do Espaider (`ANDAMENTO`, `INICIADO`) para `em_execucao`.
3.  **Frontend**: Atualizar interfaces TypeScript e componentes UI para exibir novos campos e reorganizar layout.

---

## 3. Execução & Alterações
**Arquivos Modificados:**
| Arquivo | Ação | Justificativa |
|---------|------|---------------|
| `src/integrations/espaider/mapper.ts` | Edit | Removida duplicação de `PRAZOFINAL`; garantido `DATAMOVIMENTACAO` em extras. |
| `src/lib/sync/espaider-sync.ts` | Edit | Mapeamento de status: `ANDAMENTO` -> `em_execucao` (Business Rule). |
| `src/lib/transformers/project.ts` | Edit | Adicionados campos `cronograma_atual`, `pasta_consultivo`, `aprovador_atual`, etc. |
| `src/app/projetos/projects-content.tsx` | Edit | Atualização de interfaces e legendas de status. |
| `src/components/project/ProjectCockpit.tsx` | Edit | Refinamento visual: remoção de badges, realocação de campos, correção de acentos. |

**Decisões Técnicas Críticas:**
- **Decisão:** Mapear múltiplos status do Espaider (Andamento, Iniciado, AndamentoAtraso) para um único status canônico `em_execucao`.
  - *Contexto:* O Espaider possui granularidade que não existia no Kanban simplificado.
  - *Consequência:* Visualização unificada no frontend, mas perde-se a distinção de "atraso" no status principal (pode ser visto nos detalhes).
- **Decisão:** Mover "Pasta Consultivo" para o cabeçalho do card/modal.
  - *Contexto:* Informação chave para identificação rápida do projeto jurídico.
  - *Consequência:* Melhor usabilidade para advogados/gestores.

---

## 4. Retrospectiva & Lições Aprendidas
**O que funcionou bem?**
- A estrutura de `extras` no sync permitiu adicionar campos sem migrações de banco de dados (`espaider_raw` JSONB).
- O uso de *transformers* centralizados facilitou a propagação dos dados para a UI.

**O que pode melhorar (Erro/Ineficiência)?**
- Havia uma duplicação de chave no array constant em `mapper.ts` que passou despercebida inicialmente.
- A documentação em Memory não estava sendo feita automaticamente a cada passo, exigindo esta correção manual.

**Contexto para Futuro:**
> Sempre verificar `mapper.ts` por chaves duplicadas ao adicionar novos campos. Manter o mapeamento de status sincronizado com as regras de negócio do Espaider.
