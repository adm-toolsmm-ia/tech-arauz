# Plano de Configuração de MCPs — Tech Arauz

**Objetivo:** Configurar os MCPs (Model Context Protocol) do projeto de forma correta e alinhada à engenharia e à arquitetura, com participação do **@architect** (Aria) e do **@aios-master** (Orion).

**Governança:** Add/remove/config de MCP é **EXCLUSIVO @devops**. Este plano define o *que* configurar e *como* validar; a execução em `.cursor/mcp.json` fica com @devops.

**Referências:**

- `.cursor/rules/mcp-usage.mdc` — quando usar cada MCP
- `.cursor/rules/project.mdc` — MCPs disponíveis e regras do projeto
- `.agent/skills/supabase-mcp/SKILL.md` — uso do MCP Supabase

---

## 1. Envolvimento dos Agentes

| Agente | Papel no plano |
|--------|----------------|
| **@architect (Aria)** | Decisões de arquitetura: quais MCPs fazem parte da stack, integração com Next.js/Supabase/LangGraph, critérios de uso e prioridade de ferramentas. Validação de que a configuração atende aos ADRs e ao design system. |
| **@aios-master (Orion)** | Orquestração: garantir que regras AIOS (Constituição, agent-authority, mcp-usage) estejam refletidas no plano. Alinhamento com tasks/workflows e com os agentes consumidores (dev, data-engineer, qa). |
| **@devops** | Execução: editar `.cursor/mcp.json`, adicionar/remover MCPs conforme aprovado. Não inventar MCPs fora deste plano. |

---

## 2. Estado Atual (Baseline)

Configuração em `.cursor/mcp.json` no momento do plano:

- **context7** — `npx -y @upstash/context7-mcp --api-key ${CONTEXT7_API_KEY}` (documentação de libs)
- **shadcn** — `npx shadcn@latest mcp` (componentes shadcn/ui)

**Supabase** — esperado pela skill `supabase-mcp` e por `project.mdc`, mas **não** está presente no `mcp.json` atual. Deve ser re-adicionado com `project_ref`.

**Browser** e **GitHub** — não configurados no projeto; opcionais conforme decisão do @architect.

---

## 3. Fases do Plano

### Fase 1 — Arquitetura e decisão (@architect)

**Responsável:** @architect (Aria)

**Entregas:**

1. **Lista de MCPs obrigatórios para o projeto**
   - Supabase (URL com `project_ref`) — banco, RLS, migrations, inspeção de schema
   - Context7 — documentação de libs (Next.js, React, Supabase, etc.)
   - Shadcn — design system (ADR-003), componentes shadcn/ui

2. **Lista de MCPs opcionais e critérios**
   - Browser (ex.: cursor-ide-browser ou Playwright): E2E, validação visual, testes de UI
   - GitHub: automação de PRs/issues/Actions no fluxo Story → PR → merge

3. **Regras de uso**
   - Prioridade: ferramentas nativas do Cursor (Read, Write, Grep, Glob, Shell) antes de MCP
   - MCP só para contexto externo: banco (Supabase), docs de lib (Context7), componentes (Shadcn), browser (se aprovado), GitHub (se aprovado)
   - Documentar em `mcp-usage.mdc` qualquer MCP novo aprovado

4. **Checklist de engenharia**
   - [ ] Config Supabase com `project_ref` (evitar permission denied)
   - [ ] Variáveis de ambiente: `CONTEXT7_API_KEY` opcional; nenhum secret no mcp.json
   - [ ] Shadcn compatível com `components.json` e custom registry (se houver)
   - [ ] Stack alinhada: Next.js 14, TypeScript, Supabase, Python/FastAPI, LangGraph

**Saída:** Documento de decisão (ou seção neste plano) com “MCPs aprovados” e “MCPs opcionais”, referenciável por @devops e @aios-master.

#### ✅ Decisão @architect (Aria) — 2026-02-24

**MCPs obrigatórios aprovados:**

