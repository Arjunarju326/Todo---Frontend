# Personal Task & Finance Organizer

A full-stack, mobile-friendly personal productivity and financial life-management platform.

## Architecture

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Backend**: Python Django + Django REST Framework (DRF) + django-cors-headers
- **Database**: PostgreSQL (`tododb`) with Django ORM
- **Cloud Storage**: Google Cloud Storage (`GS_BUCKET_NAME='magnus-placement-test'`)

---

## Environment Variables (`.env`)

Create or update `.env` in the project root:

```env
POSTGRES_DB='tododb'
POSTGRES_USER='postgres'
POSTGRES_PASSWORD='123'
POSTGRES_HOST='127.0.0.1'
POSTGRES_PORT='5432'
SECRET_KEY='django-insecure-6u-&vm^ra+%_nf9oe18%1yqwqpst)dqq6eh3+-(69jfk$9jruh'
PLATFORM='DEV'
ALLOWED_HOSTS='*'
GS_PROJECT_ID='magnusforum-452015'
GS_BUCKET_NAME='magnus-placement-test'
CURRENT_PLATFORM='DEV'
GOOGLE_STORAGE_JSON_NAME='credential.json'
```

---

## Running the Application

### 1. Run the Python Django Backend

```bash
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Or from root:
```bash
npm run dev:backend
```

The Django REST API will be accessible at `http://127.0.0.1:8000/api/`.

### 2. Run the Next.js Frontend

In a separate terminal:

```bash
npm run dev
```

The Next.js application will run at `http://localhost:3000`. Requests to `/api/*` are automatically reverse-proxied by Next.js to the Django backend.

---

## API Endpoints

- `GET /api/dashboard` — Daily command center answering the 4 daily focus questions & overview stats.
- `GET/POST/PUT/DELETE /api/tasks` — Task management with filters (`today`, `overdue`, `upcoming`, `category`, `priority`).
- `GET/POST/PATCH/DELETE /api/finance` — Income, expense transactions, debts, repayments, and budget tracking.
- `GET/POST/PATCH/DELETE /api/growth` — Learning goals, weekly study hours, and job application pipeline.
- `GET/POST/PATCH/DELETE /api/habits` — Habit tracking, streaks, and daily completion logs.
- `GET/POST/PATCH/DELETE /api/notes` — Quick capture inbox, ideas, and pinned notes.
- `GET/PUT /api/settings` — User preferences, monthly budget commitments, and PostgreSQL connection status.
- `POST /api/seed` — Seed initial workspace demo data.
