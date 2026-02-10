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

### Execução Automática (Recomendada)

O projeto conta com um script automatizado que realiza todo o processo (add, commit, pull rebase, push) de forma segura.

**Para executar:**

```powershell
./scripts/sync.ps1
# OU com mensagem personalizada
./scripts/sync.ps1 "feat: minha nova feature"
```

### Execução Manual


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
