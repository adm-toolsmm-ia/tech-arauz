# Tech Arauz

> Sistema de Gestão 360° de TI, Inovação e Projetos para o escritório Araúz.

## Visão Geral

O **Portal Tech Arauz** centraliza a gestão de projetos, solicitações e métricas de TI, integrando-se com o ERP Espaider para sincronização automática de dados.

**Status atual**: Fase de documentação e planejamento (pré-implementação).

---

## 🧠 Contexto do Projeto

A definição completa do projeto está em `.context/`:

```
.context/
├── 00-MASTER.md              # 👈 COMECE AQUI
├── 01-foundation/            # O que é o produto
├── 02-rules/                 # Regras de negócio e requisitos
└── 03-specs/                 # Especificações (após arquitetura)
```

**Inventário documentado:**
- ✅ 9 Regras de Negócio (BR-001 a BR-009)
- ✅ 15 Requisitos Funcionais (RF-001 a RF-015)
- ✅ 6 Rotinas de Processo (RT-001 a RT-006)

> **Para entender o projeto**: Leia [`.context/00-MASTER.md`](./.context/00-MASTER.md)

---

## 🤖 Equipe de Especialistas AI

Este projeto utiliza o **Antigravity Kit** como infraestrutura de desenvolvimento. A pasta `.agent/` contém uma equipe completa de especialistas virtuais.

### Componentes

| Tipo          | Quantidade | Descrição                                           |
| ------------- | ---------- | --------------------------------------------------- |
| **Agentes**   | 20         | Personas especializadas (frontend, backend, security, etc.) |
| **Skills**    | 37         | Módulos de conhecimento específico por domínio      |
| **Workflows** | 11         | Fluxos de trabalho padronizados (slash commands)    |

### Principais Agentes

| Agente                 | Domínio                                    |
| ---------------------- | ------------------------------------------ |
| `@project-planner`     | Planejamento, Arquitetura, Roadmap         |
| `@frontend-specialist` | UI/UX, React, Tailwind, Acessibilidade     |
| `@backend-specialist`  | APIs, Banco de Dados, Integrações          |
| `@security-auditor`    | Vulnerabilidades, OWASP, Segredos          |
| `@test-engineer`       | Testes unitários, E2E, TDD                 |

> **Como usar**: Não é necessário mencionar agentes explicitamente. O sistema detecta automaticamente o domínio e aplica o especialista correto.

### Workflows (Slash Commands)

| Comando        | Quando Usar                                |
| -------------- | ------------------------------------------ |
| `/brainstorm`  | Explorar opções antes de implementar       |
| `/plan`        | Gerar plano de implementação detalhado     |
| `/create`      | Criar novas features ou apps               |
| `/debug`       | Investigar bugs de forma sistemática       |
| `/test`        | Gerar e executar testes                    |
| `/orchestrate` | Coordenar múltiplos agentes (tarefas complexas) |

---

## 📂 Estrutura do Projeto

```
tech-arauz/
├── .agent/              # Equipe de especialistas AI
│   ├── agents/          # 20 agentes especializados
│   ├── skills/          # 37 módulos de conhecimento
│   ├── workflows/       # 11 fluxos de trabalho
│   └── scripts/         # Scripts de validação
│
├── .context/            # Contexto e regras do projeto
│   ├── 00-MASTER.md     # Ponto de entrada único
│   ├── 01-foundation/   # Visão e glossário
│   ├── 02-rules/        # Regras de negócio e requisitos
│   └── 03-specs/        # Especificações técnicas (futuro)
│
└── README.md            # Este arquivo
```

---

## 🚀 Próximos Passos

### Fase 1: Planejamento (Em andamento)
- [x] Documentar visão do produto
- [x] Definir regras de negócio
- [x] Listar requisitos funcionais
- [x] Documentar rotinas de processo

### Fase 2: Arquitetura (Próximo)
- [ ] Definir stack técnica
- [ ] Criar ADRs (Architecture Decision Records)
- [ ] Especificar módulos e componentes

### Fase 3: Implementação
- [ ] Criar estrutura inicial do projeto
- [ ] Implementar módulos do MVP
- [ ] Testes e validação

---

## 📖 Filosofia de Desenvolvimento

Este projeto segue os princípios de **Engenharia de Contexto para AI**:

1. **Single Source of Truth**: Cada conceito tem um único documento autoritativo
2. **Context-Dense**: Documentação estruturada e scannable (Markdown, IDs rastreáveis)
3. **Layered Documentation**: Fundação → Regras → Especificações
4. **AI-First**: Documentos otimizados para consumo por agentes AI

---

## 📄 Licença

Projeto interno do escritório Araúz.
