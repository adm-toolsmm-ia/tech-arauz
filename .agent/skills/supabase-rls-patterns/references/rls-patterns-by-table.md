# Tech-Arauz RLS Patterns by Table

> **Source of Truth** for strict RLS implementation in this project.

## 🏗️ Core Tables

### `projects`
- **Read:** User can read if `id_tenant` matches user's tenant.
- **Write:** User can write if `id_tenant` matches user's tenant.
- **Delete:** User CANNOT delete (Soft Delete logic preferred, or Admin only).

### `project_deliveries`
- **Read:** Inherits from Project (via `id_projeto`).
  - *Pattern:* `EXECUTE FUNCTION check_project_access(id_projeto)`
- **Write:** Inherits from Project.

### `project_schedules`
- **Read:** Inherits from Project.
- **Write:** Inherits from Project.

### `project_requirements`
- **Read:** Inherits from Project.
- **Write:** Inherits from Project.

## 👥 User Management

### `users`
- **Read:** User can read OWN profile `id = auth.uid()`.
- **Write:** User can update OWN profile.
- **Admin:** Service Role bypasses RLS.

### `user_tenants`
- **Read:** User can see tenants they belong to.
- **Write:** RESTRICTED to Admin/Service Role.

## ⚙️ Metadata

### `integration_log_entries`
- **Read:** Admin only.
- **Write:** Service Role (Sync Service) only.
