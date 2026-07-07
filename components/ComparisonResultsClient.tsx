"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CalculatorScenario } from "@/components/CalculatorClient";
import ResultsHeadToHead from "@/components/ResultsHeadToHead";
import ResultsActionBar from "@/components/ResultsActionBar";
import ResultsLoadingSkeleton from "@/components/ResultsLoadingSkeleton";
import ResultsSectionNav from "@/components/ResultsSectionNav";
import {
  buildResultsCsv,
  buildShareUrl,
  copyTextToClipboard,
  createComparisonRunShareToken,
  downloadCsvFile,
} from "@/lib/results-export";
import { getBankAbbreviation } from "@/lib/banks";
import { loanTypeLabel, resolveScenarioFees, RATES_DATA_NOTE_SHORT } from "@/lib/bankRates";
import {
  calculate3YearLoan,
  formatCurrency,
  type CalculationResult,
} from "@/lib/calculator";
import {
  getCalculatorResultsServerSnapshot,
  getCalculatorResultsSnapshot,
  getCalculatorShareTokenSnapshot,
  loadCalculatorResultsPayload,
  saveCalculatorResults,
  subscribeToCalculatorResults,
} from "@/lib/calculator-storage";

function useCalculatorResults() {
  return useSyncExternalStore(
    subscribeToCalculatorResults,
    getCalculatorResultsSnapshot,
    getCalculatorResultsServerSnapshot,
  );
}

type ResultRow = {
  id: string;
  bankName: string;
  bankShort: string;
  loanType: CalculatorScenario["loanType"];
  principal: number;
  monthlyPayment: number;
  remainingPrincipal: number;
  totalFees: number;
  totalInterest: number;
  finalResult: number;
  calculation: CalculationResult;
};

type LoanTypeFilter = "all" | CalculatorScenario["loanType"];

import {
  CHART_OPTIONS,
  RESULT_LABELS,
  type ChartType,
} from "@/lib/results-labels";

const LINE_COLORS = [
  "#f97316",
  "#fbbf24",
  "#34d399",
  "#38bdf8",
  "#a78bfa",
  "#fb7185",
  "#22d3ee",
  "#4ade80",
];

const FILTER_OPTIONS: { value: LoanTypeFilter; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "refinance", label: "รีไฟแนนซ์" },
  { value: "retention", label: "รีเทนชั่น" },
];

function buildResultRow(scenario: CalculatorScenario): ResultRow {
  const calculation = calculate3YearLoan({
    principal: scenario.principal,
    monthlyPayment: scenario.monthlyPayment,
    rates: [scenario.rateYear1, scenario.rateYear2, scenario.rateYear3],
    fees: resolveScenarioFees(scenario.loanType, scenario.principal, {
      feeMortgagePct: scenario.feeMortgage,
      feeStampPct: scenario.feeStamp,
      feeAppraisalBaht: scenario.feeAppraisal,
      feeInsuranceBaht: scenario.feeInsurance,
    }),
  });

  const totalInterest = calculation.yearly.reduce(
    (sum, year) => sum + year.interest,
    0,
  );

  return {
    id: scenario.id,
    bankName: scenario.bankName,
    bankShort: getBankAbbreviation(scenario.bankName),
    loanType: scenario.loanType,
    principal: scenario.principal,
    monthlyPayment: scenario.monthlyPayment,
    remainingPrincipal: calculation.remainingPrincipal,
    totalFees: calculation.totalFees,
    totalInterest,
    finalResult: calculation.finalResult,
    calculation,
  };
}

