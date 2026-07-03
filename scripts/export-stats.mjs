import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  "npx",
  ["tsx", "--env-file=.env.local", "scripts/export-stats.ts"],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
  },
);

process.exit(result.status ?? 1);
