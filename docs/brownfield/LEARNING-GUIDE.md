# Guia de Aprendizado — Conceitos de Arquitetura Tech Arauz

**Complemento da Avaliação Brownfield Discovery**
**Data**: 2026-02-21
**Propósito**: Ensinar conceitos-chave usando explicações ELI5 + exemplos de código

---

## 🧒 Índice

1. [RLS (Row Level Security)](#1-rls-row-level-security)
2. [UPSERT Idempotente](#2-upsert-idempotente)
3. [Isolamento por Tenant](#3-isolamento-por-tenant)
4. [Foreign Keys & Integridade Referencial](#4-foreign-keys--integridade-referencial)
5. [Orquestração de Sincronização](#5-orquestração-de-sincronização)
6. [Índices em Banco de Dados](#6-índices-em-banco-de-dados)
7. [Service Role vs Usuários Autenticados](#7-service-role-vs-usuários-autenticados)
8. [Padrão Circuit Breaker](#8-padrão-circuit-breaker)
9. [Materialized Views](#9-materialized-views)
10. [Configuração por Ambiente](#10-configuração-por-ambiente)

---

## 1. RLS (Row Level Security)

### 🧒 Explicação Simples

Imagine uma biblioteca escolar onde cada série tem sua própria estante:
- **1º ano** pode ver só os livros da estante do 1º ano
- **2º ano** pode ver só os livros da estante do 2º ano
- **Professores** podem ver todas as estantes
- **O bibliotecário** controla tudo

No Supabase, RLS funciona como as regras do bibliotecário: cada tenant (série) só vê suas próprias linhas (estante), mesmo com todos os dados na mesma tabela do banco (biblioteca).

### 💡 Exemplo Real

**Sem RLS**:
```typescript
// ❌ Perigoso: QUALQUER usuário autenticado vê os projetos de QUALQUER UM
const { data: projects } = await supabase
  .from('projects')
  .select('*');  // Retorna TODOS os projetos, independente do tenant
```

**Com RLS**:
```typescript
// ✅ Seguro: Vê só os projetos onde tenant_id = seu tenant
const { data: projects } = await supabase
  .from('projects')
  .select('*');  // RLS filtra automaticamente
  // Query executada como: WHERE tenant_id = auth.uid()
```

### 🔧 Como é Implementado

```sql
-- Policy: "Usuários veem só os projetos do seu próprio tenant"
CREATE POLICY "users_see_own_tenant" ON projects
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- Policy: "Service role (backend) acessa tudo"
CREATE POLICY "service_role_access" ON projects
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### 📚 Conceitos-Chave

- **Cláusula USING**: Filtro (quais linhas você vê)
- **Cláusula WITH CHECK**: Restrição (quais linhas você escreve)
- **Service role**: Papel especial backend-only (ignora RLS)
- **Authenticated role**: Papel de usuário normal (RLS aplicado)

### ⚠️ Erros Comuns

❌ **Muito restritivo**: Bloqueia service role (sincronização falha)
```sql
-- ERRADO: Bloqueia service role!
CREATE POLICY "block_all" ON projects
  FOR ALL TO authenticated
  USING (false);  -- Ninguém acessa
```

✅ **Correto**: Permite service role
```sql
-- CORRETO: Permite service role sincronizar
CREATE POLICY "service_role_can_sync" ON projects
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

## 2. UPSERT Idempotente

### 🧒 Explicação Simples

**Idempotente** = mesmo resultado se você faz uma vez ou 100 vezes.

Imagine fazendo uma lista de compras:
- Escreve "leite" uma vez → lista tem leite
- Escreve "leite" de novo → lista ainda tem só um leite (não 2!)
- Escreve "leite" 100 vezes → ainda tem só um leite

No Supabase, usamos constraint `UNIQUE` para que sincronizar o mesmo projeto 1x, 10x ou 100x produza resultado idêntico.

### 💡 Exemplo Real

**Sem constraint UNIQUE**:
```sql
-- ❌ Perigo: Sincronizar duas vezes = 2 projetos duplicados
INSERT INTO projects (tenant_id, espaider_id, titulo)
VALUES ('tenant-1', 1001, 'Project A');

INSERT INTO projects (tenant_id, espaider_id, titulo)
VALUES ('tenant-1', 1001, 'Project A');  -- Duplicado!

-- Resultado: 2 projetos idênticos
```

**Com constraint UNIQUE**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  espaider_id BIGINT NOT NULL,
  titulo TEXT NOT NULL,
  UNIQUE(tenant_id, espaider_id)  -- Sem duplicatas permitidas
);

-- ✅ Seguro: Sincronizar duas vezes = 1 projeto (atualizado)
INSERT INTO projects (tenant_id, espaider_id, titulo)
VALUES ('tenant-1', 1001, 'Project A')
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET titulo = 'Project A';  -- Atualiza em vez de inserir

-- Sincronizar de novo:
INSERT INTO projects (tenant_id, espaider_id, titulo)
VALUES ('tenant-1', 1001, 'Project A')
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET titulo = 'Project A';  -- Mesmo resultado: 1 projeto
```

### 🔧 Implementação TypeScript

```typescript
// Sincronização segura: pode rodar 1x, 10x, 100x com mesmo resultado
async function syncProjects(tenantId: string, projects: Project[]) {
  const { data, error } = await supabase
    .from('projects')
    .upsert(
      projects.map(p => ({
        tenant_id: tenantId,
        espaider_id: p.id,  // Chave única do Espaider
        titulo: p.titulo,
        // ...
      })),
      { onConflict: 'tenant_id,espaider_id' }  // Usa chave composta
    );

  if (error) throw error;
  return data;
}

// Seguro: pode chamar múltiplas vezes
await syncProjects('tenant-1', projectList);
await syncProjects('tenant-1', projectList);  // Mesmo resultado
```

### 📚 Conceitos-Chave

- **Chave composta**: Combinação de colunas (tenant_id + espaider_id)
- **ON CONFLICT**: O que fazer se chave já existe
- **DO UPDATE**: Atualiza em vez de inserir (idempotente)
- **Segurança de sincronização**: Pode tentar novamente sem medo de duplicatas

---

## 3. Isolamento por Tenant

### 🧒 Explicação Simples

Imagine um prédio de apartamentos:
- **Tenant A** mora no apartamento 1A
  - Pode acessar: Seu apartamento, áreas comuns
  - NÃO pode acessar: Apartamento 1B (Tenant B), telhado
- **Tenant B** mora no apartamento 1B
  - Pode acessar: Seu apartamento, áreas comuns
  - NÃO pode acessar: Apartamento 1A (Tenant A), porão
- **Gerenciador do prédio** pode acessar: Todos os apartamentos, em qualquer lugar

Em um sistema multi-tenant:
- Cada empresa/usuário = tenant
- Cada tenant = apartamento isolado
- Vê só seus próprios dados
- Gerenciador (service role) vê tudo

### 💡 Exemplo Real

**Arquitetura Multi-Tenant Tech Arauz**:
- Tenant 1: "Araúz & Advogados" → 45 projetos, 1200+ cronogramas
- Tenant 2: "Empresa futura" → 0 projetos (não implementado ainda)

Cada tenant vê:
```typescript
// Consulta do usuário do Tenant 1
const { data: projects } = await supabase
  .from('projects')
  .select('*');
// Retorna: 45 projetos (só de Araúz)

// Consulta do usuário do Tenant 2 (JWT diferente)
const { data: projects } = await supabase
  .from('projects')
  .select('*');
// Retorna: 0 projetos (Tenant 2 não tem nenhum)
// RLS previne acesso cross-tenant
```

### 🔧 Como Funciona

```sql
-- Toda tabela tem tenant_id
ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Função auxiliar: Pega tenant do usuário atual
CREATE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Policy RLS: Força isolamento por tenant
CREATE POLICY "users_see_own_tenant" ON projects
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());
  -- auth.uid() = JWT sub = profile.id do usuário
  -- profiles.tenant_id = empresa do usuário
```

### 📚 Conceitos-Chave

- **JWT sub claim**: ID único do usuário
- **Tabela profiles**: Mapeia user ID → tenant ID
- **tenant_id em toda tabela**: Obrigatório para isolamento
- **Cláusula WHERE de RLS**: Força verificação de tenant

---

## 4. Foreign Keys & Integridade Referencial

### 🧒 Explicação Simples

Imagine um catálogo de biblioteca:
- Cada **livro** tem um **número de estante**
- **Estante 5** deve existir para um livro ficar na estante 5
- Se você deleta **estante 5**, todos os livros nela devem ir em outro lugar (ou erro)

Em um banco de dados:
- **Projeto**: Pai (estante)
- **Entrega**: Filho (livro na estante)
- **Foreign key**: Referência do número da estante
- **Cascade delete**: Quando estante é deletada, livros também são

### 💡 Exemplo Real

**Schema**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  titulo TEXT NOT NULL
);

CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Foreign key: project_id deve existir em projects.id
  -- Cascade delete: Quando projeto deletado, entregas também são deletadas
  titulo TEXT NOT NULL
);
```

**Operações seguras**:
```sql
-- ✅ OK: Cria entrega para projeto existente
INSERT INTO deliveries (project_id, titulo)
VALUES ('proj-123', 'Entrega 1');

-- ❌ Erro: Projeto não existe
INSERT INTO deliveries (project_id, titulo)
VALUES ('proj-999', 'Entrega 1');
-- ERRO: Violação de foreign key

-- ✅ Cascade delete: Deleta projeto + filhos
DELETE FROM projects WHERE id = 'proj-123';
-- Resultado: projeto deletado, entrega auto-deletada
```

### 📚 Conceitos-Chave

- **Foreign key**: Liga filho → pai
- **ON DELETE CASCADE**: Auto-deleta filhos quando pai é deletado
- **Integridade referencial**: Banco de dados garante consistência
- **Violação de constraint**: Previne dados inválidos

---

## 5. Orquestração de Sincronização

### 🧒 Explicação Simples

Imagine sincronizando seu telefone com armazenamento em nuvem:

1. **Vê o que está na nuvem** → Lista de 45 projetos do Espaider
2. **Vê o que está no telefone** → Lista de 40 projetos no nosso banco
3. **Adiciona novos projetos** → 5 novos que não estão no telefone
4. **Atualiza projetos que mudaram** → 40 podem ter datas diferentes
5. **Salva tudo** → Telefone agora corresponde à nuvem
6. **Registra o que fez** → "Adicionou 5, atualizou 40, total 45"

Em Tech Arauz:
- **Nuvem**: ERP Espaider
- **Telefone**: Banco de dados Supabase
- **Sincronização**: Processo automático a cada hora

### 💡 Exemplo Real

```typescript
async function syncProjects(tenantId: string) {
  const logger = { info: [], errors: [] };

  try {
    // Passo 1: Carrega credenciais da API
    const apiConfig = await loadApiConfigs(tenantId);
    logger.info.push(`Loaded API config from ${apiConfig.source}`);

    // Passo 2: Busca do Espaider
    const espaiderData = await exportarDados(apiConfig);
    const projects = espaiderData.ListaRegistros;
    logger.info.push(`Fetched ${projects.length} projects from Espaider`);

    // Passo 3: UPSERT para Supabase (idempotente)
    const { data, error } = await supabase
      .from('projects')
      .upsert(
        projects.map(mapEspaiderToProject),
        { onConflict: 'tenant_id,espaider_id' }
      );

    if (error) throw error;
    logger.info.push(`Upserted ${data.length} projects`);

    // Passo 4: Busca filhos (entregas, cronogramas, etc.)
    const deliveries = await syncChildren(projects, tenantId);
    logger.info.push(`Synced ${deliveries} child records`);

    // Passo 5: Persiste logs
    await persistLogEntries(tenantId, logger.info);

    return { success: true, recordsSync: projects.length };
  } catch (error) {
    logger.errors.push(error.message);
    await persistLogEntries(tenantId, logger.errors);
    throw error;
  }
}
```

### 📚 Conceitos-Chave

- **Sincronização hierárquica**: Pais primeiro, depois filhos
- **Padrão UPSERT**: Insere se novo, atualiza se existe
- **Idempotência**: Seguro rodar múltiplas vezes
- **Logging estruturado**: Rastreia cada ação
- **Recuperação de erros**: Retry + circuit breaker

---

## 6. Índices em Banco de Dados

### 🧒 Explicação Simples

Imagine uma lista telefônica gigantesca com 1.000.000 nomes:

**Sem índice** (como ler de capa a capa):
- Precisa checar cada página para encontrar "Silva" → 1.000.000 verificações

**Com índice** (abas "S" no início):
- Abre aba "S" → Começa com "Silva" → Poucas verificações
- Super rápido (talvez 20 verificações)

Em bancos de dados, **índices** são como abas em uma lista telefônica. Tornam buscas 1.000.000x mais rápidas!

### 💡 Exemplo Real

```sql
-- ❌ Consulta lenta (sem índice): Deve verificar todos os 8.649 projetos
SELECT * FROM projects WHERE status = 'Execução';

-- ✅ Cria índice na coluna status
CREATE INDEX idx_projects_status ON projects(status);

-- ✅ Consulta rápida (com índice): Verifica só projetos "Execução"
SELECT * FROM projects WHERE status = 'Execução';
```

**Performance de consulta**:
```
Sem índice: 1000ms (verifica 8.649 linhas)
Com índice: <10ms (pula para seção "Execução", verifica ~100 linhas)
100x mais rápido!
```

### 🔧 Tipos de Índice

```sql
-- Índice simples (coluna única)
CREATE INDEX idx_projects_status ON projects(status);

-- Índice composto (múltiplas colunas)
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);
-- Rápido para: WHERE tenant_id = X AND status = Y

-- Índice decrescente (para ORDER BY DESC)
CREATE INDEX idx_projects_updated_at_desc ON projects(updated_at DESC);
-- Rápido para: ORDER BY updated_at DESC

-- Índice JSONB (para buscas complexas)
CREATE INDEX idx_projects_espaider_raw ON projects USING GIN(espaider_raw);
-- Rápido para: WHERE espaider_raw @> '{"campo": "valor"}'
```

### 📚 Conceitos-Chave

- **Query planner**: Decide se usa índice
- **Scan vs Seek**: Scan completo lento, index seek rápido
- **Cardinalidade**: Quantos valores distintos (alta cardinalidade = bom para índices)
- **Manutenção de índice**: Desacelera escritas um pouco (tradeoff)

---

## 7. Service Role vs Usuários Autenticados

### 🧒 Explicação Simples

Imagine um prédio de escritórios:

**Usuários Autenticados** (Funcionários):
- Crachá = ID card (token JWT)
- Acesso = Seu próprio escritório + áreas comuns
- Restrições = Não acessa escritório de outros (RLS)

**Service Role** (Gerente de Infraestrutura):
- Crachá = Chave mestra
- Acesso = Todos os escritórios, porão, telhado
- Restrições = Nenhuma (funcionário confiável)

No Supabase:
- **Usuários** = Usuários do seu app (restritos por RLS)
- **Service Role** = Servidor backend (irrestrito, usado para sincronização)

### 💡 Exemplo Real

```typescript
// ❌ Código frontend usa client USER (restrito)
const userClient = createClient();  // Usa anon key + JWT
const { data } = await userClient
  .from('projects')
  .select('*');
// RLS se aplica: Vê só tenant_id = auth.uid()

// ✅ Código backend usa client SERVICE ROLE (irrestrito)
const serverClient = createServerClient();  // Usa service role key
const { data } = await serverClient
  .from('projects')
  .select('*');
// RLS ignorado: Vê TODOS os projetos (seguro porque backend é confiável)
```

### 🔧 Diferença-Chave

```typescript
// Frontend (user client)
// .env.public
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  // Anon key pública

// Backend (service client)
// .env.local (secreto)
SUPABASE_SERVICE_KEY=eyJ...  // Secret service key (nunca em frontend!)
```

### 📚 Conceitos-Chave

- **Anon key**: Pública, restrita, segura no frontend
- **Service key**: Secreta, irrestrita, backend-only
- **Nunca exponha service key**: Contornaria toda segurança!
- **RLS se aplica a usuários**: Service role sempre ignora

---

## 8. Padrão Circuit Breaker

### 🧒 Explicação Simples

Imagine uma tomada de corrente:

**Funcionamento normal**:
- Conecta dispositivo → Eletricidade flui → Dispositivo funciona

**Problema ocorre**:
- Dispositivo falha → Tira muita corrente
- Circuit breaker dispara → Para a corrente (protege casa)
- Espera 1 minuto → Tenta de novo

Em código:
- **Normal**: Sincroniza API Espaider ✅
- **Problema**: API cai, falha 5x ❌
- **Circuit breaker**: "Vou pausar sincronizações por 60 segundos"
- **Recuperação**: Depois de 60 segundos, tenta de novo

### 💡 Exemplo Real

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state = 'closed';  // 'closed' = normal, 'open' = pausado
  private lastFailureTime = null;

  async call(fn) {
    // Se muitas falhas, pausa (abre circuit)
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < 60_000) {  // Pausa 60 segundos
        throw new Error('Circuit breaker open, pausing requests');
      }
      this.state = 'half-open';  // Tenta de novo
    }

    try {
      const result = await fn();  // Tenta chamada API
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.successCount++;
    this.failureCount = 0;
    if (this.successCount > 2) {
      this.state = 'closed';  // De volta ao normal
      this.successCount = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount > 5) {
      this.state = 'open';  // Pausa sincronizações
    }
  }
}

// Uso
const breaker = new CircuitBreaker();
try {
  await breaker.call(() => syncEspaiderAPI());
} catch (error) {
  console.error('Sync failed:', error.message);
  // Se muitas falhas: "Circuit breaker open, pausing requests"
}
```

### 📚 Conceitos-Chave

- **Contagem de falhas**: Rastreia falhas consecutivas
- **Threshold**: Dispara circuit break em N falhas (padrão 5)
- **Timeout**: Pausa por duração fixa (padrão 60s)
- **Graceful degradation**: Não marteleia API que está caída

---

## 9. Materialized Views

### 🧒 Explicação Simples

Imagine um dono de restaurante:

**Jeito lento**:
- Cada cliente pergunta "Qual é a venda total hoje?"
- Dono conta todo recibo (toma 10 minutos)
- Cliente espera...

**Jeito rápido**:
- Dono tem um **"Quadro de Resumo Diário"** atualizado cada hora
- Mostra: Venda total, pratos populares, conta média
- Cliente pergunta → Dono aponta para quadro (1 segundo)

Em bancos de dados:
- **Materialized view** = Resumo pré-calculado
- Atualizado em cronograma (horária, diária, etc.)
- Muito mais rápido que consultando dados brutos

### 💡 Exemplo Real

```sql
-- ❌ Lento: Calcula toda vez
SELECT
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'Execução' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) as completed
FROM projects
WHERE tenant_id = 'tenant-1';
-- Verifica 8.649 linhas toda vez → Lento!

-- ✅ Rápido: Materialized view pré-calculada
CREATE MATERIALIZED VIEW project_summary_by_tenant AS
SELECT
  tenant_id,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'Execução' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) as completed,
  MAX(updated_at) as last_updated
FROM projects
GROUP BY tenant_id;

-- Consulta rápida (usa materialized view)
SELECT * FROM project_summary_by_tenant WHERE tenant_id = 'tenant-1';
-- Retorna: total: 45, active: 28, completed: 12
-- Calculado uma vez por hora, não a cada consulta
```

### 📚 Conceitos-Chave

- **View**: Tabela virtual (recalculada cada consulta)
- **Materialized view**: Tabela em cache (pré-calculada)
- **Refresh**: Atualiza materialized view (REFRESH MATERIALIZED VIEW)
- **Tradeoff**: Leituras rápidas, dados um pouco antigos (1 hora atrás)

---

## 10. Configuração por Ambiente

### 🧒 Explicação Simples

Imagine um restaurante com **2 localizações**:

**Localização 1 (Centro)**:
- Endereço: Rua Principal
- Telefone: 555-1111
- Horário: 8h-22h

**Localização 2 (Aeroporto)**:
- Endereço: Terminal B
- Telefone: 555-2222
- Horário: 6h-meia-noite

Mesmo cardápio, **configurações diferentes** para cada localização.

Em código:
- **Desenvolvimento** (seu laptop): Localhost, banco teste
- **Produção** (Vercel): URL real, banco produção
- **Staging** (servidor separado): Teste antes de produção

### 💡 Exemplo Real

```typescript
// Carrega configuração do ambiente
const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.ESPAIDER_TOKEN,
  ENVIRONMENT: process.env.NODE_ENV,  // 'development', 'staging', 'production'
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Se comporta diferente por ambiente
if (config.ENVIRONMENT === 'production') {
  // Produção: Envia emails reais
  await sendEmail(user, 'alert');
} else {
  // Desenvolvimento: Log no console
  console.log('Would send email:', user);
}

// Endpoint da API muda por ambiente
const API_URL = config.ENVIRONMENT === 'production'
  ? 'https://api.tech-arauz.com'
  : 'http://localhost:3000';
```

### 🔧 Arquivos .env

```bash
# .env.local (desenvolvimento - nunca commit)
DATABASE_URL=postgres://localhost/tech_arauz_dev
ESPAIDER_TOKEN=test-token-123
NODE_ENV=development
LOG_LEVEL=debug

# .env.production (Dashboard Vercel - secreto)
DATABASE_URL=postgres://prod-server/tech_arauz
ESPAIDER_TOKEN=real-token-secret
NODE_ENV=production
LOG_LEVEL=info
```

### 📚 Conceitos-Chave

- **Variáveis de ambiente**: Configurações fora do código
- **Arquivos .env**: Configuração local
- **Secrets**: Nunca commit tokens/keys
- **Defaults**: Forneça fallbacks sensatos

---

## 🎓 Tabela de Resumo

| Conceito | Ideia Simples | Propósito Técnico |
|----------|---------------|-------------------|
| **RLS** | Regras de teatro | Isola dados por tenant |
| **UPSERT** | Dedup lista | Sincronização segura |
| **Isolamento por Tenant** | Apartamentos | Privacidade |
| **Foreign key** | Número da estante | Consistência de dados |
| **Sync** | Backup de telefone | Espaider → Supabase |
| **Índice** | Abas de lista telefônica | Consultas rápidas |
| **Service role** | Chave mestra | Acesso backend |
| **Circuit breaker** | Protetor de corrente | Protege de falhas |
| **Materialized view** | Quadro de resumo | Resumos rápidos |
| **Configuração de ambiente** | Filiais de restaurante | Multi-ambiente |

---

## 📚 Documentos Relacionados

- **Arquitetura do Sistema**: `docs/architecture/system-architecture.md`
- **Schema do Banco**: `supabase/docs/SCHEMA.md`
- **Dívida Técnica**: `docs/prd/technical-debt-assessment.md`

---

## 🆘 Perguntas Frequentes

### P: Por que UNIQUE(tenant_id, espaider_id) e não só espaider_id?
**R**: Porque espaider_id se repete entre tenants. Projeto 1001 do Tenant 1 é diferente do projeto 1001 do Tenant 2.

### P: RLS deixa as consultas lentas?
**R**: Um pouco (adiciona cláusula WHERE), mas segurança compensa. Índices mitigation isso.

### P: Posso usar banco de produção em desenvolvimento?
**R**: ⚠️ Nunca. Sempre use banco de desenvolvimento separado. Produção = somente leitura para emergências.

### P: E se sincronização falhar?
**R**: Circuit breaker pausa. Logs salvos. Tenta novamente após 60s. Dashboard mostra status.

### P: Como debugar consultas lentas?
**R**: Ative logging de queries (item dívida técnica Phase 2 D-DEVOPS-002). Verifique plano EXPLAIN.

---

**Criado**: 2026-02-21 | **Audiência**: Toda equipe técnica
