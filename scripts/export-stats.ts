import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { DEFAULT_BANKS, getBankAbbreviation } from "../lib/banks";
import {
  BANK_RATE_CONFIG,
  getRatesForBank,
  type LoanType,
  type RateValue,
} from "../lib/bankRates";
import { formatThaiDate } from "../lib/format-date";

config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../exports");

function escapeCsv(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers: string[], rows: Array<Array<string | number | null>>) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

function writeCsv(fileName: string, headers: string[], rows: Array<Array<string | number | null>>) {
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, toCsv(headers, rows), "utf8");
  console.log("wrote", fileName);
}

function formatRate(rate: RateValue) {
  if (rate.type === "fixed") {
    return String(rate.value);
  }
  const sign = rate.offset >= 0 ? "+" : "";
  return `${rate.base}${sign}${rate.offset}`;
}

function exportBankReference() {
  const headers = [
    "ธนาคาร",
    "MLR",
    "MRR",
    "รีไฟ ปี1",
    "รีไฟ ปี2",
    "รีไฟ ปี3",
    "รีไฟ ปี1 (%)",
    "รีไฟ ปี2 (%)",
    "รีไฟ ปี3 (%)",
    "รีเทนชั่น ปี1",
    "รีเทนชั่น ปี2",
    "รีเทนชั่น ปี3",
    "รีเทนชั่น ปี1 (%)",
    "รีเทนชั่น ปี2 (%)",
    "รีเทนชั่น ปี3 (%)",
    "ค่าธรรมเนียม Z (%)",
    "ค่าธรรมเนียม I (%)",
  ];

  const rows = DEFAULT_BANKS.map((bankName) => {
    const configEntry = BANK_RATE_CONFIG[bankName];
    const refinanceRates = getRatesForBank(bankName, "refinance");
    const retentionRates = getRatesForBank(bankName, "retention");

    return [
      bankName,
      configEntry.referenceRates.MLR,
      configEntry.referenceRates.MRR,
      formatRate(configEntry.refinance[0]),
      formatRate(configEntry.refinance[1]),
      formatRate(configEntry.refinance[2]),
      refinanceRates[0],
      refinanceRates[1],
      refinanceRates[2],
      formatRate(configEntry.retention[0]),
      formatRate(configEntry.retention[1]),
      formatRate(configEntry.retention[2]),
      retentionRates[0],
      retentionRates[1],
      retentionRates[2],
      configEntry.fees.Z,
      configEntry.fees.I,
    ];
  });

  writeCsv("bank-reference-rates.csv", headers, rows);
}

type ScenarioJson = {
  bankName?: string;
  loanType?: LoanType;
  principal?: number;
  monthlyPayment?: number;
  resultFinal?: number | null;
};

