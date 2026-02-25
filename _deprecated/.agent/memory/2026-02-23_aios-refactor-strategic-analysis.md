# Análise Estratégica — Refatoração AIOS GitHub-First

**Data:** 2026-02-23
**Estratégia:** GitHub como fonte de verdade, enriquecer com melhorias locais
**Status:** Pronto para execução

---

## 1. Estrutura Comparativa — GitHub vs Local

### Agentes

| Agente | GitHub | Local | Tipo | Status |
|--------|--------|-------|------|--------|
| aios-master | ✅ | ✅ | Base | Sincronizado |
| analyst | ✅ | ✅ | Base | Sincronizado |
| architect | ✅ | ✅ | Base | Sincronizado |
| data-engineer | ✅ | ✅ | Base | Sincronizado |
| dev | ✅ | ✅ | Base | Sincronizado |
| devops | ✅ | ✅ | Base | Sincronizado |
| pm | ✅ | ✅ | Base | Sincronizado |
| po | ✅ | ✅ | Base | Sincronizado |
| qa | ✅ | ✅ | Base | Sincronizado |
| sm | ✅ | ✅ | Base | Sincronizado |
| squad-creator | ✅ | ✅ | Base | Sincronizado |
| ux-design-expert | ✅ | ✅ | Base | Sincronizado |
| **frontend** | ❌ | ✅ 🎨 | Novo | **ENRIQUECIMENTO** |
| **mobile** | ❌ | ✅ 📱 | Novo | **ENRIQUECIMENTO** |
| **security** | ❌ | ✅ 🔐 | Novo | **ENRIQUECIMENTO** |

### Tasks

| Métrica | GitHub | Local | Diferença |
|---------|--------|-------|-----------|
| Total tasks | 203 | ~206 | +3 tasks novas |
| Status | Conhecido | Similarmente estruturado | 🟡 Verificar |

### Configurações

| Arquivo | GitHub | Local | Versão |
|---------|--------|-------|--------|
| constitution.md | v1.0.0 | v1.0.0 | ✅ IDÊNTICO |
| core-config.yaml | ? | v2.1.0 | 🟡 Comparar |
| IDE integrations | 4 (.claude, .cursor, .codex, .gemini) | 4 | ✅ Igual |

---

## 2. Os 3 Agentes Novos — Análise de Valor

### 🎨 @frontend (Pixel) — Frontend Specialist

**Localização:** `.aios-core/development/agents/frontend.md`

#### Características Únicas:
- Persona bem definida (Pixel)
- Skills especializadas:
  - frontend-design
  - react-best-practices (Vercel Engineering 57 regras)
  - tailwind-patterns
  - performance-profiling
  - web-design-guidelines
  - i18n-localization
  - seo-fundamentals

#### Métricas de Qualidade Integradas:
```
LCP < 2.5s  (Largest Contentful Paint)
CLS < 0.1   (Cumulative Layout Shift)
FID < 100ms (First Input Delay)
```

#### Regras Críticas Formalizadas:
- Imports absolutos (`@/`)
- Named exports (nunca default)
- Tailwind utility-first + `cn()`
- Performance profiling primeiro
- Delegação clara para @data-engineer (migrations) e @devops (git push)

#### Comandos:
- `*develop [story]` — implementar frontend story
- `*audit [componente]` — auditar perf e acessibilidade
- `*design [requisito]` — propor design antes de codar
- `*review [arquivo]` — revisar com react-best-practices

**Recomendação:** ✅ **GENERALIZAR E ENVIAR PRO GITHUB**
- Remover contexto tech-arauz específico
- Generalizar para qualquer projeto Next.js/React
- Manter estrutura de skills e métricas

---

### 📱 @mobile (Zion) — Mobile Developer

**Localização:** `.aios-core/development/agents/mobile.md`

#### Características Únicas:
- Persona bem definida (Zion)
- Frameworks suportados: React Native, Flutter, Expo
- Skills:
  - mobile-design
  - clean-code
  - testing-patterns
  - performance-profiling