| MCP | Justificativa |
|-----|---------------|
| **supabase** | Stack core: banco, RLS, migrations, inspeção de schema. project_ref `pybmawlwpmxshtccpqui` confirmado no codebase. |
| **context7** | Documentação de libs (Next.js, React, Supabase). `CONTEXT7_API_KEY` opcional; já documentado em `.env.example`. |
| **shadcn** | ADR-003 design system; componentes shadcn/ui. Compatível com `components.json`. |

**MCPs opcionais aprovados:**

| MCP | Justificativa | Decisão |
|-----|---------------|---------|
| **github** | Fluxo Story → PR → merge; `GITHUB_TOKEN` em `.env.example`. MCP oficial `@modelcontextprotocol/server-github`. | **Incluir** — usar `GITHUB_PERSONAL_ACCESS_TOKEN` (mesmo valor que `GITHUB_TOKEN`). |
| **browser** | E2E, validação visual. cursor-ide-browser pode ser built-in; config explícita não documentada. | **Não incluir** neste ciclo — avaliar em iteração futura. |

**Checklist de engenharia:** ✅ Supabase com project_ref; variáveis via env; Shadcn compatível; stack alinhada.

---

### Fase 2 — Alinhamento AIOS e regras (@aios-master)

**Responsável:** @aios-master (Orion)

**Entregas:**

1. **Conformidade com a Constituição e agent-authority**
   - Add/remove/config de MCP apenas @devops
   - Demais agentes são consumidores; não editam `.cursor/mcp.json`

2. **Regras e documentação atualizadas**
   - `.cursor/rules/mcp-usage.mdc` — lista e uso de cada MCP (incluindo os aprovados na Fase 1)
   - `.cursor/rules/project.mdc` — seção “MCPs Disponíveis” refletindo o estado alvo
   - Referência à skill `supabase-mcp` e ao fluxo de OAuth/reinício do Cursor quando aplicável

3. **Agentes consumidores**
   - Garantir que @dev, @data-engineer, @qa, @architect tenham referência clara a quais MCPs usar para que tarefa (ex.: schema → Supabase MCP; componentes → Shadcn; docs → Context7)

4. **Checklist de governança**
   - [ ] mcp-usage.mdc descreve todos os MCPs configurados
   - [ ] project.mdc não contradiz mcp-usage.mdc
   - [ ] Nenhuma instrução de “editar mcp.json” para agentes que não sejam @devops

**Saída:** Regras e docs consistentes; plano pronto para execução por @devops.

#### ✅ Aprovação @aios-master (Orion) — 2026-02-24

- `mcp-usage.mdc` atualizado com supabase, context7, shadcn, github
- `project.mdc` atualizado com os 4 MCPs
- Governança mantida: add/remove MCP exclusivo @devops
- Nenhuma instrução de editar mcp.json para agentes não-devops

---

### Fase 3 — Configuração e variáveis (@devops)

**Responsável:** @devops

**Pré-requisito:** Fases 1 e 2 concluídas (decisão do @architect e regras validadas pelo @aios-master).

**Entregas:**

1. **Editar `.cursor/mcp.json`**
   - Incluir **supabase** com URL: `https://mcp.supabase.com/mcp?project_ref=pybmawlwpmxshtccpqui` (ou project_ref correto do projeto)
   - Manter **context7** e **shadcn** conforme estado desejado
   - Se aprovado na Fase 1: adicionar entradas para **Browser** e/ou **GitHub** conforme documentação oficial do Cursor

2. **Variáveis de ambiente**
   - Garantir que `.env.example` documente `CONTEXT7_API_KEY` (opcional)
   - Não colocar secrets no `mcp.json`; usar variáveis de ambiente onde o Cursor as expanda

3. **Comunicação**
   - Informar ao time: “Reiniciar o Cursor após alteração no mcp.json”
   - Supabase: lembrar re-autenticação OAuth quando expirar