async function exportDatabaseStats(pool: pg.Pool) {
  const summary = await pool.query<{
    users: string;
    verified_users: string;
    saved_scenarios: string;
    comparison_runs: string;
    logged_in_runs: string;
    guest_runs: string;
  }>(`
    SELECT
      (SELECT COUNT(*)::text FROM "User") AS users,
      (SELECT COUNT(*)::text FROM "User" WHERE "emailVerifiedAt" IS NOT NULL) AS verified_users,
      (SELECT COUNT(*)::text FROM "CalculationScenario") AS saved_scenarios,
      (SELECT COUNT(*)::text FROM "ComparisonRun") AS comparison_runs,
      (SELECT COUNT(*)::text FROM "ComparisonRun" WHERE "userId" IS NOT NULL) AS logged_in_runs,
      (SELECT COUNT(*)::text FROM "ComparisonRun" WHERE "userId" IS NULL) AS guest_runs
  `);

  const row = summary.rows[0];
  writeCsv(
    "summary.csv",
    ["รายการ", "จำนวน"],
    [
      ["ผู้ใช้ทั้งหมด", row?.users ?? "0"],
      ["ผู้ใช้ที่ยืนยันอีเมลแล้ว", row?.verified_users ?? "0"],
      ["สถานการณ์ที่บันทึก (CalculationScenario)", row?.saved_scenarios ?? "0"],
      ["รอบการเปรียบเทียบทั้งหมด (ComparisonRun)", row?.comparison_runs ?? "0"],
      ["รอบที่ผูกบัญชี", row?.logged_in_runs ?? "0"],
      ["รอบที่ไม่ได้ล็อกอิน", row?.guest_runs ?? "0"],
    ],
  );

  const runsByDay = await pool.query<{ day: string; total: string }>(`
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
      COUNT(*)::text AS total
    FROM "ComparisonRun"
    GROUP BY 1
    ORDER BY 1
  `);

  writeCsv(
    "comparison-runs-by-day.csv",
    ["วันที่", "จำนวนรอบเปรียบเทียบ"],
    runsByDay.rows.map((entry) => [entry.day, entry.total]),
  );

  const savedScenarioStats = await pool.query<{
    bank_name: string;
    loan_type: string;
    count: string;
    avg_principal: string;
    avg_monthly_payment: string;
    avg_result_final: string;
  }>(`
    SELECT
      "bankName" AS bank_name,
      "loanType" AS loan_type,
      COUNT(*)::text AS count,
      ROUND(AVG("principal")::numeric, 2)::text AS avg_principal,
      ROUND(AVG("monthlyPayment")::numeric, 2)::text AS avg_monthly_payment,
      ROUND(AVG("resultFinal")::numeric, 2)::text AS avg_result_final
    FROM "CalculationScenario"
    GROUP BY 1, 2
    ORDER BY COUNT(*) DESC, "bankName"
  `);

  writeCsv(
    "saved-scenarios-by-bank.csv",
    [
      "ธนาคาร",
      "ประเภทสินเชื่อ",
      "จำนวนที่บันทึก",
      "เงินต้นเฉลี่ย",
      "ค่างวดเฉลี่ย",
      "ผลลัพธ์สุดท้ายเฉลี่ย",
    ],
    savedScenarioStats.rows.map((entry) => [
      entry.bank_name,
      entry.loan_type,
      entry.count,
      entry.avg_principal,
      entry.avg_monthly_payment,
      entry.avg_result_final,
    ]),
  );

  const savedScenarioRows = await pool.query<{
    id: string;
    bank_name: string;
    loan_type: string;
    principal: string;
    monthly_payment: string;
    result_final: string | null;
    created_at: Date;
    updated_at: Date;
  }>(`
    SELECT
      id,
      "bankName" AS bank_name,
      "loanType" AS loan_type,
      "principal"::text AS principal,
      "monthlyPayment"::text AS monthly_payment,
      "resultFinal"::text AS result_final,
      "createdAt" AS created_at,
      "updatedAt" AS updated_at
    FROM "CalculationScenario"
    ORDER BY "updatedAt" DESC
  `);

  writeCsv(
    "saved-scenarios-detail.csv",
    [
      "รหัสรายการ (ไม่ระบุตัวตน)",
      "ธนาคาร",
      "ชื่อย่อธนาคาร",
      "ประเภทสินเชื่อ",
      "เงินต้น (บาท)",
      "ค่างวด/เดือน (บาท)",
      "ผลลัพธ์สุดท้าย (บาท)",
      "บันทึกเมื่อ (วันที่)",
      "บันทึกเมื่อ (เวลา)",
      "แก้ไขล่าสุด (วันที่)",
      "แก้ไขล่าสุด (เวลา)",
    ],
    savedScenarioRows.rows.map((entry) => {
      const createdAt = new Date(entry.created_at);
      const updatedAt = new Date(entry.updated_at);

      return [
        entry.id,
        entry.bank_name,
        getBankAbbreviation(entry.bank_name),
        entry.loan_type === "retention" ? "รีเทนชั่น" : "รีไฟแนนซ์",
        entry.principal,
        entry.monthly_payment,
        entry.result_final ?? "",
        formatThaiDate(createdAt),
        createdAt.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
        formatThaiDate(updatedAt),
        updatedAt.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
      ];
    }),
  );

  const runs = await pool.query<{
    id: string;
    share_token: string;
    created_at: Date;
    user_id: string | null;
    scenarios_json: unknown;
  }>(`
    SELECT
      id,
      "shareToken" AS share_token,
      "createdAt" AS created_at,
      "userId" AS user_id,
      "scenariosJson" AS scenarios_json
    FROM "ComparisonRun"
    ORDER BY "createdAt" DESC
  `);

  writeCsv(
    "comparison-runs-detail.csv",
    [
      "รหัสรอบ (ไม่ระบุตัวตน)",
      "วันที่",
      "เวลา",
      "ประเภทบัญชี",
      "จำนวนธนาคาร",
      "รายชื่อธนาคาร",
      "ประเภทสินเชื่อ",
      "ธนาคารต้นทุนต่ำสุด",
      "ต้นทุนต่ำสุด (บาท)",
    ],
    runs.rows.map((run) => {
      const scenarios = Array.isArray(run.scenarios_json)
        ? (run.scenarios_json as ScenarioJson[])
        : [];
      const banks = scenarios
        .map((scenario) => scenario.bankName?.trim())
        .filter(Boolean);
      const loanTypes = new Set(
        scenarios
          .map((scenario) => scenario.loanType)
          .filter((loanType) => loanType === "refinance" || loanType === "retention"),
      );
      const loanTypeText =
        loanTypes.size === 0
          ? ""
          : loanTypes.size === 1
            ? [...loanTypes][0] === "retention"
              ? "รีเทนชั่น"
              : "รีไฟแนนซ์"
            : "รีไฟ + รีเทนชั่น";

      const ranked = scenarios
        .filter(
          (scenario) =>
            scenario.bankName &&
            scenario.resultFinal !== null &&
            scenario.resultFinal !== undefined &&
            Number.isFinite(Number(scenario.resultFinal)),
        )
        .map((scenario) => ({
          bankName: scenario.bankName as string,
          resultFinal: Number(scenario.resultFinal),
        }))
        .sort((left, right) => left.resultFinal - right.resultFinal);

      const createdAt = new Date(run.created_at);

      return [
        run.id,
        formatThaiDate(createdAt),
        createdAt.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
        run.user_id ? "ล็อกอิน" : "ไม่ล็อกอิน",
        banks.length,
        banks.join(" | "),
        loanTypeText,
        ranked[0]?.bankName ?? "",
        ranked[0]?.resultFinal ?? "",
      ];
    }),
  );

  const bankUsage = new Map<string, number>();
  const loanTypeUsage = new Map<string, number>();
  const principalBuckets = new Map<string, number>();
  let scenarioCount = 0;

  for (const run of runs.rows) {
    const scenarios = Array.isArray(run.scenarios_json)
      ? (run.scenarios_json as ScenarioJson[])
      : [];

    for (const scenario of scenarios) {
      scenarioCount += 1;
      const bankName = scenario.bankName?.trim() || "ไม่ระบุ";
      const loanType = scenario.loanType || "ไม่ระบุ";

      bankUsage.set(bankName, (bankUsage.get(bankName) ?? 0) + 1);
      loanTypeUsage.set(loanType, (loanTypeUsage.get(loanType) ?? 0) + 1);

      const principal = Number(scenario.principal ?? 0);
      let bucket = "0";
      if (principal > 0 && principal <= 1_000_000) bucket = "1-1,000,000";
      else if (principal <= 3_000_000) bucket = "1,000,001-3,000,000";
      else if (principal <= 5_000_000) bucket = "3,000,001-5,000,000";
      else if (principal > 5_000_000) bucket = "5,000,001+";

      principalBuckets.set(bucket, (principalBuckets.get(bucket) ?? 0) + 1);
    }
  }

  writeCsv(
    "comparison-bank-usage.csv",
    ["ธนาคาร", "จำนวนครั้งที่ปรากฏในรอบเปรียบเทียบ"],
    [...bankUsage.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "th"))
      .map(([bankName, count]) => [bankName, count]),
  );

  writeCsv(
    "comparison-loan-type-usage.csv",
    ["ประเภทสินเชื่อ", "จำนวนครั้ง"],
    [...loanTypeUsage.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([loanType, count]) => [loanType, count]),
  );

  writeCsv(
    "comparison-principal-buckets.csv",
    ["ช่วงเงินต้น (บาท)", "จำนวนครั้ง"],
    [...principalBuckets.entries()].map(([bucket, count]) => [bucket, count]),
  );

  writeCsv(
    "comparison-scenario-total.csv",
    ["รายการ", "จำนวน"],
    [["จำนวนสถานการณ์ธนาคารรวมใน ComparisonRun", scenarioCount]],
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not found in .env.local");
  }

  fs.mkdirSync(outDir, { recursive: true });

  exportBankReference();

  const pool = new pg.Pool({ connectionString });
  try {
    await exportDatabaseStats(pool);
  } finally {
    await pool.end();
  }

  console.log(`\nExport complete: ${outDir}`);
  console.log("หมายเหตุ: ไฟล์เหล่านี้เป็นสถิติแบบไม่ระบุตัวตน ไม่มีอีเมลหรือชื่อผู้ใช้");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
