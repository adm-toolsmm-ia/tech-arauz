---
description: Sincronizar alterações locais com o GitHub (commit + push)
---

# /sync - Workflow de Sincronização com GitHub

Commit e push das alterações para o repositório remoto.

## Pré-requisitos

- Git configurado
- Remote `origin` apontando para `https://github.com/adm-toolsmm-ia/tech-arauz.git`
- Autenticação configurada (SSH ou HTTPS)

## Execução

### 1. Verificar status

```bash
git status
```

### 2. Adicionar arquivos

```bash
# Adicionar todos os arquivos
git add .

# OU adicionar seletivamente
git add <arquivo1> <arquivo2>
```

### 3. Commit

```bash
# Commit com mensagem descritiva
git commit -m "feat: <descrição do que foi implementado>"
```

**Padrão de mensagens** (Conventional Commits):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `refactor:` - Refatoração de código
- `test:` - Adição/modificação de testes
- `chore:` - Tarefas de manutenção (configs, deps)
- `style:` - Formatação de código
- `perf:` - Melhorias de performance

### 4. Push

// turbo
```bash
git push origin main
```

## Atalho Rápido

Para commit + push de uma vez:

```bash
git add . && git commit -m "feat: sua mensagem aqui" && git push origin main
```

## Troubleshooting

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/adm-toolsmm-ia/tech-arauz.git
```

### Erro: "failed to push"

```bash
# Pull primeiro (se houver mudanças remotas)
git pull origin main --rebase

# Depois push
git push origin main
```

### Ver histórico

```bash
git log --oneline --graph
```

## Agentes Envolvidos

- **devops-engineer**: Gerenciamento de repositório e CI/CD