**Saída:** `.cursor/mcp.json` correto e documentado; time ciente do uso e do reinício.

#### ✅ Execução @devops — 2026-02-24

- `.cursor/mcp.json` atualizado: supabase, context7, shadcn, github
- `GITHUB_PERSONAL_ACCESS_TOKEN` adicionado em `.env.example`
- GitHub MCP sem `env` block (herda do processo; Cursor carrega `.env` ao iniciar)

---

### Fase 4 — Validação e smoke test

**Responsáveis:** @architect (validação de arquitetura) + @aios-master (validação de processo) + qualquer agente que use MCPs

**Checklist de validação:**

- [ ] **Supabase:** chamar `list_tables` (ou equivalente) via MCP; sem “permission denied”
- [ ] **Context7:** consultar documentação de uma lib (ex.: React) via MCP
- [ ] **Shadcn:** listar ou adicionar um componente via MCP
- [ ] **Browser** (se configurado): abrir aba, snapshot ou interação básica
- [ ] **GitHub** (se configurado): operação read-only (ex.: listar issues/PRs) conforme escopo aprovado
- [ ] **Regras:** `mcp-usage.mdc` e `project.mdc` refletem o estado final
- [ ] **Skill supabase-mcp:** fluxo “inspeção de schema via MCP antes de SQL” respeitado pelos agentes

**Saída:** Todos os itens acima verificados; plano considerado concluído.

---

## 4. Especificação Alvo do `.cursor/mcp.json` (Obrigatórios)

Após Fase 1 aprovada, o mínimo esperado para o projeto é:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=pybmawlwpmxshtccpqui"
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "${CONTEXT7_API_KEY}"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

- **project_ref** deve ser o ID do projeto Supabase do Tech Arauz (confirmar em Fase 1).
- MCPs opcionais (Browser, GitHub) serão adicionados por @devops somente se aprovados na Fase 1 e documentados na Fase 2.

---

## 5. Resumo de Responsabilidades

| Fase | Quem | O quê |
|------|------|--------|
| 1 | @architect | Decidir MCPs obrigatórios/opcionais, critérios de uso, checklist de engenharia |
| 2 | @aios-master | Alinhar regras AIOS, mcp-usage.mdc, project.mdc, agentes consumidores |
| 3 | @devops | Editar `.cursor/mcp.json`, env, comunicar reinício e OAuth |
| 4 | @architect + @aios-master + uso | Validar funcionamento e conformidade |

---

## 6. Próximos Passos

1. **@architect** executar Fase 1: emitir decisão (MCPs aprovados + opcionais) e checklist de engenharia.
2. **@aios-master** executar Fase 2: atualizar `mcp-usage.mdc` e `project.mdc` conforme decisão; validar governança.
3. **@devops** executar Fase 3: aplicar configuração em `.cursor/mcp.json` e variáveis.
4. Time executar Fase 4: smoke tests e confirmação de que engenharia e arquitetura estão corretas no projeto.

---

## 7. Execução Concluída — 2026-02-24

| Fase | Status | Observação |
|------|--------|------------|
| 1 @architect | ✅ Aprovado | Supabase, Context7, Shadcn obrigatórios; GitHub incluído; Browser não incluído |
| 2 @aios-master | ✅ Aprovado | mcp-usage.mdc e project.mdc atualizados |
| 3 @devops | ✅ Executado | `.cursor/mcp.json` com 4 MCPs; `GITHUB_PERSONAL_ACCESS_TOKEN` em `.env.example` |
| 4 Validação | ✅ Concluída | Todos os MCPs habilitados e validados (2026-02-24) |

**Validação Fase 4 (final):**

- ✅ **Supabase:** `list_tables` OK (14 tabelas; servidor `project-0-tech-arauz-supabase`)
- ✅ **Context7:** `resolve-library-id` e `query-docs` OK (servidor `project-0-tech-arauz-context7`)
- ✅ **Shadcn:** `get_project_registries` e `list_items_in_registries` OK (servidor `project-0-tech-arauz-shadcn`)
- ✅ **GitHub:** `search_repositories` OK (servidor `project-0-tech-arauz-github`)
- ✅ **Browser:** cursor-ide-browser disponível

