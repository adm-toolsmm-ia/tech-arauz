---
doc-id: CLAUDE-V01-10
title: Fluxos Ponta a Ponta
scope: 12 fluxos fim-a-fim cobrindo sync, dashboards, admin e operacional
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [05-espaider-integration, 06-feature-map, 09-routines-catalog]
---

# Fluxos Ponta a Ponta

> Cada fluxo possui um ID estável (F-###) para referência cruzada.

Relacionado: [[09-routines-catalog]] (rotinas referenciadas), [[06-feature-map]] (módulos), [[05-espaider-integration]] (pipeline Espaider)

---

## F-001: Sincronização Completa Espaider → Portal

**Narrativa**: Importação de projetos e filhos do Espaider para o portal.

```
Ator: Admin (manual) ou pg_cron (automático)
   │
   ▼
1. Admin clica "Sincronizar" na API card (/apis)
   OU pg_cron dispara schedule
   │
   ▼
2. Frontend chama useSyncApi → POST /functions/v1/sync-espaider
   Body: { api_id: uuid }
   │
   ▼
3. Edge function carrega config da API (tabela apis)
   ├── Valida: token, url_base, tipo_autenticacao
   └── Cria log_execucao (status: "em_andamento") — R-001
   │
   ▼
4. Fetch principal: POST url_base com auth headers
   ├── Loop de paginação (URLPaginacao)
   └── Coleta ListaURLFilhos
   │
   ▼
5. Fetch filhos: GET cada URL de ListaURLFilhos — R-002, R-003, R-004
   ├── Detecta tipo (entrega/cronograma/requisito)
   └── Extrai IDREGISTROPAI
   │
   ▼
6. Normalização: aliases (135+), datas BR→ISO, status normalization — R-006
   │
   ▼
7. UPSERT projetos (onConflict: id_espaider)
   │
   ▼
8. Link filhos aos pais (mapa id_espaider→projeto_id) — R-007
   ├── UPSERT entregas_projeto
   ├── UPSERT cronogramas_projeto
   └── UPSERT requisitos_projeto
   │
   ▼
9. Atualiza apis.ultima_sincronizacao
   │
   ▼
10. Finaliza log_execucao com métricas
    │
    ▼
11. Frontend recebe resultado → invalidateQueries(['projetos', 'apis'])
    │
    ▼
12. Toast de sucesso/erro via Sonner
```

**Decisões**: Deduplicação em memória por id_espaider. Filhos órfãos são logados, não salvos.
**Falhas**: Retry 3x para erros de rede. Erro 4xx aborta. Ver [[05-espaider-integration]]
**Referências**: [ref: supabase/functions/sync-espaider/index.ts], [ref: src/features/admin/apis/hooks/useApis.ts]
**Confiança**: Alta

---

## F-002: Visualização de Dashboard com Drill-Down

**Narrativa**: Usuário acessa dashboard, visualiza KPIs e faz drill-down por status.

```
Ator: Qualquer usuário autenticado
   │
   ▼
1. Navega para / (Dashboard Geral)
   │
   ▼
2. useDashboardStats(period) executa — R-008
   ├── Busca status IDs (lookup)
   ├── 7 queries paralelas para contagens
   └── Calcula tempo médio de resolução
   │
   ▼
3. Renderiza KPI cards com valores
   ├── useSolicitacoesPorDia → gráfico de tendência
   ├── useSolicitacoesPorTipo → pie chart
   └── useSolicitacoesPorPrioridade → pie chart
   │
   ▼
4. Usuário clica em KPI card (ex: "Em Atendimento")
   │
   ▼
5. useSolicitacoesByStatus("em andamento")
   ├── Resolve status.id por nome (ilike)
   └── Busca solicitações com joins (status, prioridade, tipo, area)
   │
   ▼
6. Exibe lista filtrada de solicitações
   │
   ▼
7. Usuário altera período (7days → 30days)
   │
   ▼
8. Query key muda → TanStack Query refetch automático
```

**Referências**: [ref: src/features/dashboard/hooks/useDashboardStats.ts], [[07-dashboard-kpis]]
**Confiança**: Alta

---

## F-003: Gestão de Projeto no Kanban

**Narrativa**: Usuário visualiza projetos no Kanban e altera etapa.

```
Ator: Usuário autenticado
   │
   ▼
1. Navega para /solicitacoes/projetos
   │
   ▼
2. useProjetos() carrega todos os projetos com joins (status, etapa_kanban)
   useProjetosEtapasKanban() carrega colunas do kanban
   │
   ▼
3. ProjetoKanbanBoard renderiza colunas por etapa
   Cada card mostra: titulo, codigo_espaider, status badge, prioridade badge
   │
   ▼
4. Usuário aplica filtros (busca, status, prioridade, tipo_assunto)
   │
   ▼
5. Lista filtrada atualiza cards visíveis
   │
   ▼
6. Usuário move projeto para outra etapa (ex: Backlog → Em Análise)
   │
   ▼
7. useUpdateProjetoEtapa mutation
   ├── UPDATE projetos SET etapa_kanban_id = nova_etapa WHERE id = projeto_id
   └── invalidateQueries(['projetos'])
   │
   ▼
8. Kanban re-renderiza com projeto na nova coluna
```

**Referências**: [ref: src/features/projetos/]
**Confiança**: Alta

---

## F-004: Configuração de Nova API

**Narrativa**: Admin configura nova integração com API externa.

```
Ator: Admin
   │
   ▼
1. Navega para /apis
   │
   ▼
2. Clica "Nova API" → FormDialog abre
   │
   ▼
3. Preenche: Nome, Tipo (espaider), URL Base, Token, Auth Type, Recurso, Identificador
   │
   ▼
4. Submit → useCreateApi mutation
   ├── INSERT INTO apis (nome, tipo, url_base, token, tipo_autenticacao, ...)
   └── invalidateQueries(['apis'])
   │
   ▼
5. Card da nova API aparece no grid
   │
   ▼
6. Admin clica "Testar" → F-005
```

**Referências**: [ref: src/features/admin/apis/]
**Confiança**: Alta

---

## F-005: Teste de Conexão API

**Narrativa**: Admin testa se uma API está acessível.

```
Ator: Admin
   │
   ▼
1. Na página /apis, clica "Testar" no card da API
   │
   ▼
2. useTestApiConnection mutation
   ├── POST /functions/v1/test-api { api_id }
   └── Edge function: carrega config, faz request mínimo
   │
   ▼
3. Resultado:
   ├── Sucesso → Toast verde "Conexão OK"
   └── Erro → Toast vermelho com mensagem
```

**Referências**: [ref: supabase/functions/test-api/]
**Confiança**: Alta

---

## F-006: Login e Autorização por Role

**Narrativa**: Usuário faz login e sistema aplica permissões por role.

```
Ator: Qualquer usuário
   │
   ▼
1. Acessa /auth
   │
   ▼
2. Digita email (ou username → @arauz.com.br auto-append) + senha
   │
   ▼
3. AuthContext.signIn → supabase.auth.signInWithPassword
   │
   ▼
4. Sucesso:
   ├── Session + User armazenados no contexto
   ├── onAuthStateChange listener ativo
   └── Redirect para / (Dashboard)
   │
   ▼
5. ProtectedRoute verifica session
   ├── Autenticado → renderiza MainLayout com Outlet
   └── Não autenticado → redirect /auth
   │
   ▼
6. RLS no Supabase aplica políticas por role:
   ├── viewer: SELECT em tabelas básicas
   ├── user: SELECT + UPDATE limitado
   └── admin: ALL operations + views sensíveis
```

**Referências**: [ref: src/contexts/AuthContext.tsx], [[12-security-rbac]]
**Confiança**: Alta

---

## F-007: Visualização de Detalhes do Projeto

**Narrativa**: Usuário abre detalhes de um projeto com abas.

```
Ator: Usuário autenticado
   │
   ▼
1. No Kanban ou Lista, clica em um card de projeto
   │
   ▼
2. ProjetoDetailSheet abre (Sheet lateral)
   │
   ▼
3. Tab "Detalhes":
   ├── useProjeto(id) → dados do projeto com joins
   ├── Exibe: responsável, assunto, prazo, movimentação, metadata
   └── Status badge com cor, prioridade badge com cor
   │
   ▼
4. Tab "Entregas":
   ├── useEntregasProjeto(id)
   └── Cards com: titulo, status, data_prevista, data_conclusao
   │
   ▼
5. Tab "Cronograma":
   ├── useCronogramasProjeto(id)
   └── Cards com: titulo, data_inicio, data_fim, progresso (%), responsavel
   │
   ▼
6. Tab "Requisitos":
   ├── useRequisitosProjeto(id)
   └── Cards com: titulo, tipo, prioridade, status
```

**Referências**: [ref: src/features/projetos/components/ProjetoDetailSheet.tsx]
**Confiança**: Alta

---

## F-008: Execução Manual de Sincronização

**Narrativa**: Admin dispara sync manualmente para uma API específica.

```
Ator: Admin
   │
   ▼
1. Na página /apis, clica "Sincronizar" no card de uma API tipo "espaider"
   │
   ▼
2. useSyncApi mutation → POST /functions/v1/sync-espaider { api_id }
   │
   ▼
3. Execução completa do pipeline F-001 (steps 3-12)
   │
   ▼
4. Resultado exibido via toast
   │
   ▼
5. invalidateQueries(['projetos', 'solicitacoes', 'apis'])
```

**Referências**: [ref: src/features/admin/apis/hooks/useApis.ts]
**Confiança**: Alta

---

## F-009: Monitoramento de Health das Integrações

**Narrativa**: Usuário monitora saúde das integrações no Dashboard Tecnologia.

```
Ator: Qualquer usuário autenticado
   │
   ▼
1. Navega para /dashboard/tecnologia
   │
   ▼
2. useTechDashboardStats → R-010 (KPI-011 a KPI-014)
   │
   ▼
3. useIntegrationStatus → uptime por API
   │
   ▼
4. useRecentSyncLogs → últimos 5 logs (auto-refresh 30s)
   │
   ▼
5. Cards exibem: APIs ativas, syncs hoje, erros 24h, uptime médio
   │
   ▼
6. Lista de APIs com uptime individual e última sync
```

**Referências**: [ref: src/features/dashboard/hooks/useIntegrationStatus.ts]
**Confiança**: Alta

---

## F-010: Gestão de Solicitações

**Narrativa**: Usuário visualiza e filtra solicitações em diferentes views.

```
Ator: Usuário autenticado
   │
   ▼
1. Navega para /solicitacoes (hub) ou painel específico
   │
   ▼
2. useSolicitacoes() carrega dados com joins
   │
   ▼
3. View Kanban: colunas por etapa_kanban
   View Lista: DataTable com ordenação e busca
   │
   ▼
4. Filtros: status, prioridade, tipo, busca textual
   │
   ▼
5. Click em solicitação → Sheet de detalhes com:
   ├── Informações gerais
   ├── Entregas
   ├── Cronogramas
   ├── Requisitos
   └── Interações
```

**Referências**: [ref: src/features/solicitacoes/]
**Confiança**: Alta

---

## F-011: Consulta de Logs de Execução

**Narrativa**: Admin visualiza logs detalhados de sincronizações.

```
Ator: Admin (detalhes completos) ou User (sanitizado)
   │
   ▼
1. Navega para /logs
   │
   ▼
2. Query: logs_execucao (admin) ou logs_execucao_safe (não-admin)
   │
   ▼
3. Tabela com: status, tarefa, registros processados, duração, data
   │
   ▼
4. Click em linha → expande detalhes:
   ├── Admin: JSON completo (detalhes), mensagem_erro
   └── User: apenas métricas numéricas, sem dados sensíveis
```

**Referências**: [ref: src/features/logs/], [[12-security-rbac]]
**Confiança**: Alta

---

## F-012: Agendamento de Sync via Cron

**Narrativa**: Configuração de sincronização automática periódica.

```
Ator: Admin
   │
   ▼
1. Navega para /tarefas ou /automacoes
   │
   ▼
2. Configura tarefa de sincronização:
   ├── Nome, descrição
   ├── API vinculada (api_id)
   ├── Frequência (diario/semanal/mensal)
   ├── Horário e timezone (America/Sao_Paulo)
   ├── Cron schedule (ex: "0 6 * * *" = 6h diário)
   └── Ativo: true/false
   │
   ▼
3. pg_cron lê schedule e dispara edge function no horário
   │
   ▼
4. Execução segue pipeline F-001
   │
   ▼
5. Resultado registrado em logs_execucao
```

**Referências**: [ref: supabase/migrations/20260119210400_sync_cron.sql], [[13-jobs-scheduling]]
**Confiança**: Média (jobs estão `ativo=false` por padrão)

---

## Decisões Pendentes

> [!question] Q-FLOW-001: Fluxo de notificação pós-sync
> Atualmente F-001 termina com um toast. Não há notificação para outros usuários online. Considerar broadcast via Supabase Realtime ou WebSocket.

> [!question] Q-FLOW-002: Fluxo de criação manual de projeto
> Não existe fluxo para criar projetos manualmente (sem Espaider). Necessário para projetos internos que não estão no ERP? Ver [[17-prd-seed]].
