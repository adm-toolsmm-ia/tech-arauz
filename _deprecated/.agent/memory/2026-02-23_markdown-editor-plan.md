# Plano de Implementação: Editor Markdown Padrão (`tech-arauz`)

**Objetivo:** Construir o componente base do Editor de Textos Avançado utilizando Markdown para o sistema `tech-arauz`, focando primeiro na infraestrutura limpa de texto antes de evoluir para mídias pesadas.

## 🏗️ 1. Arquitetura e Persistência (Decisão Socrática)
- **Armazenamento:** O conteúdo será salvo como `string` (texto longo no formato Markdown) diretamente em colunas do banco de dados (Supabase).
- **Justificativa:** Evita a complexidade prematura de gerenciar File System/Storage. Permite buscas rápidas em banco (Full Text Search) e facilita a aplicação de regras de acesso (RLS). E caso futuramente precisemos exportar arquivos físicos `.md`, basta o backend gerar o arquivo estático a partir da string no banco.

## 💻 2. Stack e Dependências Principais
- **Renderização:** `react-markdown` e `remark-gfm` (já instalados via npm).
- **UI Base:** `textarea` do shadcn (já adicionado) e componentes estruturais para separação em abas (Write / Preview).

## 🧩 3. Escopo do Componente React (`MarkdownEditor`)
- **Localização Estipulada:** `src/components/editor/markdown-editor.tsx`
- **Funcionalidades da Fase 1 (MVP Avançado):**
  - Componente de dupla visualização (sistema de abas *Write/Preview*).
  - Campo de texto focado na experiência de escrita limpa (auto-resize é ideal).
  - Aba de `Preview` renderizando o Markdown fiel ao Design System da plataforma.
- **Isolamento de Responsabilidade:** O componente deve ser agnóstico quanto à API. Ele deve receber `value` e `onChange` como propriedades para facilitar seu reuso em formulários (ex: anotações, descrições longas, projetos).

## 📋 Orientação para a equipe (Claude + AIOS):
1. Convocar o agente `@frontend` para estilizar e construir as abas.
2. Certificar que a renderização através do `react-markdown` adere perfeitamente à paleta de cores, tipografia (Google Fonts como Inter/Outfit) e dark mode da aplicação, utilizando um estilo customizado ou `@tailwindcss/typography`.
3. Manter a atenção às regras do `clean-code` ao construir as passagens de props.
