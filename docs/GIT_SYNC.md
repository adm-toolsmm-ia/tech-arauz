# Guia de Sincronização com GitHub

## Workflow /sync

O projeto possui um workflow padronizado para commit e push. Use o comando `/sync` ou siga o guia abaixo.

## Passo a Passo

### 1. Verificar mudanças

```bash
git status
```

### 2. Adicionar arquivos

```bash
# Adicionar todos
git add .

# Ou adicionar específicos
git add src/ docs/
```

### 3. Commit (Conventional Commits)

Formato: `tipo: descrição`

```bash
git commit -m "feat: nova funcionalidade X"
```

**Tipos comuns:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `chore:` - Tarefas de manutenção
- `refactor:` - Refatoração
- `test:` - Testes

### 4. Push

```bash
git push origin main
```

## Atalho Rápido

```bash
git add . && git commit -m "feat: sua mensagem" && git push origin main
```

## Informações do Repositório

- **URL**: https://github.com/adm-toolsmm-ia/tech-arauz.git
- **Branch principal**: `main`
- **Remote**: `origin`

## Arquivos Protegidos

O `.gitignore` já está configurado para NOT commitar:

- `docs/credenciais/` ✅
- `.env` e `.env.local` ✅
- `node_modules/` ✅
- `.next/` e `build/` ✅

## Próximo Commit

Use o comando `/sync` ou execute:

```bash
git add .
git commit -m "tipo: sua mensagem aqui"
git push origin main
```
