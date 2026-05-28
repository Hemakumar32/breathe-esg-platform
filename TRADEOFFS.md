# TRADEOFFS.md

## 1. No Real-Time SAP Integration

I intentionally avoided direct SAP integrations such as:
- BAPI
- OData
- IDoc processing

**Reason:**
- high implementation complexity
- assignment time constraints
- CSV ingestion demonstrates the normalization workflow sufficiently

---

## 2. No Authentication System

I did not implement:
- login
- RBAC
- SSO

**Reason:**
- focus was prioritized on ingestion, normalization, validation, and audit workflow
- authentication was not central to the assignment evaluation

---

## 3. No Asynchronous Processing Pipeline

Uploads are processed synchronously. I did not implement:
- Celery
- background workers
- queue systems

**Reason:**
- prototype-scale dataset sizes
- reduced operational complexity
- faster implementation within timeline

---

## Additional Limitations

Not implemented:
- OCR for PDF utility bills
- live travel platform APIs
- advanced emissions factor libraries
- automated anomaly detection models
- bulk reconciliation workflows

These were intentionally excluded to prioritize core workflow quality and auditability.
