export function getDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing database connection string. Add DATABASE_URL to .env.local.",
    );
  }

  return databaseUrl;
}
