# Tech Araúz

> Sistema de Gestão 360° de TI, Inovação e Projetos para o escritório Araúz.

## Visão Geral

O **Portal Tech Arauz** centraliza a gestão de projetos, solicitações e métricas de TI, integrando-se com o ERP Espaider para sincronização automática de dados.

**Status atual**: 🚀 **Fase de Evolução/Implementação**
O sistema já conta com integração funcional com ERP, Dashboard de métricas, Gestão de Projetos (Kanban/Lista) e Gestão de Usuários.

---

## 🧠 Contexto do Projeto

A documentação oficial de regras de negócio e requisitos reside EXCLUSIVAMENTE em `.context/`:

```
.context/
├── 00-MASTER.md              # 👈 COMECE AQUI (Ponto de Entrada Único)
├── 01-foundation/            # Visão, Glossário e Escopo
├── 02-rules/                 # Regras de Negócio, Requisitos e Rotinas
└── 03-specs/                 # Especificações Técnicas e ADRs
```

> **Atenção:** Qualquer documentação fora desta estrutura (antiga pasta `docs`) foi migrada ou removida para garantir uma única fonte de verdade.

---

## 🤖 Equipe de Especialistas AI

Este projeto utiliza o **Antigravity Kit**. Mais detalhes em `.agent/`.

---

## 🚀 Como Executar

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Configurar ambiente:**
    Copie `.env.example` para `.env.local` e preencha as chaves (Supabase, Espaider Token).

3.  **Rodar servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Rodar testes:**
    ```bash
    npm run test
    ```

5.  **Comandos de DX:**
    - `npm run sync`: Sincroniza mudanças com GitHub (commit + push + rebase)
    - `npm run db:apply`: Aplica migrations do Supabase (idempotente)

---

## 📂 Estrutura do Projeto

```
tech-arauz/
├── .agent/              # Configurações dos Agentes AI
├── .context/            # Regras de Negócio ([Leia aqui](.context/README.md))
├── src/                 # Código Fonte ([Leia aqui](src/README.md))
│   ├── app/             # Frontend (Next.js App Router)
│   ├── components/      # UI Components (Shadcn/UI)
│   ├── integrations/    # Integrações Externas (Espaider API)
│   │   └── espaider/
│   │       └── references/ # Mocks e Docs Técnicos da API
│   └── lib/             # Utilitários e Core Logic
├── supabase/            # Banco de Dados & Migrations ([Leia aqui](supabase/README.md))
└── README.md            # Este arquivo
```

---

## 📄 Licença

Projeto interno do escritório Araúz.
