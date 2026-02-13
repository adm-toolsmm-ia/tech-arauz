# Memory Indexing & Search

> **Find the needle in the haystack.**

---

## 🔍 How to Find Logs

### Option 1: Grep (Fastest)

```bash
# Search by tag
grep -r "tags:.*security" .agent/memory/

# Search by keyword
grep -r "RLS policy" .agent/memory/
```

### Option 2: Python Script (Structured)

Use the included script to search by metadata.

```bash
python .agent/skills/memory-management/scripts/memory-search.py "Espaider"
```

## 🗂️ Indexing

The `memory-indexer.py` script scans all files in `.agent/memory/` and builds an in-memory index of:
- Tags
- Dates
- Agents involved
- Skills used

Run it to get a report:
```bash
python .agent/skills/memory-management/scripts/memory-indexer.py
```
