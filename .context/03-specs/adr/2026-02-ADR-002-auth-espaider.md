# ADR-002: Autenticação e Integração com API Espaider

> **Status**: Aceito  
> **Data**: 2026-02-07  
> **Decisores**: Gabriel Cristofolini (CTO/PO)  
> **Tags**: integração, segurança, espaider, api

---

## Contexto

O Tech Arauz precisa importar dados de projetos do ERP Espaider. A API do Espaider utiliza um padrão WCF/JSON específico que requer autenticação via querystring.

### Dados Observados da API

**Endpoint Base**:
```
POST https://espaider.com.br/Arauz/WCF/WCFExportaDados.svc/ExportaDados
```

**Parâmetros de Autenticação** (via querystring):
- `Token`: Token de acesso (string)
- `Key`: Chave de API (string)
- `Identificador`: Dataset de exportação (ex: "Projetos", "Entregas", "Cronogramas")

**Resposta Típica**:
```json
{
  "ListaRegistros": [
    {
      "IDEspaider": 12345,
      "Identificador": "Projetos",
      "ListaCampos": [
        { "Identificador": "TRMESPAIDER", "Valor": "PROJ.00001/25" },
        { "Identificador": "NOME", "Valor": "Migração Sistema X" },
        { "Identificador": "STATUSPROJETO", "Valor": "Em execução" }
      ]
    }
  ]
}
```

---

## Decisão

### Método de Autenticação

| Aspecto | Decisão |
|---------|---------|
| **Tipo** | Token + Key via querystring |
| **Armazenamento** | Secrets (Vercel env vars / Supabase vault) |
| **Rotação** | A cada 90 dias |
| **Validação** | IP allowlist (se suportado pelo Espaider) |

### Variáveis de Ambiente

```env
ESPAIDER_BASE_URL=https://espaider.com.br/Arauz/WCF/WCFExportaDados.svc
ESPAIDER_TOKEN=<secret>
ESPAIDER_KEY=<secret>
```

### Política de Chamadas

| Aspecto | Valor | Justificativa |
|---------|-------|---------------|
| **Timeout** | 10 segundos | API pode ser lenta; evita bloqueio |
| **Retries** | 3x com backoff exponencial | Resiliência a falhas temporárias |
| **Base delay** | 1 segundo | Delay inicial entre retries |
| **Max delay** | 8 segundos | Cap para evitar espera excessiva |
| **Circuit Breaker** | Abre após 5 falhas em 60s | Proteção contra cascata |
| **Rate Limit** | 5 req/segundo | Não sobrecarregar API origem |

### Logging e Segurança

| Aspecto | Regra |
|---------|-------|
| **PII** | Nunca logar dados pessoais |
| **Tokens** | Mascarar sempre (ex: `tok_****1234`) |
| **Correlation** | `request_id` em todos os logs |
| **Nível** | INFO para sucesso, WARN para retry, ERROR para falha final |

---

## Implementação Proposta

### Assinatura da Função Principal

```typescript
// src/integrations/espaider/client.ts

interface ExportarDadosParams {
  identificador: string;       // "Projetos" | "Entregas" | "Cronogramas" | "Requisitos"
  filtros?: Record<string, string>;  // Filtros opcionais
}

interface CampoEspaider {
  Identificador: string;
  Valor: string;
}

interface RegistroEspaider {
  IDEspaider: number;
  Identificador: string;
  ListaCampos: CampoEspaider[];
}

interface ExportarDadosResponse {
  ListaRegistros: RegistroEspaider[];
}

async function exportarDados(
  params: ExportarDadosParams
): Promise<ExportarDadosResponse>
```

### Estrutura de Arquivos

```
src/integrations/espaider/
├── client.ts          # Função exportarDados + retry logic
├── types.ts           # Interfaces TypeScript
├── mapper.ts          # Mapeia ListaCampos → objetos tipados
├── config.ts          # Carrega env vars
└── __tests__/
    ├── client.test.ts     # Testes unitários
    └── contract.test.ts   # Testes de contrato (mock)
```

---

## Tratamento de Erros

| Cenário | Ação | Retry? |
|---------|------|--------|
| Timeout (10s) | Log WARN, tentar novamente | Sim (3x) |
| HTTP 4xx (client error) | Log ERROR, não retentar | Não |
| HTTP 5xx (server error) | Log WARN, tentar novamente | Sim (3x) |
| Resposta vazia | Log WARN, retornar array vazio | Não |
| JSON inválido | Log ERROR, lançar exceção | Não |
| Circuit aberto | Retornar erro imediato | Não |

---

## Alternativas Consideradas

### Token no Header vs Querystring
- **Header**: Mais seguro, mas API não suporta
- **Querystring**: Exigido pela API Espaider
- **Mitigação**: HTTPS obrigatório, não logar URLs completas

### Polling vs Webhook
- **Webhook**: Melhor, mas requer mudança no Espaider
- **Polling**: Funcionará com API atual
- **Escolha**: Polling (manual ou agendado)

---

## Consequências

### Positivas
- Integração simples com API existente
- Retry automático aumenta confiabilidade
- Circuit breaker protege contra cascata

### Negativas
- Tokens em querystring menos seguro que header
- Dependência de IP allowlist no Espaider
- Polling pode ter delay vs webhook

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Token expira sem aviso | Média | Alto | Monitorar 401, alertar para rotação |
| API Espaider fora | Baixa | Alto | Circuit breaker + fallback para cache |
| Rate limit atingido | Baixa | Médio | Implementar rate limiter client-side |

---

## Questões Abertas para Espaider

> ⚠️ **Confirmar com fornecedor**:

1. **Autenticação**: O método Token + Key via querystring é o único disponível?
2. **Rate Limiting**: Há limite de requisições por minuto/hora?
3. **IP Allowlist**: É possível configurar IPs autorizados?
4. **Rotação de Token**: Qual o processo para rotacionar credenciais?
5. **Webhooks**: Há planos para suportar push notifications?

---

## Referências

- Exemplo de resposta: [`docs/espaider-apiprojetos/response - Projetos.json`](file:///c:/Users/Gabriel%20Cristofolini/Documents/SOLUCOESSISTEMAS/tech-arauz/docs/espaider-apiprojetos/response%20-%20Projetos.json)
- Regra de mapeamento: [`BR-003`](./../02-rules/business-rules.md)
