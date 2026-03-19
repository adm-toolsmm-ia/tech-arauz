# Design Tools — Color Extraction Utilities

**Purpose:** Extract dominant color palettes from design assets (PNG, JPEG) to inform visual identity and design system decisions.

**Framework Layer:** L2 (Framework Templates — reusable infrastructure)

---

## Scripts Available

### 1. `extract.js` (Node.js)
Extract top 5 colors from PNG images using pngjs library.

**Usage:**
```bash
node extract.js
```

**Dependencies:**
```bash
npm install pngjs
```

**Output:**
```
Top colors for image.png:
#FF6B35 - count: 5234
#2B2D42 - count: 3421
...
```

---

### 2. `extract.py` (Python)
Extract top 10 colors from PNG/JPEG images using PIL (Pillow).

**Usage:**
```bash
python extract.py
```

**Dependencies:**
```bash
pip install Pillow
```

**Output:**
```
Top 10 colors for image.png:
#FF6B35 - count: 5234
#2B2D42 - count: 3421
...
```

---

### 3. `extract.ps1` (PowerShell)
Extract top 5 colors using .NET System.Drawing (Windows-native).

**Usage:**
```powershell
.\extract.ps1
```

**Output:**
```
Top colors in image.png
#FF6B35 - 5234
#2B2D42 - 3421
...
```

---

## How to Customize

Edit the target image paths in any script:

```javascript
// extract.js
extractColors('docs/assets/design-system/logos/logo-primary.png');
```

```python
# extract.py
extract_colors(r"docs/assets/design-system/logos/logo-primary.png")
```

```powershell
# extract.ps1
Get-TopColors -ImagePath "docs/assets/design-system/logos/logo-primary.png"
```

---

## Integration with Design System

**Intended workflow:**
1. Place design assets in `docs/assets/design-system/{category}/`
2. Run extraction script
3. Document palette in `docs/assets/DESIGN-SYSTEM.md`
4. Reference colors in `src/app/globals.css` (Tailwind config)

---

## Layer Classification

| Layer | Status | Owner |
|-------|--------|-------|
| **L1** Framework Core | — | Framework (NEVER modify) |
| **L2** Framework Templates | ✅ **This file** | Framework (extend-only) |
| **L3** Project Config | — | `.aiox-core/data/` |
| **L4** Project Runtime | — | `docs/assets/`, `src/` |

---

## Quality Gates (AIOX 10/10)

- ✅ No external API calls
- ✅ Runs locally (offline-safe)
- ✅ Cross-platform (Node.js, Python, PowerShell)
- ✅ No security vulnerabilities
- ✅ Documented and tested

---

*Last updated: 2026-03-18*
*Framework: Synkra AIOX v1.0.0 (Constitution-driven)*
