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
import { getBankAbbreviation } from "@/lib/banks";
import { getEffectiveFees, loanTypeLabel } from "@/lib/bankRates";
import {
  calculate3YearLoan,
  formatCurrency,
  type CalculationResult,
} from "@/lib/calculator";
import {
  getCalculatorResultsServerSnapshot,
  getCalculatorResultsSnapshot,
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

type ChartType = "final" | "stacked" | "remaining" | "interest";

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "final", label: "ผลสุดท้าย (finalResult)" },
  { value: "stacked", label: "A₃ vs ค่าใช้จ่าย" },
  { value: "remaining", label: "ยอดคงเหลือ 3 ปี (เส้น)" },
  { value: "interest", label: "ดอกเบี้ยรวม 3 ปี" },
];

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
    fees: getEffectiveFees(scenario.loanType, {
      Z: scenario.feeMortgage,
      I: scenario.feeStamp,
      P: scenario.feeAppraisal,
      G: scenario.feeInsurance,
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
          <Bar dataKey="value" name="ผลสุดท้าย" radius={[6, 6, 0, 0]}>
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
          <Bar dataKey="a3" name="A₃ (เงินต้นคงเหลือ)" stackId="total" fill="#0f3d6e" />
          <Bar
            dataKey="fees"
            name="ค่าใช้จ่าย (Z+I+P+G)"
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
        <Bar dataKey="interest" name="ดอกเบี้ยรวม 3 ปี" radius={[6, 6, 0, 0]}>
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

export default function ComparisonResultsClient() {
  const router = useRouter();
  const scenarios = useCalculatorResults();
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanTypeFilter>("all");
  const [chartType, setChartType] = useState<ChartType>("final");
  const [selectedRowId, setSelectedRowId] = useState<string>("");

  useEffect(() => {
    if (scenarios === null) {
      router.replace("/calculator");
    }
  }, [router, scenarios]);

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

  if (scenarios === null) {
    return (
      <div className="theme-card p-8 text-center theme-card-text">
        กำลังโหลดผลการคำนวณ...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="theme-kicker">ผลการคำนวณ</p>
            <h1 className="theme-card-title mt-2 text-3xl tracking-tight">
              ตารางเปรียบเทียบธนาคาร
            </h1>
            <p className="theme-card-text mt-3 text-sm leading-6">
              เรียงจากผลลัพธ์สุดท้ายต่ำสุด (ต้นทุนรวมน้อยที่สุด)
            </p>
          </div>
          <Link
            href="/calculator"
            className="theme-btn-outline inline-flex"
          >
            กลับไปแก้ไข
          </Link>
        </div>
      </div>

      <div className="theme-card p-5 sm:p-6">
        <p className="theme-label">ประเภทสินเชื่อ</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLoanTypeFilter(option.value)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                loanTypeFilter === option.value
                  ? "theme-pill-active"
                  : "theme-pill"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="theme-card-text text-sm font-semibold">กราฟเปรียบเทียบ</p>
            <h2 className="theme-card-title mt-1 text-xl">
              {CHART_OPTIONS.find((option) => option.value === chartType)?.label}
            </h2>
          </div>
          <label className="block w-full sm:w-auto">
            <span className="sr-only">เลือกประเภทกราฟ</span>
            <select
              value={chartType}
              onChange={(event) => setChartType(event.target.value as ChartType)}
              className="theme-input w-full text-sm font-semibold sm:min-w-72"
            >
              {CHART_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <ResultsChart chartType={chartType} rows={chartRows} />
        </div>
      </div>

      <div className="theme-card p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 theme-card-text">
                <th className="px-3 py-2 font-semibold">อันดับ</th>
                <th className="px-3 py-2 font-semibold">ธนาคาร</th>
                <th className="px-3 py-2 font-semibold">ประเภท</th>
                <th className="px-3 py-2 font-semibold">เงินต้น</th>
                <th className="px-3 py-2 font-semibold">A₃</th>
                <th className="px-3 py-2 font-semibold">ค่าใช้จ่าย</th>
                <th className="px-3 py-2 font-semibold">ผลสุดท้าย</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center theme-card-text"
                  >
                    ไม่มีข้อมูลสำหรับตัวกรองนี้
                  </td>
                </tr>
              ) : (
                sortedFilteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 ${
                      index === 0 ? "bg-orange-50" : ""
                    }`}
                  >
                    <td className="theme-card-title px-3 py-3 font-medium">
                      {index + 1}
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

      <section className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="theme-card-text text-sm font-semibold">รายละเอียด</p>
            <h2 className="theme-card-title mt-1 text-xl">
              รายละเอียดแต่ละธนาคาร
            </h2>
          </div>
          <label className="block w-full sm:w-auto">
            <span className="theme-label">
              เลือกธนาคาร
            </span>
            <select
              value={resolvedSelectedRowId}
              onChange={(event) => setSelectedRowId(event.target.value)}
              disabled={sortedFilteredRows.length === 0}
              className="theme-input mt-2 w-full text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500 sm:min-w-72"
            >
              {sortedFilteredRows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.bankShort} ({loanTypeLabel(row.loanType)})
                </option>
              ))}
            </select>
          </label>
        </div>

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
              ดอกเบี้ยรวม 3 ปี: {formatCurrency(selectedRow.totalInterest)}
            </p>
            <p className="theme-kicker font-semibold">
              ผลลัพธ์สุดท้าย: {formatCurrency(selectedRow.finalResult)}
            </p>
          </div>
        ) : (
          <p className="theme-card-text mt-4 text-sm">
            ไม่มีข้อมูลสำหรับตัวกรองนี้
          </p>
        )}
      </section>
    </div>
  );
}
