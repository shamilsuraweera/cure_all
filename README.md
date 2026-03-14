# Cure-All — Clinical Operations Platform

## Project overview

Cure-All is a clinical operations platform that coordinates patient care across
providers, pharmacies, and labs. It includes:

- **Backend API** (Express + Prisma + Postgres) for auth, org management, patient care,
  prescriptions, dispensing, and lab results.
- **Admin Web App** (Vite + React) for root admin, doctor, pharmacy, and lab workflows.
- **Mobile App** (Expo Router) for patient/guardian access to prescriptions and lab results.

This README is an **instruction manual** for running the system locally or in a demo
deployment, creating test accounts, and validating end‑to‑end flows.

## Tech stack

- Node.js (ESM)
- Express 5 (REST API)
- Prisma ORM + Prisma Client
- PostgreSQL
- Vite + React (web)
- Expo Router + React Native (mobile)

## Repo layout

- `src/` backend API
- `apps/web` admin web app
- `apps/mobile` Expo mobile app
- `packages/api-client` shared API client
- `sql/` database create/reset scripts

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Android Studio / emulator (for mobile)

## Environment files

- Backend: `.env` (see `.env.example`)
- Web: `apps/web/.env` (see `apps/web/.env.example`)
- Mobile: `apps/mobile/.env` (see `apps/mobile/.env.example`)

**Important:** do not commit real passwords or secrets. Keep them in `.env`.

## Database setup (dev/test/shadow)

Use the SQL scripts in `sql/` (run as postgres superuser):

```bash
psql -U postgres -f sql/dev_create.sql
psql -U postgres -f sql/test_create.sql
psql -U postgres -f sql/shadow_create.sql
```

To reset any database (destructive):

```bash
psql -U postgres -f sql/dev_reset.sql
psql -U postgres -f sql/test_reset.sql
psql -U postgres -f sql/shadow_reset.sql
```

## Backend (API)

1) Install dependencies (repo root):

```bash
npm install
```

2) Create `.env` from example and fill secrets:

```bash
cp .env.example .env
```

3) Run migrations + seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

4) Start API server:

```bash
npm run dev
```

API runs at `http://localhost:3000`.

## Demo / test accounts (create locally or in Supabase)

Create a ROOT_ADMIN user (and optional doctor/pharmacy/lab) via **seed** or **manual SQL**.

**Recommended local/dev setup:**
- ROOT_ADMIN: `root_admin@example.com`
- Password: `ChangeMe@123`

**Manual SQL (Supabase SQL editor):**
1) Generate an argon2 hash locally:
```bash
node -e "const argon2 = require('argon2'); argon2.hash('ChangeMe@123').then(console.log)"
```
2) Insert into `User`:
```sql
INSERT INTO "User" (
  id,
  email,
  "passwordHash",
  "globalRole",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'root_admin@example.com',
  '<ARGON2_HASH_HERE>',
  'ROOT_ADMIN',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
  SET "passwordHash" = EXCLUDED."passwordHash",
      "updatedAt" = now();
```

Optional org role users (doctor/pharmacy/lab) are created by **inviting members**
from the root admin dashboard.

## Dev vs Prod behavior

- `NODE_ENV=development` (local): no proxy trust; rate limits disabled.
- `NODE_ENV=production` (deploy): trust proxy enabled; auth/invite rate limits enabled.
- Local URLs live in `.env`; production URLs live in Render/Supabase env settings.

### Cookies & auth

- Local dev serves from the same host, so cookies use `SameSite=Strict`.
- Production deploy must send cookies with `SameSite=None; Secure` so the web app (separate origin) can receive them.
- The shared API client already sets `credentials: "include"` so the tokens round-trip with those cookies.

Quick health checks:
```bash
curl http://localhost:3000/health
curl https://<your-render-api>/health
```

## Web app (admin)

1) Install dependencies:

```bash
cd apps/web
npm install
```

2) Create env file:

```bash
cp .env.example .env
```

3) Start dev server:

```bash
npm run dev
```

Web app runs at `http://localhost:5173`.

## Mobile app (Expo)

## Mobile app (Expo)

1) Install dependencies:

```bash
cd apps/mobile
npm install
```

2) Create env file:

```bash
cp .env.example .env
```

3) Start Metro:

```bash
npm start
```

4) Run on emulator:

```bash
npm run android
```

## Feature test runbook (happy path)

### Root Admin (web)
1) Login as ROOT_ADMIN.
2) Create **organizations** for doctor/pharmacy/lab.
3) Invite members and accept invites.
4) Create a **patient**.
5) Create a **medicine**.
6) Create a **prescription** for that patient.

### Pharmacy (web)
1) Login with PHARMACY org member.
2) Open prescription → verify.
3) Dispense (partial/full) and confirm history.

### Lab (web)
1) Login with LAB org member.
2) Create lab result + measures.
3) Upload attachment.

### Doctor (web)
1) Login with DOCTOR org member.
2) Patient lookup → detail.
3) Create prescription and confirm it appears in history.

### Patient/Guardian (mobile)
1) Login on mobile.
2) View prescriptions and lab results.
3) Open attachment.
4) (If applicable) Accept guardian invite token.

## Tests

Backend:
```bash
npm test
```

Web:
```bash
cd apps/web
npm test
```

API client:
```bash
cd packages/api-client
npm test
```

## Deployment (Render + Supabase quick notes)

- **API (Render Web Service):** build with `npm install && npx prisma generate`
- **DB (Supabase):** run `npx prisma migrate deploy` locally against Supabase
- **Web (Render Static Site):** root dir `apps/web`, build `npm install && npm run build`, publish `dist`
- **Mobile:** use Expo Go or EAS Update; set `EXPO_PUBLIC_API_BASE_URL` to the deployed API URL
