import pg from "pg";
import { readFileSync } from "fs";

const envLocal = readFileSync(".env.local", "utf8");
const connectionString = envLocal.match(/^DATABASE_URL="([^"]+)"/m)?.[1];
const pool = new pg.Pool({ connectionString });

const email = "kanittha011981@gmail.com";

const user = await pool.query(
  `SELECT id, email, name, "emailVerifiedAt", "createdAt"
   FROM "User" WHERE email = $1`,
  [email],
);

if (!user.rowCount) {
  console.log("User not found");
  process.exit(0);
}

const u = user.rows[0];
console.log("User:", u);

const sessions = await pool.query(
  `SELECT id, "expiresAt", "createdAt" FROM "Session" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5`,
  [u.id],
);
console.log("Recent sessions:", sessions.rowCount);
for (const s of sessions.rows) {
  console.log("-", s.id.slice(0, 12) + "...", "expires", s.expiresAt);
}

const scenarios = await pool.query(
  `SELECT COUNT(*)::int AS count FROM "CalculationScenario" WHERE "userId" = $1`,
  [u.id],
);
console.log("Saved scenarios:", scenarios.rows[0].count);

await pool.end();
