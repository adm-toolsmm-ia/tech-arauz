# Execução Merge — Sincronização Preservadora

**Data:** 2026-02-23 23:15
**Status:** EM EXECUÇÃO

---

## ✅ PASSO 1: BACKUP (Iniciado)

### Comando
```bash
cp -r .aios-core .aios-core.backup-2026-02-23
```

### Propósito
- Preservar versão atual completa
- Segurança contra reversão

### Status
- [ ] Executando...

---

## ⏳ PASSO 2: COMPARAÇÃO DE AGENTES (Próximo)

### Estratégia
Para cada um dos 12 agentes base:
```
1. Contar linhas GitHub vs Local
2. Se IGUAL (±5 linhas) → KEEP local (já sincronizado)
3. Se GitHub MAIOR → DECIDIR se puxar (revisar diffs)
4. Se Local MAIOR → MANTER (pode ter melhorias)
```

### Agentes a Comparar
- [ ] aios-master.md
- [ ] analyst.md
- [ ] architect.md
- [ ] data-engineer.md
- [ ] dev.md
- [ ] devops.md
- [ ] pm.md
- [ ] po.md
- [ ] qa.md
- [ ] sm.md
- [ ] squad-creator.md
- [ ] ux-design-expert.md

---

## PASSO 3: APLICAR MERGE (Aguardando)

### Lógica
```
Para 12 agentes:
  IF (github_version == local_version OR muito_similares):
    KEEP local (já sincronizado)
  ELSE IF (github_newer):
    DECIDIR manualmente
  ELSE:
    KEEP local

Para 3 agentes novos (frontend, mobile, security):
  KEEP SEMPRE (local only)

Para configs:
  constitution.md → KEEP local (idêntico)
  core-config.yaml → KEEP local (idêntico)

Para tech-arauz:
  .claude/CLAUDE.md → KEEP local (critical!)
  supabase/ → KEEP local (critical!)
  src/integrations/ → KEEP local (critical!)
```

---

## PASSO 4: VALIDAÇÃO (Após Merge)

### Testes
```bash
# Teste 1: Agente Master
@aios-master *help
→ Deve listar 15 agentes (12 base + 3 novos)

# Teste 2: Agente novo funcionando
@frontend *help
@mobile *help
@security *help
→ Devem retornar comandos específicos

# Teste 3: Agente base
@architect *help
→ Deve funcionar normalmente

# Teste 4: Tasks
(Verificar ~206 tasks carregam)
```

### Critério de Sucesso
- ✅ Nenhum breaking change
- ✅ 15 agentes ativam
- ✅ 206+ tasks funcionam
- ✅ Tech-arauz configs preservados

---

## PASSO 5: PREPARAR PRs (Após Validação)

### PRs para GitHub

#### PR #1: Adicionar 3 Agentes Novos
```
Title: "feat: Add 3 specialized agents (frontend, mobile, security)"

Body:
- 🎨 @frontend (Pixel) — React/Next.js specialist with Web Vitals
- 📱 @mobile (Zion) — React Native/Flutter/Expo mobile dev
- 🔐 @security (Shade) — OWASP auditor + vulnerability scanner

These agents:
- Are generalized (no project-specific context)
- Add significant value to any fullstack project
- Follow existing agent patterns and architecture
- Include comprehensive personas, skills, and protocols
```

#### PR #2: Updates nos Agentes Base (Se necessário)
```
Se houver diferenças:
- Title: "refactor: Update agent definitions from upstream"
- Body: Liste apenas os agentes que foram atualizados
```

---

## ✨ RESULTADO ESPERADO

### Arquivo Final
```
.aios-core/
├── constitution.md (v1.0.0 — preservado)
├── core-config.yaml (v2.1.0 — preservado)
├── development/
│   ├── agents/
│   │   ├── (12 base — sincronizados)
│   │   ├── frontend.md ✨ (Pixel)
│   │   ├── mobile.md ✨ (Zion)
│   │   └── security.md ✨ (Shade)
│   └── tasks/
│       ├── (203 base — sincronizadas)
│       └── (3 novas — preservadas)
└── [tudo mais preservado]
```

### Status Final
✅ Sincronizado com GitHub v4.0+
✅ 15 agentes funcionando
✅ 206+ tasks funcionando
✅ 3 PRs prontas para GitHub
✅ Tech-arauz 100% preservado

---

## Próxima Ação
Aguardando confirmação para executar **PASSO 1: BACKUP**

---

*Cronograma: ~90 minutos total (backup 5m + comparação 20m + merge 20m + validação 15m + PRs 20m + buffer 10m)*
