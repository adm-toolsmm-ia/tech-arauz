# Rotinas e Processos

> **Camada**: 1 - Regras  
> **Última atualização**: 2026-02-07

---

## Propósito

Este documento define as **rotinas de negócio** que o sistema deve suportar. Cada rotina tem um ID único (`RT-XXX`) para rastreabilidade.

---

# MÓDULO 1: GESTÃO DE PROJETOS

## RT-001: Sincronização de Projetos (Espaider)

| Atributo | Valor |
|----------|-------|
| **Frequência** | Sob demanda (manual) ou Agendada (diária, 2x ao dia, etc.) |
| **Origem** | API Espaider |
| **Destino** | Portal Tech Arauz |

### Fluxo
1. Usuário clica em "Sincronizar" ou job agendado dispara
2. Sistema busca projetos do endpoint Espaider
3. Para cada projeto:
   - Se não existe (by IDEspaider): cria
   - Se existe: atualiza dados
4. Busca registros filhos (Cronogramas, Entregas, Requisitos)
5. Vincula filhos aos projetos correspondentes
6. Registra log de execução com métricas

### Métricas Registradas
- Total processado
- Novos cadastrados
- Atualizados
- Erros encontrados
- Duração total

---

## RT-002: Gestão de Sessão do Usuário

| Atributo | Valor |
|----------|-------|
| **Evento** | Login, Logout, Expiração |

### Comportamentos
- **Login**: Cria sessão, redireciona para dashboard
- **Logout**: Encerra sessão, redireciona para login
- **Expiração**: Após inatividade, solicita novo login
- **Refresh**: Renova sessão automaticamente se ativo

---

## RT-002B: Gestão de Usuários (Admin-Only)

| Atributo | Valor |
|----------|-------|
| **Frequência** | Sob demanda (ação do admin) |
| **Permissão** | admin |
| **Rota** | `/cadastros/usuarios` |

### Fluxo — Criar Usuário
1. Admin acessa página de gestão de usuários
2. Clica em "Novo Usuário" e preenche formulário (nome, email, perfil)
3. Sistema valida dados (Zod) e verifica permissão do admin
4. Cria usuário no Supabase Auth com senha temporária
5. Insere perfil na tabela `profiles` com `tenant_id` do admin
6. Em caso de falha no perfil, executa rollback do auth
7. Admin comunica senha temporária ao novo usuário fora do sistema

### Fluxo — Editar Usuário
1. Admin seleciona usuário na tabela e clica "Editar"
2. Altera nome e/ou perfil de acesso
3. Sistema valida que o usuário-alvo pertence ao mesmo tenant
4. Atualiza dados em `auth.users` e `profiles`

### Fluxo — Ativar/Desativar Usuário
1. Admin seleciona "Desativar" ou "Reativar" no menu de ações
2. Sistema valida tenant do usuário-alvo
3. Alterna `ban_duration` no Auth e sincroniza `profiles.is_active`

### Regras de Segurança
- Apenas role `admin` pode executar qualquer operação
- Validação de tenant antes de toda operação em `auth.admin`
- Mensagens de erro genéricas para UI, detalhes apenas em logs do servidor
- Service role usado exclusivamente após confirmação de permissão admin

---

## RT-003: Auditoria de Logs

| Atributo | Valor |
|----------|-------|
| **Frequência** | Contínua (cada operação registra) |
| **Retenção** | 90 dias (configurável) |
| **Acesso** | admin (detalhes completos), outros (resumo) |

### Informações Registradas
- Data/hora da execução
- Tipo de operação
- Quantidade de registros
- Erros encontrados
- Usuário ou job que disparou
- Tenant

---

# MÓDULO 2: GESTÃO DE AGENTES AI

## RT-101: Sincronização de Runs (LangSmith)

| Atributo | Valor |
|----------|-------|
| **Frequência** | Sob demanda ou periódica (a cada 5 min) |
| **Origem** | API LangSmith |
| **Destino** | Portal Tech Arauz |

### Fluxo
1. Sistema consulta API LangSmith
2. Busca runs recentes por projeto
3. Para cada run:
   - Se não existe: cria registro
   - Se existe: atualiza status
4. Extrai métricas (duração, tokens, sucesso/erro)
5. Vincula run ao agente correspondente
6. Registra log de sincronização

---

## RT-102: Documentação de Agente

| Atributo | Valor |
|----------|-------|
| **Frequência** | Sob demanda (ação do usuário) |
| **Permissão** | admin, user |

### Fluxo
1. Usuário acessa agente no portal
2. Cria/edita documentação em Markdown
3. Sistema salva versão atual
4. Histórico de versões mantido
5. Documentação vinculada ao agente

---

## RT-103: Visualização de Workflow

| Atributo | Valor |
|----------|-------|
| **Frequência** | Sob demanda (ao acessar agente) |

### Fluxo
1. Usuário acessa detalhes do agente
2. Sistema carrega definição do workflow
3. Renderiza visualização:
   - LangChain: diagrama de cadeia
   - LangGraph: grafo interativo
4. Exibe inputs/outputs de cada step

---

# INFRAESTRUTURA

## RT-201: Backup de Dados

| Atributo | Valor |
|----------|-------|
| **Frequência** | Diária (madrugada) |
| **Retenção** | 30 dias |

### Itens Backupeados
- Banco de dados completo
- Configurações de integrações
- Documentações de agentes
- Logs de auditoria

---

## RT-202: Verificação de Saúde (Health Check)

| Atributo | Valor |
|----------|-------|
| **Frequência** | A cada 1 minuto |

### Verificações
- Conexão com banco de dados
- Conexão com API Espaider
- Conexão com API LangSmith (se configurado)
- Uso de memória/CPU
