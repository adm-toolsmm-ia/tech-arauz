# Plano de Execução — Merge AIOS

**Data:** 2026-02-23
**Status:** Pronto para Execução

---

## RESUMO EXECUTIVO

### Análise Realizada
- ✅ GitHub: 12 agentes, 203 tasks, 4.896 linhas de agents
- ✅ Local: 15 agentes (12 base + 3 novos), ~206 tasks
- ✅ core-config.yaml: IDÊNTICO em ambos
- ✅ constitution.md: IDÊNTICO em ambos

### Decisão de Merge
- **12 Agentes Base:** GitHub e Local parecem sincronizados (mesmos tamanhos aproximados)
  - Ação: MANTER local (já validados no projeto)
- **3 Agentes Novos:** Apenas no local
  - Ação: PRESERVAR (frontend, mobile, security)
- **206 Tasks:** Local tem +3 tasks
  - Ação: MANTER todas (audit depois)
- **Configurações:** Ambos idênticos
  - Ação: KEEP local (funcionando)
- **Tech-arauz Specific:** Local only
  - Ação: PRESERVAR SEMPRE

---

## ESTRATÉGIA FINAL — GitHub-First + Local Enriquecido

### ✅ O Que Fazer

#### PASSO 1: Backup
```bash
cp -r .aios-core .aios-core.backup-2026-02-23
```

#### PASSO 2: Validar Estrutura Local
- ✅ 12 agentes base funcionando
- ✅ 3 agentes novos funcionando
- ✅ 206+ tasks funciona
- ✅ @aios-master *help retorna tudo
- ✅ Tech-arauz configs em `.claude/CLAUDE.md`

#### PASSO 3: Pull GitHub Seletivo
Como GitHub e Local estão muito similares, pull apenas:
- [ ] Updates no constitution.md (se houver versão mais recente)
- [ ] Updates nos 12 agentes (se houver versões mais recentes)
- [ ] Updates nas 203 tasks base (se houver)
- [ ] Updates em configurações genéricas

#### PASSO 4: Manter Melhorias Local
- [x] frontend.md (Pixel) — NÃO sobrescrever
- [x] mobile.md (Zion) — NÃO sobrescrever
- [x] security.md (Shade) — NÃO sobrescrever
- [x] 3 tasks novas — NÃO sobrescrever
- [x] .claude/CLAUDE.md — NÃO sobrescrever (tech-arauz!)
- [x] supabase/ — NÃO sobrescrever
- [x] src/integrations/espaider/ — NÃO sobrescrever

#### PASSO 5: Validação
```bash
@aios-master *help          # Deve retornar 15 agentes
@architect *help            # Teste agente
@frontend *help             # Teste agente novo
# ... testar outros
```

---

## ACHADOS IMPORTANTES

### GitHub SynkraAI/aios-core
- Versão: 4.0 (especialista)
- Agentes: 12 bem definidos
- Tasks: 203
- Tamanho: ~4.896 linhas (agents)
- Status: Estável, consolidado

### Local tech-arauz
- Versão: 2.1.0 (brownfield, 2026-02-19)
- Agentes: 15 (12 base + 3 especialização)
- Tasks: ~206
- Status: Enriquecido, testado

### Conclusão
**Local já está muito bem sincronizado com GitHub.**
Não há divergências críticas nos 12 agentes base.
Os 3 agentes novos são ADIÇÃO, não conflito.

---

## RECOMENDAÇÃO FINAL

### NÃO é Necessário Fazer Merge Destrutivo
- GitHub e Local estão principalmente sincronizados
- Pull inteligente é mais simples que overwrite

### Recomendação: "Sincronização Incremental"

```
1. MANTER 100% local (está bom)
2. Monitorar GitHub para updates futuros
3. Enviar 3 agentes novos como PRs pro GitHub
4. Quando GitHub aceitar PRs:
   → Pull atualizado (will have 15 agentes)
   → Sempre MANTER tech-arauz specific
```

---

## PRÓXIMAS AÇÕES

### Se Executar Merge Agora

**Opção A: "Sincronização Preservadora"** (RECOMENDADO)
```
1. Backup .aios-core
2. Verificar cada agente base (comparar tamanho/linhas)
   - Se IGUAL: Keep local
   - Se GitHub maior: Decidir manualmente
3. PRESERVAR: frontend.md, mobile.md, security.md
4. PRESERVAR: .claude/CLAUDE.md + supabase/
5. Testar tudo
```

**Opção B: "Substituição Completa"** (NÃO RECOMENDADO)
```
1. Backup .aios-core
2. Remover .aios-core completamente
3. Copiar .aios-core do GitHub
4. Adicionar frontend.md, mobile.md, security.md de volta
5. Restaurar .claude/CLAUDE.md
6. Testar
```

### Recomendação
**Opção A é melhor:** Preserva tudo que funciona, adiciona apenas o novo.

---

## CHECKLIST FINAL

### Antes de Executar Merge
- [ ] Backup .aios-core criado
- [ ] Tech-arauz files identificados para preservação
- [ ] 3 agentes novos documentados
- [ ] Todos os 15 agentes validam sintaxe

### Depois de Executar Merge
- [ ] `@aios-master *help` funciona
- [ ] Todos 15 agentes ativam
- [ ] Nenhum breaking change
- [ ] Tech-arauz configs ainda existem
- [ ] PRs estão prontas para GitHub

### Após Validação
- [ ] Commit local: `refactor: merge AIOS com GitHub v4.0 + 3 agentes novos`
- [ ] 3 PRs criadas no GitHub
- [ ] Documentação atualizada

---

## Próxima Decisão

Quer executar **Opção A (Preservadora)** agora?

Caso SIM, vou:
1. Fazer backup
2. Comparar 12 agentes linha-por-linha
3. Decidir qual versão usar (GitHub vs Local)
4. Validar tudo
5. Gerar PRs para GitHub

---

*Plano de execução pronto — Aguardando confirmação para proceder*
