# Relatório Arquitetural e de Engenharia: Sincronização API Espaider (Full-Stack)

> **Data do Documento:** Março 2026
> **Escopo:** Fluxo completo da integração entre Portal tech-arauz e API Espaider (Módulo de Projetos / Consultivo).
> **Público-Alvo:** Engenheiros de Software, Arquitetos de Solução e **Agentes de Inteligência Artificial (AIOS)** atuando no repositório.

---

## 🏗️ 1. Visão Arquitetural de Alto Nível (360º)

A integração com o ERP Espaider é a espinha dorsal de dados do módulo de Projetos no portal. O sistema adota o padrão **ETL Assíncrono Orientado a Eventos Controlados**, garantindo que o banco de dados local (`Supabase PostgreSQL`) seja um espelho resiliente, performático e enriquecido da base original do Espaider.

A arquitetura foi desenhada para contornar limitações naturais de APIs legadas (limites de taxa, quedas intermitentes, lentidão na entrega de payloads grandes), blindando o frontend de qualquer gargalo externo.

---

## 🖥️ 2. Camada de Frontend (Triggers & UI)

A sincronização não opera por Webhooks (o Espaider não empurra os dados), ela é uma operação de **PULL** disparada ativamente pelas interfaces de usuário.

### 2.1. Server Actions (`app/actions/sync.ts`)
A função `syncEspaiderAction()` é o único portão de entrada para iniciar uma sincronização.
**Pipeline de Segurança & Trigger:**
1. Validada via Cookie Session (usuário logado no Supabase).
2. Resgata o `tenant_id` atrelado ao usuário que solicitou.
3. Checagem de RBAC (Role-Based Access Control): usuários com *role* `viewer` têm a execução bloqueada. Somente `admin` ou `user` podem engatilhar.
4. Invoca o núcleo de sincronização usando o cliente Supabase `service_role` (ignora as regras de RLS do PostgreSQL para injeções massivas em background).
5. Após o fim do ciclo ETL, invoca `revalidatePath('/dashboard')` e `revalidatePath('/projetos')` do Next.js (App Router) para purgar o cache do servidor e atualizar a tela em tempo real sem refresh para o usuário.

### 2.2. Onde a Sincronização é Disparada?
Agentes atualizando componentes devem buscar os botões de sync nos arquivos:
- `app/projetos/projects-content.tsx`
- `app/cronogramas/cronogramas-content.tsx`

---

## ⚙️ 3. Back-End Core: Engine de Sincronização

Mora na pasta `src/integrations/espaider/` (comunicação limpa) e `src/lib/sync/` (regras de banco e orquestração).

### 3.1. Cliente HTTP Resiliente (`client.ts`)
Responsável pelas requisições puras (`exportarDados` e `buscarFilhos`).
**O que Agentes de IA precisam saber:**
- Implementa um padrão de **Retry Exponencial**.
- Possui um **Circuit Breaker** embutido (abre o circuito após 5 falhas no espaço de 60s), impedindo de gerar sobrecarga na rede e estourar requisições em cascata.
- Tem a capacidade de varrer a paginação automática (`URLPaginacao`) do Espaider através de iterações do tipo GET até o retorno do payload estar vazio (segurança de estagnação limitada a 50 páginas).

### 3.2. Mapping & Parsing (`mapper.ts`)
O payload que vem do Espaider é um dicionário feio e genérico do tipo: `[{Identificador: 'CODIGO', Valor: '123'}]`.
A função `mapearRegistros` unifica essa bagunça em interfaces TypeScript perfeitamente tipadas (ex: `ProjetoMapeado`).
- O mapper injeta conversão embutida para Datas PT-BR.
- Resolve tipagens primitivas e lógicas boleanas oriundas do ERP (ex: Converter os status em texto solto para os slugs do Kanban: `aguardando_fornecedor`, `projeto_futuro`).

---

## 🗺️ 4. Fluxo de Orquestração (ETL PostgreSQL)

Localizado majoritariamente em `src/lib/sync/espaider-sync.ts`, utiliza o método de **Descoberta Hierárquica** associado num workflow Idempotente.

### Passo 1: Projetos (Root)
Busca dados raiz na `espaider_apis`. Realiza `upsert` na tabela principal: `projects`. A chave de conflito única fundamental do projeto é a constraint composita: `(tenant_id, espaider_id)`.

