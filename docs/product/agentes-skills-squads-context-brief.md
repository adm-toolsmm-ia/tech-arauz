# Brief: Contexto e objetivo — Agentes, Squads e Skills de projeto (Tech Arauz)

**Versão:** 1.0  
**Data:** 2026-03-21  
**Status:** Aprovado para base de PRD  
**Autoria:** @pm / @analyst (síntese) — revisão @po  

---

## 1. Contexto

O Tech Arauz é um SaaS **multi-tenant** para gestão de projetos (Espaider), organização e capacidades de IA. Hoje coexistem:

- **Agentes e skills de engenharia** (AIOS/AIOX no repositório: `.aios-core/`, `.agent/skills/`) usados por desenvolvimento e orquestração de software.
- **Agentes de produto** persistidos no Supabase (`agents`, provedores LM, sessões de chat), configuráveis pela aplicação.

A lacuna: **gestores e equipes de TI/projetos** precisam **definir e governar** como a IA apoia o dia a dia (fornecedores, documentos, cronogramas, riscos) **sem depender de arquivos no Git**. Isso exige um módulo no app onde o **usuário do tenant** gerencie executores (agente), **equipes lógicas de agentes** (squad) e **pacotes de contexto e instrução** (skills de projeto), com **isolamento por tenant (RLS)**.

Foi implementada uma **baseline técnica** (migration 073, UI em `/agentes`) **antes** de PRD formal — o que gerou risco de perda de rastreabilidade. Este brief e o PRD associado **formalizam a intenção retroativamente** e orientam evolução via stories AIOX.

---

## 2. Objetivo de negócio

1. Oferecer **AI para gestão de projetos e tecnologia da empresa** dentro do produto, com configuração **100% acessível na interface** (CRUD, filtros, cópias claras).
2. Diferenciar de forma **estável e documentada** três conceitos:
   - **Agente**: executor com modelo LLM, prompts e classificação (chatbot/workflow).
   - **Squad**: agrupamento de agentes individuais para orquestração conceitual (não confundir com “squad” do framework AIOX de desenvolvimento).
   - **Skill de projeto**: registro de catálogo com instruções (Markdown), URLs, tags, anexos textuais — **não** é o `SKILL.md` do runtime dev.
3. Preparar **contexto estruturado** (dados + anexos) para uso futuro por projetos, automações e agentes, sem acoplar prematuramente pipelines pesados (scrape/OCR) ao MVP de catálogo.

---

## 3. Stakeholders (alvo)

- **Product Owner / Gestão**: prioriza catálogo de skills e regras de uso.
- **PMO / Projetos**: consome skills alinhadas a cronograma, custo, riscos, fornecedores.
- **TI / Arquitetura**: skills técnicas (APIs, ADR, segurança, licenças).
- **Time interno**: @architect, @data-engineer, @ux-design-expert, @dev, @qa (implementação e qualidade).

---

## 4. Baseline retroativa (decisão)

- O código e o schema existentes são tratados como **linha de base** a ser descrita, validada e refinada **somente** após PRD + ADR + validação @po.
- Novas migrations ou mudanças de escopo **exigem** story e, quando aplicável, @data-engineer.

---

## 5. Documentos relacionados

- [PRD brownfield](../prd/PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md)
- [ADR-015 — modelo de contexto](../architecture/ADR-015-agentes-skills-squads-context-model.md)
- [Log de validação @po](../governance/PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md)
- [Revisão final AIOX (execução autônoma 16.2+)](../governance/AIOX-MULTIAGENT-REVIEW-EPIC16-AGENTES-SKILLS.md)
- [Snapshot de contexto para implementação](../governance/CONTEXT-SNAPSHOT-EPIC16-EXECUTION.md)

---

## 6. Revisão @po

Registrar parecer e data em [PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md](../governance/PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md).
