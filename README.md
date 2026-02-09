# Launch CRM foundation

Production-ready starter for a CRM-style web app on Netlify + Neon Postgres.

## Tech stack
- React + Vite (SPA)
- Netlify Functions (API)
- Neon Postgres (Knex migrations)
- JWT auth + role-based access control (RBAC)

## Environment variables
Create a `.env` file locally (do **not** commit secrets):

```
DATABASE_URL=postgres://...            # For migrations + scripts
DATABASE_URL_POOLED=postgres://...     # For Netlify Functions runtime
JWT_SECRET=your-long-random-secret
```

## Local development
```bash
npm install
npm run migrate
npm run create:user -- --email you@example.com --password StrongPass --roles Admin
npm run dev
```

- `npm run dev` runs Netlify Dev (SPA + Functions).
- `npm run dev:client` runs the Vite SPA only.

## Database migrations
```bash
npm run migrate
```

## API endpoints
All endpoints are served via Netlify Functions.

```
POST /api/auth/login
GET  /api/me
POST /api/leads
GET  /api/leads
PATCH /api/leads/:id
```

### RBAC rules
- `Admin`, `Sales`: access leads endpoints.
- Other roles: blocked with `403`.

Audit logs are written for login, create lead, and update lead.

## Netlify deploy notes
- Ensure `DATABASE_URL_POOLED` and `JWT_SECRET` are set in the Netlify UI.
- The build uses `npm run build` and publishes `dist`.
- Redirects are configured in `netlify.toml`.
