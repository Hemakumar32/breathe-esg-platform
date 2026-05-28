# DECISIONS.md

## SAP Data Choice

I chose CSV flat-file ingestion for SAP data.

**Reason:**
- common real-world export format
- easy for enterprise teams to share manually
- realistic for sustainability onboarding workflows

**Handled:**
- fuel usage
- procurement activities
- inconsistent units
- mixed date formats

**Ignored:**
- live SAP integrations
- IDoc parsing
- BAPI integrations

---

## Utility Data Choice

I chose CSV exports from utility portals.

**Reason:**
- facilities teams frequently export monthly utility reports manually
- easier to prototype within assignment timeline

**Handled:**
- billing periods
- electricity usage
- unit normalization
- missing readings

**Ignored:**
- PDF OCR extraction
- smart meter APIs
- tariff breakdown complexity

---

## Travel Data Choice

I modeled travel data using simplified Concur/Navan-like exports.

**Handled:**
- flights
- hotels
- ground transport
- airport codes

**Reason:**
- realistic corporate travel structure
- easier to normalize into Scope 3 categories

**Ignored:**
- live OAuth integrations
- airline APIs
- distance calculation engines

---

## Review Workflow Decision

I implemented:
- approve
- reject
- locked states

**Reason:**
- analyst review is central to ESG audit workflows
- supports traceability and governance

---

## Database Choice

I used **PostgreSQL** because:
- strong relational modeling support
- production-ready
- widely used with Django

---

## Deployment Choice

- **Backend:** Render
- **Frontend:** Vercel

**Reason:**
- fast deployment
- GitHub integration
- free-tier support suitable for prototype assignment

---

## Assumptions

Assumptions made:
- uploads are CSV-based
- analysts manually review flagged records
- emission factors are simplified
- tenant scale is moderate

---

## Questions For PM

If more time were available, I would ask:
- expected upload volume
- preferred ERP integrations
- required audit retention period
- emission factor source requirements
- role-based access requirements
