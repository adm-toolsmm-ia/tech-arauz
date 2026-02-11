# 📂 src/ (Source Code)

> **Contexto:** Núcleo da aplicação Next.js, contendo frontend, integrações e lógica de negócio.

## 🎯 Propósito
Centralizar todo o código fonte da aplicação, separando responsabilidades por pastas semânticas.

## 📄 Estrutura & Arquivos Chave
- `app/`: Next.js App Router (Páginas, Layouts, API Routes).
- `components/`: Componentes React reutilizáveis (UI Kit).
- `integrations/`: Módulos de conexão com serviços externos (Espaider, Supabase).
- `lib/`: Utilitários, hooks globais e constantes.

## 🚀 Como Usar
Esta pasta é processada pelo compilador do Next.js. Nenhum arquivo aqui deve ser executado diretamente via Node.js, exceto testes unitários.

## ⚠️ Notas Importantes
- **Server vs Client Components:** Por padrão, arquivos em `app/` são Server Components. Use `'use client'` no topo para interatividade.
- **Aliases:** Use `@/` para importar arquivos desta pasta (ex: `import { Button } from '@/components/ui/button'`).
