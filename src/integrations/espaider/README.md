# Integração Espaider

Módulo de integração com a API do ERP Espaider para importação de dados de projetos.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `types.ts` | Interfaces TypeScript para requisição, resposta e mapeamento |
| `config.ts` | Carrega configuração de env vars, mascaramento de tokens |
| `client.ts` | Client HTTP com retry, circuit breaker e logging |
| `mapper.ts` | Converte ListaCampos para objetos tipados |
| `index.ts` | Barrel export |

## Uso

```typescript
import { 
  exportarDados, 
  mapearProjeto, 
  mapearRegistros 
} from '@/integrations/espaider';

// Buscar projetos
const response = await exportarDados({ identificador: 'Projetos' });

// Mapear para objetos tipados
const projetos = mapearRegistros(response.ListaRegistros, mapearProjeto);
```

## Configuração

Variáveis de ambiente obrigatórias:

```env
ESPAIDER_BASE_URL=https://espaider.com.br/Arauz/WCF/WCFExportaDados.svc
ESPAIDER_TOKEN=<seu-token>
ESPAIDER_KEY=<sua-key>
```

## Políticas

- **Timeout**: 10 segundos
- **Retry**: 3x com backoff exponencial (1s, 2s, 4s)
- **Circuit Breaker**: Abre após 5 falhas em 60s
- **Rate Limit**: 5 req/segundo (client-side)

## Referências

- [ADR-002: Auth Espaider](/.context/03-specs/adr/2026-02-ADR-002-auth-espaider.md)
- [BR-003: Mapeamento de Campos](/.context/02-rules/business-rules.md)
