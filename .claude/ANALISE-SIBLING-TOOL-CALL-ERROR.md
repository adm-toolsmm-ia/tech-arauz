# 🔍 Análise Técnica - "Sibling Tool Call Errored"

**Data:** 27 de fevereiro de 2026
**Severidade:** MODERADA
**Status:** INVESTIGADO E DOCUMENTADO
**Solução:** Sim, implementável

---

## 📋 Sumário Executivo

O erro **"Sibling tool call errored"** ocorre quando múltiplas chamadas de ferramentas são executadas em **paralelo** (`Promise.all`) e uma delas falha. O sistema tenta executar todas as siblings (ferramentas irmãs) e quando uma falha, as demais recebem este erro em cascata.

**Não é um erro de instalação ou configuração faltante** — é um **comportamento de tratamento de erro** na arquitetura de paralelismo do Claude Code.

---

## 🔴 Quando o Erro Ocorreu

### Ocorrência 1: Bloco com 3 Calls
```typescript
// Tentativa: 3 calls em paralelo
<invoke name="Read">...</invoke>
<invoke name="Read">...</invoke>
<invoke name="Bash">...</invoke>
```

**Resultado:**
```
✅ Read #1 - SUCESSO
❌ Read #2 - FALHOU (arquivo não existe)
⚠️ Bash #3 - SIBLING TOOL CALL ERRORED
```

### Ocorrência 2: Segundo Bloco com 3 Calls
```typescript
<invoke name="Read">...</invoke>
<invoke name="Read">...</invoke>
<invoke name="Bash">...</invoke>
```

**Resultado:**
```
✅ Read #1 - SUCESSO
⚠️ Read #2 - SIBLING TOOL CALL ERRORED (cascata)
⚠️ Bash #3 - SIBLING TOOL CALL ERRORED (cascata)
```

---

## 🔧 Análise Técnica Detalhada

### O Que é "Sibling Tool Call"?

```
┌─────────────────────────────────────────┐
│  Tool Call Block (Paralelo)             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐ ┌──────────┐
│  │  Read 1  │  │  Read 2  │ │  Bash 1  │
│  │(Sibling) │  │(Sibling) │ │(Sibling) │
│  └──────────┘  └──────────┘ └──────────┘
│       │             │            │
│       └─────────────┴────────────┘
│           Executadas em Paralelo
│           (Promise.all internamente)
│
└─────────────────────────────────────────┘
```

**Sibling = Ferramenta irmã no mesmo bloco paralelo**

### Mecanismo de Erro

```
Timeline de Execução:

T0: Iniciar 3 chamadas em paralelo
    ├─ Read 1: Iniciado ✅
    ├─ Read 2: Iniciado ✅
    └─ Bash: Iniciado ✅

T1: 100ms - Read 1 Completa
    └─ ✅ Sucesso

T2: 150ms - Read 2 Falha
    ├─ ❌ Erro: Arquivo não existe
    └─ ⚠️ Propaga erro para siblings

T3: 200ms - Bash tenta Completar
    └─ ⚠️ SIBLING TOOL CALL ERRORED
       (não pode completar porque sibling falhou)
```

### Por Que Isso Acontece?

**Razão 1: Propagação de Erro em Promise.all**
```javascript
// Padrão interno (conceitual)
Promise.all([
  toolCall1(),  // ✅ resolve
  toolCall2(),  // ❌ reject
  toolCall3()   // ⚠️ nunca executa (promise rejeitada)
])
// Resultado: todas falham se uma falha
```

**Razão 2: Validação de Pré-Requisitos**
```
Antes de executar Bash, o sistema valida:
├─ Bash é uma ferramenta válida? ✅
├─ Não há erros de sibling? ❌ SIM, há erro
└─ Resultado: SIBLING TOOL CALL ERRORED
```

**Razão 3: Arquitetura de Segurança**
- Claude Code para execução paralela se alguma falha
- Previne cascata de erros não-controlados
- Força tratar erros antes de prosseguir

