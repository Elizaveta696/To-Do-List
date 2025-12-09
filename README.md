
# TeamBoard — Collaborative Task Management

TeamBoard is a concise full‑stack app for creating and collaborating on tasks within teams. It provides user authentication, team-based task boards, and basic task CRUD operations. The project is split into `backend/` (Express + Sequelize + PostgreSQL) and `frontend/` (React + Vite).

Quick links
- Backend: `./backend`
- Frontend: `./frontend`

Quick Start (development)

1. Install dependencies (use `pnpm` if available):

	npm install
	# or
	pnpm install

2. Run backend (from `./backend`):

	npm --prefix backend run dev
	# or
	pnpm --filter backend dev

	The backend dev script uses `.env.dev` (if present). Required environment variables include `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and optionally `POSTGRES_HOST`.

3. Run frontend (from `./frontend`):

	npm --prefix frontend run dev
	# or
	pnpm --filter frontend dev

Testing
- Backend tests: `npm --prefix backend test` (uses Vitest)
- Frontend tests: `npm --prefix frontend test`

Environment variables (backend)
- `POSTGRES_DB` — database name
- `POSTGRES_USER` — DB username
- `POSTGRES_PASSWORD` — DB password
- `POSTGRES_HOST` — DB host (defaults to `db`)
- `PORT` — server port (defaults to `3000`)

Repository layout

- `backend/` — Express API, Sequelize models, migrations and tests
- `frontend/` — React app using Vite
- `test/`, `backups/`, and `security/` — auxiliary files and reports

Contributing

Keep the README concise and up to date as features and scripts change. Open an issue or PR for larger changes.

License

See `backend/LICENSE` for license details.
