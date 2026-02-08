# Arquitetura de Documentação - Tech Arauz MVP

> **Autor**: @project-planner + @documentation-writer  
> **Data**: 2026-02-07  
> **Status**: 🟡 Em Planejamento  
> **Objetivo**: Definir a estrutura de documentação AI-first para o Portal Tech Arauz

---

## 📋 Índice

1. [Princípios de Documentação AI-First](#princípios)
2. [Auditoria do Estado Atual](#auditoria)
3. [Documentos Essenciais (O que falta)](#documentos-essenciais)
4. [Estrutura de Pastas Proposta](#estrutura)
5. [Roadmap de Documentação](#roadmap)
6. [Templates e Padrões](#templates)

---

## 🎯 Princípios de Documentação AI-First {#princípios}

### 1. **Single Source of Truth (SSOT)**
- Cada conceito tem um único documento autoritativo
- Cross-references via links, não duplicação

### 2. **Context-Dense & Scannable**
- Markdown estruturado (headers, listas, tabelas)
- Diagramas Mermaid para fluxos complexos
- IDs únicos para rastreabilidade (`RF-001`, `US-001`, `ADR-001`)

### 3. **Versioned Decision Records**
- ADRs (Architecture Decision Records) para decisões técnicas
- BDRs (Business Decision Records) para decisões de produto

### 4. **Executable Documentation**
- User Stories com critérios de aceitação testáveis
- API specs que podem gerar testes automaticamente

### 5. **Progressive Disclosure**
- INDEX como roteador de contexto
- Documentos separados por domínio
- Profundidade sob demanda (links para detalhes)

---

## 🔍 Auditoria do Estado Atual {#auditoria}

### O que já temos (em `docs/tech-arauz-claude-v01/`)

| Documento | Status | Cobertura | Lacunas |
|-----------|--------|-----------|---------|
| `00-INDEX.md` | ✅ Completo | Roteador de contexto | - |
| `01-vision-scope.md` | ✅ Completo | Visão e escopo MVP | Faltam User Personas detalhadas |
| `03-architecture.md` | ✅ Completo | Stack técnica | Decisões arquiteturais (ADRs) pendentes |
| `04-database-schema.md` | ✅ Completo | Modelo de dados | Migrations não documentadas |
| `05-espaider-integration.md` | ✅ Completo | Integração ERP | Tratamento de erros edge cases |
| `06-feature-map.md` | ✅ Completo | Módulos e rotas | User Stories faltando |
| `07-dashboard-kpis.md` | ✅ Completo | Métricas | Queries SQL não documentadas |
| `17-prd-seed.md` | ✅ Completo | Requisitos MoSCoW | Sem critérios de aceitação formais |

### O que **NÃO** temos (crítico para os agentes)

| Tipo | Documento Faltante | Importância | Agente que precisa |
|------|--------------------|-------------|-------------------|
| **Negócio** | Business Rules (Regras de Negócio) | 🔴 Alta | @backend-specialist, @frontend-specialist |
| **Produto** | User Stories com Acceptance Criteria | 🔴 Alta | @project-planner, @test-engineer |
| **UX** | User Flows & Journey Maps | 🔴 Alta | @frontend-specialist, @ux-designer |
| **Design** | Design System & UI Components Spec | 🟡 Média | @frontend-specialist |
| **API** | API Contract (OpenAPI/Swagger) | 🔴 Alta | @backend-specialist, @test-engineer |
| **Segurança** | Security Requirements & Threat Model | 🔴 Alta | @security-auditor |
| **Dados** | Data Dictionary & Entity Glossary | 🟡 Média | @database-architect |
| **Qualidade** | Testing Strategy & Test Cases | 🔴 Alta | @test-engineer |
| **Deploy** | Deployment Plan & Runbook | 🟡 Média | @devops-engineer |
| **Decisões** | ADRs (Architecture Decision Records) | 🔴 Alta | @project-planner |

---

## 📚 Documentos Essenciais (O que falta) {#documentos-essenciais}

### 1. **Business Rules Document** (`docs/business-rules.md`)

**Objetivo**: Centralizar todas as regras de negócio do Portal Tech Arauz.

**Seções**:
- **Regras de Autorização**: Quem pode fazer o quê (além de RBAC técnico)
- **Regras de Workflow**: Estados e transições permitidas (ex: Projeto pode ir de "Aprovação" para "Desenvolvimento", mas não diretamente para "Encerrado")
- **Regras de Validação**: Campos obrigatórios, formatos, limites
- **Regras de Cálculo**: Fórmulas de KPIs, SLA, priorização
- **Regras de Integração**: O que sincronizar, quando, frequência

**Exemplo de estrutura**:
```markdown
## BR-001: Projeto só pode ser encerrado com todas as entregas concluídas
- **Entidade**: Projeto
- **Trigger**: Quando usuário tenta alterar status para "Encerrado"
- **Condição**: `entregas_projeto.status != 'Concluído'` para qualquer entrega
- **Ação**: Bloquear alteração + mostrar erro "Existem entregas pendentes"
- **Exceção**: Admin pode forçar encerramento
```

---

### 2. **User Stories com Acceptance Criteria** (`docs/user-stories/`)

**Objetivo**: Traduzir requisitos em histórias acionáveis para os agentes.

**Formato**:
```markdown
## US-001: Visualizar Dashboard Geral

**Como** Gestor de TI  
**Eu quero** visualizar o dashboard com KPIs de solicitações  
**Para que** eu possa acompanhar o status em tempo real

### Acceptance Criteria (AC)

✅ **AC-001**: Dashboard exibe 6 cards de KPI no topo  
✅ **AC-002**: Gráficos respondem ao filtro de período (hoje/7d/30d/mês)  
✅ **AC-003**: Click em KPI card filtra a lista de solicitações abaixo  
✅ **AC-004**: Dashboard carrega em < 2 segundos com até 10k registros  

### Technical Notes
- Hook: `useDashboardStats({ period })`
- Componentes: `KPICard`, `SolicitacoesChart`, `FilterPeriod`

### Dependencies
- [[04-database-schema]] tabela `solicitacoes`
- [[07-dashboard-kpis]] fórmulas KPI-001 a KPI-007
```

**Organização**: Uma pasta por módulo
```
docs/user-stories/
├── dashboard/
│   ├── US-001-visualizar-dashboard-geral.md
│   ├── US-002-filtrar-por-periodo.md
├── projetos/
│   ├── US-010-visualizar-kanban.md
│   ├── US-011-mover-card-kanban.md
```

---

### 3. **User Flows & Journey Maps** (`docs/ux/user-flows.md`)

**Objetivo**: Mapear jornadas do usuário para o @frontend-specialist entender o fluxo completo.

**Formato**: Mermaid flowcharts

```markdown
## UF-001: Login até visualizar solicitação

\`\`\`mermaid
flowchart TD
    Start([Usuário acessa /]) --> Auth{Autenticado?}
    Auth -->|Não| Login[/auth - Tela de Login]
    Login --> SubmitCreds[Envia email + senha]
    SubmitCreds --> ValidAuth{Credenciais válidas?}
    ValidAuth -->|Não| ErrorMsg[Exibe erro]
    ErrorMsg --> Login
    ValidAuth -->|Sim| SetSession[Supabase cria sessão JWT]
    Auth -->|Sim| Dashboard[/ - Dashboard Geral]
    SetSession --> Dashboard
    Dashboard --> ClickSol[Click em solicitação]
    ClickSol --> OpenSheet[Sheet com detalhes]
    OpenSheet --> End([Fim do fluxo])
\`\`\`

**Pain Points**:
- Se sessão expirar durante uso, deve redirecionar para login sem perder estado
- Sheet deve carregar < 500ms

**Success Metrics**:
- Time to First Interaction (TTFI) < 3s
- Bounce rate < 10% na tela de login
```

---

### 4. **Design System Spec** (`docs/ux/design-system.md`)

**Objetivo**: Definir componentes visuais reutilizáveis para o @frontend-specialist.

**Seções**:
- **Cores**: Paleta completa (já definida em `tailwind.config.ts`, mas explicar uso)
- **Tipografia**: Hierarquia (h1-h6, body, caption)
- **Componentes**: Specs de cada componente Shadcn customizado
- **Espaçamento**: Grid system (4px base)
- **Ícones**: Biblioteca (Lucide) e quando usar cada um
- **Estados**: Hover, active, disabled, loading

**Exemplo**:
```markdown
## Componente: KPI Card

### Anatomia
\`\`\`
┌─────────────────────────────┐
│ 📊 Título do KPI            │
│                             │
│      1,234                  │ ← Valor (text-4xl)
│    ↑ +12%                   │ ← Variação (text-sm)
└─────────────────────────────┘
```

### Variantes
- **default**: Fundo branco, borda cinza
- **clickable**: Hover com sombra, cursor pointer
- **alert**: Borda vermelha se valor crítico

### Props
\`\`\`ts
interface KPICardProps {
  title: string
  value: number
  trend?: { direction: 'up' | 'down', percentage: number }
  onClick?: () => void
  alert?: boolean
}
\`\`\`
```

---

### 5. **API Contract** (`docs/api-contract.yml`)

**Objetivo**: Especificar exatamente o que cada Edge Function retorna.

**Formato**: OpenAPI 3.0

```yaml
openapi: 3.0.0
info:
  title: Tech Arauz API
  version: 1.0.0

paths:
  /functions/v1/sync-espaider:
    post:
      summary: Sincroniza dados do Espaider
      operationId: syncEspaider
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                api_id:
                  type: string
                  format: uuid
                filters:
                  type: object
      responses:
        '200':
          description: Sincronização bem-sucedida
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  processados:
                    type: integer
                  novos:
                    type: integer
                  atualizados:
                    type: integer
                  erros:
                    type: integer
        '500':
          description: Erro na sincronização
```

**Uso**: @backend-specialist e @test-engineer podem gerar:
- Tipos TypeScript automaticamente
- Testes de contrato
- Mock servers

---

### 6. **Security Requirements** (`docs/security/requirements.md`)

**Objetivo**: Checklist de segurança que o @security-auditor precisa validar.

**Seções**:
- **Authentication**: Requisitos de auth (JWT, refresh tokens, timeout)
- **Authorization**: RBAC + RLS coverage
- **Data Protection**: Campos sensíveis a mascarar
- **Input Validation**: Sanitização (XSS, SQL injection)
- **Rate Limiting**: Limites por endpoint
- **Secrets Management**: Onde armazenar tokens, APIs
- **Audit Logging**: O que logar

**Exemplo**:
```markdown
## SEC-001: Mascaramento de Tokens de API

**Requisito**: Tokens de API não podem ser exibidos em texto plano no frontend.

**Implementação**:
- View `apis_safe` retorna `substring(token, 1, 4) || '****'`
- Frontend usa `apis_safe`, Edge Functions usam `apis` diretamente
- Logs sanitizam tokens antes de armazenar

**Teste**:
- Verificar que query `SELECT * FROM apis_safe` não expõe token completo
- Verificar que logs não contêm `?Token=ABC123` em URLs

**Referência**: [[12-security-rbac]]
```

---

### 7. **Testing Strategy** (`docs/testing/strategy.md`)

**Objetivo**: Definir o que testar, como, e quando.

**Pirâmide de Testes**:
```
        /\
       /E2E\      ← 10% (Playwright - fluxos críticos)
      /------\
     /  INT   \   ← 20% (Integração - API + DB)
    /----------\
   /    UNIT    \ ← 70% (Vitest - funções puras, hooks)
  /--------------\
```

**Test Cases por Módulo**:
```markdown
## Módulo: Dashboard

### Unit Tests
- `useDashboardStats` retorna dados corretos para cada período
- `formatKPIValue` formata números com separador de milhares
- `calculateTrend` calcula variação percentual corretamente

### Integration Tests
- Query de KPIs retorna resultados em < 1s
- Filtro de período atualiza gráficos corretamente

### E2E Tests
- TC-DASH-001: Login → Dashboard carrega todos os KPIs
- TC-DASH-002: Click em KPI filtra lista de solicitações
```

---

### 8. **ADRs (Architecture Decision Records)** (`docs/adrs/`)

**Objetivo**: Documentar TODAS as decisões arquiteturais (as do protótipo + novas).

**Formato**:
```markdown
# ADR-006: Uso de Supabase RLS para Controle de Acesso

**Status**: ✅ Aprovado  
**Data**: 2026-02-07  
**Autor**: @security-auditor + @backend-specialist  

## Contexto
Precisamos de controle de acesso granular por linha de dados. Usuários 'viewer' não podem ver projetos de outras áreas.

## Decisão
Usar Row-Level Security (RLS) nativo do PostgreSQL via Supabase.

## Alternativas Consideradas
1. **Middleware na aplicação**: Filtrar no código antes de retornar
   - ❌ Propenso a erros (esquecer filtro)
   - ❌ Aumenta latência
2. **Views separadas por role**: Criar `projetos_admin`, `projetos_user`
   - ❌ Duplicação de estrutura
   - ❌ Difícil manutenção

## Consequências

### Positivas
- ✅ Segurança nativa do banco (não dá pra burlar)
- ✅ Reduz código na aplicação
- ✅ Performance otimizada (Postgres indexa policies)

### Negativas
- ⚠️ Debugging mais complexo (policies invisíveis no código)
- ⚠️ Testes precisam simular roles diferentes

## Implementação
- Policies em `supabase/migrations/`
- Função helper `has_role(role_name)` já implementada
- Cobertura: 100% das tabelas sensíveis

## Validação
- [ ] Testar que 'viewer' não acessa projetos de outra área
- [ ] Testar que 'admin' acessa tudo
- [ ] Auditar tabelas sem RLS
```

---

## 🗂️ Estrutura de Pastas Proposta {#estrutura}

```
docs/
├── 00-INDEX.md                          # Roteador de contexto (já existe)
├── DOCUMENTATION_ARCHITECTURE.md        # Este arquivo
├── tech-arauz-claude-v01/               # Documentação existente (manter)
│   ├── 00-INDEX.md
│   ├── 01-vision-scope.md
│   ├── ... (20 documentos)
│
├── business/                            # 🆕 Regras de Negócio
│   ├── business-rules.md
│   ├── glossary.md                      # Mover de tech-arauz-claude-v01/02-glossary.md
│   └── data-dictionary.md
│
├── product/                             # 🆕 Produto e User Stories
│   ├── user-personas.md
│   ├── user-stories/
│   │   ├── dashboard/
│   │   ├── projetos/
│   │   ├── solicitacoes/
│   │   └── admin/
│   └── roadmap.md                       # Já existe: tech-arauz-claude-v01/18-roadmap-wbs.md
│
├── ux/                                  # 🆕 Design e Experiência
│   ├── user-flows.md
│   ├── design-system.md
│   ├── wireframes/                      # PNG ou Figma exports
│   └── accessibility-guidelines.md
│
├── technical/                           # 🆕 Arquitetura Técnica
│   ├── architecture.md                  # Mover de tech-arauz-claude-v01/03-architecture.md
│   ├── database-schema.md               # Mover de tech-arauz-claude-v01/04-database-schema.md
│   ├── api-contract.yml
│   ├── espaider-integration.md          # Mover de tech-arauz-claude-v01/05-espaider-integration.md
│   └── adrs/
│       ├── ADR-001-supabase-rls.md
│       ├── ADR-002-view-apis-safe.md
│       └── ...
│
├── security/                            # 🆕 Segurança
│   ├── requirements.md
│   ├── threat-model.md
│   └── rbac.md                          # Mover de tech-arauz-claude-v01/12-security-rbac.md
│
├── testing/                             # 🆕 Testes
│   ├── strategy.md
│   ├── test-cases/
│   │   ├── dashboard/
│   │   ├── projetos/
│   │   └── integration/
│   └── coverage-report.md
│
├── deployment/                          # 🆕 Deploy
│   ├── deployment-plan.md
│   ├── runbook.md
│   └── environment-config.md
│
└── AGENT_FLOW.md                        # Já migrado da raiz
```

---

## 🗓️ Roadmap de Documentação {#roadmap}

### Fase 1: Fundação (Esta Sprint - 2 dias)

**Objetivo**: Criar documentos críticos para os agentes começarem.

| Prioridade | Documento | Responsável (Agente) | Esforço | Status |
|------------|-----------|----------------------|---------|--------|
| 🔴 P0 | `business/business-rules.md` | @project-planner | 4h | 🟡 Aguardando aprovação |
| 🔴 P0 | `product/user-personas.md` | @project-planner | 2h | - |
| 🔴 P0 | `product/user-stories/dashboard/` (5 stories) | @project-planner | 3h | - |
| 🔴 P0 | `ux/user-flows.md` (3 fluxos principais) | @frontend-specialist | 3h | - |
| 🔴 P0 | `technical/api-contract.yml` | @backend-specialist | 4h | - |
| 🔴 P0 | `security/requirements.md` | @security-auditor | 2h | - |
| 🔴 P0 | `testing/strategy.md` | @test-engineer | 2h | - |
| 🔴 P0 | `technical/adrs/` (6 ADRs do protótipo) | @project-planner | 3h | - |

**Total**: ~23h (3 dias de trabalho distribuído entre agentes)

### Fase 2: Expansão (Próxima Sprint - 3 dias)

| Prioridade | Documento | Responsável | Esforço |
|------------|-----------|-------------|---------|
| 🟡 P1 | `ux/design-system.md` | @frontend-specialist | 4h |
| 🟡 P1 | `product/user-stories/` (todos os módulos) | @project-planner | 6h |
| 🟡 P1 | `business/data-dictionary.md` | @database-architect | 3h |
| 🟡 P1 | `testing/test-cases/` (20 casos críticos) | @test-engineer | 5h |
| 🟡 P1 | `deployment/deployment-plan.md` | @devops-engineer | 3h |

### Fase 3: Refinamento (Contínuo)

- Atualizar ADRs conforme novas decisões
- Adicionar test cases conforme bugs encontrados
- Manter user stories sincronizadas com mudanças de produto

---

## 📝 Templates e Padrões {#templates}

### Template: User Story

```markdown
## US-XXX: [Título da História]

**Como** [persona]  
**Eu quero** [ação]  
**Para que** [benefício]

### Acceptance Criteria

✅ **AC-001**: [Critério testável]  
✅ **AC-002**: [Critério testável]  

### Technical Notes
- Componentes: 
- Hooks: 
- APIs: 

### Dependencies
- [[link-para-doc]]

### Definition of Done
- [ ] Código implementado
- [ ] Testes unitários passando
- [ ] Testes E2E (se aplicável)
- [ ] Code review aprovado
- [ ] Documentação atualizada
```

### Template: ADR

```markdown
# ADR-XXX: [Título da Decisão]

**Status**: 🟡 Proposto | ✅ Aprovado | ❌ Rejeitado | ⏸️ Descontinuado  
**Data**: YYYY-MM-DD  
**Autor**: @agente-nome  

## Contexto
[Situação que levou à decisão]

## Decisão
[O que foi decidido]

## Alternativas Consideradas
1. **Opção A**: ...
   - ❌ Motivo de rejeição
2. **Opção B**: ...
   - ❌ Motivo de rejeição

## Consequências

### Positivas
- ✅ Benefício 1
- ✅ Benefício 2

### Negativas
- ⚠️ Trade-off 1
- ⚠️ Trade-off 2

## Implementação
[Como será implementado]

## Validação
- [ ] Checklist de validação
```

### Template: Test Case

```markdown
## TC-XXX: [Nome do Teste]

**Módulo**: Dashboard  
**Tipo**: E2E  
**Prioridade**: Alta  

### Pré-condições
- Usuário logado como 'admin'
- Banco com 50 solicitações de teste

### Passos
1. Acessar `/dashboard`
2. Verificar que todos os 6 KPIs aparecem
3. Click no filtro "7 dias"
4. Verificar que gráficos atualizam

### Resultado Esperado
- Dashboard carrega em < 2s
- 6 KPI cards visíveis
- Gráficos respondem ao filtro

### Resultado Real
[Preencher após execução]

### Status
🟢 Pass | 🔴 Fail | ⏸️ Bloqueado
```

---

## ✅ Checklist de Validação

Antes de iniciar implementação, validar que:

- [ ] Todos os documentos P0 (Fase 1) estão criados
- [ ] Cada User Story tem Acceptance Criteria testáveis
- [ ] ADRs documentam todas as decisões do protótipo
- [ ] API Contract está validado com @backend-specialist
- [ ] User Flows cobrem os 3 fluxos principais
- [ ] Security Requirements revisados por @security-auditor
- [ ] Testing Strategy aprovada por @test-engineer

---

## 🎯 Próximos Passos

1. **Você (Gabriel) aprova esta arquitetura?**
   - Se sim, eu inicio a criação dos documentos P0 (Fase 1)
   - Se não, ajustamos conforme feedback

2. **Delegação para Agentes**
   - Cada agente criará os documentos de sua expertise
   - Ex: @security-auditor cria `security/requirements.md`

3. **Review Coletivo**
   - Após Fase 1, revisamos compatibilidade entre documentos
   - Garantimos que não há contradições

---

**Status**: 🟡 Aguardando aprovação do Gabriel para iniciar Fase 1
