---
description: Protocolo obrigatório para registro de memória de longo prazo das operações dos agentes.
---

# 🧠 Protocolo de Memória de Agentes (Agent Memory Protocol)

> **Objective:** Generate a persistent audit trail of agent decisions, actions, and lessons learned to improve future context and prevent regression.

## Quando usar?
Este protocolo deve ser executado **SEMPRE** que:
1. Uma "Força Tarefa" de múltiplos agentes for acionada.
2. Uma mudança arquitetural significativa for realizada.
3. Uma refatoração complexa ou correção de bug crítico for aplicada.
4. Uma auditoria ou análise de projeto for solicitada.

## O Processo

### 1. Inicialização (Pre-Work)
O `@orchestrator` ou agente responsável deve:
- Ler o histórico recente em `.agent/memory/`.
- Identificar se já existem soluções para problemas similares.

### 2. Execução
Realizar as tarefas conforme planejado, mantendo registro mental (ou temporário) das decisões chave.

### 3. Registro (Post-Work)
Ao finalizar a tarefa, o agente **DEVE** criar um arquivo Markdown em `.agent/memory/` seguindo o padrão de nomenclatura:
`YYYY-MM-DD_{task-slug}.md`

Usar o template `.agent/memory/TEMPLATE.md` para preencher:
- **Contexto:** O que e por quê.
- **Execução:** Quem fez e o que foi alterado.
- **Justificativa:** Por que mudamos X e não Y.
- **Lições:** O que aprendemos para não errar na próxima.

## Benefícios
- **Rastreabilidade:** CTO/Humanos podem auditar *por que* um código foi mudado.
- **Contexto Infinito:** Agentes futuros podem ler logs passados para entender "Chesterton's Fence" (por que essa cerca está aqui?).
- **Evolução Contínua:** Erros documentados aqui não devem se repetir.
