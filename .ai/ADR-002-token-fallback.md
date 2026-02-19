# ADR-002: Token Fallback para Env Vars

**Status**: Accepted
**Date**: 2026-02-08
**Decision Makers**: Gabriel Cristofolini (CTO)

## Context

A API Espaider requer token de autenticação. O token pode estar na tabela `espaider_apis` ou em variáveis de ambiente.

## Decision

Quando o token na tabela `espaider_apis` for `PREENCHER_TOKEN` (placeholder), o sistema DEVE fazer fallback para a variável de ambiente correspondente.

## Consequences

- Flexibilidade: permite configuração via DB (produção) ou env vars (desenvolvimento)
- O valor `PREENCHER_TOKEN` é uma sentinel value documentada
