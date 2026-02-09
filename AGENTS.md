# AGENTS

## Repo map
- `index.html`, `src/`: Vite + React SPA entry and UI.
- `netlify/functions/`: Netlify Functions API (serverless backend).
- `migrations/`, `knexfile.cjs`: Database schema migrations (Knex).
- `scripts/`: Local helper scripts (e.g., create users).
- `netlify.toml`: Netlify build/dev configuration and redirects.

## Local development
- Install deps: `npm install`
- Run full stack locally (SPA + Functions): `npm run dev`
- Run SPA only: `npm run dev:client`

## Database
- Run migrations: `npm run migrate`
- Create a user: `npm run create:user -- --email you@example.com --password StrongPass --roles Admin`

## Build
- Production build: `npm run build`