#### Contexto tech-arauz:
```
project_context: "App mobile do portal tech-arauz para apresentação à diretoria —
implementação futura"
```

#### Regras Críticas:
- Touch targets: 44pt (iOS) / 48dp (Android)
- Listas: `FlatList` com React.memo + useCallback (nunca ScrollView)
- Tokens: `SecureStore` (nunca AsyncStorage para dados sensíveis)
- Verificar builds reais antes de marcar completo
- Platform-specific behaviors com `Platform.OS`

#### Stack Padrão Definido:
- React Navigation
- Expo (navegação nativa)
- SecureStore para tokens
- EAS Build para distribuição

#### Comandos:
- `*setup` — configurar React Native/Expo do zero
- `*develop [story]` — implementar story mobile
- `*build [platform]` — verificar build Android ou iOS
- `*audit` — auditoria perf/segurança/UX mobile

**Recomendação:** ✅ **GENERALIZAR E ENVIAR PRO GITHUB**
- Remove tech-arauz specific context
- Manter estrutura de skills e best practices
- Generalizar para qualquer projeto mobile multiplataforma

---

### 🔐 @security (Shade) — Security Auditor

**Localização:** `.aios-core/development/agents/security.md`

#### Características Únicas:
- Persona bem definida (Shade)
- Skills especializadas:
  - vulnerability-scanner
  - red-team-tactics
  - supabase-rls-patterns
  - code-review-checklist

#### Protocolo de Auditoria em 4 Fases:
1. **RECONHECIMENTO** — Mapear superfície de ataque
2. **ANÁLISE ESTÁTICA** — npm audit, security_scan.py, .env check
3. **RLS AUDIT** — RLS policies, get_user_tenant_id(), multi-tenant
4. **RELATÓRIO** — Severidades (CRITICAL, HIGH, MEDIUM, LOW)

#### Severidades Bem Definidas:
- **CRITICAL:** Secrets expostos, SQL injection, auth bypass → Escalar hoje
- **HIGH:** XSS, IDOR, RLS mal configurada → Fix na próxima sprint
- **MEDIUM:** Headers de segurança, logging → Backlog prioritário
- **LOW:** Hardening melhorias → Backlog normal

#### Permissões Restritivas:
- ✅ read_all, run_security_scan, write_security_report
- ❌ git_push, code_edit_production, read_env_real
- Filosofia: Reportar, não alterar

#### Comandos:
- `*audit` — auditoria completa
- `*audit-rls` — apenas RLS policies
- `*audit-deps` — dependências npm
- `*audit-secrets` — secrets expostos
- `*report` — gerar relatório em docs/qa/

**Recomendação:** ✅ **GENERALIZAR E ENVIAR PRO GITHUB**
- Remover Supabase-específico (generalizável)
- Manter framework OWASP
- Generalizar para qualquer projeto com banco de dados + autenticação

---

## 3. Tasks Novas — Identificação

**Questão:** Quais são as ~3-6 tasks novas no local?

Hipótese: Tarefas correspondentes aos 3 agentes novos:
- `frontend-audit-component.md` ou similar
- `mobile-build-android.md` ou similar
- `security-audit-owasp.md` ou similar

**Ação:** Verificar `.aios-core/development/tasks/` para identificar exatamente.

---

## 4. Configuração Local Customizada

### tech-arauz Specific
- `.claude/CLAUDE.md` — Regras Supabase, Espaider, Tech Stack
- `.claude/rules/*` — Story lifecycle, Agent authority, IDS principles
- `supabase/migrations/` — Schema específico
- `src/integrations/espaider/` — ERP integration

### GitHub Agnostic (Devem estar no GitHub)
- Constitution framework
- Story lifecycle + QA Loop
- Agent authority matrix
- IDS principles (Incremental Development)
- CodeRabbit integration patterns
- Workflow execution protocol

