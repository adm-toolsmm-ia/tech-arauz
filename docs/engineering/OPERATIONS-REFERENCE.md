# OPERATIONS REFERENCE — Setup, Scripts, Deploy

```yaml
---
doc_id: "operations-reference"
git_ref: "5d1978cf7170b79a6bc06a95204063a121e45f04"
generated_at: "2026-03-21T00:00:00Z"
evidence_manifest:
  - "package.json"
  - ".env.example"
  - "supabase/README.md"
  - "docs/architecture/build-deploy-gates.md"
  - "docs/engineering/DEPLOYMENT-GUIDE.md"
known_gaps: []
---
```

---

## npm Scripts (package.json)

| Script | Comando | Descrição |
|--------|---------|-----------|
| dev | `next dev` | Servidor de desenvolvimento |
| build | `next build` | Build de produção |
| start | `next start` | Servidor de produção |
| lint | `next lint` | ESLint |
| format | `prettier --write "src/**/*.{ts,tsx,...}"` | Formatar código |
| format:check | `prettier --check "..."` | Verificar formatação |
| test | `vitest --run` | Testes |
| test:watch | `vitest` | Testes em watch |
| test:coverage | `vitest --coverage` | Cobertura |
| test:a11y | `vitest ... a11y.test.tsx` | Testes a11y |
| test:rls | `supabase test db -- ...` | Testes RLS |
| typecheck | `tsc --noEmit` | TypeScript check |
| gate | lint + typecheck + test + format:check | Gate completo |
| db:apply | `npx supabase db push` | Aplicar migrations |
| db:purge-logs | `node ./scripts/db/run-log-retention.mjs` | Purge de logs |
| sync | `powershell ... sync.ps1` | Sync Espaider |
| storybook | `storybook dev -p 6006` | Storybook |
| sync:ide | `node .aiox-core/.../ide-sync` | Sync IDE AIOX |

---

## Variáveis de Ambiente (nomes apenas — .env.example)

**LLM:** DEEPSEEK_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY

**Search:** EXA_API_KEY, CONTEXT7_API_KEY

**Supabase:** SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY  
*(Também: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY para frontend)*

**CI/CD:** GITHUB_TOKEN

*(Outras variáveis em .env.example — nunca commitar valores reais)*

---

## Supabase (supabase/README.md)

- **Migrations:** `supabase/migrations/`
- **Aplicar:** `npm run db:apply` ou `npx supabase db push`
- **Reset local:** `npx supabase db reset`
- **Nova migration:** `npx supabase migration new nome_da_mudanca`

---

## Build & Deploy

- **Quality gates:** [architecture/build-deploy-gates.md](../architecture/build-deploy-gates.md)
- **Deploy guide:** [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- **PowerShell:** Usar `;` para encadear (não `&&`)

---

**Last Updated:** 2026-03-21
**Source:** [COMPOSER-DOCUMENTATION-PACK.md](COMPOSER-DOCUMENTATION-PACK.md) §5.5