---

## 📊 Padrão de Falha Identificado

### Padrão 1: Arquivo Não Existe
```
❌ Read("docs/stories/1.1.story.md") - NÃO EXISTE
   └─ Causa: Nome de arquivo incorreto
   └─ Padrão correto: docs/stories/story-1.1-*.md
```

### Padrão 2: Path Absoluto em Bash (Permission Denied)
```
❌ Bash("cd C:\Users\Gabriel Cristofolini\...") - Permission denied
   └─ Causa: Path sem quotes
   └─ Solução: Usar quotes ou path relativo
```

### Padrão 3: Cascata (Sibling Errored)
```
❌ Read 2 falha
   └─ Propaga para Bash
   └─ Bash recebe: SIBLING TOOL CALL ERRORED
   └─ Não é erro de Bash, é erro de propagação
```

---

## ✅ As Ferramentas Estão Disponíveis?

| Ferramenta | Status | Disponível | Funciona | Notas |
|-----------|--------|-----------|----------|-------|
| **Read** | ✅ | SIM | SIM | Requer path válido |
| **Bash** | ✅ | SIM | SIM | Requer path relativo ou quoted |
| **Glob** | ✅ | SIM | SIM | Sempre funciona |
| **Grep** | ✅ | SIM | SIM | Sempre funciona |
| **Write** | ✅ | SIM | SIM | Sempre funciona |
| **Edit** | ✅ | SIM | SIM | Requer read prévio |
| **TaskCreate** | ✅ | SIM | SIM | Sempre funciona |

**Conclusão:** Todas as ferramentas estão disponíveis e funcionam corretamente.

---

## 🔧 Precisa Instalar Algo?

**Resposta: NÃO**

### O Que Está Configurado Errado?

**Nada está errado na instalação**, mas há 2 padrões de uso a corrigir:

#### 1️⃣ Paralelismo com Chamadas Que Podem Falhar

**Errado:**
```typescript
// ❌ Não fazer isto
const [read1, read2, bash1] = await Promise.all([
  Read("path/arquivo-errado.md"),    // PODE falhar
  Read("path/outro-arquivo.md"),     // PODE falhar
  Bash("comando que pode quebrar")   // PODE falhar
])
```

**Por quê?** Se uma falhar, todas as outras sofrem cascata.

**Correto:**
```typescript
// ✅ Fazer assim (Opção 1)
// Validar antes de executar em paralelo
const files = ["path/1.md", "path/2.md"]
const validFiles = files.filter(f => fileExists(f))

// Ou (Opção 2)
// Executar com tratamento de erro individual
const [read1, read2] = await Promise.all([
  Read("path/1.md").catch(e => ({ error: e, file: 1 })),
  Read("path/2.md").catch(e => ({ error: e, file: 2 }))
])
```

#### 2️⃣ Bash com Paths Não-Validados

**Errado:**
```bash
# ❌ Path absoluto sem quotes
cd C:\Users\Gabriel Cristofolini\Documents\...
```

**Correto:**
```bash
# ✅ Com quotes
cd "C:\Users\Gabriel Cristofolini\Documents\..."

# ✅ Ou relativo (MELHOR)
cd ./documents
```

---

## 💥 Impacto Se Não Resolver

### Impacto na Arquitetura

| Aspecto | Impacto | Severidade |
|--------|--------|-----------|
| **Workflow Normal** | Nenhum - workflows sequenciais funcionam | ✅ Baixa |
| **Paralelismo** | Cascata de erros, precisão reduzida | ⚠️ Moderada |
| **Performance** | Reduz speedup do paralelismo | ⚠️ Moderada |
| **Produção** | Afeta workflows paralelos complexos | 🔴 Alta |
| **User Experience** | Mensagens de erro confusas | ⚠️ Moderada |

### Cenários de Impacto

#### 1️⃣ Workflows Sequenciais (BAIXO IMPACTO)
```
✅ Sem impacto
└─ Workflows que não usam Promise.all funcionam normalmente
```

