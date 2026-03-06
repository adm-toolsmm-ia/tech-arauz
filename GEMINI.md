# GEMINI.md — tech-arauz AI Engineering

> **Este projeto usa a arquitetura AIOS + Antigravity unificada.**
> A engenharia de IA é padronizada e independente do modelo selecionado.

---

## 📐 Fonte de Verdade (leia primeiro)

| Documento                            | Caminho                                      |
| ------------------------------------ | -------------------------------------------- |
| Constituição (6 regras inegociáveis) | `.aiox-core/constitution.md`                 |
| Agentes AIOS                         | `.aiox-core/development/agents/`             |
| Skills técnicas                      | `.agent/skills/`                             |
| Protocolo de orquestração (6 fases)  | `.agent/workflows/orchestration-protocol.md` |
| Memória histórica                    | `.agent/memory/`                             |

---

## 🤖 Fluxo Padrão de Atendimento

**Todo pedido passa pelo orquestrador primeiro.**

```
Você → @aios-master (analisa + monta equipe) → especialistas → plano conjunto
```

### Tabela de Roteamento

> ⚠️ Agentes deprecated não devem ser usados. Consulte a tabela abaixo.
> 🚫 **NUNCA carregue arquivos de `_deprecated/`** — são backups históricos, fora de uso.

| Domínio                 | Agente AIOS         | Ativar com          | Deprecated → Arquivado em `_deprecated/`      |
| ----------------------- | ------------------- | ------------------- | --------------------------------------------- |
| Orquestração / padrão   | `@aios-master`      | `/aios-master`      | ~~orchestrator~~, ~~project-planner~~         |
| Frontend / UI / React   | `@frontend`         | `/frontend`         | ~~frontend-specialist~~                       |
| Mobile / App            | `@mobile`           | `/mobile`           | ~~mobile-developer~~ (migrado → AIOS)         |
| Segurança / OWASP / RLS | `@security`         | `/security`         | ~~security-auditor~~, ~~penetration-tester~~  |
| Backend / API           | `@dev`              | `/dev`              | ~~backend-specialist~~                        |
| Qualidade / Testes      | `@qa`               | `/qa`               | ~~qa-automation-engineer~~, ~~test-engineer~~ |
| DevOps / git push       | `@devops`           | `/devops`           | ~~devops-engineer~~                           |
| Banco / Supabase        | `@data-engineer`    | `/data-engineer`    | ~~database-architect~~                        |
| Produto                 | `@pm` / `@po`       | `/pm` `/po`         | ~~product-manager~~ / ~~product-owner~~       |
| Design / UX             | `@ux-design-expert` | `/ux-design-expert` | —                                             |
| Análise                 | `@analyst`          | `/analyst`          | —                                             |
| Arquitetura / ADRs      | `@architect`        | `/architect`        | —                                             |
| Scrum / Stories         | `@sm`               | `/sm`               | —                                             |

---

## 🧹 Regras Universais

1. **Idioma:** Respostas em PT-BR. Código e variáveis em inglês.
2. **Portão Socrático:** Para features novas, faça 3 perguntas estratégicas antes de implementar.
3. **Clean Code:** Siga `.agent/skills/clean-code/SKILL.md` sem exceções.
4. **Memória:** Após implementações significativas, crie log em `.agent/memory/YYYY-MM-DD_{task}.md`.
5. **Supabase:** SEMPRE definir RLS ao criar tabelas.
6. **Espaider:** API `BI_SOLICITACOES_SUPORTEESPAIDER` — validar dados, logs em `integration_log_entries`.

---

## 📁 Skills Técnicas por Domínio

| Domínio          | Skills                                                             | Carregada por    |
| ---------------- | ------------------------------------------------------------------ | ---------------- |
| UI/React/Next.js | `react-best-practices`, `tailwind-patterns`, `frontend-design`     | `@frontend`      |
| Mobile           | `mobile-design`, `performance-profiling`                           | `@mobile`        |
| Backend/API      | `api-patterns`, `nodejs-best-practices`                            | `@dev`           |
| Banco/RLS        | `supabase-rls-patterns`, `database-design`, `espaider-integration` | `@data-engineer` |
| Segurança        | `vulnerability-scanner`, `red-team-tactics`                        | `@security`      |
| Testes           | `testing-patterns`, `tdd-workflow`, `webapp-testing`               | `@qa`            |
| Deploy           | `deployment-procedures`                                            | `@devops`        |
| Debug / Perf     | `systematic-debugging`, `performance-profiling`                    | `@dev`           |
