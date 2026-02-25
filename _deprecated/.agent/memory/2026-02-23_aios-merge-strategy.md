# Estratégia de Merge AIOS — GitHub ← → Local

**Data:** 2026-02-23
**Objetivo:** Mescla inteligente GitHub (fonte de verdade) + Local (melhorias contextuais)

---

## 1. Análise Comparativa — Repos

### GitHub SynkraAI/aios-core (Verdade)
- **Agentes:** 12
  - aios-master, analyst, architect, data-engineer, dev, devops, pm, po, qa, sm, squad-creator, ux-design-expert
- **Tasks:** 203
- **Constitution:** v1.0.0
- **Status:** Especialista, consolidado

### Local tech-arauz (Melhorias)
- **Agentes:** 15 (12 base + 3 novos)
  - + frontend.md (Pixel)
  - + mobile.md (Zion)
  - + security.md (Shade)
- **Tasks:** ~206 (203 base + 3 novas)
- **Constitution:** v1.0.0 (idêntico)
- **Status:** Enriquecido com especialidades

---

## 2. Classificação de Arquivos

### CATEGORIA A: "Puxar do GitHub" (GitHub → Local)
Se GitHub tem versão mais recente ou melhor:

| Arquivo | GitHub | Local | Ação |
|---------|--------|-------|------|
| constitution.md | v1.0.0 | v1.0.0 | ✅ Keep local (idêntico) |
| core-config.yaml | ? | v2.1.0 | 🔄 Comparar e merge configs |
| 12 agentes base | ✅ | ✅ | ✅ Keep local (testados) |
| 203 tasks | ✅ | ~203 | 🔄 Merge + audit tasks novas |
| .claude/* | ? | ✅ | 🔄 Manter local (tech-arauz) |
| .cursor/* | ? | ✅ | 🔄 Comparar |
| .codex/* | ? | ✅ | 🔄 Comparar |
| .gemini/* | ? | ✅ | 🔄 Comparar |

### CATEGORIA B: "Adicionar do Local" (Local → GitHub)
Se local tem inovação:

| Arquivo | GitHub | Local | Ação | Prioridade |
|---------|--------|-------|------|-----------|
| frontend.md | ❌ | ✅ 🎨 | → Enviar PR GitHub | 🔴 ALTA |
| mobile.md | ❌ | ✅ 📱 | → Enviar PR GitHub | 🔴 ALTA |
| security.md | ❌ | ✅ 🔐 | → Enviar PR GitHub | 🔴 ALTA |
| Tasks novas (~3) | ❌ | ✅ | → Audit + PR | 🟡 MÉDIA |

### CATEGORIA C: "Manter Local Only" (Tech-arauz Specific)
NÃO sincronizar com GitHub:

| Arquivo | Por Quê |
|---------|---------|
| `.claude/CLAUDE.md` | Regras Supabase, Espaider, Tech Stack local |
| `supabase/migrations/` | Schema específico do projeto |
| `src/integrations/espaider/` | ERP integration (tech-arauz only) |
| `docs/architecture/` | Documentação de negócio |
| `.env.example` | Variáveis local-specific |

---

## 3. Plano de Merge — 5 Passos

### PASSO 1: Comparação Estrutural (30m)
- [ ] Listar todos arquivos GitHub vs Local
- [ ] Identificar novos no local
- [ ] Identificar modificados
- [ ] Identificar removidos

### PASSO 2: Decisão de Merge (1h)
Para cada divergência:
- **Tipo 1 - Idêntico:** Keep local
- **Tipo 2 - GitHub mais recente:** Sobrescrever com GitHub
- **Tipo 3 - Local é melhoria:** Manter local, depois enviar PR GitHub
- **Tipo 4 - Local-only:** Ignorar (tech-arauz specific)

### PASSO 3: Executar Merge (2h)
Ordem de operações:
```
1. Backup local (.aios-core)
2. Copiar GitHub → Local (sobrescrever apenas CATEGORIA A)
3. Manter CATEGORIA B (novos agentes)
4. Restaurar CATEGORIA C (tech-arauz)
5. Validar que nada quebrou
```

### PASSO 4: Preparar PRs (1h)
Para cada item CATEGORIA B:
- [ ] Generalizar (remover tech-arauz context)
- [ ] Criar PR draft
- [ ] Documentar razão de adição

### PASSO 5: Validação Final (30m)
- [ ] `@aios-master *help` funciona
- [ ] Todos 15 agentes ativam
- [ ] Tasks 206+ funcionam
- [ ] Sem breaking changes

---

## 4. Merge Checklist Detalhado

### Para os 12 Agentes Base
```
[ ] aios-master.md — comparar, usar versão mais recente
[ ] analyst.md — comparar, usar versão mais recente
[ ] architect.md — comparar, usar versão mais recente
[ ] data-engineer.md — comparar, usar versão mais recente
[ ] dev.md — comparar, usar versão mais recente
[ ] devops.md — comparar, usar versão mais recente
[ ] pm.md — comparar, usar versão mais recente
[ ] po.md — comparar, usar versão mais recente
[ ] qa.md — comparar, usar versão mais recente
[ ] sm.md — comparar, usar versão mais recente
[ ] squad-creator.md — comparar, usar versão mais recente
[ ] ux-design-expert.md — comparar, usar versão mais recente
```

### Para os 3 Agentes Novos (Local)
```
[ ] frontend.md — MANTER (prep para PR GitHub)
[ ] mobile.md — MANTER (prep para PR GitHub)
[ ] security.md — MANTER (prep para PR GitHub)
```

### Para Configurações
```
[ ] constitution.md — Keep local (idêntico)
[ ] core-config.yaml — Merge intelligently
[ ] .claude/CLAUDE.md — Keep local (tech-arauz)
[ ] IDE configs — Comparar
```

### Para Tasks
```
[ ] Comparar 203 GitHub vs ~206 local
[ ] Identificar 3 tasks novas
[ ] Manter novas
[ ] Audit para conflicts
```

---

## 5. Merge Inteligente — Estratégia por Tipo

### Tipo 1: Arquivo Idêntico
```
Local: constitution.md v1.0.0
GitHub: constitution.md v1.0.0
→ AÇÃO: Keep local (sem mudança)
```

### Tipo 2: GitHub tem versão melhor
```
Local: aios-master.md (v3.0, 2026-02-19)
GitHub: aios-master.md (v3.1, 2026-02-23)
→ AÇÃO: Copiar GitHub (mais recente)
```

### Tipo 3: Local é melhoria generaliza
```
Local: frontend.md (novo, bem feito)
GitHub: ❌ não existe
→ AÇÃO: MANTER local + preparar PR GitHub
```

### Tipo 4: Local-only, tech-arauz specific
```
Local: .claude/CLAUDE.md (Supabase, Espaider rules)
GitHub: Pode ter versão genérica
→ AÇÃO: MANTER local sempre (override GitHub)
```

---

## 6. Riscos & Mitigação

| Risco | Mitigação |
|-------|-----------|
| Sobrescrever melhoria local | Audit cada arquivo antes |
| Perder tech-arauz config | Backup .claude/ + supabase/ |
| Breaking changes | Validar todos agentes pós-merge |
| Conflitos em 12 agentes base | 3-way diff + manual review |

---

## 7. Sequência de Execução Recomendada

1. **Backup local completo**
   ```bash
   cp -r .aios-core .aios-core.backup-2026-02-23
   ```

2. **Copiar GitHub → Local (selective)**
   - constitution.md (se mais recente)
   - core-config.yaml (merge intelligently)
   - 12 agentes base (usar GitHub se mais recente)

3. **Manter local**
   - frontend.md, mobile.md, security.md
   - .claude/CLAUDE.md
   - supabase/, src/integrations/

4. **Validar**
   - `@aios-master *help` retorna todos 15 agentes
   - Testar alguns agentes

5. **Preparar PRs**
   - frontend.md (generalizado)
   - mobile.md (generalizado)
   - security.md (generalizado)

---

## 8. Success Criteria

✅ Tech-arauz tem GitHub v4.0+ como base
✅ 12 agentes base funcionam perfeitamente
✅ 3 agentes novos funcionam sem issues
✅ Tech-arauz specific configs preservados
✅ Nenhum breaking change
✅ 206+ tasks funcionam
✅ PRs prontas para enviar ao GitHub

---

## 9. Próxima Ação

**Aprovação para executar merge com estratégia acima?**

- [ ] SIM — Executar merge inteligente
- [ ] Quer mais detalhes antes?
- [ ] Prefere abordagem manual file-by-file?

---

*Estratégia de merge consciente — GitHub + Local = Melhor dos dois mundos*