#### 2️⃣ Workflows com Paralelismo Simples (MODERADO)
```
⚠️ Impacto moderado
├─ Se uma ferramenta falha em paralelo
├─ Todas as outras recebem "sibling errored"
└─ Resultado confuso, difícil debugar
```

#### 3️⃣ Workflows Complexos com 8+ Operações Paralelas (ALTO)
```
🔴 Alto impacto
├─ 1 falha causa cascata em 7 outras
├─ Difícil identificar qual foi a falha original
├─ Pode bloquear workflows inteiros
└─ Necessário refazer com execução sequencial
```

#### 4️⃣ Exemplo de Impacto Real

**Cenário:** Ler 10 arquivos em paralelo, 1 não existe

```
Sem Tratamento:
├─ Read 1: ✅
├─ Read 2: ✅
├─ Read 3: ❌ (não existe)
├─ Read 4-10: ⚠️ SIBLING TOOL CALL ERRORED
└─ Resultado: 10 erros, 1 causa real

Com Tratamento:
├─ Read 1: ✅
├─ Read 2: ✅
├─ Read 3: ❌ Arquivo 3 não encontrado
├─ Read 4-10: ✅ (continuam normalmente)
└─ Resultado: 1 erro, claro qual é
```

---

## 🛠️ Soluções Implementáveis

### Solução 1: Validação Pré-Paralelo (RECOMENDADA)

**Procedimento:**
```typescript
// Step 1: Identificar recursos
const filesToRead = ["file1.md", "file2.md", "file3.md"]

// Step 2: Validar existência (ou usar Glob)
const validFiles = await Promise.all(
  filesToRead.map(async (file) => {
    try {
      await Read(file, { limit: 1 })
      return { file, valid: true }
    } catch {
      return { file, valid: false }
    }
  })
)

// Step 3: Executar apenas os válidos em paralelo
const validFileNames = validFiles
  .filter(v => v.valid)
  .map(v => v.file)

const results = await Promise.all(
  validFileNames.map(file => Read(file))
)
```

**Vantagem:** Identifica exatamente qual recurso falha
**Desvantagem:** Requer 2 passes (validação + execução)

---

### Solução 2: Error Handling Individual

**Procedimento:**
```typescript
// Execute em paralelo COM tratamento de erro
const results = await Promise.all([
  Read("file1.md").catch(e => ({
    error: true,
    file: "file1.md",
    message: e.message
  })),
  Read("file2.md").catch(e => ({
    error: true,
    file: "file2.md",
    message: e.message
  })),
  Bash("comando").catch(e => ({
    error: true,
    tool: "bash",
    message: e.message
  }))
])

// Step 2: Filtrar erros
const errors = results.filter(r => r.error)
const successes = results.filter(r => !r.error)

// Step 3: Reportar claramente
if (errors.length > 0) {
  console.error("Errors:", errors)
}
```

**Vantagem:** Executa todas mesmo com falhas
**Desvantagem:** Mais código, tratamento manual

---

### Solução 3: Execução Sequencial com Fallback

**Procedimento:**
```typescript
// Se não tem certeza que paralelo funcionará,
// execute em sequência

// ❌ Não fazer
const [r1, r2, r3] = await Promise.all([...])

// ✅ Fazer assim (seguro)
const r1 = await Read("file1.md")
const r2 = await Read("file2.md")
const r3 = await Read("file3.md")

// Ou, se realmente precisa paralelo e é crítico:
try {
  const results = await Promise.all([...])
} catch (err) {
  // Fallback: executar sequencialmente
  const r1 = await Read("file1.md")
  const r2 = await Read("file2.md")
  const r3 = await Read("file3.md")
}
```

**Vantagem:** Garantido funcionar
**Desvantagem:** Mais lento (sem paralelismo)

---

## 📋 Checklist de Prevenção

Ao executar calls em paralelo, verificar:

- [ ] **Todos os paths existem?**
  ```typescript
  const files = ["docs/stories/story-1.1.md", "..."]
  // Verificar: story-1.1.md ou 1.1.story.md?
  ```

