# Breathe ESG

A lightweight ESG data ingestion and audit review platform built using Django REST Framework and React.

The platform simulates how enterprise sustainability teams onboard ESG-related operational data from multiple disconnected systems, normalize it into a canonical structure, validate inconsistencies, and route records through analyst review workflows before audit sign-off.

---

# Features

* CSV ingestion for:

  * SAP fuel/procurement data
  * Utility electricity usage data
  * Corporate travel data

* Canonical ESG emission normalization

* Scope 1 / 2 / 3 categorization

* Validation engine for suspicious or incomplete records

* Analyst review dashboard

* Approve / Reject workflow

* Immutable locked records after approval

* Audit logging and traceability

* PostgreSQL-backed persistence

* Multi-source data handling

---

# Architecture Workflow

CSV Upload
↓
Raw Record Storage
↓
Normalization Layer
↓
Canonical Emission Record
↓
Validation Checks
↓
Analyst Review Workflow
↓
Approved & Locked for Audit

---

# Review Lifecycle

PENDING → REJECTED → CORRECTED → APPROVED → LOCKED

Locked records become immutable to preserve audit integrity.

---

# Tech Stack

## Backend

* Django
* Django REST Framework
* PostgreSQL

## Frontend

* React
* Vite
* Axios
* Tailwind CSS

## Deployment

* Render (Backend)
* Vercel (Frontend)

---

# Local Setup

## Backend Setup

```bash
cd backend

python -m venv venv
```

### Activate Virtual Environment

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure PostgreSQL

Update database settings in:

```text
core/settings.py
```

Ensure PostgreSQL contains a database named:

```text
breathe_esg
```

### Run Migrations

```bash
python manage.py makemigrations ingestion
python manage.py migrate
```

### Start Backend

```bash
python manage.py runserver
```

Backend runs on:

```text
http://localhost:8000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Deployment

## Backend Deployment (Render)

1. Create a new Web Service
2. Connect GitHub repository
3. Set Root Directory:

```text
backend
```

### Build Command

```text
pip install -r requirements.txt && python manage.py migrate
```

### Start Command

```text
gunicorn core.wsgi
```

### Environment Variables

```text
DATABASE_URL
SECRET_KEY
DEBUG=False
```

---

## Frontend Deployment (Vercel)

1. Import GitHub repository
2. Framework Preset: Vite
3. Root Directory:

```text
frontend
```

### Environment Variable

Key:

```text
VITE_API_URL
```

Value:

```text
https://your-render-backend-url/api
```

---

# Sample Data Sources

The project includes realistic mock datasets for:

* SAP fuel/procurement exports
* Utility electricity reports
* Corporate travel records

These datasets simulate real-world ESG onboarding inconsistencies such as:

* mixed units
* missing values
* inconsistent formats
* invalid quantities

---

# API Endpoints

## Upload Data

```text
/api/upload/
```

## Records

```text
/api/records/
```

## Audit Logs

```text
/api/audit-logs/
```

---

# Key Design Priorities

* Auditability
* Explainability
* Realistic ingestion workflows
* Analyst usability
* Data traceability

---

# Future Improvements

Potential future enhancements:

* OCR support for PDF utility bills
* SAP OData/BAPI integrations
* Async processing pipelines
* Role-based authentication
* Automated anomaly detection
* Live travel platform integrations

---

# Repository

GitHub Repository:

```text
https://github.com/Hemakumar32/breathe-esg-platform
```
