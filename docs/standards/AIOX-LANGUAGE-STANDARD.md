# AIOX Language Standard — Tech Arauz

**Data:** 2026-03-13
**Status:** ATIVO
**Aplicável a:** Todos os agentes Claude Code

---

## 📋 Regra Fundamental

### ✅ OBRIGATORIO: Responder SEMPRE em Português

Todos os agentes AIOX (dev, qa, sm, po, architect, data-engineer, ux-design-expert, analyst, devops, aiox-master) devem:

- **SEMPRE** comunicar em português brasileiro
- **NUNCA** usar inglês em respostas para o usuário
- **SEMPRE** manter termos técnicos no idioma original (ex: "CI/CD", "TypeScript", "Supabase")
- **SEMPRE** traduzir títulos, descrições e mensagens para português

---

## 🎯 Aplicação Prática

### Permitido (Termos Técnicos em Inglês)
```
✅ "Vou criar um componente React"
✅ "Execute npm run dev"
✅ "Ative o Storybook"
✅ "TypeScript strict mode habilitado"
✅ "Integração com Supabase RLS"
```

### Não Permitido (Respostas em Inglês)
```
❌ "I'll create a React component"
❌ "Ready for development"
❌ "All stories approved"
```

### Esperado (Português Completo + Termos Técnicos)
```
✅ "Vou criar um componente React para o Kanban"
✅ "Pronto para desenvolvimento. As 10 stories foram aprovadas"
✅ "Integração com Supabase RLS validada"
```

---

## 📝 Exemplos de Tradução

| Inglês | Português | Contexto |
|--------|-----------|----------|
| Story | História/Estória | "5 histórias criadas" |
| Epic | Épico | "ÉPICO 5 Foundation" |
| Task | Tarefa | "Tarefa 1: Criar índices" |
| Acceptance Criteria | Critérios de Aceitação | "AC-001: Índices criados" |
| Ready for Review | Pronto para Revisão | "Estória pronta para revisão" |
| Approved | Aprovado | "10/10 histórias aprovadas" |
| Owner | Proprietário/Responsável | "Responsável: Dara (@data-engineer)" |
| Blocked By | Bloqueado por | "Bloqueado por: Estória 5.2" |
| In Progress | Em Progresso | "Status: Em Progresso" |
| Complete | Completo/Concluído | "Sprint 3: Completo" |

---

## 🔧 Implementação no Padrão AIOX

### Arquivo de Configuração
**Localização:** `.claude/CLAUDE.md`
**Seção:** Language Configuration
**Prioridade:** NON-NEGOTIABLE (como Constitution Artigo I)

### Adição ao CLAUDE.md

```markdown
## Language Configuration

### Linguistic Standard
- **PRIMARY LANGUAGE:** Português Brasileiro (pt-BR)
- **REQUIREMENT LEVEL:** MANDATORY (Non-Negotiable)
- **SCOPE:** All agent communications with user
- **EXCEPTION:** Technical terms remain in original language (English)

### Rule
All responses from any AIOX agent must be in Portuguese.
Responses in other languages are non-compliant with this standard.

**Rationale:** User preference for Portuguese communication; consistency across all agents.
```

---

## ✅ Validação

Cada agente AIOX deve validar antes de responder:

```
□ Estou respondendo em português?
□ Termos técnicos estão em inglês (apropriado)?
□ Mensagens estão completas e claras?
□ Sem mistura de português e inglês na mesma frase?
```

---

## 🚨 Regra de Compliance

**Se violar esta regra:**
1. Interrupção da resposta
2. Reinício em português
3. Documentação da violação
4. Correção automática nos próximos turnos

---

## 📌 Aplicação Imediata

**A partir de:** 2026-03-13
**Válido para:** Todas as respostas futuras
**Quem valida:** Usuário pode solicitar correção a qualquer momento

---

*AIOX Language Standard v1.0*
*Tech Arauz — Padrão de Comunicação Português*
*Framework: Synkra AIOX*
