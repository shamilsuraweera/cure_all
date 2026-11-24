/**
 * Prisma's CLI understands a `?schema=name` query parameter on the database
 * URL, but the `pg` driver does not. Split it out so the app can pass the
 * schema to the Prisma adapter and give `pg` a clean connection string.
 */
export const parseDatabaseUrl = (raw: string) => {
  const url = new URL(raw);
  const schema = url.searchParams.get("schema") ?? undefined;
  url.searchParams.delete("schema");
  return { connectionString: url.toString(), schema };
};

/** Same database, different schema (used so tests never touch dev data). */
export const withSchema = (raw: string, schema: string) => {
  const url = new URL(raw);
  url.searchParams.set("schema", schema);
  return url.toString();
};
