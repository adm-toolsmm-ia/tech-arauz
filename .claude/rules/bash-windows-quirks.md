# Bash on Windows (Git Bash) Quirks & Workarounds

## Problema Identificado

Ao usar a ferramenta Bash do Claude Code no Windows com paths contendo espaços, o erro ocorre:

```
/usr/bin/bash: line 1: /c/Users/Gabriel: Permission denied
```

**NÃO é um erro de permissão real** — é um problema de escapement de paths em MSYS2/Git Bash.

## Raiz Técnica

| Componente | Detalhe |
|-----------|---------|
| **Shell** | Git Bash (MSYS2) — ambiente Unix em Windows |
| **Problema** | Paths com espaços não são escaped automaticamente |
| **Sintoma** | Bash interpreta `Gabriel Cristofolini` como 2 argumentos |
| **Resultado** | Tenta executar `/c/Users/Gabriel` como comando |

## Soluções Recomendadas

### ✅ PREFERIDO: Ferramentas Dedicadas (SEM problemas)

Sempre prefira ferramentas que não dependem de shell:

```typescript
// ✅ BOM - Use Read (sem shell, sem erros)
await readFile("C:\Users\Gabriel Cristofolini\...\file.txt")

// ✅ BOM - Use Glob (sem shell, sem erros)
glob.glob("src/**/*.tsx")

// ✅ BOM - Use Grep (sem shell, sem erros)
grep.search("pattern", "src")

// ✅ BOM - Use Write (sem shell, sem erros)
writeFile("path/file.txt", content)

// ❌ EVITAR - Bash com path não escapado
bash("cat C:\Users\Gabriel Cristofolini\...\file.txt")
```

### ⚠️ ALTERNATIVA: Escapement de Paths em Bash

Se você **DEVE** usar Bash:

#### Opção 1: Quotes (RECOMENDADO)
```bash
# ✅ FUNCIONA
ls "C:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz"

# ✅ FUNCIONA (caminhos curtos funcionam naturalmente)
ls ./src
cd ./documents
```

#### Opção 2: Unix Path com Escapes
```bash
# ✅ FUNCIONA
ls /c/Users/Gabriel\ Cristofolini/Documents/...

# ✅ FUNCIONA (mais claro)
ls /c/users/gabriel\ cristofolini/documents/...
```

#### Opção 3: Variáveis (para paths longos)
```bash
# Define uma vez
PROJECT_ROOT="C:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz"

# Usa com quotes
cd "$PROJECT_ROOT"
ls "$PROJECT_ROOT/src"
```

## Protocolo de Claude Code para Bash no Windows

### Regra 1: Sempre Quote Windows Absolute Paths
```bash
# ❌ ERRADO (vai quebrar)
cd C:\Users\Gabriel Cristofolini\Documents

# ✅ CORRETO
cd "C:\Users\Gabriel Cristofolini\Documents"
```

### Regra 2: Use Caminhos Relativos Quando Possível
```bash
# ✅ MELHOR (relativo, sem quotes necessárias)
cd ./src
ls ./components
```

### Regra 3: Nunca Use && (Use ; para Compatibilidade)
```bash
# ❌ PowerShell error (&&) + Bash context
npm run lint && npm run typecheck

# ✅ CORRETO (;)
npm run lint ; npm run typecheck
```

### Regra 4: Prefira Ferramentas Dedicadas
```typescript
// ❌ Evitar (shell dependency)
bash("grep pattern file.ts")

// ✅ Preferir (ferramenta dedicada)
grep("pattern", "file.ts")

// ❌ Evitar (shell dependency)
bash("cat package.json | head -5")

// ✅ Preferir (ferramenta dedicada)
read("package.json").split("\n").slice(0, 5)
```

## Checklist para Claude Code

Ao executar Bash no Windows:

- [ ] É absolutamente necessário usar Bash? (Senão, use ferramentas dedicadas)
- [ ] Se sim, é um path Windows? (Senão, use relativo)
- [ ] Se sim, tem espaços no path? (Senão, pode deixar sem quotes)
- [ ] Se sim, está quoted? (Obrigatório: `"C:\Users\...\"`)
- [ ] Estou usando `&&`? (Trocar por `;`)
- [ ] Testei com quotes? (Sempre testar antes de considerar "não funciona")

## Exemplos Práticos

### ❌ ERRADO
```bash
cd C:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz
npm install
git status
```
**Resultado**: `/usr/bin/bash: line 1: /c/Users/Gabriel: Permission denied`

### ✅ CORRETO - Opção A (Quotes)
```bash
cd "C:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz"
npm install
git status
```
**Resultado**: Comandos executam com sucesso ✅

### ✅ CORRETO - Opção B (Relativo)
```bash
# Já está no diretório certo
npm install
git status
```
**Resultado**: Comandos executam com sucesso ✅

### ✅ CORRETO - Opção C (Ferramentas Dedicadas)
```typescript
// Em vez de: bash("cat package.json")
read("C:\Users\Gabriel Cristofolini\...\package.json")

// Em vez de: bash("find . -name *.tsx")
glob("**/*.tsx")

// Em vez de: bash("grep pattern src/")
grep("pattern", "src/")
```
**Resultado**: Sem erros de shell, funcionamento garantido ✅

## Quando Este Arquivo se Aplica

Este arquivo é carregado automaticamente pelo Claude Code quando:
- Plataforma: Windows
- Ferramenta: Bash é usada
- Contexto: Qualquer uso de paths

## Referências Relacionadas

- **CLAUDE.md** (Shell section): Contexto humano vs Claude Code
- **powershell-windows/SKILL.md**: Padrões PowerShell para humanos
- **configs/project.yaml**: Regras de shell_chain e shell_forbidden
- **settings.json**: Configuração de Bash

---

**Resumo**: Use ferramentas dedicadas sempre que possível. Se Bash for necessário, sempre quote paths absolutos Windows e use `;` em vez de `&&`.

*Documento criado: 2026-02-27 por Orion*
*Categoria: Troubleshooting | Severidade: Importante | Status: Ativo*
