# School Management

Comprehensive school management web application (Django backend + React/Vite frontend).

This repository contains a small-to-medium sized project used for managing students, classes, subjects, results and users. The backend is a Django REST API and the frontend is a TypeScript + React application built with Vite.

## Repository layout

- `backend/` — Django project and related scripts
	- `school_backend/` — Django project code (settings, urls, wsgi, asgi)
	- `school_backend/api/` — main app containing models, serializers, views, tests and management commands
	- `requirements.txt` — Python dependencies for the backend
	- `env_template.txt` — example environment variables used by the Django settings
- `frontend/` — React + TypeScript frontend (Vite)
	- `package.json`, `tsconfig.json`, `vite.config.ts` and source files
- Various docs at the repo root: `ARCHITECTURE.md`, `USER_GUIDE.md`, `QUICK_START.md`, etc.

## Quick overview

- Backend: Django REST framework providing endpoints for authentication, students, classes, subjects, results and statistics.
- Frontend: React + TypeScript app that consumes the REST API.
- Database: PostgreSQL (recommended) — an example Docker Compose file for Postgres only is provided as `docker-compose.postgres.yml`.

## Prerequisites

- Git
- Docker & Docker Compose (for running Postgres easily)
- Python 3.10+ (for backend development)
- Node.js 16+ and npm/yarn (for frontend development)

If you plan to run the backend locally without Docker for Postgres, make sure you have a running PostgreSQL instance and update the environment variables accordingly.

## Environment configuration

Copy the backend template and set your secrets:

```bash
# from project root
cp backend/env_template.txt backend/.env
# edit backend/.env and set SECRET_KEY and DB_PASSWORD at minimum
```

The important DB values in `backend/env_template.txt` are:

- `DB_NAME` (default: `school_db2`)
- `DB_USER` (default: `school_user`)
- `DB_PASSWORD` (change this)
- `DB_HOST` / `DB_PORT`

For local development we include a Postgres-only compose file `docker-compose.postgres.yml`. Using it is optional but convenient.

## Starting Postgres with Docker Compose

From the repository root you can start only the Postgres service provided with this project:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

The compose file exposes Postgres on the host port `5432`. The default credentials in the compose file are taken from `backend/env_template.txt` — change `POSTGRES_PASSWORD` before using in anything but a throwaway local setup.

To stop and remove the Postgres container and network:

```bash
docker compose -f docker-compose.postgres.yml down
```

### Using an env file with Docker Compose

If you prefer to keep secrets in a file, edit `backend/.env` and then update the compose file to include `env_file: backend/.env` under the `db` service (I can do that for you if you'd like).

## Backend - local development

1. Create and activate a Python virtual environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Ensure database is reachable (either the Docker Postgres above or a local Postgres instance) and your `backend/.env` is configured.

4. Run migrations and create a superuser:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

5. Run the development server:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/` by default.

## Frontend - local development

From the `frontend/` directory:

```bash
cd frontend
npm install    # or yarn
npm run dev    # starts Vite dev server, usually at http://localhost:5173
```

Open the app in your browser and log in using a backend user account.

## Useful management commands

- Reset DB or load test data: see `backend/school_backend/api/management/commands/` for helpful scripts like `create_test_students.py`, `create_test_users.py`, `load_official_subjects.py`, and `reset_db.py`.

Run any of these commands like:

```bash
cd backend
python manage.py <command_name>
```

## Security & production notes

- Do not use `DEBUG=True` or the sample `SECRET_KEY` from `env_template.txt` in production.
- Use environment variables or secrets management for DB credentials and JWT keys.
- Consider using Docker Compose stacks for full production deployments or a container orchestration system.

## Architecture & documentation

This repository contains design and documentation files at the root, such as:

- `ARCHITECTURE.md` — high-level architectural notes
- `UML_CLASS_DIAGRAM.md`, `UML_DATABASE_DIAGRAM.md` — diagrams and schemas
- `USER_GUIDE.md` — basic user-facing instructions

Refer to them when you need an in-depth understanding of the system.

## Troubleshooting

- Postgres connection refused: ensure the Postgres container is running and ports are not blocked. Check `docker compose -f docker-compose.postgres.yml logs -f db`.
- Migrations failing: ensure your DB credentials in `backend/.env` match the running Postgres instance.
- Frontend can't reach backend: confirm the frontend's API base URL is set to the backend host/port (CORS settings in `backend/env_template.txt` are set to allow `http://localhost:3000` by default).

