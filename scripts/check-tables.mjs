import pg from "pg";
import { readFileSync } from "fs";

const connectionString = readFileSync(".env.local", "utf8").match(
  /^DATABASE_URL="([^"]+)"/m,
)?.[1];
const pool = new pg.Pool({ connectionString });

const tables = await pool.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('PasswordResetToken', 'VerificationToken', 'ComparisonRun', 'User')
  ORDER BY table_name
`);
console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

await pool.end();
