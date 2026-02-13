# Decision Matrix

> **Lookup Table:** Which agents do I need for Task X?

| Task Type                 | Complexity | Agents Required                                                             | Pattern   |
| ------------------------- | ---------- | --------------------------------------------------------------------------- | --------- |
| **New Database Table**    | Low        | `database-architect`                                                        | Single    |
| **New API Endpoint**      | Low        | `backend-specialist`                                                        | Single    |
| **New UI Component**      | Low        | `frontend-specialist`                                                       | Single    |
| **Full CRUD Feature**     | Medium     | `database-architect`, `backend-specialist`, `frontend-specialist`           | **Trio**  |
| **3rd Party Integration** | High       | `orchestrator`, `backend-specialist`, `database-architect`, `test-engineer` | **Squad** |
| **Security Audit**        | High       | `security-auditor`, `test-engineer`                                         | **Pair**  |
| **Performance Opt**       | Medium     | `performance-profiler`, `frontend-specialist`                               | **Pair**  |
| **Critical Bug Fix**      | High       | `orchestrator`, `debugger`, `backend-specialist`                            | **Trio**  |
| **Documentation**         | Low        | `documentation-writer`                                                      | Single    |
| **Deployment**            | High       | `devops-engineer`, `test-engineer`                                          | **Pair**  |
