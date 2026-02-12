# GEMINI.md - Instruções para Gemini (Antigravity)

> **Este projeto opera sob um sistema de governança de agentes em `.agent/`.**

---

## 🚨 PROTOCOLO CRÍTICO: AGENTES & SKILLS (LEIA PRIMEIRO)

> **OBRIGATÓRIO:** Você DEVE ler o arquivo do agente apropriado e suas skills ANTES de realizar qualquer implementação. Esta é a regra de maior prioridade.

### 1. Protocolo de Carregamento Modular de Skills

Agente ativado → Verificar frontmatter "skills:" → Ler SKILL.md (INDEX) → Ler seções específicas.

- **Leitura Seletiva:** NÃO leia TODOS os arquivos em uma pasta de skill. Leia `SKILL.md` primeiro, depois apenas as seções que correspondem à solicitação do usuário.
- **Prioridade de Regras:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). Todas as regras são vinculativas.

### 2. Protocolo de Aplicação

1. **Quando o agente é ativado:**
    - ✅ Ativar: Ler Regras → Verificar Frontmatter → Carregar SKILL.md → Aplicar Tudo.
2. **Proibido:** Nunca pule a leitura das regras do agente ou instruções de skill. "Ler → Entender → Aplicar" é obrigatório.

---

## 📥 CLASSIFICADOR DE SOLICITAÇÃO (ETAPA 1)

**Antes de QUALQUER ação, classifique a solicitação:**

| Tipo de Solicitação | Palavras-chave de Gatilho | Tiers Ativos | Resultado |
| :--- | :--- | :--- | :--- |
| **PERGUNTA** | "o que é", "como funciona", "explique" | APENAS TIER 0 | Resposta em Texto |
| **LEVANTAMENTO/INTEL** | "analisar", "listar arquivos", "visão geral" | TIER 0 + Explorer | Intel de Sessão (Sem Arquivo) |
| **CÓDIGO SIMPLES** | "corrigir", "adicionar", "alterar" (arquivo único) | TIER 0 + TIER 1 (lite) | Edição Inline |
| **CÓDIGO COMPLEXO** | "construir", "criar", "implementar", "refatorar" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Obrigatório** |
| **DESIGN/UI** | "design", "UI", "página", "dashboard" | TIER 0 + TIER 1 + Agent | **{task-slug}.md Obrigatório** |
| **COMANDO SLASH** | /create, /orchestrate, /debug | Fluxo específico do comando | Variável |

---

## 🤖 ROTEAMENTO DE AGENTE INTELIGENTE (ETAPA 2 - AUTO)

**SEMPRE ATIVO: Antes de responder a QUALQUER solicitação, analise e selecione automaticamente o(s) melhor(es) agente(s).**

> 🔴 **OBRIGATÓRIO:** Você DEVE seguir o protocolo definido em `@[skills/intelligent-routing]`.

### Protocolo de Auto-Seleção

1. **Analisar (Silencioso)**: Detectar domínios (Frontend, Backend, Segurança, etc.) da solicitação do usuário.
2. **Selecionar Agente(s)**: Escolher o(s) especialista(s) mais apropriado(s).
3. **Informar Usuário**: Declarar concisamente qual experiência está sendo aplicada.
4. **Aplicar**: Gerar resposta usando a persona e regras do agente selecionado.

### Formato de Resposta (OBRIGATÓRIO)

Ao aplicar automaticamente um agente, informe o usuário:

```markdown
🤖 **Aplicando conhecimento de `@[nome-do-agente]`...**

[Continue com a resposta especializada]
```

---

## TIER 0: REGRAS UNIVERSAIS (Sempre Ativas)

### 🌐 Tratamento de Idioma

Quando o prompt do usuário NÃO estiver em Inglês:

1. **Traduzir internamente** para melhor compreensão.
2. **Responder e criar ARTEFATOS no idioma do usuário** - corresponda à comunicação (Português do Brasil).
3. **Comentários/variáveis de código** permanecem em Inglês.

### 🧹 Clean Code (Obrigatório Global)

**TODO código DEVE seguir as regras de `@[skills/clean-code]`. Sem exceções.**

### 📁 Consciência de Dependência de Arquivo

**Antes de modificar QUALQUER arquivo:**

1. Verifique `CODEBASE.md` → Dependências de Arquivo.
2. Identifique arquivos dependentes.
3. Atualize TODOS os arquivos afetados juntos.

### 🧠 Ler → Entender → Aplicar

```
❌ ERRADO: Ler arquivo do agente → Começar a codificar
✅ CORRETO: Ler → Entender O PORQUÊ → Aplicar PRINCÍPIOS → Codificar
```

---

## TIER 1: REGRAS DE CÓDIGO (Ao Escrever Código)

### 🛑 Portão Socrático (Socratic Gate)

**OBRIGATÓRIO: Toda solicitação de usuário deve passar pelo Portão Socrático antes de QUALQUER uso de ferramenta ou implementação.**

| Tipo de Solicitação | Estratégia | Ação Necessária |
| :--- | :--- | :--- |
| **Novo recurso / Build** | Descoberta Profunda | PERGUNTAR no mínimo 3 perguntas estratégicas |
| **Edição de Código / Bug Fix** | Verificação de Contexto | Confirmar entendimento + perguntar impacto |
| **Vago / Simples** | Clarificação | Perguntar Propósito, Usuários e Escopo |

### 🏁 Protocolo de Checklist Final

**Gatilho:** Quando o usuário diz "son kontrolleri yap", "verificações finais", "execute todos os testes", ou frases similares.

Execute: `python .agent/scripts/checklist.py .`

---

## REGRAS ESPECÍFICAS DO PROJETO (De CLAUDE.md)

### 1. Supabase
- **SEMPRE** definir RLS policies ao criar tabelas.
- Usar `get_user_tenant_id()` e `get_user_role()`.
- Migrations em `supabase/migrations/`.

### 2. Espaider
- API: `BI_SOLICITACOES_SUPORTEESPAIDER`.
- Validar dados externos para null/undefined.
- Logs em `integration_log_entries`.

### 3. Logs de Memória (Pós-Implementação)

**Após implementações significativas**, você DEVE:
1. Criar log em `.agent/memory/YYYY-MM-DD_{task-slug}.md`.
2. Seguir template `.agent/memory/TEMPLATE.md`.
3. Documentar: contexto, decisões, arquivos alterados, lições aprendidas.

---

## RESUMO DE EXECUÇÃO

```
┌─────────────────────────────────────────────────────┐
│  OBRIGATÓRIO:                                       │
│  1. Ler GEMINI.md e seguir regras do Agente/Skill   │
│  2. Passar pelo Portão Socrático antes de codar     │
│  3. Seguir protocolos de .agent/workflows/          │
│  4. Criar memory log após implementações            │
├─────────────────────────────────────────────────────┤
│  PROJETO:                                           │
│  - RLS no Supabase sempre                           │
│  - APIs Espaider com validação e logs               │
└─────────────────────────────────────────────────────┘
```
