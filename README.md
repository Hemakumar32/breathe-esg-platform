# Breathe ESG

A lightweight ESG data ingestion and audit review platform built using Django REST Framework and React.

The platform simulates how enterprise sustainability teams onboard ESG-related operational data from multiple disconnected systems, normalize it into a canonical structure, validate inconsistencies, and route records through analyst review workflows before audit sign-off.

---

# Live Deployment

## Frontend

https://breathe-esg-platform-theta.vercel.app/login

## Backend API

https://breathe-esg-backend-asol.onrender.com

## GitHub Repository

https://github.com/Hemakumar32/breathe-esg-platform

---

# Features

## CSV Ingestion for:

* SAP fuel/procurement data
* Utility electricity usage data
* Corporate travel data

## Core Functionalities

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

# Backend Setup

```bash
cd backend
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure PostgreSQL

Update database settings in:

```bash
core/settings.py
```

Ensure PostgreSQL contains a database named:

```bash
breathe_esg
```

## Run Migrations

```bash
python manage.py makemigrations ingestion
python manage.py migrate
```

## Start Backend

```bash
python manage.py runserver
```

Backend runs on:

```bash
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

```bash
http://localhost:5173
```

---

# Deployment

# Backend Deployment (Render)

* Create a new Web Service
* Connect GitHub repository
* Set Root Directory:

```bash
backend
```

## Build Command

```bash
pip install -r requirements.txt && python manage.py migrate
```

## Start Command

```bash
gunicorn core.wsgi
```

## Environment Variables

```bash
DATABASE_URL
SECRET_KEY
DEBUG=False
```

---

# Frontend Deployment (Vercel)

* Import GitHub repository
* Framework Preset: Vite

## Root Directory

```bash
frontend
```

## Environment Variable

### Key

```bash
VITE_API_URL
```

### Value

```bash
https://breathe-esg-backend-asol.onrender.com/api
```

---

# API Endpoints

## Upload Data

```bash
/api/upload/
```

## Records

```bash
/api/records/
```

## Audit Logs

```bash
/api/audit-logs/
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

# Screenshots

## Dashboard Overview

* ESG analytics dashboard
* Emission trends visualization
* Scope distribution charts

* <img width="1919" height="955" alt="Screenshot 2026-05-28 225017" src="https://github.com/user-attachments/assets/26292383-b491-4f15-a448-890f73ce0fe1" />


## Upload Workflow

* SAP CSV ingestion
* Utility ingestion
* Corporate travel uploads

  <img width="1918" height="958" alt="Screenshot 2026-05-28 225044" src="https://github.com/user-attachments/assets/38d81fb6-4465-4e71-a7ad-b0c69e110eb6" />

## Review Workflow

* Approve / Reject records
* Validation issue tracking
* Record lifecycle history

  <img width="1910" height="953" alt="Screenshot 2026-05-28 225223" src="https://github.com/user-attachments/assets/ac2a231a-b69e-4b34-af17-a4bd021025f9" />


<img width="1919" height="945" alt="Screenshot 2026-05-28 225244" src="https://github.com/user-attachments/assets/f4df08f4-5dbd-4171-ae70-8d53205b5961" />

* Approved records become locked and immutable
* Validation issues are highlighted during analyst review


<img width="1917" height="950" alt="Screenshot 2026-05-28 225340" src="https://github.com/user-attachments/assets/3b10289b-b6da-4c01-b67e-87efd6beb5d7" />

## Audit Logs

* Immutable audit records
* Approval history tracking
* System traceability logs



<img width="1919" height="963" alt="Screenshot 2026-05-28 225258" src="https://github.com/user-attachments/assets/f1b1a17c-8b27-4496-b5fa-34e1351c3241" />

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

https://github.com/Hemakumar32/breathe-esg-platform

