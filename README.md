# Cure-All (development setup)

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
