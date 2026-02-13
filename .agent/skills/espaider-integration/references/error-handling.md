# Espaider Error Handling & Recovery

> **Strategy:** Fail gracefully, log aggressively, retry intelligently.

---

## 🚨 Common Scenarios

### 1. Timeout (API Unresponsive)

- **Symptom:** Request takes > 30s.
- **Strategy:** Exponential Backoff.
  - Attempt 1: Immediate.
  - Attempt 2: Wait 2s.
  - Attempt 3: Wait 5s.
  - **Final:** Log "Sync Failed: Timeout" to `integration_log_entries`.

### 2. Invalid JSON (Malformed Response)

- **Symptom:** `SyntaxError: Unexpected token...`
- **Strategy:**
  - **Do NOT retry.** (It won't fix itself).
  - Log raw response snippet (first 500 chars).
  - Alert admin via log level `ERROR`.

### 3. Rate Limit (429 Too Many Requests)

- **Symptom:** HTTP 429.
- **Strategy:**
  - Respect `Retry-After` header if present.
  - Else, wait 60s before next sync attempt.

### 4. Partial Data (Missing Fields)

- **Symptom:** `NOMEPROJETO` is `null` but schema says `NOT NULL`.
- **Strategy:**
  - **Skip Record:** Do not corrupt DB with partial data.
  - Log `WARNING`: "Skipped Project ID X due to missing NOME".

---

## 🪵 Logging Standard

All errors MUST be logged to `integration_log_entries`.

| Column      | Value                                      |
| :---------- | :----------------------------------------- |
| `log_level` | `ERROR` or `WARNING`                       |
| `entity`    | `projects`, `deliveries`, etc.             |
| `message`   | Human readable: "Failed to parse date..."  |
| `payload`   | JSON object with context (IDs, raw values) |
