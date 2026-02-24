# 📂 .context/ (Business Rules & Requirements)

> **⚠️ Atenção:** Este diretório contém a "Fonte da Verdade" do projeto.

## 🎯 Ponto de Entrada

Por favor, leia **[`00-MASTER.md`](./00-MASTER.md)**. Ele é o índice mestre de toda a documentação funcional e de negócio.

## 📄 Estrutura

- `00-MASTER.md`: Índice Geral.
- `01-foundation/`: Visão e Glossário.
- `02-rules/`: Regras de Negócio Detalhadas.
- `03-specs/`: Especificações Técnicas e ADRs.

> 🚫 **REGRA ESTRITA DA PASTA `.context` (LEITURA OBRIGATÓRIA PARA AGENTES)**
>
> 1. **PROIBIDO CRIAR ARQUIVOS NOVOS NA RAIZ** desta pasta, a menos que sejam roteiros oficiais de longo prazo (como `IMPLEMENTATIONS.md` ou `DEVELOPMENT_ROADMAP.md`).
> 2. **PROIBIDO SALVAR LOGS DE ERROS OU DIAGNÓSTICOS AQUI**. Todo arquivo do tipo "Investigation Summary", "Error Diagnosis" ou relacionados à resolução de bugs e debugs, devem ser obrigatoriamente salvos em `.agent/memory/YYYY-MM-DD_{task}.md`.
> 3. **PROIBIDO SALVAR PLANOS DE SPRINTS SOLTOS AQUI**. Qualquer plano de refatoração, planejamento de tarefa ou specs, devem ir para `.context/03-specs/`. `task.md` temporários devem ir para a raiz do projeto (como instruído na "plan-writing skill") ou serem removidos.
