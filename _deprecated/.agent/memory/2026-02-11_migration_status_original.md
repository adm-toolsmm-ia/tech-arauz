# 🧠 Memory Log: Migration & Protocol Alignment

> **Date:** 2026-02-11
> **Context:** Database Schema Update & UI Enhancement
> **Task Force:** @database-architect, @frontend-specialist, @orchestrator

## 1. Contexto (The Why)

O usuário solicitou que o card de projetos no frontend exibisse o status original vindo do Espaider ("Em Aprovação", "Em Homologação", etc.) ao invés da label normalizada ("em_aprovacao"). Além disso, o layout do card precisava de ajustes visuais (título no topo).

Isso exigiu:
1.  Alteração no banco de dados (`projects`) para armazenar o valor original.
2.  Atualização da lógica de sincronização (`espaider-sync.ts`).
3.  Atualização da interface do usuário (`ProjectCockpit.tsx`).

Durante o processo, identificou-se uma falha crítica no cumprimento dos protocolos de agência (`.agent`), especificamente na execução de migrações e registro de memória, que foi corrigida imediatamente.

## 2. Execução (The What)

### Database
- **Migration:** `008_add_project_status_original.sql` criada e aplicada via `npx supabase db push`.
- **Schema:** Adicionada coluna `status_original` (TEXT) na tabela `projects`.

### Backend (Sync)
- **Mapper:** Atualizado `mapearProjeto` e `DBProject` interface.
- **Sync Logic:** `syncProjects` agora persiste `p.status` (raw) em `status_original`.

### Frontend
- **Transformer:** `dbProjectToUI` mapeia `status_original`.
- **UI:** `ProjectCockpit` reestruturado para exibir Título/Código no header e usar `original_status` na seção "Situação Atual".

### Protocol Correction
- Identificada a necessidade de seguir estritamente `.agent/workflows/supabase-ops` e `memory-protocol.md`.
- Este arquivo de memória foi criado para compliance com a Fase 6 do Protocolo de Orquestração.

## 3. Justificativa (The Reason)

- **Status Original:** A normalização é útil para lógica de negócio (Kanban), mas o usuário precisa ver a terminologia exata do ERP Espaider para confiança nos dados.
- **Automated Migration:** O uso de scripts manuais (`.ps1`) falhou por dependência de ambiente. A solução via `npx supabase` demonstrou ser mais robusta e alinhada com as ferramentas Node.js do projeto.

## 4. Lições Aprendidas (The Learning)

1.  **Strict Protocol Adherence:** NUNCA ignorar `.agent/workflows`. Se existe um workflow definido (como `supabase-ops`), ele deve ser a única fonte de verdade.
2.  **Environment Dependencies:** Scripts PowerShell dependem de configuração global que pode não existir no ambiente do agente. Preferir ferramentas locais do projeto (`npm`, `npx`).
3.  **Memory is Mandatory:** Toda tarefa complexa DEVE terminar com este log. Sem ele, perde-se o contexto do "porquê".
