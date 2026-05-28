# Breathe ESG

A mini ESG data ingestion and review platform built with Django and React.

## Features
- CSV ingestion for SAP, Utility, and Travel data
- Canonical emission normalization
- Data validation engine
- Review dashboard with approve/reject workflow

## Local Setup

### Backend (Django)
1. `cd backend`
2. `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt`
5. Configure PostgreSQL in `core/settings.py` (ensure you have a database named `breathe_esg`).
6. `python manage.py makemigrations ingestion`
7. `python manage.py migrate`
8. `python manage.py runserver`

### Frontend (Vite + React)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment

### Backend (Render)
1. Create a new Web Service on Render.
2. Connect the repository.
3. Build command: `pip install -r backend/requirements.txt && python backend/manage.py migrate`
4. Start command: `gunicorn core.wsgi:application --chdir backend`
5. Set Environment Variables: `DATABASE_URL`, `DJANGO_SECRET_KEY`.

### Frontend (Vercel)
1. Create a new Project on Vercel.
2. Connect the repository.
3. Framework Preset: Vite
4. Root Directory: `frontend`
5. Add an environment variable `VITE_API_URL` pointing to your Render backend URL (update `client.js` to use this environment variable).
