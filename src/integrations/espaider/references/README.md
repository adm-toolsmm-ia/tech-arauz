# Referências da Integração Espaider

Esta pasta contém artefatos técnicos utilizados como base para o desenvolvimento e testes da integração com o ERP Espaider.

> **Importante**: Estes arquivos são apenas para consulta e execução de testes (mocks). **Não** representam dados de produção.

## Conteúdo

| Arquivo                                   | Descrição                                                     |
| ----------------------------------------- | ------------------------------------------------------------- |
| `Especificacao_Tecnica_Versao_4.pdf`      | Documentação oficial da API Espaider (fornecida pelo vendor). |
| `response - Projetos.json`                | Mock de resposta do endpoint de Projetos.                     |
| `response - Entregas de Projetos.json`    | Mock de resposta do endpoint de Entregas.                     |
| `response - Cronogramas de Projetos.json` | Mock de resposta do endpoint de Cronogramas.                  |
| `response - Requisitos de Projetos.json`  | Mock de resposta do endpoint de Requisitos.                   |
| `teste_api - Exemplo Python.ipynb`        | Notebook Jupyter com exemplos de chamadas à API (legado).     |

## Uso em Testes

Estes arquivos JSON são importados pelos testes de contrato em `src/integrations/espaider/__tests__/contract.test.ts` para validar se o parser (`mapper.ts`) continua compatível com o formato esperado pela API.
