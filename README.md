# Cure-All API (development setup)

## Tech stack

- Node.js (CommonJS)
- Express 5 (REST API)
- Prisma ORM + Prisma Client
- PostgreSQL
- dotenv, cors
- nodemon (dev server)

## Project initialization (what is currently set up)

- Node.js project with `package.json` scripts for dev and start.
- Express app in `src/app.js` with basic health and root routes.
- Server entry in `src/server.js` using `app.listen`.
- Prisma config in `prisma.config.ts` and schema in `prisma/schema.prisma`.
- SQL bootstrap in `sql/create_db_user.sql` for creating a database and user.

## Development environment setup

1) Install dependencies:

```bash
npm install
```

2) Create the database/user in PostgreSQL:

```bash
psql -U postgres -f sql/create_db_user.sql
```

3) Create a `.env` file with your connection string:

```bash
DATABASE_URL="postgresql://cure_all_user:cure_all_db_pass@localhost:5432/cure_all_db"
```

4) Start the dev server:

```bash
npm run dev
```

## Notes

- The Prisma schema currently defines the datasource and client output only.
- No models or migrations are present yet.
