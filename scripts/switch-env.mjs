import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const prodPath = resolve(root, ".env.local.production-links");
const backupPath = resolve(root, ".env.local.dev-backup");

const PROD_URL = "https://mathweb-main.vercel.app";
const LOCAL_URL = "http://localhost:3000";

function readAppUrl(content) {
  const match = content.match(/^APP_URL=(.*)$/m);
  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^["']|["']$/g, "");
}

function setAppUrl(content, url) {
  const line = `APP_URL="${url}"`;

  if (/^APP_URL=.*$/m.test(content)) {
    return content.replace(/^APP_URL=.*$/m, line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

function ensureProdFile() {
  if (existsSync(prodPath)) {
    return;
  }

  if (!existsSync(envPath)) {
    console.error(".env.local not found — create it first.");
    process.exit(1);
  }

  const current = readFileSync(envPath, "utf8");
  writeFileSync(prodPath, setAppUrl(current, PROD_URL), "utf8");
  console.log("Created .env.local.production-links");
}

function switchToProd() {
  if (!existsSync(envPath)) {
    console.error(".env.local not found");
    process.exit(1);
  }

  ensureProdFile();

  const currentUrl = readAppUrl(readFileSync(envPath, "utf8"));
  if (currentUrl !== PROD_URL) {
    copyFileSync(envPath, backupPath);
  }

  copyFileSync(prodPath, envPath);
  console.log(`Switched to production links (${PROD_URL})`);
  console.log("Restart npm run dev if it is already running.");
}

function switchToLocal() {
  if (existsSync(backupPath)) {
    copyFileSync(backupPath, envPath);
    console.log(`Restored .env.local from backup (${LOCAL_URL})`);
  } else if (existsSync(envPath)) {
    const current = readFileSync(envPath, "utf8");
    writeFileSync(envPath, setAppUrl(current, LOCAL_URL), "utf8");
    console.log(`Set APP_URL to ${LOCAL_URL}`);
  } else {
    console.error("No .env.local or backup found");
    process.exit(1);
  }

  console.log("Restart npm run dev if it is already running.");
}

function showStatus() {
  if (!existsSync(envPath)) {
    console.log("No .env.local");
    return;
  }

  const url = readAppUrl(readFileSync(envPath, "utf8"));
  let mode = "custom";

  if (url === PROD_URL) {
    mode = "production links";
  } else if (url === LOCAL_URL) {
    mode = "local dev";
  }

  console.log(`APP_URL: ${url ?? "(not set)"} (${mode})`);
  console.log(`Backup exists: ${existsSync(backupPath)}`);
  console.log(`Production template exists: ${existsSync(prodPath)}`);
}

const command = process.argv[2];

if (command === "prod") {
  switchToProd();
} else if (command === "local") {
  switchToLocal();
} else if (command === "status") {
  showStatus();
} else {
  console.log(`Usage:
  npm run env:prod     # APP_URL -> production (for email/reset links)
  npm run env:local    # restore local APP_URL
  npm run env:status   # show current APP_URL`);
}