### Passo 2: Extração de Entidades Filhas (Relacionais)
Na resposta da API dos Projetos, o Espaider devolve uma coleção chamada `ListaURLFilhos`.
O script varre essas URLs, realiza matches textuais baseados em heurística textual (`descricaoToDataset`) para descobrir de qual entidade se trata, puxando e gravando via UUID correspondente as seguintes tabelas satélites:
- **`project_deliveries`**: Tabela de Entregas (`syncDeliveriesFromRegistros`).
- **`project_schedules`**: Tabela de Cronogramas (`syncSchedulesFromRegistros`).
- **`project_requirements`**: Tabela de Requisitos (`syncRequirementsFromRegistros`).
- **`project_histories`**: Histórico e Trâmites (registros imutáveis das ações efetuadas lá atrás no ERP).
- **`project_tempo_permanencia`**: Tempos em dias gastos por cada responsável/fase.
- **`project_budgets`** e **`project_approvers`**: Modeladas de acordo com as migrações SQL.

*Segurança do Relacionamento:* Se os registros filhos vierem no payload da API mas seu respectivo projeto-pai não tiver sido encontrado no banco de dados local da Arauz, ele se torna um "órfão" e a sincronização ignora de injetá-lo, emitindo apenas um _Warning_ na observabilidade, priorizando não quebrar o banco por Foreign Key Violations.

### Passo 3: Horas Lançadas (Endpoint Independente)
Diferente das tabelas filhas que vêm penduradas no endpoint primário de projetos, a sincronização do esforço e `Horas Lançadas` é uma chamada à parte executada no fim do pipeline (`syncHorasLancadas`).
Ele persiste os dados na nova tabela `project_horas_lancadas` da migração 054, baseando a amarração da entidade via:
1) Match no `espaider_id` numérico, e, na falta dele;
2) Match no slug `pasta_consultivo` contra a coluna correspondente no banco.

---

## 📊 5. Observabilidade, Logging e Transparência

Transparência total para o usuário é um requisito da Arauz na arquitetura de logs dessa integração.

### 5.1 O Sistema de Logs Duplos
Para rastrear cada byte que sai ou entra, o sistema alimenta duas camadas do banco (via funções `logSyncResult` e `persistLogEntries`):
1. **`sync_logs`**: Resumo de performance e sucesso (Ex: *Iniciou X, Terminou Y, Injetou 49 linhas, Levou 1.2s*).
2. **`integration_log_entries`**: A trilha detalhada técnica por microsserviço (Info, Warn, Error).

### 5.2 Apresentação Front-End (`LogViewer.tsx`)
O componente especializado localizado na seção de _Configurações > Integrações_.
- Reativo por completo (Escuta callbacks da tela `onSyncComplete` via variável React State `logViewerKey` provocando refresh no mesmo segundo que a sync acaba).
- Possui paginação remota, filtros por Nível (Erro, Alerta, Info), filtros pelo respectivo Dataset ("Apenas Cronogramas") e um debounce de input de Search pra consultas pontuais (chamando a Rota API `app/api/integracoes/logs/route.ts`).

---

## 🤖 6. Diretrizes para Agentes AIOS (Contexto Técnico)

Se você é um assistente LLM designado a atuar nos fluxos do Espaider, leia e observe religiosamente as seguintes diretrizes:

1. **Idempotência Constante**: NUNCA gere lógicas destrutivas nesse pipeline. As funções do `espaider-sync.ts` e de API estão desenhadas para rodarem quantas vezes o usuário clicar por hora, usando exclusivamente instruções `upsert` na tupla `[tenant_id, espaider_id]`.
2. **Ignorar RLS no Back, Honrar RLS no Front**: O job de Sincronização Server Side (ETL) precisa sempre carregar as injeções com um client bypass-RLS (`createServiceClient()`). As buscas para componentes front-end (ex: `projects-content.tsx` puxando relatórios para montar cards no Trello Kanban) precisam respeitar rigidamente os selects na API validando sempre o policy RLS do `user_tenant_id()`.
3. **Novos Campos e Parsing**: Se houver um novo campo nas tabelas do ERP, o fluxo inquebrável para incluí-lo é:
   - *Passo 1*: Adicionar a nova coluna na prop apropriada na tipagem `types.ts` do Espaider integration;
   - *Passo 2*: Colocar a extração robusta (e parse de Datas pt-BR ou Números Decimal Pt-Br) dentro do `mapper.ts`.
   - *Passo 3*: Gerar uma `migration.sql` espelhando a coluna na respectiva tabela do Supabase.
   - *Passo 4*: Acoplar o campo ao mapeamento Upsert dentro do worker pesado (o respectivo arquivo base ou satélite em `espaider-sync.ts`).
4. **Tratamento de Exceções**: Em caso de falha completa de conversão (null pointers ou payload corrompido), capture em blocos try-catch emitindo chamadas de `createLog()` e **siga rodando o próximo bloco** sem jogar exception explícito para o exterior que interrompa todo o Worker Node — O usuário final depende dos fluxos parciais garantidos para ver log no `LogViewer`.
