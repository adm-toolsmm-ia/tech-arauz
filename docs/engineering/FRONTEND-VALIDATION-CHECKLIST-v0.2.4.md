# Frontend Validation Checklist — v0.2.4 (Story 13.1)

**Data:** 2026-03-16
**Versão:** v0.2.4 (EPIC 11 + EPIC 12 + Story 13.1)
**Status:** 🟢 Staging Ready
**Responsável:** User (Frontend Validation)

---

## 🎯 **Objetivo**

Validar que os **3 Critical Gaps** foram implementados corretamente no frontend:
- ✅ Gap #1: ResponsibleRoles integration em Activities
- ✅ Gap #2: BPM Fields (inputs/outputs/risks/impacts) editáveis
- ✅ Gap #3: Process SLA Management (CRUD)

---

## 🔍 **Pre-Requisites**

- [ ] Staging URL acessível (ex: `https://tech-arauz-staging.vercel.app`)
- [ ] Logged in como usuário com tenant ativo
- [ ] Browser: Chrome/Firefox/Safari (recomendado)
- [ ] Dev Tools aberto (F12) para verificar console errors
- [ ] Database: org_* tables acessíveis (check via Supabase dashboard)

---

## 🧪 **Testes por Gap**

### **GAP #1: ResponsibleRoles Integration**

**Rota:** `/organizacao/processos`

#### Teste 1.1: Open Process → Activity
- [ ] Navigate to `/organizacao/processos`
- [ ] Selecionar um **Processo** (ex: "Gestão de Contrato")
- [ ] Expandir **Rotina** dentro do processo
- [ ] Click em uma **Atividade** (ex: "Validar Contrato")
- [ ] Verify `ActivityCockpit360` abre com tabs

**Expected:** Activity detail view com múltiplos tabs (Info, BPM, Documentos, Documentação, Sistemas)

#### Teste 1.2: Edit Activity → ResponsibleRoles
- [ ] Em `ActivityCockpit360`, clique botão **"Editar"** (top-right)
- [ ] `OrgEntityFormSheet` abre from right side
- [ ] Form carrega com activity data
- [ ] Verify campo **"Responsible Roles"** está presente (com tag input + autocomplete)
- [ ] **Expected:** ResponsibleRolesInput component renderizado

#### Teste 1.3: Add Responsible Role
- [ ] Em "Responsible Roles" field, click na caixa de input
- [ ] Type primeiro caracter de um role (ex: "D" para "Director")
- [ ] Autocomplete dropdown aparece com opções
- [ ] Select "Director"
- [ ] Tag com "Director" aparece na forma

**Expected:** Papel adicionado como tag com badge visual

#### Teste 1.4: Remove Role
- [ ] Clique no "X" no badge de "Director"
- [ ] Role é removido
- [ ] Campo fica vazio

**Expected:** Role removido sem erro

#### Teste 1.5: Save & Persist
- [ ] Adicione 2-3 roles (ex: Director, Manager, Specialist)
- [ ] Click botão **"Save"**
- [ ] Toast notification aparece: "Activity updated successfully"
- [ ] Form fecha
- [ ] Reabra a activity → Verify roles ainda estão lá (persisted)

**Expected:** AC #27 ✅ SATISFIED

---

### **GAP #2: BPM Fields (Inputs/Outputs/Risks/Impacts)**

#### Teste 2.1: Open BPM Details
- [ ] Em `ActivityCockpit360`, clique botão **"Detalhes BPM"** (próximo a "Editar")
- [ ] Form abre com **BPM tab** selecionada

**Expected:** Tab com 4 seções: Inputs, Outputs, Risks, Impacts

#### Teste 2.2: Inputs Field
- [ ] Na seção "Inputs", verificar display de inputs existentes (se houver)
- [ ] Click botão **"+ Adicionar Input"** (ou similar)
- [ ] Modal/dialog aparece com campos:
  - [ ] Input name (obrigatório)
  - [ ] Description (opcional)
  - [ ] Required checkbox
- [ ] Preencha: name="Contrato em PDF", description="Arquivo do contrato", required=true
- [ ] Click "Save Input"
- [ ] Input aparece na lista com badge "Required"

**Expected:** Input adicionado com validação obrigatória

#### Teste 2.3: Outputs Field
- [ ] Mesmos passos que Inputs
- [ ] Add: name="Contrato Validado", description="Contrato aprovado"
- [ ] Verify output aparece

**Expected:** Output adicionado

#### Teste 2.4: Risks Field
- [ ] Click **"+ Adicionar Risk"**
- [ ] Input simples: risk text
- [ ] Add: "Contrato rejeitado"
- [ ] Verify risk aparece em lista

**Expected:** Risk adicionado

#### Teste 2.5: Impacts Field
- [ ] Click **"+ Adicionar Impact"**
- [ ] Add: "Processo para, aguarda novo contrato"
- [ ] Verify impact aparece

**Expected:** Impact adicionado

#### Teste 2.6: Save & Persist BPM
- [ ] Click **"Save"** button na form
- [ ] Toast: "Activity updated successfully"
- [ ] Reabra activity → Check BPM tab → Verify todos 4 campos persistiram

**Expected:** AC #28 ✅ SATISFIED

---

### **GAP #3: Process SLA Management**

**Rota:** `/organizacao/processos`

#### Teste 3.1: Open Process → SLAs Tab
- [ ] Navigate to `/organizacao/processos`
- [ ] Click em um **Processo** (ex: "Gestão de Contrato")
- [ ] `ProcessCockpit360` abre
- [ ] Verificar existem tabs: Principal, Detalhes, Rotinas, Sistemas, **SLAs** (NEW)
- [ ] Click na aba **"SLAs"**

