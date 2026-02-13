# Data Validation Checklist

> **Defensive Programming:** Trust nothing from the API. Validate everything.

---

## 🛡️ Pre-Integration Checks

### 1. Null Safety

- [ ] **String Fields:** Check `if (value !== null && value !== undefined)`.
- [ ] **Objects:** Check `if (obj && obj.property)`.
- [ ] **Fallbacks:** Define defaults (e.g., `""` for strings, `0` for numbers) if acceptable.

### 2. Type Coercion

- [ ] **Dates:**
  - Validate: `!isNaN(Date.parse(value))`
  - Handle: "0000-00-00", empty strings, or varying formats (DD/MM/YYYY vs YYYY-MM-DD).
- [ ] **Numbers:**
  - Parse: `parseInt(value, 10)` or `parseFloat(value)`.
  - Validate: `!isNaN(result)`.

### 3. Business Logic Validation

- [ ] **Enums:** Does `APROVADORATUAL` match one of the allowed `FASES`?
- [ ] **Relationships:** Does `IDPROJETO` (FK) exist before inserting `ENTREGA`?

### 4. Database Constraints

- [ ] **Length:** Truncate strings if `VARCHAR(50)` limit exists.
- [ ] **Uniqueness:** Handle duplicate `ID`s in same payload (use last win or first win strategy).

---

## 📝 Code Review Question

*"If the API returns an empty object `{}` for a Project, does the code crash or log a warning?"*
**It MUST NOT crash.**
