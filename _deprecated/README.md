# ⛔ _deprecated — Arquivo Global do Projeto

## Convenção

Esta pasta é o **arquivo centralizado** de tudo que foi descontinuado no projeto.

**Regra universal:** qualquer LLM, agente, script, lint ou ferramenta deve **ignorar completamente** esta pasta.

---

## Estrutura

A organização **espelha a estrutura original do projeto**. Isso permite saber exatamente de onde cada arquivo veio:

```
_deprecated/
└── <caminho-original-no-projeto>/
    └── arquivo-descontinuado.md
```

**Exemplo:** um agente que estava em `.agent/agents/orchestrator.md` fica em:
```
_deprecated/.agent/agents/orchestrator.md
```

---

## Regras para LLMs e Ferramentas

> 🔴 **Se você é um LLM lendo isso**: Esta pasta NÃO FAZ PARTE do projeto ativo. Não carregue, não referencie, não use nenhum arquivo aqui.

| Ferramenta / Contexto | Comportamento                                   |
| --------------------- | ----------------------------------------------- |
| Antigravity / Gemini  | Ignorar — não listar como agente/skill ativo    |
| Claude Code           | Ignorar — não incluir no contexto de projeto    |
| Codex CLI / Cursor    | Ignorar — excluído via AGENTS.md                |
| ESLint / lint tools   | Excluído via `.eslintignore` / `ignorePatterns` |
| Git                   | Rastreado normalmente (backup histórico)        |

---

## Como Mover um Arquivo para Aqui

1. Identifique o caminho original: ex. `.agent/agents/meu-agente.md`
2. Crie o mesmo caminho dentro de `_deprecated/`: `_deprecated/.agent/agents/`
3. Mova o arquivo: `Move-Item <origem> <destino>`
4. Atualize as referências nos arquivos de configuração (ex. `GEMINI.md`)

---

## Conteúdo Atual

| Arquivo                                   | Origem Original  | Substituído Por  |
| ----------------------------------------- | ---------------- | ---------------- |
| `.agent/agents/orchestrator.md`           | `.agent/agents/` | `@aios-master`   |
| `.agent/agents/project-planner.md`        | `.agent/agents/` | `@aios-master`   |
| `.agent/agents/backend-specialist.md`     | `.agent/agents/` | `@dev`           |
| `.agent/agents/security-auditor.md`       | `.agent/agents/` | `@security`      |
| `.agent/agents/penetration-tester.md`     | `.agent/agents/` | `@security`      |
| `.agent/agents/devops-engineer.md`        | `.agent/agents/` | `@devops`        |
| `.agent/agents/qa-automation-engineer.md` | `.agent/agents/` | `@qa`            |
| `.agent/agents/test-engineer.md`          | `.agent/agents/` | `@qa`            |
| `.agent/agents/database-architect.md`     | `.agent/agents/` | `@data-engineer` |