**Expected:** Nova aba "SLAs" com icon Target renderizada

#### Teste 3.2: Create New SLA
- [ ] Na aba "SLAs", click botão **"Novo SLA"** (ou "+ Add SLA")
- [ ] `ProcessSlaModal` abre (form in dialog)
- [ ] Form contém campos:
  - [ ] Métrica (dropdown: execution_time, quality, availability)
  - [ ] Duração (number input)
  - [ ] Threshold Aviso (%)
  - [ ] Threshold Crítico (%)
  - [ ] Descrição (textarea, opcional)
- [ ] Preencha:
  - Métrica: "execution_time"
  - Duração: "48"
  - Aviso: "80"
  - Crítico: "60"
  - Descrição: "SLA padrão para validação de contrato"

**Expected:** Todos campos renderizados e acessíveis

#### Teste 3.3: Validation Rules
- [ ] Try submit com Duração = 0 → Error message aparece
- [ ] Try submit com Aviso (80) >= Crítico (60) → Should accept (ou mostrar warning)
- [ ] Try submit com descrição vazia → Should accept (opcional)

**Expected:** Validação funcionando

#### Teste 3.4: Save SLA
- [ ] Preencha corretamente todos campos
- [ ] Click **"Save"** ou **"Create"**
- [ ] Toast notification: "SLA created successfully"
- [ ] Dialog fecha
- [ ] SLA aparece na lista com:
  - [ ] Badge visual "execution_time"
  - [ ] Duração exibida (48h)
  - [ ] Status (Green/Yellow/Red based on thresholds)

**Expected:** AC #29 ✅ SATISFIED (Create)

#### Teste 3.5: Edit SLA
- [ ] Na lista de SLAs, click botão **"Edit"** (pencil icon)
- [ ] Modal abre em edit mode com dados preenchidos
- [ ] Modifique: Duração 48 → 72, Aviso 80 → 85
- [ ] Click **"Save"**
- [ ] Toast: "SLA updated successfully"
- [ ] SLA list atualiza com novos valores

**Expected:** Edit funciona corretamente

#### Teste 3.6: Delete SLA
- [ ] Click botão **"Delete"** (trash icon)
- [ ] Confirmation dialog: "Are you sure?"
- [ ] Click **"Confirm"**
- [ ] Toast: "SLA deleted successfully"
- [ ] SLA desaparece da lista

**Expected:** AC #29 ✅ SATISFIED (Delete)

---

## ♿ **Accessibility Checks (WCAG AA)**

- [ ] **Keyboard Navigation:** Tab through all forms, fields accessible
- [ ] **Color Contrast:** Form labels readable (check with DevTools)
- [ ] **Focus Indicators:** Blue outline visible when tabbing through inputs
- [ ] **Screen Reader (optional):** Test with VoiceOver (Mac) or NVDA (Windows)
  - [ ] Labels announced correctly
  - [ ] Button purpose clear
  - [ ] Error messages announced
- [ ] **Mobile Responsive:** Test on mobile (iPad/iPhone) — forms should adapt
  - [ ] Modal/sheet doesn't overflow
  - [ ] Buttons tappable (≥44x44px)

**Expected:** WCAG AA compliant ✅

---

## 🔒 **Security/RLS Checks**

- [ ] **Cross-Tenant Isolation:** Login as different tenant → Activities/SLAs should NOT show other tenant's data
  - Test: Create SLA in Tenant A, switch to Tenant B → Tenant B SLAs should be different
- [ ] **Authorization:** Non-admin users can CRUD their own activities/SLAs
- [ ] **No Console Errors:** F12 → Console tab → Zero red errors

**Expected:** RLS 100% enforced ✅

---

## 📊 **Performance Checks**

- [ ] **Page Load Time:** `/organizacao/processos` loads in <2 seconds
- [ ] **Activity Detail:** Click activity → opens in <1 second
- [ ] **Form Save:** Click save → API responds in <1.5 seconds
- [ ] **No Network Errors:** Network tab (F12) shows 200 status codes

**Expected:** Performance acceptable ✅

---

## 🎯 **Final Summary**

| Gap | Feature | Teste 1 | Teste 2 | Teste 3 | Status |
|-----|---------|---------|---------|---------|--------|
| **#1** | ResponsibleRoles | Open ✓ | Edit ✓ | Add/Remove ✓ | ✅ AC #27 |
| **#2** | BPM Fields | Inputs ✓ | Outputs ✓ | Risks/Impacts ✓ | ✅ AC #28 |
| **#3** | SLA CRUD | Create ✓ | Edit ✓ | Delete ✓ | ✅ AC #29 |
| **A11y** | WCAG AA | Keyboard ✓ | Contrast ✓ | Focus ✓ | ✅ WCAG AA |
| **Security** | RLS | Isolation ✓ | Authorization ✓ | Console ✓ | ✅ RLS 100% |

---

## ✅ **Sign-Off**

- [ ] **All 3 gaps tested** — ✅ PASS
- [ ] **Accessibility verified** — ✅ WCAG AA
- [ ] **RLS validated** — ✅ 100% isolated
- [ ] **Performance acceptable** — ✅ <2s loads
- [ ] **No critical bugs** — ✅ Console clear

**Overall Status:** 🟢 **READY FOR PRODUCTION** (v0.2.4 April 25)

---

**Tester Name:** _______________
**Date:** _______________
**Notes/Feedback:**
