---
description: Guia de deploy para Vercel via GitHub Actions
---

# 🚀 Workflow de Deploy (Vercel)

Este projeto utiliza **Vercel** para hospedagem e **GitHub Actions** para Integração Contínua (CI).

## 🔄 Fluxo de Trabalho (CI/CD)

O deploy é acionado automaticamente através do **Git**.

1.  **Desenvolvimento**: Crie uma branch para sua feature (`git checkout -b feat/nova-feature`).
2.  **Pull Request**: Abra um PR para a branch `main`.
    *   🤖 **GitHub Actions** rodará automaticamente:
        *   `Lint`: Verifica estilo de código.
        *   `Test`: Executa testes unitários.
        *   `Build`: Verifica se o projeto compila.
3.  **Merge & Deploy**: Ao fazer merge na `main`, o Vercel iniciará o deploy de produção automaticamente.

## 🛠️ Configuração

As configurações de deploy estão definidas em:
*   `vercel.json`: Configurações de infraestrutura (região, framework).
*   `.github/workflows/ci.yml`: Pipeline de testes automatizados.

## ⚠️ Pré-requisitos de Produção

Para que o deploy funcione, o projeto deve estar vinculado à Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Vincular projeto (rodar na raiz)
vercel link
```

## 🔍 Monitoramento

*   **GitHub**: Aba "Actions" do repositório para ver status dos testes.
*   **Vercel**: Dashboard para ver logs de build e status do deploy.