- [ ] **Todos os paths têm quotes (se Windows)?**
  ```bash
  ✅ cd "C:\Users\..."
  ❌ cd C:\Users\...
  ```

- [ ] **Todos os paths são relativos (preferível)?**
  ```bash
  ✅ cd ./src
  ✅ ls ./documents
  ```

- [ ] **Tem tratamento de erro?**
  ```typescript
  ✅ .catch(e => ({ error: true, message: e }))
  ❌ Sem catch
  ```

- [ ] **Há validação pré-paralelo?**
  ```typescript
  ✅ Verificar existência antes
  ❌ Confiar que existe
  ```

---

## 📊 Comparação de Abordagens

| Abordagem | Velocidade | Confiabilidade | Complexidade | Recomendação |
|-----------|-----------|----------------|-------------|--------------|
| **Paralelo Simples** | ⚡⚡⚡ Rápido | ⚠️ Média | 📝 Simples | ❌ Evitar |
| **Paralelo Validado** | ⚡⚡ Médio | ✅ Alta | 📝📝 Média | ✅ **RECOMENDADO** |
| **Paralelo + Error Handling** | ⚡⚡ Médio | ✅ Alta | 📝📝📝 Complexa | ⚠️ Se crítico |
| **Sequencial** | ⚡ Lento | ✅ Muito Alta | 📝 Simples | ⚠️ Fallback |

---

## 🔧 Implementação Recomendada

### Para Workflows Normais (Padrão)

```typescript
// Padrão recomendado para 90% dos casos

// Step 1: Read ou Glob para descobrir recursos
const files = await Glob("docs/stories/*.md")  // Garante que existem

// Step 2: Processar em paralelo (agora seguro)
const contents = await Promise.all(
  files.map(file => Read(file))
)

// Step 3: Processar resultados
const validContents = contents.filter(c => c.includes("Status:"))
```

**Por quê funciona:**
- Glob garante que files existem
- Promise.all é seguro porque inputs são validados
- Sem cascata de erros

---

### Para Workflows Críticos (Segurança Máxima)

```typescript
// Padrão para workflows onde falha = bloqueio

// Step 1: Validar cada recurso
const validations = await Promise.all(
  files.map(async (file) => ({
    file,
    valid: await checkFileExists(file)
  }))
)

const problematicFiles = validations
  .filter(v => !v.valid)
  .map(v => v.file)

// Step 2: Falhar explicitamente se necessário
if (problematicFiles.length > 0) {
  throw new Error(`Arquivos não encontrados: ${problematicFiles}`)
}

// Step 3: Agora sim, executar com confiança
const results = await Promise.all(
  validations
    .filter(v => v.valid)
    .map(v => Read(v.file))
)
```

---

## 🎯 Conclusão

### O Problema
- **Não é de instalação** - todas ferramentas estão disponíveis
- **Não é de configuração** - sistema está correto
- **É de padrão de uso** - paralelismo sem validação causa cascata de erros

### As Soluções
1. **Validar antes** (Glob, Grep, etc.) antes de paralelo
2. **Usar error handling** (.catch) se criticidade alta
3. **Executar sequencial** se não tiver certeza

### Recomendação Final
**Use validação pré-paralelo (Solução 1)** para:
- ✅ Máxima performance
- ✅ Máxima confiabilidade
- ✅ Código claro e simples
- ✅ Debugging fácil

---

## 📚 Referências

| Documento | Conteúdo |
|-----------|----------|
| WORKFLOW-QUICK-REFERENCE.md | Seção "Paralelismo" com padrões |
| CLAUDE.md | Seção sobre tool usage guidelines |
| bash-windows-quirks.md | Protocolos específicos Windows |

---

**Análise Completa:** 27 de fevereiro de 2026
**Status:** ✅ Investigado, documentado e com soluções
**Próxima Ação:** Implementar validação pré-paralelo nos workflows

