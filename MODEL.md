# MODEL.md

## Overview

The platform is designed as a lightweight ESG ingestion and review workflow system for enterprise sustainability reporting.

The core goal is to:
- ingest heterogeneous ESG-related datasets
- normalize them into a canonical format
- validate suspicious or incomplete records
- support analyst review and approval
- preserve auditability for compliance workflows

---

## Core Entities

### Tenant
Represents a client company using the platform.

**Purpose:** multi-tenant support, data isolation between organizations

**Fields:**
- `id`
- `company_name`
- `created_at`

---

### RawRecord
Stores uploaded source data before normalization.

**Purpose:** preserve original uploaded values, support traceability, enable debugging and audit review

**Fields:**
- `source_type` (SAP / Utility / Travel)
- `uploaded_file`
- `raw_payload`
- `uploaded_at`
- `uploaded_by`

---

### EmissionRecord
Canonical ESG record after normalization.

**Purpose:** provide a unified structure independent of source system

**Fields:**
- `tenant`
- `source_type`
- `scope_category` (Scope 1 / 2 / 3)
- `activity_type`
- `quantity`
- `normalized_unit`
- `emission_factor`
- `calculated_emissions`
- `status`
- `validation_flags`
- `locked`
- `created_at`

---

### AuditLog
Tracks analyst actions on records.

**Purpose:** support compliance workflows, maintain audit trail, preserve reviewer accountability

**Fields:**
- `emission_record`
- `action`
- `previous_value`
- `updated_value`
- `performed_by`
- `timestamp`

---

## Scope Handling

The platform supports:
- **Scope 1** → fuel combustion
- **Scope 2** → purchased electricity
- **Scope 3** → travel and procurement

Mappings are handled during normalization.

---

## Source Tracking

Each record preserves:
- originating source type
- upload timestamp
- original raw data
- analyst modifications

This ensures traceability during audit review.

---

## Unit Normalization

Different source systems use inconsistent units. Examples:
- liters
- gallons
- kWh
- MWh
- miles
- kilometers

The normalization layer converts values into canonical units before emissions calculations.

---

## Review Lifecycle

Record states:

```
PENDING → REJECTED → CORRECTED → APPROVED → LOCKED
```

Locked records become immutable for audit safety.

---

## Validation Engine

Validation checks include:
- missing quantities
- invalid units
- negative values
- suspiciously large emissions
- incomplete travel distances

Records with validation issues are surfaced to analysts before approval.

---

## Design Philosophy

The system prioritizes:
- auditability
- explainability
- realistic ingestion workflows
- analyst usability

over enterprise-scale optimization.
