# Component Accessibility Guide

**Framework:** React + Radix UI  
**Standard:** WCAG 2.1 Level AA  
**Last Updated:** 2026-03-08  

---

## Table of Contents

1. [Introduction](#introduction)
2. [Accessible Component Patterns](#accessible-component-patterns)
3. [Common Mistakes](#common-mistakes)
4. [Testing Checklist](#testing-checklist)

---

## Introduction

This guide documents accessibility best practices for all components in the Tech Arauz design system. All components must be tested with jest-axe and verified with keyboard navigation and screen readers.

### Key Principles

- **Semantic HTML:** Use appropriate HTML elements (button, input, label, fieldset, etc.)
- **ARIA Attributes:** Only use ARIA when native HTML doesn't suffice
- **Keyboard Navigation:** All interactive elements must be keyboard accessible
- **Color Contrast:** Text must meet WCAG AA contrast ratios (4.5:1 for normal text)
- **Focus Management:** Focus indicators must be visible and predictable

---

## Accessible Component Patterns

### Button

**Good Practice:**
```tsx
<button type="button" onClick={handleClick}>
  Click me
</button>

// With icon + text
<button aria-label="Delete project">
  <TrashIcon />
</button>

// Disabled state
<button disabled aria-disabled="true">
  Saving...
</button>
```

**What to test:**
- ✅ Can activate with Enter/Space keys
- ✅ Visible focus indicator
- ✅ aria-label when text is missing
- ✅ aria-busy/aria-disabled for async states

---

### Input

**Good Practice:**
```tsx
<label htmlFor="email">Email:</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>

// With error
<input
  id="username"
  aria-invalid="true"
  aria-describedby="username-error"
/>
<span id="username-error" role="alert">
  Username is required
</span>
```

**What to test:**
- ✅ Label always associated (htmlFor + id)
- ✅ Type attribute correct (email, password, number, etc.)
- ✅ aria-invalid + aria-describedby for errors
- ✅ aria-required for mandatory fields
- ✅ Visible focus indicator

---

### Modal / Dialog

**Good Practice:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent role="dialog" aria-modal="true">
    <DialogHeader>
      <DialogTitle id="modal-title">Confirm Delete</DialogTitle>
    </DialogHeader>
    <DialogDescription id="modal-desc">
      This action cannot be undone.
    </DialogDescription>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="destructive">Delete</Button>
  </DialogContent>
</Dialog>
```

**What to test:**
- ✅ role="dialog" and aria-modal="true"
- ✅ Focus trap (Tab stays within modal)
- ✅ Escape key closes dialog
- ✅ Focus returns to trigger after close
- ✅ Descriptive title and description

---

### Form

**Good Practice:**
```tsx
<form>
  <fieldset>
    <legend>Personal Information</legend>
    
    <label htmlFor="name">Name *</label>
    <input
      id="name"
      type="text"
      required
      aria-required="true"
    />
    
    <label htmlFor="email">Email *</label>
    <input
      id="email"
      type="email"
      required
      aria-required="true"
    />
    
    <fieldset>
      <legend>Preferences</legend>
      <input type="checkbox" id="newsletter" />
      <label htmlFor="newsletter">Subscribe to newsletter</label>
    </fieldset>
  </fieldset>
  
  <button type="submit">Submit</button>
</form>
```

**What to test:**
- ✅ `<fieldset>` + `<legend>` for grouped fields
- ✅ Every input has `<label htmlFor>`
- ✅ `aria-required="true"` on required fields
- ✅ `aria-invalid="true"` + `aria-describedby` for errors
- ✅ Error messages have `role="alert"`

---

### Dropdown / Select

**Good Practice:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button aria-haspopup="listbox" aria-expanded={open}>
      Select option
    </Button>
  </PopoverTrigger>
  <PopoverContent role="listbox">
    <div
      role="option"
      onClick={selectOption}
      aria-selected={selected}
      tabIndex={0}
    >
      Option 1
    </div>
    <div role="option" aria-selected={false} tabIndex={-1}>
      Option 2
    </div>
  </PopoverContent>
</Popover>
```

**What to test:**
- ✅ `role="listbox"` on container
- ✅ `role="option"` on items
- ✅ `aria-selected` for state
- ✅ Arrow keys navigate items
- ✅ Enter/Space select item

---

### Filtros e componentes customizados (Select, grupos de botão)

**Select (Radix/shadcn):** componente deve aceitar `id` e repassar ao trigger; consumidor usa `<Label htmlFor={id}>` + `<TeamFilter id={id} />`.

**Grupo de botões (ex.: PeriodSelector):** usar `<fieldset>` + `<legend>` — não usar `<label>` isolado.

**Evitar:** `<label>Texto</label><CustomControl />` sem associação.

---

### Tabs

**Good Practice:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList role="tablist">
    <TabsTrigger
      value="tab1"
      role="tab"
      aria-selected={selected === 'tab1'}
      aria-controls="panel-1"
    >
      Tab 1
    </TabsTrigger>
    <TabsTrigger
      value="tab2"
      role="tab"
      aria-selected={selected === 'tab2'}
      aria-controls="panel-2"
    >
      Tab 2
    </TabsTrigger>
  </TabsList>
  
  <TabsContent
    value="tab1"
    role="tabpanel"
    id="panel-1"
    aria-labelledby="tab-1"
  >
    Content 1
  </TabsContent>
  <TabsContent
    value="tab2"
    role="tabpanel"
    id="panel-2"
    aria-labelledby="tab-2"
  >
    Content 2
  </TabsContent>
</Tabs>
```

**What to test:**
- ✅ `role="tab"` and `role="tabpanel"`
- ✅ `aria-selected` on active tab
- ✅ `aria-controls` links tab to panel
- ✅ Arrow keys switch tabs
- ✅ Focus visible on tab

---

## Common Mistakes

### ❌ Missing Labels

**Bad:**
```tsx
<input type="email" placeholder="Enter email" />
```

**Good:**
```tsx
<label htmlFor="email">Email:</label>
<input id="email" type="email" />
```

**Why:** Placeholder is not a label. Screen reader users need explicit label.

---

### ❌ Divs as Buttons

**Bad:**
```tsx
<div onClick={handleClick}>Delete</div>
```

**Good:**
```tsx
<button type="button" onClick={handleClick}>Delete</button>
```

**Why:** `<button>` is focusable and supports Enter/Space keyboard activation.

---

### ❌ Color-Only Indicators

**Bad:**
```tsx
<div style={{ color: 'green' }}>Success</div>
```

**Good:**
```tsx
<div style={{ color: 'green' }}>
  ✓ Success
</div>
```

**Why:** Users who are colorblind cannot perceive green. Add text or icon.

---

### ❌ Insufficient Contrast

**Bad:**
```tsx
<span style={{ color: '#999' }}>Disabled</span>
```

**Good (WCAG AA Compliant):**
```tsx
<span style={{ color: '#666' }}>Disabled</span>
```

**Why:** Text must have 4.5:1 contrast ratio with background.

---

### ❌ Auto-Playing Media

**Bad:**
```tsx
<audio autoPlay>...</audio>
```

**Good:**
```tsx
<audio controls>...</audio>
```

**Why:** Auto-playing audio startles and disorients users.

---

## Testing Checklist

Before marking a component as accessible:

- [ ] **Semantic HTML:** Does component use appropriate HTML elements?
- [ ] **Labels:** Are all inputs associated with labels (`htmlFor` + `id`)?
- [ ] **Keyboard Navigation:** Can I navigate using only Tab/Arrow/Enter/Escape?
- [ ] **Focus Indicator:** Is focus clearly visible?
- [ ] **Color Contrast:** Does text meet 4.5:1 ratio (normal) or 3:1 (large)?
- [ ] **ARIA Attributes:** Are ARIA roles/states only used when needed?
- [ ] **Screen Reader:** Does content make sense when read aloud?
- [ ] **Error Messages:** Do errors have `role="alert"` and clear descriptions?
- [ ] **jest-axe Test:** Does automated test pass with no violations?
- [ ] **Disabled State:** Is disabled state announced accessibly?

---

## Running Tests

```bash
# Run all a11y tests
npm run test:a11y

# Run specific component test
npm run test:a11y -- button

# Watch mode during development
npm run test:a11y:watch
```

---

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Jest-Axe](https://github.com/nickcolley/jest-axe)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

*Last updated: 2026-03-08 | Framework: React + Radix UI | Standard: WCAG 2.1 AA*
