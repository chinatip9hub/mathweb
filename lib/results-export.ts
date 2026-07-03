import type { CalculatorScenario } from "@/components/CalculatorClient";
import { loanTypeLabel } from "@/lib/bankRates";
import { RESULT_LABELS } from "@/lib/results-labels";

export type ExportResultRow = {
  id: string;
  bankName: string;
  loanType: CalculatorScenario["loanType"];
  principal: number;
  monthlyPayment: number;
  remainingPrincipal: number;
  totalFees: number;
  totalInterest: number;
  finalResult: number;
};

function escapeCsvCell(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function scenarioMap(scenarios: CalculatorScenario[]) {
  return new Map(scenarios.map((scenario) => [scenario.id, scenario]));
}

export function buildResultsCsv(
  rows: ExportResultRow[],
  scenarios: CalculatorScenario[],
  options?: { filterLabel?: string },
) {
  const byId = scenarioMap(scenarios);
  const meta = [
    `RefiLab — ผลเปรียบเทียบธนาคาร`,
    `สร้างเมื่อ,${new Date().toLocaleString("th-TH")}`,
    options?.filterLabel ? `ตัวกรอง,${options.filterLabel}` : "",
    "",
  ].filter(Boolean);

  const header = [
    "อันดับ",
    "ธนาคาร",
    "ประเภท",
    "เงินต้น (บาท)",
    "ค่างวด/เดือน (บาท)",
    "อัตราปี 1 (%)",
    "อัตราปี 2 (%)",
    "อัตราปี 3 (%)",
    "A₃ คงเหลือ (บาท)",
    "ค่าใช้จ่าย (บาท)",
    `${RESULT_LABELS.totalInterest} (บาท)`,
    `${RESULT_LABELS.finalResult} (บาท)`,
  ].join(",");

  const lines = rows.map((row, index) => {
    const scenario = byId.get(row.id);

    return [
      index + 1,
      row.bankName,
      loanTypeLabel(row.loanType),
      row.principal,
      row.monthlyPayment,
      scenario?.rateYear1 ?? "",
      scenario?.rateYear2 ?? "",
      scenario?.rateYear3 ?? "",
      row.remainingPrincipal,
      row.totalFees,
      row.totalInterest,
      row.finalResult,
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  return `\uFEFF${meta.join("\n")}\n${header}\n${lines.join("\n")}`;
}

export function downloadCsvFile(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildShareUrl(shareToken: string) {
  if (typeof window === "undefined") {
    return `/calculator/results?run=${shareToken}`;
  }

  return `${window.location.origin}/calculator/results?run=${shareToken}`;
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export async function createComparisonRunShareToken(
  scenarios: CalculatorScenario[],
): Promise<{ shareToken: string; runId: string } | null> {
  const response = await fetch("/api/comparison-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarios }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    shareToken: string;
    runId: string;
  };

  return data;
}