**Nada mais a fazer** — configuração dos MCPs concluída.

---

## 8. Instruções pós-reinício — MCPs que não carregaram

Após o reinício, apenas **Shadcn** e **Browser** aparecem. Use os passos abaixo para ativar **Supabase**, **Context7** e **GitHub**.

### Supabase (não carregou)

1. Abra **Cursor Settings** (Ctrl+,) → **Tools & MCP**.
2. Verifique se o servidor **supabase** aparece na lista e se há erro (ícone de aviso).
3. Se houver erro ou “Not connected”:
   - Clique no servidor **supabase** e use a opção para **conectar / fazer login** (abre o browser para OAuth do Supabase).
   - Conclua o login no browser e autorize o projeto.
4. Reinicie o Cursor após o OAuth e teste de novo.
5. Se o Supabase não aparecer em Tools & MCP, confira se `.cursor/mcp.json` está no diretório do projeto (raiz do repositório) e contém a entrada `supabase` com a URL e `project_ref=pybmawlwpmxshtccpqui`.

### Context7 (não carregou)

1. O Cursor pode não expandir `${CONTEXT7_API_KEY}` ao rodar o comando; o processo pode receber a string literal e falhar.
2. **Opção A — usar sem key (modo básico):**  
   Remova o argumento `--api-key` da entrada do Context7 em `.cursor/mcp.json` (só `command` + `args` sem `--api-key`). O Context7 funciona em modo básico sem key.  
   Exemplo de `args`: `["-y", "@upstash/context7-mcp"]`.
3. **Opção B — garantir a variável no ambiente:**  
   Defina `CONTEXT7_API_KEY` nas variáveis de ambiente do **sistema** (Windows: Variáveis de ambiente do usuário) com o valor da key, reinicie o Cursor e mantenha `--api-key ${CONTEXT7_API_KEY}` no `mcp.json` se o Cursor expandir variáveis nesse contexto.
4. Verifique em **Tools & MCP** se o Context7 aparece após a alteração e reinício.

### GitHub (não carregou)

1. O servidor GitHub MCP espera a variável **`GITHUB_PERSONAL_ACCESS_TOKEN`** no ambiente do processo (não apenas `GITHUB_TOKEN`).
2. No seu **`.env`** na raiz do projeto, adicione (com o mesmo valor do token que você usa no GitHub):
   - `GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...` (mesmo valor que `GITHUB_TOKEN`, se já usar um token para CLI).
3. O Cursor nem sempre carrega o `.env` do projeto para os processos dos MCPs. Se após reiniciar o GitHub ainda não carregar:
   - Defina **GITHUB_PERSONAL_ACCESS_TOKEN** nas **variáveis de ambiente do sistema** (Windows: Configurações → Sistema → Sobre → Configurações avançadas → Variáveis de ambiente).
   - Reinicie o Cursor.
4. Em **Tools & MCP**, confira se o servidor **github** aparece e se não há erro de autenticação.

### Checklist rápido

- [ ] **Supabase:** OAuth feito em Settings → Tools & MCP; reinício; servidor “supabase” visível e conectado.
- [ ] **Context7:** Ajuste em `mcp.json` (sem `--api-key`) ou `CONTEXT7_API_KEY` no ambiente do sistema; reinício; servidor visível.
- [ ] **GitHub:** `GITHUB_PERSONAL_ACCESS_TOKEN` no `.env` e/ou nas variáveis de ambiente do sistema; reinício; servidor “github” visível.

---

*Documento criado para garantir que a configuração de MCPs esteja alinhada ao @architect (engenharia/arquitetura) e ao @aios-master (orquestração e regras AIOS). Última atualização: 2026-02-24.*
