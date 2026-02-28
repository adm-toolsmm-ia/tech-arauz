# ⚡ Workflow Quick Reference - Snippets Prontos para Usar

**Data:** 27 de fevereiro de 2026
**Descrição:** Biblioteca de snippets reutilizáveis para operações comuns

---

## 📚 Índice Rápido

- [Operações de Arquivo](#operações-de-arquivo)
- [Git Operations](#git-operations)
- [Paralelismo](#paralelismo)
- [Agentes](#agentes)
- [Tasks](#tasks)
- [Validação](#validação)
- [Troubleshooting](#troubleshooting)

---

## 📂 Operações de Arquivo

### 1. LER ARQUIVO

**Simples:**
```typescript
const content = await Read("src/components/Project.tsx")
```

**Com limite de linhas:**
```typescript
const content = await Read(
  "src/components/Project.tsx",
  limit: 50  // primeiras 50 linhas
)
```

**Múltiplos arquivos em paralelo:**
```typescript
const [file1, file2, file3] = await Promise.all([
  Read("docs/stories/story-1.1.md"),
  Read("src/components/sidebar-config.ts"),
  Read("package.json")
])
```

---

### 2. CRIAR ARQUIVO

**Novo arquivo:**
```typescript
await Write(
  "docs/stories/story-2.1.md",
  `# Story 2.1 - Description

Status: Draft
...`
)
```

**Com validação:**
```typescript
const newFile = "docs/my-file.md"
const content = "# My File\n\n..."

try {
  await Write(newFile, content)
  console.log(`✅ Created: ${newFile}`)
} catch (error) {
  console.error(`❌ Failed to create ${newFile}:`, error.message)
}
```

---

### 3. ALTERAR ARQUIVO

**Procedimento correto:**
```typescript
// Step 1: Read primeiro
const path = "src/components/sidebar-config.ts"
const current = await Read(path)

// Step 2: Identificar string exata
const oldString = "{ title: 'Dashboard', url: '/dashboard' }"
const newString = "{ title: 'Dashboard', url: '/dashboard', badge: 'v2' }"

// Step 3: Editar
await Edit(path, oldString, newString)
```

**Com múltiplas alterações:**
```typescript
const path = "src/lib/config.ts"
const current = await Read(path)

// Alterar 1
await Edit(path, "const API_URL = \"...\"", "const API_URL = \"new-url\"")

// Alterar 2
await Edit(path, "const TIMEOUT = 5000", "const TIMEOUT = 10000")

// Alterar 3
await Edit(path, "debug: false", "debug: true")
```

---

### 4. PESQUISAR ARQUIVOS (GLOB)

**Padrão simples:**
```typescript
const stories = await Glob("docs/stories/*.md")
```

**Padrão recursivo:**
```typescript
const components = await Glob("src/**/*.tsx")
```

**Múltiplas extensões:**
```typescript
const configs = await Glob("src/**/*.{json,yaml,yml}")
```

**Encontrar pattern específico:**
```typescript
// Encontrar todos os testes
const tests = await Glob("tests/**/*.test.{ts,tsx}")

// Encontrar migrations
const migrations = await Glob("supabase/migrations/*.sql")

// Encontrar componentes do projeto
const projectComps = await Glob("src/components/project/*.tsx")
```

---

### 5. PESQUISAR CONTEÚDO (GREP)

**Busca simples:**
```typescript
const results = await Grep("Status: Done", "docs/stories/")
```

**Retornar apenas nomes de arquivos:**
```typescript
const filesWithDone = await Grep(
  "Status: Done",
  "docs/stories/",
  output_mode: "files_with_matches"
)
```

**Retornar linhas com contexto:**
```typescript
const contextResults = await Grep(
  "database.ts",
  "src/",
  output_mode: "content",
  context: 3  // 3 linhas antes e depois
)
```

**Padrão regex:**
```typescript
const importsOfEd = await Grep(
  "import.*Edit",
  "src/",
  output_mode: "files_with_matches"
)
```

**Case-insensitive:**
```typescript
const allTypes = await Grep(
  "interface.*props",
  "src/components/",
  output_mode: "content",
  "-i": true
)
```

---

## 💻 Git Operations

### 1. STATUS E DIFF

**Verificar status (COM PATH RELATIVO):**
```bash
pwd
git status --short
```

**Ver diferenças não staged:**
```bash
git diff --stat  # resumo por arquivo
git diff  # conteúdo completo
```

**Ver diferenças staged:**
```bash
git diff --cached
```

---

### 2. COMMIT VIA SKILL

**Commit simples:**
```typescript
await Skill({
  skill: "commit",
  args: "-m 'feat: add new feature'"
})
```

**Commit com scopo:**
```typescript
await Skill({
  skill: "commit",
  args: "-m 'feat(stories): create story 2.1'"
})
```

**Commit com corpo:**
```typescript
await Skill({
  skill: "commit",
  args: "-m 'fix: resolve permission denied error\n\nChange bash protocol to use relative paths\nUpdate documentation'"
})
```

---

### 3. LOG E HISTÓRICO

**Ver últimos commits:**
```bash
git log --oneline -10
```

**Ver commits detalhados:**
```bash
git log --oneline --graph --decorate -10
```

**Ver commits de um arquivo:**
```bash
git log --oneline -- docs/stories/story-2.1.md
```

---

## 🔄 Paralelismo

### 1. MÚLTIPLOS READS EM PARALELO

```typescript
// ✅ RÁPIDO - Todos em paralelo
const [epic, story1, story2] = await Promise.all([
  Read("docs/stories/epic-technical-debt.md"),
  Read("docs/stories/story-1.1.md"),
  Read("docs/stories/story-1.2.md")
])

// Time: ~200ms (vs ~600ms sequencial)
```

---

### 2. MÚLTIPLOS WRITES EM PARALELO

```typescript
await Promise.all([
  Write("docs/stories/story-2.1.md", content1),
  Write("docs/stories/story-2.2.md", content2),
  Write("docs/stories/story-2.3.md", content3)
])
```

---

### 3. GLOB + READ COMBINADO

```typescript
// Encontrar todos os stories
const storyFiles = await Glob("docs/stories/*.md")

// Ler todos em paralelo
const allStories = await Promise.all(
  storyFiles.map(file => Read(file, limit: 20))
)

// Resultado: Array[strings]
```

---

## 🤖 Agentes

### 1. INVOCAR UM AGENTE (Sequencial)

```typescript
await Task({
  description: "Dev - Implementar novo componente",
  prompt: `
    Você é @dev (Dex).

    Tarefa: Criar novo componente ProjectTable
    Requisitos:
    - TypeScript completo
    - Testes unitários
    - Pronto para usar
  `,
  subagent_type: "dev"
})
```

---

### 2. INVOCAR 3 AGENTES (Paralelo)

```typescript
const [devResult, qaResult, archResult] = await Promise.all([
  Task({
    description: "Dev - Implementação",
    prompt: "...",
    subagent_type: "dev"
  }),
  Task({
    description: "QA - Testes",
    prompt: "...",
    subagent_type: "qa"
  }),
  Task({
    description: "Architect - Review",
    prompt: "...",
    subagent_type: "architect"
  })
])
```

---

### 3. AGENTES ESPECÍFICOS

**Dev Agent:**
```typescript
subagent_type: "dev"  // @dev / Dex - Implementação
```

**QA Agent:**
```typescript
subagent_type: "qa"   // @qa / Quinn - Testes
```

**Architect Agent:**
```typescript
subagent_type: "architect"  // @architect / Aria - Design
```

**PM Agent:**
```typescript
subagent_type: "pm"   // @pm / Morgan - Product
```

**PO Agent:**
```typescript
subagent_type: "po"   // @po / Pax - Product Owner
```

**Scrum Master:**
```typescript
subagent_type: "sm"   // @sm / River - Agile
```

**Data Engineer:**
```typescript
subagent_type: "data-engineer"  // @data-engineer / Dara - DB
```

---

## 📋 Tasks

### 1. CRIAR TASK

```typescript
const task = await TaskCreate({
  subject: "Implementar novo filtro",
  description: "Criar ProjectFilters component com suporte a múltiplos critérios",
  activeForm: "Implementando filtro"  // Obrigatório
})
```

---

### 2. CRIAR MÚLTIPLAS TASKS EM PARALELO

```typescript
const [t1, t2, t3] = await Promise.all([
  TaskCreate({
    subject: "Task 1 - Leitura",
    description: "Ler specs...",
    activeForm: "Lendo"
  }),
  TaskCreate({
    subject: "Task 2 - Criação",
    description: "Criar arquivos...",
    activeForm: "Criando"
  }),
  TaskCreate({
    subject: "Task 3 - Validação",
    description: "Validar...",
    activeForm: "Validando"
  })
])
```

---

### 3. ATUALIZAR TASK STATUS

```typescript
// Mark como in_progress
await TaskUpdate({
  taskId: "2",
  status: "in_progress"
})

// Mark como completed
await TaskUpdate({
  taskId: "2",
  status: "completed"
})

// Adicionar metadata
await TaskUpdate({
  taskId: "2",
  status: "completed",
  metadata: {
    sprint: "Q1-2026",
    reviewer: "@qa"
  }
})
```

---

### 4. MARCAR TASK COM DEPENDÊNCIAS

```typescript
// Task 2 depende de Task 1
await TaskUpdate({
  taskId: "2",
  addBlockedBy: ["1"]
})

// Task 3 aguarda Task 2
await TaskUpdate({
  taskId: "3",
  addBlockedBy: ["2"]
})
```

---

## ✅ Validação

### 1. VALIDAR STORY

```typescript
// 1. Ler a story
const storyContent = await Read("docs/stories/story-1.1.md")

// 2. Verificar campos obrigatórios
const hasStatus = storyContent.includes("Status:")
const hasEpic = storyContent.includes("Epic:")
const hasAC = storyContent.includes("## Acceptance Criteria")

if (hasStatus && hasEpic && hasAC) {
  console.log("✅ Story válida")
} else {
  console.log("❌ Story incompleta")
}
```

---

### 2. VALIDAR ARQUIVO APÓS EDIT

```typescript
const path = "src/components/sidebar-config.ts"

// Antes
const before = await Read(path)
console.log(`Before: ${before.length} chars`)

// Editar
await Edit(path, oldStr, newStr)

// Depois
const after = await Read(path)
console.log(`After: ${after.length} chars`)

if (after.includes("badge: 'v2'")) {
  console.log("✅ Alteração validada")
}
```

---

### 3. VALIDAR MÚLTIPLOS ARQUIVOS

```typescript
const filesToValidate = [
  "docs/stories/story-2.1.md",
  "src/components/sidebar-config.ts",
  "docs/stories/epic-technical-debt.md"
]

const validations = await Promise.all(
  filesToValidate.map(async (file) => {
    const content = await Read(file)
    return {
      file,
      exists: true,
      size: content.length,
      isValid: content.length > 50
    }
  })
)

console.table(validations)
```

---

## 🐛 Troubleshooting

### 1. BASH COM PERMISSION DENIED

**Problema:**
```bash
/usr/bin/bash: line 1: /c/Users/Gabriel: Permission denied
```

**Solução 1 - Usar Path Relativo ✅ (PREFERIDO):**
```bash
cd ./docs/stories
pwd
git status
```

**Solução 2 - Usar Path COM Quotes:**
```bash
cd "C:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz"
pwd
```

**Solução 3 - Usar Ferramentas Dedicadas ✅ (MELHOR):**
```typescript
// Em vez de bash para ler arquivo:
const content = await Read("path/to/file.md")

// Em vez de bash para encontrar arquivo:
const files = await Glob("docs/**/*.md")

// Em vez de bash para pesquisar:
const results = await Grep("pattern", "src/")
```

---

### 2. EDIT FALHA - OLD_STRING NÃO ENCONTRADA

**Problema:**
```
ERROR: old_string not found in file
```

**Solução:**
```typescript
// 1. Ler o arquivo
const content = await Read("file.ts")

// 2. Procurar a string EXATA
const exactString = content.substring(100, 200)
console.log(exactString)

// 3. Editar com a string correta
await Edit(
  "file.ts",
  exactString,  // Use a cópia exata do arquivo
  newString
)
```

---

### 3. GREP NÃO ENCONTRA NADA

**Problema:**
```
No results found
```

**Solução:**
```typescript
// 1. Verificar se a pattern está correta
const results = await Grep("Status", "docs/", output_mode: "content")

// 2. Tentar com regex
const regexResults = await Grep(
  "Status: (Done|Draft)",
  "docs/",
  output_mode: "content"
)

// 3. Case-insensitive
const anyCase = await Grep(
  "status",
  "docs/",
  "-i": true
)
```

---

### 4. TASK NÃO ATUALIZA

**Problema:**
```
Task update failed
```

**Solução:**
```typescript
// 1. Usar TaskGet para ver estado atual
const task = await TaskGet({ taskId: "2" })
console.log(task)

// 2. Verificar status válido: pending, in_progress, completed
const validStatuses = ["pending", "in_progress", "completed"]

// 3. Atualizar com validação
if (validStatuses.includes("completed")) {
  await TaskUpdate({
    taskId: "2",
    status: "completed"
  })
}
```

---

## 🎯 Workflow Templates

### TEMPLATE 1: Criar Nova Story

```typescript
// 1. Read epic
const epic = await Read("docs/stories/epic-technical-debt.md")

// 2. Glob stories
const existingStories = await Glob("docs/stories/story-*.md")

// 3. Write nova story
await Write(
  "docs/stories/story-2.1-novo.md",
  "# Story 2.1\n..."
)

// 4. Edit epic
const newEpicContent = epic + "\n- Story 2.1: novo"
await Edit(epic, oldStr, newEpicContent)

// 5. Create tasks
const [t1, t2] = await Promise.all([
  TaskCreate({subject: "Leitura", ...}),
  TaskCreate({subject: "Criação", ...})
])

// 6. Invocar agentes
const [dev, qa] = await Promise.all([
  Task({subagent_type: "dev", ...}),
  Task({subagent_type: "qa", ...})
])
```

---

### TEMPLATE 2: Validar Múltiplos Arquivos

```typescript
// 1. Find all files
const files = await Glob("src/**/*.tsx")

// 2. Read and validate
const validations = await Promise.all(
  files.map(async (file) => {
    const content = await Read(file, limit: 10)
    return {
      file,
      hasImports: content.includes("import"),
      isValid: content.length > 0
    }
  })
)

// 3. Report
const valid = validations.filter(v => v.isValid).length
console.log(`✅ ${valid}/${validations.length} valid`)
```

---

### TEMPLATE 3: Parallelizar Tudo

```typescript
const [
  readResult,
  globResult,
  grepResult,
  taskResult,
  agentResults
] = await Promise.all([
  // Reads em paralelo
  Promise.all([
    Read("file1.md"),
    Read("file2.md"),
    Read("file3.md")
  ]),

  // Glob em paralelo
  Promise.all([
    Glob("docs/**/*.md"),
    Glob("src/**/*.tsx"),
    Glob("tests/**/*.test.ts")
  ]),

  // Grep em paralelo
  Promise.all([
    Grep("Status: Done", "docs/"),
    Grep("export const", "src/")
  ]),

  // Tasks em paralelo
  Promise.all([
    TaskCreate({...}),
    TaskCreate({...}),
    TaskCreate({...})
  ]),

  // Agentes em paralelo
  Promise.all([
    Task({subagent_type: "dev", ...}),
    Task({subagent_type: "qa", ...}),
    Task({subagent_type: "architect", ...})
  ])
])
```

---

## ⚡ Performance Tips

### ✅ RÁPIDO
```typescript
// Leitura em paralelo (3x mais rápido)
await Promise.all([Read(f1), Read(f2), Read(f3)])

// Glob com padrão específico
await Glob("docs/stories/*.md")  // Rápido

// Grep com output_mode otimizado
await Grep("pattern", "src/", output_mode: "files_with_matches")  // Rápido
```

### ❌ LENTO
```typescript
// Leitura sequencial
await Read(f1)
await Read(f2)
await Read(f3)

// Glob muito abrangente
await Glob("**/*")  // Lento

// Grep com contexto excessivo
await Grep("pattern", "src/", context: 100)  // Lento
```

---

## 📚 Referências

- **Protocolo:** `.claude/rules/bash-windows-quirks.md`
- **Workflow Teste:** `WORKFLOW-TEST-REPORT.md`
- **Exemplo Prático:** `EXEMPLO-WORKFLOW-PRATICO.md`
- **Memory:** `memory/MEMORY.md`

---

**Última atualização:** 27 de fevereiro de 2026
**Status:** ✅ Pronto para uso

