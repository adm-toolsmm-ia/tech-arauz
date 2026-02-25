---
description: Protocolo oficial de ciclo de vida de demandas complexas gerenciadas pelo @aios-master (Orion).
---

# 🎻 Orchestration Protocol (The CTO Workflow)

> **Objective:** Garantir entrega consistente e de alta qualidade através de coordenação estruturada de agentes, com `@aios-master` sempre como primeiro ponto de contato.

---

## 🚪 Porta de Entrada Obrigatória

**TODO pedido complexo começa aqui:**

```
Você → @aios-master → analisa → monta equipe → especialistas executam → plano de ação conjunto
```

> ⚠️ **Regra:** Nenhum agente especialista é acionado diretamente sem passar pelo `@aios-master` em tarefas complexas. Para tarefas simples (ex: "corrige esse bug"), acionar o agente diretamente é permitido.

---

## 🔄 Ciclo de Vida de uma Demanda

### Fase 1: Recepção (O Porteiro)
**Agente:** `@aios-master`

1. **Receber:** Analisar o pedido do usuário.
2. **Verificar memória:** `ls .agent/memory/` → ler logs relevantes.
   - *Pergunta:* "Já resolvemos isso antes? O que deu errado da última vez?"
3. **Viabilidade:** Conseguimos fazer com as ferramentas/skills atuais?
4. **Montar equipe:** Definir quais agentes são necessários para este pedido.

### Fase 2: Estratégia (O Arquiteto)
**Agentes:** `@aios-master` + `@architect` (se necessário)

1. **Rascunho do plano:** Criar/atualizar `task.md` ou `implementation_plan.md`.
2. **Montar Task Force:** Definir os agentes envolvidos.
   - *Exemplo:* "Feature de relatórios" = `@pm` (PRD) + `@dev` (implementação) + `@qa` (testes) + `@devops` (deploy)
3. **Apresentar plano ao usuário** antes de executar.

### Fase 3: Execução (O Maestro)
**Agentes:** `@aios-master` coordenando os especialistas

1. **Despacho:** Enviar prompts claros para os especialistas.
   - ✅ *Faça:* "@frontend, atualiza o componente Button com TypeScript estrito."
   - ❌ *Não faça:* "Conserta o botão."
2. **Monitorar:** Acompanhar outputs. Se um agente travar, intervir.
3. **Síntese:** Combinar os resultados em uma solução coesa.

### Fase 4: Validação (O Auditor)
**Agentes:** `@aios-master` + `@security` + `@qa`

1. **Análise estática:** Lint, Type Check.
2. **Revisão de segurança:** Inputs sanitizados? Segredos protegidos? RLS ativo?
3. **Aceite do usuário:** Atende ao pedido original?

### Fase 5: Documentação (O Bibliotecário)
**Agente:** `@pm` ou `@architect`

1. **Verificar contexto:** Diretórios alterados têm `README.md`?
2. **Atualizar docs:** `PRD.md`, `API.md` ou `ARCHITECTURE.md` se a lógica de negócio mudou.
3. **Validação:** Docs batem com o código novo?

### Fase 6: Memória (O Historiador)
**Agente:** `@aios-master`

1. **Criar log:** `.agent/memory/YYYY-MM-DD_{contexto}.md`.
2. **Refletir:** O que aprendemos? O que deve ser atualizado em `ARCHITECTURE.md`?

---

## 🧩 Matriz de Montagem de Equipe

| Tipo de Demanda            | Task Force Mínima                            |
| -------------------------- | -------------------------------------------- |
| Nova feature completa      | `@pm` + `@dev` + `@qa` + `@devops`           |
| Feature com banco de dados | +`@data-engineer`                            |
| Feature com UI             | +`@frontend`                                 |
| Auditoria de segurança     | `@security` + `@qa`                          |
| Refatoração grande         | `@architect` + `@dev` + `@qa`                |
| Deploy / publicação        | `@devops` (único autorizado para `git push`) |
| Onboarding de feature nova | `@pm` + `@sm` → cria story → `@dev`          |

---

## 🚨 Protocolos de Emergência

- **Agente falha 3x:** Parar. Reavaliar estratégia com `@aios-master`.
- **Contexto muito grande:** Dividir e pedir ao usuário para proceder em etapas.
- **Conflito arquitetural:** Se o usuário pedir algo que viola `constitution.md`, informar educadamente mas firmemente — e não implementar.
