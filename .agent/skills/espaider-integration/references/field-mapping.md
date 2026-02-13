# Espaider API Field Mapping

> **Source of Truth:** This document (and its companion `field-mapping.json`) defines the official mapping between Espaider API fields and the Tech-Arauz database schema.

---

## 🏗️ Projetos (Entity: `projects`)

| Espaider Field   | DB Column     | Type      | Nullable | Notes                          |
| :--------------- | :------------ | :-------- | :------- | :----------------------------- |
| `IDPROJETO`      | `id_espaider` | `integer` | ❌ No     | Primary Key from Espaider      |
| `NOMEPROJETO`    | `nome`        | `text`    | ❌ No     | Project Title                  |
| `APROVADORATUAL` | `fase_atual`  | `text`    | ✅ Yes    | Used for Kanban phase grouping |

---

## 📦 Entregas (Entity: `project_deliveries`)

| Espaider Field     | DB Column     | Type      | Nullable | Notes               |
| :----------------- | :------------ | :-------- | :------- | :------------------ |
| `IDENTREGA`        | `id_espaider` | `integer` | ❌ No     | Primary Key         |
| `DESCRICAOENTREGA` | `descricao`   | `text`    | ✅ Yes    | Description content |

---

## 📅 Cronogramas (Entity: `project_schedules`)

| Espaider Field | DB Column     | Type      | Nullable | Notes                       |
| :------------- | :------------ | :-------- | :------- | :-------------------------- |
| `IDCRONOGRAMA` | `id_espaider` | `integer` | ❌ No     | Primary Key                 |
| `DATAINICIO`   | `data_inicio` | `date`    | ✅ Yes    | Start date of schedule item |

---

## 📋 Requisitos (Entity: `project_requirements`)

| Espaider Field  | DB Column     | Type      | Nullable | Notes            |
| :-------------- | :------------ | :-------- | :------- | :--------------- |
| `IDREQUISITO`   | `id_espaider` | `integer` | ❌ No     | Primary Key      |
| `NOMEREQUISITO` | `nome`        | `text`    | ❌ No     | Requirement Name |
