"use client";

import type { CalculatorScenario } from "@/components/CalculatorClient";
import { formatCurrency } from "@/lib/calculator";
import { RESULT_LABELS } from "@/lib/results-labels";

export type HeadToHeadRow = {
  id: string;
  bankName: string;
  bankShort: string;
  remainingPrincipal: number;
  totalInterest: number;
  finalResult: number;
};

type ResultsHeadToHeadProps = {
  bestRow: HeadToHeadRow;
  baselineRow: HeadToHeadRow;
  baselineOptions: HeadToHeadRow[];
  scenarios: CalculatorScenario[];
  onBaselineChange: (id: string) => void;
};

type MetricRow = {
  id: string;
  label: string;
  sublabel?: string;
  format: "percent" | "currency";
  getValue: (row: HeadToHeadRow, avgRate: number) => number;
  lowerIsBetter: boolean;
  emphasize?: boolean;
};

function averageRate(row: HeadToHeadRow, scenarios: CalculatorScenario[]) {
  const scenario = scenarios.find((item) => item.id === row.id);
  if (!scenario) {
    return 0;
  }

  return (scenario.rateYear1 + scenario.rateYear2 + scenario.rateYear3) / 3;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatMetricValue(value: number, format: "percent" | "currency") {
  if (format === "percent") {
    return formatPercent(value);
  }

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const METRIC_ROWS: MetricRow[] = [
  {
    id: "avg-rate",
    label: RESULT_LABELS.avgRate,
    format: "percent",
    getValue: (_row, avgRate) => avgRate,
    lowerIsBetter: true,
  },
  {
    id: "remaining",
    label: RESULT_LABELS.remainingPrincipal,
    sublabel: RESULT_LABELS.remainingPrincipalHint,
    format: "currency",
    getValue: (row) => row.remainingPrincipal,
    lowerIsBetter: true,
  },
  {
    id: "interest",
    label: RESULT_LABELS.totalInterest,
    format: "currency",
    getValue: (row) => row.totalInterest,
    lowerIsBetter: true,
    emphasize: true,
  },
  {
    id: "final",
    label: RESULT_LABELS.finalResult,
    sublabel: RESULT_LABELS.finalResultHint,
    format: "currency",
    getValue: (row) => row.finalResult,
    lowerIsBetter: true,
    emphasize: true,
  },
];

export default function ResultsHeadToHead({
  bestRow,
  baselineRow,
  baselineOptions,
  scenarios,
  onBaselineChange,
}: ResultsHeadToHeadProps) {
  const bestAvgRate = averageRate(bestRow, scenarios);
  const baselineAvgRate = averageRate(baselineRow, scenarios);
  const interestSavings = baselineRow.totalInterest - bestRow.totalInterest;
  const totalSavings = baselineRow.finalResult - bestRow.finalResult;
  const showSavings = baselineRow.id !== bestRow.id && totalSavings > 0;
  const animationKey = `${bestRow.id}-${baselineRow.id}`;

  return (
    <section
      id="results-summary"
      className="results-h2h-card theme-card theme-animate-in-slow theme-animate-delay-1 print:hidden scroll-mt-24"
    >
      <div className="results-h2h-card__intro">
        <div>
          <p className="theme-kicker">สรุปผลเปรียบเทียบ</p>
          <h2 className="theme-card-title mt-1 text-xl font-bold sm:text-2xl">
            {bestRow.bankName}
          </h2>
          <p className="theme-card-text mt-1 text-sm">
            ธนาคารที่แนะนำ · เปรียบกับ {baselineRow.bankShort}
          </p>
        </div>
        <div className="results-h2h-card__badge results-h2h-card__badge--float" aria-hidden="true">
          🏆
        </div>
      </div>

      <div className="results-h2h__shell" key={animationKey}>
        <div className="results-h2h__table" role="table" aria-label="เปรียบเทียบธนาคาร">
          <div className="results-h2h__row results-h2h__row--header" role="row">
            <div className="results-h2h__label-cell results-h2h__label-cell--ghost" role="columnheader" />
            <div
              className="results-h2h__head results-h2h__head--baseline results-h2h-stagger"
              style={{ animationDelay: "40ms" }}
              role="columnheader"
            >
              <span className="results-h2h__head-tag">อ้างอิง</span>
              <span>{baselineRow.bankShort}</span>
            </div>
            <div
              className="results-h2h__head results-h2h__head--best results-h2h-stagger"
              style={{ animationDelay: "90ms" }}
              role="columnheader"
            >
              <span className="results-h2h__head-badge">แนะนำ</span>
              <span>{bestRow.bankShort}</span>
            </div>
          </div>

          {METRIC_ROWS.map((metric, index) => {
            const baselineValue = metric.getValue(baselineRow, baselineAvgRate);
            const bestValue = metric.getValue(bestRow, bestAvgRate);
            const bestWins = metric.lowerIsBetter
              ? bestValue < baselineValue
              : bestValue > baselineValue;
            const rowDelay = `${140 + index * 70}ms`;

            return (
              <div
                key={metric.id}
                className="results-h2h__row results-h2h-stagger"
                style={{ animationDelay: rowDelay }}
                role="row"
              >
                <div className="results-h2h__label-cell" role="rowheader">
                  <span className="results-h2h__metric-label">{metric.label}</span>
                  {metric.sublabel && (
                    <span className="results-h2h__metric-sublabel">
                      {metric.sublabel}
                    </span>
                  )}
                </div>
                <div className="results-h2h__value-cell results-h2h__value-cell--baseline" role="cell">
                  <span className="results-h2h__value-text">
                    {formatMetricValue(baselineValue, metric.format)}
                  </span>
                </div>
                <div
                  className={`results-h2h__value-cell results-h2h__value-cell--best${
                    bestWins ? " results-h2h__value-cell--win" : ""
                  }${metric.emphasize && bestWins ? " results-h2h__value-cell--ring" : ""}`}
                  role="cell"
                >
                  <span className="results-h2h__value-text">
                    {formatMetricValue(bestValue, metric.format)}
                  </span>
                  {bestWins && (
                    <span className="results-h2h__win-icon results-h2h-win-pop" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showSavings ? (
          <div className="results-h2h__savings results-h2h-savings-enter">
            <div className="results-h2h__savings-icon results-h2h-card__badge--float" aria-hidden="true">
              💰
            </div>
            <div>
              <p className="results-h2h__savings-main">
                ประหยัดดอกเบี้ย {formatCurrency(Math.max(interestSavings, 0))}
              </p>
              <p className="results-h2h__savings-sub">
                ต้นทุนรวม (A₃ + ค่าใช้จ่าย) น้อยลง{" "}
                {formatCurrency(totalSavings)}
              </p>
            </div>
          </div>
        ) : (
          <div className="results-h2h__savings results-h2h__savings--neutral results-h2h-savings-enter">
            <p className="results-h2h__savings-main">
              {bestRow.bankName} — ตัวเลือกที่คุ้มที่สุดในกลุ่มนี้
            </p>
          </div>
        )}
      </div>

      {baselineOptions.length > 1 && (
        <label className="results-h2h__picker">
          <span className="results-h2h__picker-label">เปรียบเทียบกับธนาคาร</span>
          <select
            value={baselineRow.id}
            onChange={(event) => onBaselineChange(event.target.value)}
            className="results-h2h__picker-select"
          >
            {baselineOptions.map((row) => (
              <option key={row.id} value={row.id}>
                {row.bankName}
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  );
}