---

## 5. Recomendações Estratégicas

### TIER 1 — PRs para GitHub (Alta Prioridade)

#### PR #1: 3 Novos Agentes Generalizados
- **O quê:** frontend.md, mobile.md, security.md (removido context tech-arauz)
- **Por quê:** Agregam valor universal para qualquer projeto fullstack
- **Impacto:** 3 especialistas novos no GitHub
- **Esforço:** Baixo (remover ~3-5 linhas de context por agente)

#### PR #2: Melhorias nas Regras
- **O quê:** Story lifecycle, Agent authority, IDS principles consolidadas
- **Por quê:** Clarificam governança que já existe no GitHub
- **Impacto:** Documentação mais robusta
- **Esforço:** Médio (consolidação)

---

### TIER 2 — Tasks Novas (Média Prioridade)

#### Verificar e Enviar Tasks Especializadas
- Frontend-related tasks (design, audit, component generation)
- Mobile-related tasks (build, platform detection, perf profiling)
- Security-related tasks (OWASP audit, RLS audit, deps scan)

---

### TIER 3 — Local Keep-As-Is

- `.claude/CLAUDE.md` — Tech-arauz específico (Supabase, Espaider)
- `supabase/migrations/` — Schema local
- `src/integrations/` — Integrações específicas

---

## 6. Plano de Ação Executável

### Fase 1: Preparação (2h)
- [ ] Generalizar frontend.md (remover tech-arauz context)
- [ ] Generalizar mobile.md (remover tech-arauz context)
- [ ] Generalizar security.md (remover tech-arauz context)
- [ ] Criar 3 PRs drafts

### Fase 2: Validação (1h)
- [ ] Verificar que 3 agentes funcionam sem context local
- [ ] Confirmar permissões estão OK para gen-purpose
- [ ] Validar comandos funcionam em contexto genérico

### Fase 3: Submit PRs (1h)
- [ ] PR #1: 3 agentes novos
- [ ] PR #2: Regras consolidadas (se houver melhorias)
- [ ] Aguardar feedback do GitHub

### Fase 4: Sincronização Local (1h)
- [ ] Após PRs mergearem, fazer git pull do GitHub
- [ ] Verificar que 12 agentes base + 3 novos funcionam
- [ ] Manter customizações tech-arauz em `.claude/CLAUDE.md`
- [ ] Testar @aios-master *help

### Fase 5: Documentação Final (30m)
- [ ] Atualizar `.claude/CLAUDE.md` para referenciar GitHub
- [ ] Documentar o que é local-only vs GitHub-synced
- [ ] Criar README em `.claude/` explicando a estrutura

---

## 7. Riscos & Mitigação

| Risco | Prob | Impacto | Mitigação |
|-------|------|--------|-----------|
| PRs rejeitadas | BAIXA | BAIXO | Validar formato antes |
| Merge conflicts | MÉDIA | MÉDIO | Git worktree por PR |
| Agentes quebrados pós-sync | BAIXA | CRÍTICO | Testar ativação pós-merge |
| Perder customizações | BAIXA | CRÍTICO | Backup .claude/ antes |

---

## 8. Sucesso — Critérios

✅ Tech-arauz alinhado com GitHub v4.0+
✅ 3 agentes novos funcionais (frontend, mobile, security)
✅ Nenhuma quebra em 12 agentes base
✅ Customizações tech-arauz preservadas e documentadas
✅ PRs mergeadas no GitHub (se houver agregação real)

---

## 9. Próximos Passos Imediatos

### Agora:
1. [ ] Você revisa esta análise
2. [ ] Aprova ou solicita ajustes

### Amanhã (se aprovado):
1. [ ] Generalizar 3 agentes
2. [ ] Validar funcionamento
3. [ ] Preparar PRs para GitHub

---

*Análise estratégica completa — Pronto para execução*
*GitHub-First com enriquecimento local consciente*