function currencyTooltip(value: unknown) {
  if (typeof value === "number") {
    return formatCurrency(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function ResultsChart({
  chartType,
  rows,
}: {
  chartType: ChartType;
  rows: ResultRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="theme-card flex h-80 items-center justify-center text-sm theme-card-text">
        ไม่มีข้อมูลสำหรับตัวกรองนี้
      </div>
    );
  }

  if (chartType === "final") {
    const data = rows.map((row) => ({
      name: row.bankShort,
      value: row.finalResult,
    }));

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("th-TH", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip formatter={currencyTooltip} />
          <Bar dataKey="value" name={RESULT_LABELS.finalResult} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={index === 0 ? "#f97316" : "#64748b"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "stacked") {
    const data = rows.map((row) => ({
      name: row.bankShort,
      a3: row.remainingPrincipal,
      fees: row.totalFees,
    }));

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("th-TH", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip formatter={currencyTooltip} />
          <Legend />
          <Bar
            dataKey="a3"
            name={RESULT_LABELS.remainingPrincipal}
            stackId="total"
            fill="#0f3d6e"
          />
          <Bar
            dataKey="fees"
            name={RESULT_LABELS.totalFees}
            stackId="total"
            fill="#fbbf24"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "remaining") {
    const data = [1, 2, 3].map((year) => {
      const point: Record<string, string | number> = {
        year: `ปี ${year}`,
      };

      for (const row of rows) {
        const yearly = row.calculation.yearly.find((item) => item.year === year);
        point[row.bankShort] = yearly?.remaining ?? 0;
      }

      return point;
    });

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("th-TH", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip formatter={currencyTooltip} />
          <Legend />
          {rows.map((row, index) => (
            <Line
              key={row.id}
              type="monotone"
              dataKey={row.bankShort}
              name={row.bankShort}
              stroke={LINE_COLORS[index % LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const data = rows.map((row) => ({
    name: row.bankShort,
    interest: row.totalInterest,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value: number) =>
            new Intl.NumberFormat("th-TH", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value)
          }
        />
        <Tooltip formatter={currencyTooltip} />
        <Bar dataKey="interest" name={RESULT_LABELS.totalInterest} radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={index === 0 ? "#f97316" : "#64748b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function subscribeNoop() {
  return () => {};
}

function getPrintedAtSnapshot() {
  return new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
}

function getCanNativeShareSnapshot() {
  return typeof navigator !== "undefined" && Boolean(navigator.share);
}

type ComparisonResultsClientProps = {
  initialShareToken?: string | null;
};

export default function ComparisonResultsClient({
  initialShareToken = null,
}: ComparisonResultsClientProps) {
  const router = useRouter();
  const scenarios = useCalculatorResults();
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanTypeFilter>("all");
  const [chartType, setChartType] = useState<ChartType>("final");
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [remoteLoading, setRemoteLoading] = useState(Boolean(initialShareToken));
  const [shareToken, setShareToken] = useState<string | null>(
    initialShareToken,
  );
  const [scenarioTokenKey, setScenarioTokenKey] = useState(scenarios);

  if (scenarios !== scenarioTokenKey) {
    setScenarioTokenKey(scenarios);
    const storedToken = getCalculatorShareTokenSnapshot();
    if (storedToken) {
      setShareToken(storedToken);
    }
  }

  const [actionMessage, setActionMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"share" | "csv" | null>(null);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    getCanNativeShareSnapshot,
    () => false,
  );
  const [baselineOverride, setBaselineOverride] = useState<string | null>(null);
  const [baselineFilter, setBaselineFilter] = useState(loanTypeFilter);
  const printedAt = useSyncExternalStore(
    subscribeNoop,
    getPrintedAtSnapshot,
    () => "",
  );

  if (loanTypeFilter !== baselineFilter) {
    setBaselineFilter(loanTypeFilter);
    setBaselineOverride(null);
  }

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timer = setTimeout(() => setActionMessage(""), 3200);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  useEffect(() => {
    if (!initialShareToken) {
      return;
    }

    let cancelled = false;

    async function loadRemote() {
      setRemoteLoading(true);

      try {
        const response = await fetch(`/api/comparison-runs/${initialShareToken}`);
        if (!response.ok) {
          throw new Error("load failed");
        }

        const data = await response.json();
        if (cancelled) {
          return;
        }

        saveCalculatorResults(data.scenarios, {
          shareToken: data.shareToken,
          runId: data.runId,
        });
        setShareToken(data.shareToken);
      } catch {
        if (!cancelled) {
          setActionMessage("โหลดผลจากลิงก์ไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) {
          setRemoteLoading(false);
        }
      }
    }

    void loadRemote();

    return () => {
      cancelled = true;
    };
  }, [initialShareToken]);

  useEffect(() => {
    if (remoteLoading) {
      return;
    }

    if (scenarios === null) {
      router.replace("/calculator");
    }
  }, [router, scenarios, remoteLoading]);

  const resultRows = useMemo(() => {
    if (!scenarios || scenarios.length === 0) {
      return [];
    }

    return scenarios
      .map(buildResultRow)
      .sort((a, b) => a.finalResult - b.finalResult);
  }, [scenarios]);

  const filteredRows = useMemo(() => {
    if (loanTypeFilter === "all") {
      return resultRows;
    }

    return resultRows.filter((row) => row.loanType === loanTypeFilter);
  }, [loanTypeFilter, resultRows]);

  const sortedFilteredRows = useMemo(
    () => [...filteredRows].sort((a, b) => a.finalResult - b.finalResult),
    [filteredRows],
  );

  const interestSortedRows = useMemo(
    () => [...filteredRows].sort((a, b) => a.totalInterest - b.totalInterest),
    [filteredRows],
  );

  const chartRows = useMemo(() => {
    if (chartType === "interest") {
      return interestSortedRows;
    }

    return sortedFilteredRows;
  }, [chartType, interestSortedRows, sortedFilteredRows]);

  const resolvedSelectedRowId = useMemo(() => {
    if (sortedFilteredRows.length === 0) {
      return "";
    }

    if (sortedFilteredRows.some((row) => row.id === selectedRowId)) {
      return selectedRowId;
    }

    return sortedFilteredRows[0].id;
  }, [selectedRowId, sortedFilteredRows]);

  const selectedRow = sortedFilteredRows.find(
    (row) => row.id === resolvedSelectedRowId,
  );
  const selectedRank =
    selectedRow === undefined
      ? -1
      : sortedFilteredRows.findIndex((row) => row.id === selectedRow.id);

  const bestRow = sortedFilteredRows[0];
  const secondRow = sortedFilteredRows[1];
  const worstRow = sortedFilteredRows[sortedFilteredRows.length - 1];

  const defaultBaselineId = useMemo(() => {
    if (!worstRow || !bestRow) {
      return "";
    }

    if (worstRow.id !== bestRow.id) {
      return worstRow.id;
    }

    return secondRow?.id ?? "";
  }, [bestRow, secondRow, worstRow]);

  const baselineCompareId = baselineOverride ?? defaultBaselineId;

  const baselineRow = useMemo(() => {
    if (sortedFilteredRows.length === 0) {
      return undefined;
    }

    const preferred = sortedFilteredRows.find(
      (row) => row.id === baselineCompareId,
    );

    if (preferred && preferred.id !== bestRow?.id) {
      return preferred;
    }

    return worstRow && worstRow.id !== bestRow?.id
      ? worstRow
      : secondRow ?? sortedFilteredRows[sortedFilteredRows.length - 1];
  }, [baselineCompareId, bestRow, secondRow, sortedFilteredRows, worstRow]);

  const filterLabel =
    FILTER_OPTIONS.find((option) => option.value === loanTypeFilter)?.label ??
    "ทั้งหมด";

  async function ensureShareToken() {
    const existing =
      shareToken ??
      loadCalculatorResultsPayload()?.shareToken ??
      initialShareToken;

    if (existing) {
      return existing;
    }

    if (!scenarios || scenarios.length === 0) {
      return null;
    }

    const created = await createComparisonRunShareToken(scenarios);
    if (!created) {
      return null;
    }

    saveCalculatorResults(scenarios, {
      shareToken: created.shareToken,
      runId: created.runId,
    });
    setShareToken(created.shareToken);
    return created.shareToken;
  }

  function handleExportCsv() {
    if (sortedFilteredRows.length === 0) {
      setActionMessage("ไม่มีข้อมูลให้ดาวน์โหลด");
      return;
    }

    setBusyAction("csv");

    try {
      const csv = buildResultsCsv(sortedFilteredRows, scenarios ?? [], {
        filterLabel,
      });
      const date = new Date().toISOString().slice(0, 10);
      downloadCsvFile(`refilab-${filterLabel}-${date}.csv`, csv);
      setActionMessage("ดาวน์โหลด CSV แล้ว");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleShareLink() {
    setBusyAction("share");
    setActionMessage("");

    try {
      const token = await ensureShareToken();
      if (!token) {
        setActionMessage("สร้างลิงก์แชร์ไม่สำเร็จ — ลองคำนวณใหม่อีกครั้ง");
        return;
      }

      const url = buildShareUrl(token);
      setShareUrl(url);
      setSharePanelOpen(true);

      if (canNativeShare) {
        setActionMessage("ลิงก์พร้อมแชร์แล้ว");
        return;
      }

      const copied = await copyTextToClipboard(url);
      setActionMessage(copied ? "คัดลอกลิงก์แชร์แล้ว" : "ลิงก์พร้อมแชร์แล้ว — กดคัดลอกด้านล่าง");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleCopyShareLink() {
    if (!shareUrl) {
      return;
    }

    const copied = await copyTextToClipboard(shareUrl);
    setActionMessage(copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกไม่สำเร็จ — ลองเลือกลิงก์แล้วคัดลอกเอง");
  }

  async function handleNativeShare() {
    if (!shareUrl || !navigator.share) {
      return;
    }

    try {
      await navigator.share({
        title: "RefiLab — ผลเปรียบเทียบธนาคาร",
        text: "ดูผลเปรียบเทียบสินเชื่อบ้านจาก RefiLab",
        url: shareUrl,
      });
      setActionMessage("แชร์แล้ว");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setActionMessage("แชร์ไม่สำเร็จ — ลองคัดลอกลิงก์แทน");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (remoteLoading || scenarios === null) {
    return <ResultsLoadingSkeleton />;
  }

  return (
    <div className="results-print-root results-page space-y-5 pb-20 sm:space-y-6 sm:pb-24">
      <div className="hidden print:block results-print-banner">
        <p className="results-print-banner__brand">RefiLab</p>
        <h1 className="results-print-banner__title">ผลเปรียบเทียบธนาคาร</h1>
        <p className="results-print-banner__meta">
          พิมพ์เมื่อ {printedAt || "—"} · ตัวกรอง: {filterLabel}
        </p>
        <p className="results-print-banner__note">
          {RATES_DATA_NOTE_SHORT} — โปรดตรวจสอบกับธนาคารอีกครั้งก่อนตัดสินใจ
        </p>
      </div>

      <header className="theme-card results-page__header theme-animate-in p-5 sm:p-6 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="theme-kicker">ผลการคำนวณ</p>
            <h1 className="theme-card-title mt-2 text-2xl tracking-tight sm:text-3xl">
              เปรียบเทียบธนาคาร
            </h1>
            <p className="theme-card-text mt-2 max-w-2xl text-sm leading-6">
              {bestRow
                ? `แนะนำ ${bestRow.bankName} · เรียงจากต้นทุนรวมต่ำสุด`
                : "เรียงจากผลลัพธ์สุดท้ายต่ำสุด — ต้นทุนรวมน้อยที่สุดอยู่ด้านบน"}
            </p>
            <p className="theme-card-text mt-2 max-w-2xl text-xs leading-5 text-slate-500">
              {RATES_DATA_NOTE_SHORT}
            </p>
          </div>

          <div className="results-page__filters">
            <p className="results-page__filters-label">ประเภทสินเชื่อ</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLoanTypeFilter(option.value)}
                  className={`results-filter-pill${
                    loanTypeFilter === option.value
                      ? " results-filter-pill--active"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {bestRow && baselineRow && sortedFilteredRows.length >= 2 && scenarios && (
        <ResultsHeadToHead
          bestRow={bestRow}
          baselineRow={baselineRow}
          baselineOptions={sortedFilteredRows.filter((row) => row.id !== bestRow.id)}
          scenarios={scenarios}
          onBaselineChange={setBaselineOverride}
        />
      )}

      {sortedFilteredRows.length >= 2 && <ResultsSectionNav />}

      {actionMessage && (
        <p
          className="results-toast theme-animate-in print:hidden"
          role="status"
          aria-live="polite"
        >
          {actionMessage}
        </p>
      )}

      {bestRow && sortedFilteredRows.length === 1 && (
        <div
          id="results-summary"
          className="theme-card theme-best-card theme-animate-in-slow theme-animate-delay-1 scroll-mt-24 p-5 sm:p-6 print:hidden"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900 bg-orange-100 text-2xl">
              🏆
            </span>
            <div className="min-w-0 flex-1">
              <p className="theme-kicker">ธนาคารที่คุ้มที่สุด</p>
              <p className="theme-card-title mt-1 text-2xl font-bold sm:text-3xl">
                {bestRow.bankName}
              </p>
              <p className="theme-card-text mt-1 text-sm">
                {loanTypeLabel(bestRow.loanType)} · อันดับ 1 จาก{" "}
                {sortedFilteredRows.length} ธนาคาร
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="theme-stat-pill">
              <p className="theme-stat-pill__label">{RESULT_LABELS.finalResult}</p>
              <p className="theme-stat-pill__value text-orange-700">
                {formatCurrency(bestRow.finalResult)}
              </p>
            </div>
            <div className="theme-stat-pill">
              <p className="theme-stat-pill__label">{RESULT_LABELS.totalInterest}</p>
              <p className="theme-stat-pill__value">
                {formatCurrency(bestRow.totalInterest)}
              </p>
            </div>
            <div className="theme-stat-pill">
              <p className="theme-stat-pill__label">{RESULT_LABELS.remainingPrincipal}</p>
              <p className="theme-stat-pill__value">
                {formatCurrency(bestRow.remainingPrincipal)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        id="results-chart"
        className="theme-card theme-animate-in theme-animate-delay-3 scroll-mt-24 p-5 sm:p-6 print:hidden"
      >
        <div>
          <p className="theme-kicker">กราฟเปรียบเทียบ</p>
          <h2 className="theme-card-title mt-1 text-xl font-bold">
            {CHART_OPTIONS.find((option) => option.value === chartType)?.description}
          </h2>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="เลือกประเภทกราฟ"
        >
          {CHART_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={chartType === option.value}
              onClick={() => setChartType(option.value)}
              className={`results-filter-pill${
                chartType === option.value ? " results-filter-pill--active" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div key={chartType} className="results-chart-enter mt-6">
          <ResultsChart chartType={chartType} rows={chartRows} />
        </div>
      </div>

      <div
        id="results-table"
        className="theme-card theme-animate-in theme-animate-delay-4 scroll-mt-24 p-5 sm:p-6 results-print-table-card"
      >
        <p className="theme-card-title mb-1 text-lg font-bold">
          ตารางอันดับธนาคาร
        </p>
        <p className="theme-card-text mb-3 text-sm print:hidden sm:mb-4">
          เรียงจากผลลัพธ์สุดท้ายต่ำสุด
          <span className="results-table-scroll-hint"> · เลื่อนซ้าย-ขวาเพื่อดูทั้งตาราง</span>
        </p>
        <p className="theme-card-title mb-4 hidden text-lg font-bold print:block">
          ตารางเปรียบเทียบ
        </p>
        <div className="results-table-scroll overflow-x-auto">
          <table className="min-w-[42rem] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 theme-card-text">
                <th className="px-3 py-2 font-semibold">อันดับ</th>
                <th className="px-3 py-2 font-semibold">ธนาคาร</th>
                <th className="px-3 py-2 font-semibold">ประเภท</th>
                <th className="px-3 py-2 font-semibold">เงินต้น</th>
                <th className="px-3 py-2 font-semibold">{RESULT_LABELS.remainingPrincipal}</th>
                <th className="px-3 py-2 font-semibold">{RESULT_LABELS.totalFees}</th>
                <th className="px-3 py-2 font-semibold">{RESULT_LABELS.totalInterest}</th>
                <th className="px-3 py-2 font-semibold">{RESULT_LABELS.finalResult}</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center theme-card-text"
                  >
                    ไม่มีข้อมูลสำหรับตัวกรองนี้
                  </td>
                </tr>
              ) : (
                sortedFilteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`results-table-row border-b border-slate-100 transition hover:bg-orange-50/60 ${
                      index === 0 ? "bg-orange-50/80" : ""
                    }`}
                    style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
                  >
                    <td className="theme-card-title px-3 py-3 font-medium">
                      <span
                        className={`results-rank-badge${
                          index === 0 ? " results-rank-badge--best" : ""
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="theme-card-title px-3 py-3 font-medium">
                      {row.bankName}
                      {index === 0 && (
                        <span className="theme-kicker ml-2 text-xs">
                          แนะนำ
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">{loanTypeLabel(row.loanType)}</td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.remainingPrincipal)}
                    </td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.totalFees)}
                    </td>
                    <td className="px-3 py-3">
                      {formatCurrency(row.totalInterest)}
                    </td>
                    <td className="theme-card-title px-3 py-3 font-semibold">
                      {formatCurrency(row.finalResult)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section
        id="results-details"
        className="theme-card theme-animate-in theme-animate-delay-5 scroll-mt-24 p-5 sm:p-6 print:hidden"
      >
        <details className="theme-accordion border-0 bg-transparent">
          <summary className="theme-accordion__summary rounded-[inherit] border-2 border-slate-900/15 bg-white/55 px-4">
            <span>รายละเอียดแต่ละธนาคาร</span>
            <span className="theme-card-text text-xs font-medium">
              {selectedRow ? selectedRow.bankName : "เลือกธนาคาร"}
            </span>
          </summary>
          <div className="theme-accordion__body mt-3 rounded-[inherit] border border-slate-200 bg-white/70">
            <label className="block">
              <span className="theme-label">เลือกธนาคาร</span>
              <select
                value={resolvedSelectedRowId}
                onChange={(event) => setSelectedRowId(event.target.value)}
                disabled={sortedFilteredRows.length === 0}
                className="theme-input mt-2 w-full text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500 sm:max-w-md"
              >
                {sortedFilteredRows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.bankShort} ({loanTypeLabel(row.loanType)})
                  </option>
                ))}
              </select>
            </label>

            {selectedRow ? (
              <div className="theme-card-text mt-4 space-y-2 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="theme-card-title text-lg font-bold">
                    {selectedRow.bankName}
                  </p>
                  <p className="theme-card-text text-sm font-medium">
                    อันดับ {selectedRank + 1} · {loanTypeLabel(selectedRow.loanType)}
                  </p>
                </div>

                {selectedRow.calculation.yearly.map((year) => (
                  <p key={year.year}>
                    ปีที่ {year.year} (อัตรา {year.rate.toFixed(3)}%): ดอกเบี้ย{" "}
                    {formatCurrency(year.interest)} | หักเงินต้น{" "}
                    {formatCurrency(year.principalPaid)} | คงเหลือ{" "}
                    <span className="theme-card-title font-semibold">
                      {formatCurrency(year.remaining)}
                    </span>
                  </p>
                ))}
                <p className="theme-kicker pt-2 font-semibold">
                  {RESULT_LABELS.totalInterest}: {formatCurrency(selectedRow.totalInterest)}
                </p>
                <p className="theme-kicker font-semibold">
                  {RESULT_LABELS.finalResult}: {formatCurrency(selectedRow.finalResult)}
                </p>
              </div>
            ) : (
              <p className="theme-card-text mt-4 text-sm">
                ไม่มีข้อมูลสำหรับตัวกรองนี้
              </p>
            )}
          </div>
        </details>
      </section>

      <section className="theme-card results-tools theme-animate-in theme-animate-delay-6 p-5 pb-6 sm:p-6 print:hidden">
        <div className="mb-4">
          <p className="theme-card-title text-base font-bold">เครื่องมือ</p>
          <p className="theme-card-text mt-1 text-sm">
            ดาวน์โหลด แชร์ หรือพิมพ์ผลการเปรียบเทียบ
          </p>
        </div>
        <ResultsActionBar
          onExportCsv={handleExportCsv}
          onShare={handleShareLink}
          onPrint={handlePrint}
          shareUrl={shareUrl}
          sharePanelOpen={sharePanelOpen}
          onCloseSharePanel={() => setSharePanelOpen(false)}
          onCopyShareLink={handleCopyShareLink}
          onNativeShare={handleNativeShare}
          busyAction={busyAction}
          disabled={sortedFilteredRows.length === 0}
          canNativeShare={canNativeShare}
        />
      </section>

      <div className="theme-card theme-animate-in hidden p-5 sm:block sm:p-6 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="theme-card-title text-base font-semibold">
              อยากปรับตัวเลขใหม่?
            </p>
            <p className="theme-card-text mt-1 text-sm">
              กลับไปแก้ไขเงินต้น ค่างวด หรืออัตราดอกเบี้ย แล้วคำนวณใหม่ได้
            </p>
          </div>
          <Link
            href="/calculator"
            className="theme-btn-primary inline-flex shrink-0"
          >
            ‹ กลับไปแก้ไข
          </Link>
        </div>
      </div>
    </div>
  );
}
