# Instruções do Projeto (Claude Extension)

> **ATENÇÃO: AGENTE CLAUDE**
> Este projeto opera sob um rígido sistema de governança de agentes definido em `.agent/`.

## 1. Fonte da Verdade de Governança
Todas as suas regras de comportamento, personas e workflows estão em:
- `.agent/GEMINI.md` (Regras Gerais)
- `.agent/agents/` (Suas Personas)
- `.agent/skills/` (Suas Habilidades)

**Regra Suprema:** Antes de qualquer ação complexa, leia `.agent/GEMINI.md`.

## 2. Ferramentas & Banco de Dados (Supabase MCP)
Este projeto usa o **Supabase MCP Server**.
- **NUNCA** alucine credenciais ou execute SQL sem verificar o schema.
- Use as tools do MCP (`list_tables`, `execute_sql`) para interagir com o banco.
- Siga o protocolo de migrations em `.agent/skills/supabase-mcp/SKILL.md`.

## 3. Logs de Integração
- Ao trabalhar com integrações (Espaider, etc), você **DEVE** implementar logs persistentes na tabela `integration_logs`.
- Não confie apenas em `console.log`.

## 4. Contexto do Negócio
- Leia `.context/00-MASTER.md` para entender as Regras de Negócio.
- Não assuma funcionalidades que não estejam documentadas lá.

## 5. Estrutura de Pastas
- `src/` contém READMEs explicativos (`src/README.md`).
- `supabase/` contém READMEs de banco (`supabase/README.md`).
- Use esses arquivos para entender onde colocar seu código.
