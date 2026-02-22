# Shell Execution Standard

**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Status:** Official Standard
**Related:** Padronização de comandos AIOS, tech-arauz

---

## Objetivo

Evitar que agentes e IDEs executem comandos com sintaxe que falha no ambiente de destino (ex.: `&&` no PowerShell). Garantir comportamento consistente entre Windows, macOS e Linux.

---

## Escopo

- Comandos executados por agentes ou IDEs em nome do projeto
- Scripts de automação (npm, husky, CI/CD) quando rodados em ambiente Windows
- Documentação e exemplos que descrevem comandos para execução manual

---

## Ambiente por SO

| SO | Shell padrão | Chaining nativo |
|----|--------------|-----------------|
| Windows | PowerShell | `;` (semicolon) |
| macOS / Linux | bash (ou sh) | `&&` ou `;` |

**Regra:** Em Windows, o shell é PowerShell. No PowerShell 5.x (padrão do Windows), o operador `&&` não existe e causa erro.

---

## Proibido

- **Usar `&&` para encadear comandos** quando o ambiente for Windows/PowerShell
- **Comandos que começam com `&&`** (sintaxe inválida em qualquer shell)
- **Assumir bash em projetos cross-platform** sem qualificar por SO

---

## Padrão recomendado

1. **Encadear com `;` no PowerShell:** `cmd1; cmd2` (executa ambos, independente do resultado do primeiro)
2. **Um comando por execução:** Rodar cada comando separadamente (ideal para agentes)
3. **Script npm que encadeie passos:** Ex.: `npm run quality-gates` que internamente chama lint, typecheck, test
4. **Preferir ferramentas da IDE:** Grep, Read, Glob, Delete em vez de `grep`, `cat`, `find`, `rm` no shell

---

## Exemplos

### Errado (falha no PowerShell)

```bash
npm run lint && npm run typecheck
```

```bash
&& npm run build
```

```bash
cd src && grep -r "pattern" .
```

### Correto

**PowerShell (Windows):**

```powershell
npm run lint; npm run typecheck
```

**Ou dois comandos separados:**

```powershell
npm run lint
npm run typecheck
```

**Ou script npm agnóstico:**

```powershell
npm run quality-gates
```

**Busca em arquivos:** Usar ferramenta Grep da IDE, não `grep` no shell.

---

## Referências

- [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md) — exemplos de pre-commit com variante PowerShell
- [STANDARDS-INDEX.md](./STANDARDS-INDEX.md) — índice de padrões AIOS

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-21 | 1.0.0 | Initial standard | @dev |
