"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NumericInput from "@/components/NumericInput";
import { DEFAULT_BANKS, getBankAbbreviation } from "@/lib/banks";
import type { LoanType } from "@/lib/bankRates";
import {
  getRatesForBank,
  getDefaultScenarioFeeInputs,
  resolveScenarioFees,
  loanTypeHasAdditionalFees,
  loanTypeLabel,
} from "@/lib/bankRates";
import { calculate3YearLoan } from "@/lib/calculator";
import { saveCalculatorResults } from "@/lib/calculator-storage";

export type CalculatorScenario = {
  id: string;
  bankName: string;
  loanType: LoanType;
  principal: number;
  monthlyPayment: number;
  rateYear1: number;
  rateYear2: number;
  rateYear3: number;
  useCustomRates: boolean;
  useCustomFees: boolean;
  feeMortgage: number;
  feeStamp: number;
  feeAppraisal: number;
  feeInsurance: number;
  resultFinal: number | null;
  isSaved: boolean;
};

type CalculatorClientProps = {
  initialScenarios: CalculatorScenario[];
  isLoggedIn?: boolean;
};

function createScenarioId() {
  return `new-${crypto.randomUUID()}`;
}

function createScenarioFromBank(
  bankName: string,
  loanType: LoanType = "refinance",
  principal = 0,
  monthlyPayment = 0,
): CalculatorScenario {
  const rates = getRatesForBank(bankName, loanType);
  const defaultFees = getDefaultScenarioFeeInputs(bankName);

  return {
    id: createScenarioId(),
    bankName,
    loanType,
    principal,
    monthlyPayment,
    rateYear1: rates[0],
    rateYear2: rates[1],
    rateYear3: rates[2],
    useCustomRates: false,
    useCustomFees: false,
    feeMortgage: defaultFees.feeMortgagePct,
    feeStamp: defaultFees.feeStampPct,
    feeAppraisal: defaultFees.feeAppraisalBaht,
    feeInsurance: defaultFees.feeInsuranceBaht,
    resultFinal: null,
    isSaved: false,
  };
}

function createDefaultScenarios(): CalculatorScenario[] {
  return DEFAULT_BANKS.map((bankName) => createScenarioFromBank(bankName));
}

function getInitialScenarios(
  initialScenarios: CalculatorScenario[],
): CalculatorScenario[] {
  if (initialScenarios.length > 0) {
    return initialScenarios;
  }

  return createDefaultScenarios();
}

function getScenarioRates(scenario: CalculatorScenario): [number, number, number] {
  return [scenario.rateYear1, scenario.rateYear2, scenario.rateYear3];
}

function getScenarioFees(scenario: CalculatorScenario) {
  return resolveScenarioFees(scenario.loanType, scenario.principal, {
    feeMortgagePct: scenario.feeMortgage,
    feeStampPct: scenario.feeStamp,
    feeAppraisalBaht: scenario.feeAppraisal,
    feeInsuranceBaht: scenario.feeInsurance,
  });
}

function calculateScenario(scenario: CalculatorScenario) {
  return calculate3YearLoan({
    principal: scenario.principal,
    monthlyPayment: scenario.monthlyPayment,
    rates: getScenarioRates(scenario),
    fees: getScenarioFees(scenario),
  });
}

function applyBankDefaults(
  scenario: CalculatorScenario,
  bankName: string,
  loanType: LoanType,
): CalculatorScenario {
  const rates = getRatesForBank(bankName, loanType);
  const isRetention = loanType === "retention";
  const defaultFees = getDefaultScenarioFeeInputs(bankName);

  return {
    ...scenario,
    bankName,
    loanType,
    ...(scenario.useCustomRates
      ? {}
      : {
          rateYear1: rates[0],
          rateYear2: rates[1],
          rateYear3: rates[2],
        }),
    ...(isRetention
      ? {
          useCustomFees: false,
          feeMortgage: 0,
          feeStamp: 0,
          feeAppraisal: 0,
          feeInsurance: 0,
        }
      : scenario.useCustomFees
        ? {}
        : {
            feeMortgage: defaultFees.feeMortgagePct,
            feeStamp: defaultFees.feeStampPct,
            feeAppraisal: defaultFees.feeAppraisalBaht,
            feeInsurance: defaultFees.feeInsuranceBaht,
          }),
    resultFinal: null,
  };
}

export default function CalculatorClient({
  initialScenarios,
  isLoggedIn = false,
}: CalculatorClientProps) {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<CalculatorScenario[]>(() =>
    getInitialScenarios(initialScenarios),
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bulkPrincipal, setBulkPrincipal] = useState(0);
  const [bulkMonthlyPayment, setBulkMonthlyPayment] = useState(0);
  const [bulkLoanType, setBulkLoanType] = useState<LoanType>("refinance");
  const [newBankName, setNewBankName] = useState("");
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [navDirection, setNavDirection] = useState<"next" | "prev">("next");
  const [navTick, setNavTick] = useState(0);
  const [appliedKey, setAppliedKey] = useState<
    "principal" | "monthly" | "loanType" | null
  >(null);
  const [appliedTick, setAppliedTick] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [calcBtnHighlight, setCalcBtnHighlight] = useState(false);

  useEffect(() => {
    if (!appliedKey) {
      return;
    }

    const timer = setTimeout(() => setAppliedKey(null), 1800);
    return () => clearTimeout(timer);
  }, [appliedKey, appliedTick]);

  useEffect(() => {
    if (!showSavedPopup) {
      return;
    }

    const timer = setTimeout(() => setShowSavedPopup(false), 2600);
    return () => clearTimeout(timer);
  }, [showSavedPopup]);

  function flagApplied(key: "principal" | "monthly" | "loanType") {
    setAppliedKey(key);
    setAppliedTick((tick) => tick + 1);
  }

  function clearCalcHighlight() {
    setCalcBtnHighlight(false);
  }

  function updateScenario(
    id: string,
    changes: Partial<Omit<CalculatorScenario, "id" | "isSaved">>,
  ) {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id === id
          ? { ...scenario, ...changes, resultFinal: null }
          : scenario,
      ),
    );
  }

  function applyPrincipalToAll() {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) => ({
        ...scenario,
        principal: bulkPrincipal,
        resultFinal: null,
      })),
    );
    setMessage("ใช้เงินต้นนี้กับทุกธนาคารแล้ว");
    flagApplied("principal");
  }

  function applyMonthlyPaymentToAll() {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) => ({
        ...scenario,
        monthlyPayment: bulkMonthlyPayment,
        resultFinal: null,
      })),
    );
    setMessage("ใช้ค่างวดนี้กับทุกธนาคารแล้ว");
    flagApplied("monthly");
  }

  function applyLoanTypeToAll() {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        applyBankDefaults(scenario, scenario.bankName, bulkLoanType),
      ),
    );
    setMessage(`ใช้${loanTypeLabel(bulkLoanType)}กับทุกธนาคารแล้ว`);
    flagApplied("loanType");
  }

  function handleScenarioLoanTypeChange(id: string, loanType: LoanType) {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id === id
          ? applyBankDefaults(scenario, scenario.bankName, loanType)
          : scenario,
      ),
    );
  }

  function resetAllBanks() {
    clearCalcHighlight();
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) => {
        const defaults = createScenarioFromBank(
          scenario.bankName,
          scenario.loanType,
          scenario.principal,
          scenario.monthlyPayment,
        );

        return {
          ...scenario,
          rateYear1: defaults.rateYear1,
          rateYear2: defaults.rateYear2,
          rateYear3: defaults.rateYear3,
          useCustomRates: false,
          useCustomFees: false,
          feeMortgage: defaults.feeMortgage,
          feeStamp: defaults.feeStamp,
          feeAppraisal: defaults.feeAppraisal,
          feeInsurance: defaults.feeInsurance,
          resultFinal: null,
        };
      }),
    );
    setMessage("รีเซ็ตอัตราและค่าใช้จ่ายของทุกธนาคารแล้ว");
  }

  function addBank(bankName: string) {
    const trimmed = bankName.trim();
    if (!trimmed) {
      setMessage("กรุณาระบุชื่อธนาคาร");
      return;
    }

    if (scenarios.some((scenario) => scenario.bankName === trimmed)) {
      setMessage("มีธนาคารนี้อยู่ในรายการแล้ว");
      return;
    }

    clearCalcHighlight();
    setScenarios((currentScenarios) => [
      ...currentScenarios,
      createScenarioFromBank(trimmed),
    ]);
    setNavDirection("next");
    setNavTick((tick) => tick + 1);
    setCurrentIndex(scenarios.length);
    setNewBankName("");
    setMessage(`เพิ่ม ${trimmed} แล้ว`);
    setIsAddBankOpen(false);
  }

  async function deleteScenario(id: string) {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) {
      return;
    }

    if (scenario.isSaved) {
      await fetch(`/api/scenarios/${id}`, {
        method: "DELETE",
      });
    }

    setScenarios((currentScenarios) =>
      currentScenarios.filter((item) => item.id !== id),
    );
    clearCalcHighlight();
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  async function deleteSavedScenarios(toDelete: CalculatorScenario[]) {
    await Promise.all(
      toDelete
        .filter((scenario) => scenario.isSaved)
        .map((scenario) =>
          fetch(`/api/scenarios/${scenario.id}`, {
            method: "DELETE",
          }),
        ),
    );
  }

  function scenarioPayload(scenario: CalculatorScenario) {
    const result = calculateScenario(scenario);

    return {
      bankName: scenario.bankName,
      loanType: scenario.loanType,
      principal: scenario.principal,
      monthlyPayment: scenario.monthlyPayment,
      rateYear1: scenario.rateYear1,
      rateYear2: scenario.rateYear2,
      rateYear3: scenario.rateYear3,
      useCustomRates: scenario.useCustomRates,
      useCustomFees:
        scenario.loanType === "retention" ? false : scenario.useCustomFees,
      feeMortgage: scenario.feeMortgage,
      feeStamp: scenario.feeStamp,
      feeAppraisal: scenario.feeAppraisal,
      feeInsurance: scenario.feeInsurance,
      resultFinal: result.finalResult,
    };
  }

  async function saveAll() {
    if (!isLoggedIn) {
      router.push("/login?next=/calculator");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await deleteSavedScenarios(
        initialScenarios.filter(
          (initialScenario) =>
            !scenarios.some((scenario) => scenario.id === initialScenario.id),
        ),
      );

      const savedScenarios = await Promise.all(
        scenarios.map(async (scenario) => {
          const response = await fetch(
            scenario.isSaved ? `/api/scenarios/${scenario.id}` : "/api/scenarios",
            {
              method: scenario.isSaved ? "PATCH" : "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(scenarioPayload(scenario)),
            },
          );

          if (!response.ok) {
            throw new Error("Save failed");
          }

          const data = await response.json();
          return {
            ...data.scenario,
            isSaved: true,
          } as CalculatorScenario;
        }),
      );

      setScenarios(savedScenarios);
      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      setShowSavedPopup(true);
      setCalcBtnHighlight(true);
    } catch {
      setMessage("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }

  async function calculateAll() {
    setCalcBtnHighlight(false);
    setIsCalculating(true);

    try {
      const response = await fetch("/api/comparison-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarios }),
      });

      if (response.ok) {
        const data = await response.json();
        saveCalculatorResults(scenarios, {
          shareToken: data.shareToken,
          runId: data.runId,
        });
        router.push(`/calculator/results?run=${data.shareToken}`);
        return;
      }
    } catch {
      // fall through to session-only results
    }

    saveCalculatorResults(scenarios);
    router.push("/calculator/results");
  }

  const totalBanks = scenarios.length;
  const safeIndex =
    totalBanks === 0 ? 0 : ((currentIndex % totalBanks) + totalBanks) % totalBanks;
  const scenario = scenarios[safeIndex];
  const calcBtnClassName = calcBtnHighlight
    ? "theme-btn-primary calc-cta-btn"
    : "theme-btn-primary";

  function goToBank(index: number) {
    if (totalBanks === 0) {
      return;
    }

    const nextIndex = ((index % totalBanks) + totalBanks) % totalBanks;
    if (nextIndex === safeIndex) {
      return;
    }

    const forward =
      (nextIndex - safeIndex + totalBanks) % totalBanks <= totalBanks / 2;
    setNavDirection(forward ? "next" : "prev");
    setNavTick((tick) => tick + 1);
    setCurrentIndex(nextIndex);
  }

  const availableBanksToAdd = DEFAULT_BANKS.filter(
    (bankName) => !scenarios.some((item) => item.bankName === bankName),
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="theme-kicker">เครื่องมือคำนวณ</p>
            <h1 className="theme-card-title mt-2 text-2xl tracking-tight sm:text-3xl">
              เปรียบเทียบอัตราดอกเบี้ยแต่ละธนาคาร
            </h1>
            <p className="theme-card-text mt-2 max-w-2xl text-sm leading-6">
              กรอกทีละธนาคาร หรือใช้ค่าด้านล่างกับทุกธนาคารพร้อมกัน
            </p>
            {!isLoggedIn && (
              <p className="theme-card-text mt-2 text-xs leading-5">
                ทดลองคำนวณได้เลย —{" "}
                <Link href="/login?next=/calculator" className="theme-link">
                  เข้าสู่ระบบ
                </Link>{" "}
                เมื่อต้องการบันทึกข้อมูล
              </p>
            )}
          </div>
          {totalBanks > 0 && (
            <div className="theme-progress w-full sm:max-w-xs">
              <div className="theme-progress__meta">
                <span>ธนาคาร {safeIndex + 1}/{totalBanks}</span>
                <span>{Math.round(((safeIndex + 1) / totalBanks) * 100)}%</span>
              </div>
              <div className="theme-progress__track">
                <div
                  className="theme-progress__fill"
                  style={{ width: `${((safeIndex + 1) / totalBanks) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {message && <p className="theme-alert mt-4">{message}</p>}
      </div>

      <section className="theme-card theme-animate-in p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-orange-100 text-lg">
            ⚡
          </span>
          <div>
            <p className="theme-kicker">กรอกครั้งเดียว ใช้ได้ทุกธนาคาร</p>
            <h2 className="theme-card-title mt-1 text-lg">ใช้ค่าเดียวกันทุกธนาคาร</h2>
            <p className="theme-card-text mt-1 text-sm leading-6">
              กรอกค่าด้านล่างแล้วกดปุ่ม เพื่อนำไปใส่ให้ทุกธนาคารพร้อมกัน
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col rounded-2xl border-2 border-slate-900/80 bg-white/70 p-4 shadow-[2px_3px_0_rgba(30,41,59,0.12)]">
            <label className="block">
              <span className="theme-label">เงินต้น (A₀)</span>
              <NumericInput
                value={bulkPrincipal}
                onChange={setBulkPrincipal}
                suffix="บาท"
              />
            </label>
            <button
              type="button"
              onClick={applyPrincipalToAll}
              className={`mt-4 w-full ${
                appliedKey === "principal"
                  ? "theme-btn-applied"
                  : "theme-btn-outline"
              }`}
            >
              {appliedKey === "principal"
                ? "✓ ใช้กับทุกธนาคารแล้ว"
                : "ใช้เงินต้นนี้ทุกธนาคาร"}
            </button>
          </div>

          <div className="flex flex-col rounded-2xl border-2 border-slate-900/80 bg-white/70 p-4 shadow-[2px_3px_0_rgba(30,41,59,0.12)]">
            <label className="block">
              <span className="theme-label">ค่างวดต่อเดือน</span>
              <NumericInput
                value={bulkMonthlyPayment}
                onChange={setBulkMonthlyPayment}
                suffix="บาท"
              />
            </label>
            <button
              type="button"
              onClick={applyMonthlyPaymentToAll}
              className={`mt-4 w-full ${
                appliedKey === "monthly"
                  ? "theme-btn-applied"
                  : "theme-btn-outline"
              }`}
            >
              {appliedKey === "monthly"
                ? "✓ ใช้กับทุกธนาคารแล้ว"
                : "ใช้ค่างวดนี้ทุกธนาคาร"}
            </button>
          </div>

          <div className="flex flex-col rounded-2xl border-2 border-slate-900/80 bg-white/70 p-4 shadow-[2px_3px_0_rgba(30,41,59,0.12)]">
            <p className="theme-label">ประเภทสินเชื่อ</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["refinance", "retention"] as LoanType[]).map((loanType) => (
                <label
                  key={loanType}
                  className={`flex cursor-pointer items-center justify-center gap-2 px-3 py-2 text-sm font-semibold transition ${
                    bulkLoanType === loanType ? "theme-pill-active" : "theme-pill"
                  }`}
                >
                  <input
                    type="radio"
                    name="bulk-loan-type"
                    checked={bulkLoanType === loanType}
                    onChange={() => setBulkLoanType(loanType)}
                    className="sr-only"
                  />
                  {loanTypeLabel(loanType)}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={applyLoanTypeToAll}
              className={`mt-4 w-full ${
                appliedKey === "loanType"
                  ? "theme-btn-applied"
                  : "theme-btn-outline"
              }`}
            >
              {appliedKey === "loanType"
                ? "✓ ใช้กับทุกธนาคารแล้ว"
                : "ใช้ประเภทนี้ทุกธนาคาร"}
            </button>
          </div>
        </div>
      </section>

      {scenario && (
        <section
          key={`${scenario.id}-${navTick}`}
          className={`theme-card p-5 sm:p-6 ${
            navDirection === "next" ? "theme-bank-next" : "theme-bank-prev"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToBank(safeIndex - 1)}
              aria-label="ธนาคารก่อนหน้า"
              className="theme-btn-outline px-4 py-3 text-lg"
            >
              ‹
            </button>

            <div className="text-center">
              <p className="theme-card-text text-sm font-semibold">
                {loanTypeLabel(scenario.loanType)} · {safeIndex + 1}/{totalBanks}
              </p>
              <h2 className="theme-card-title mt-1 text-xl">{scenario.bankName}</h2>
            </div>

            <button
              type="button"
              onClick={() => goToBank(safeIndex + 1)}
              aria-label="ธนาคารถัดไป"
              className="theme-btn-outline px-4 py-3 text-lg"
            >
              ›
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {scenarios.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold transition ${
                  index === safeIndex ? "theme-pill-active" : "theme-pill"
                }`}
              >
                <button
                  type="button"
                  onClick={() => goToBank(index)}
                  className="px-1"
                >
                  {getBankAbbreviation(item.bankName)}
                </button>
                {totalBanks > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteScenario(item.id)}
                    aria-label={`ลบ ${item.bankName}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-sm leading-none text-red-500 transition hover:bg-red-100"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setNewBankName("");
                setIsAddBankOpen(true);
              }}
              aria-label="เพิ่มธนาคาร"
              title="เพิ่มธนาคาร"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-xl font-bold leading-none text-white shadow-sm transition hover:bg-green-600"
            >
              +
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="theme-label">เงินต้น (A₀)</span>
              <NumericInput
                value={scenario.principal}
                onChange={(principal) =>
                  updateScenario(scenario.id, { principal })
                }
                suffix="บาท"
              />
            </label>

            <label className="block">
              <span className="theme-label">ค่างวดต่อเดือน</span>
              <NumericInput
                value={scenario.monthlyPayment}
                onChange={(monthlyPayment) =>
                  updateScenario(scenario.id, { monthlyPayment })
                }
                suffix="บาท"
              />
            </label>
          </div>

          <div className="mt-5">
            <p className="theme-label">ประเภทสินเชื่อ</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(["refinance", "retention"] as LoanType[]).map((loanType) => (
                <label
                  key={loanType}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                    scenario.loanType === loanType
                      ? "theme-pill-active"
                      : "theme-pill"
                  }`}
                >
                  <input
                    type="radio"
                    name={`loan-type-${scenario.id}`}
                    checked={scenario.loanType === loanType}
                    onChange={() =>
                      handleScenarioLoanTypeChange(scenario.id, loanType)
                    }
                    className="sr-only"
                  />
                  {loanTypeLabel(loanType)}
                </label>
              ))}
            </div>
          </div>

          <details
            className="theme-accordion"
            open={scenario.useCustomRates || scenario.useCustomFees}
          >
            <summary className="theme-accordion__summary">
              <span>ตั้งค่าเพิ่มเติม (อัตราดอกเบี้ย / ค่าใช้จ่าย)</span>
              <span className="theme-card-text text-xs font-medium">
                {scenario.useCustomRates || scenario.useCustomFees
                  ? "กำหนดเอง"
                  : "ค่าเริ่มต้นธนาคาร"}
              </span>
            </summary>
            <div className="theme-accordion__body">
              <div className="flex items-center justify-between gap-3">
                <p className="theme-label">อัตราดอกเบี้ย 3 ปี (%)</p>
                <label className="theme-card-text flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={scenario.useCustomRates}
                    onChange={(event) => {
                      const useCustomRates = event.target.checked;
                      if (useCustomRates) {
                        updateScenario(scenario.id, { useCustomRates });
                        return;
                      }

                      updateScenario(
                        scenario.id,
                        applyBankDefaults(
                          { ...scenario, useCustomRates: false },
                          scenario.bankName,
                          scenario.loanType,
                        ),
                      );
                    }}
                    className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                  />
                  กำหนดอัตราเอง
                </label>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-3">
                {[
                  { key: "rateYear1", label: "ปีที่ 1 (C₀)" },
                  { key: "rateYear2", label: "ปีที่ 2 (C₁)" },
                  { key: "rateYear3", label: "ปีที่ 3 (C₂)" },
                ].map(({ key, label }) => (
                  <label key={key} className="block">
                    <span className="theme-label">{label}</span>
                    <NumericInput
                      value={scenario[key as keyof CalculatorScenario] as number}
                      disabled={!scenario.useCustomRates}
                      onChange={(rate) =>
                        updateScenario(scenario.id, {
                          [key]: rate,
                          useCustomRates: true,
                        })
                      }
                      suffix="%"
                    />
                  </label>
                ))}
              </div>

              {loanTypeHasAdditionalFees(scenario.loanType) ? (
                <>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <p className="theme-label">ค่าใช้จ่ายเพิ่มเติม (Z, I, P, G)</p>
                    <label className="theme-card-text flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={scenario.useCustomFees}
                        onChange={(event) => {
                          const useCustomFees = event.target.checked;
                          if (useCustomFees) {
                            updateScenario(scenario.id, { useCustomFees: true });
                            return;
                          }

                          const defaultFees = getDefaultScenarioFeeInputs(
                            scenario.bankName,
                          );
                          updateScenario(scenario.id, {
                            useCustomFees: false,
                            feeMortgage: defaultFees.feeMortgagePct,
                            feeStamp: defaultFees.feeStampPct,
                            feeAppraisal: defaultFees.feeAppraisalBaht,
                            feeInsurance: defaultFees.feeInsuranceBaht,
                          });
                        }}
                        className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                      />
                      กำหนดค่าใช้จ่ายเอง
                    </label>
                  </div>

                  <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                      <span className="theme-label">
                        ค่าจดจำนอง (Z) — % ของเงินต้น
                      </span>
                      <NumericInput
                        value={scenario.feeMortgage}
                        disabled={!scenario.useCustomFees}
                        onChange={(feeMortgage) =>
                          updateScenario(scenario.id, {
                            feeMortgage,
                            useCustomFees: true,
                          })
                        }
                        suffix="%"
                      />
                    </label>
                    <label className="block">
                      <span className="theme-label">
                        ค่าอากรแสตมป์ (I) — % ของเงินต้น
                      </span>
                      <NumericInput
                        value={scenario.feeStamp}
                        disabled={!scenario.useCustomFees}
                        onChange={(feeStamp) =>
                          updateScenario(scenario.id, {
                            feeStamp,
                            useCustomFees: true,
                          })
                        }
                        suffix="%"
                      />
                    </label>
                    <label className="block">
                      <span className="theme-label">ค่าประเมิน (P) — บาท</span>
                      <NumericInput
                        value={scenario.feeAppraisal}
                        disabled={!scenario.useCustomFees}
                        onChange={(feeAppraisal) =>
                          updateScenario(scenario.id, {
                            feeAppraisal,
                            useCustomFees: true,
                          })
                        }
                        suffix="บาท"
                      />
                    </label>
                    <label className="block">
                      <span className="theme-label">
                        ค่าประกันอัคคีภัย (G) — บาท
                      </span>
                      <NumericInput
                        value={scenario.feeInsurance}
                        disabled={!scenario.useCustomFees}
                        onChange={(feeInsurance) =>
                          updateScenario(scenario.id, {
                            feeInsurance,
                            useCustomFees: true,
                          })
                        }
                        suffix="บาท"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <p className="theme-card-text mt-5 text-sm">
                  รีเทนชั่นไม่มีค่าใช้จ่ายเพิ่มเติม (Z, I, P, G)
                </p>
              )}
            </div>
          </details>

          <div className="mt-6 hidden flex-col gap-3 border-t border-slate-100 pt-5 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => goToBank(safeIndex - 1)}
              className="theme-btn-outline"
            >
              ‹ ย้อนกลับ
            </button>

            {safeIndex === totalBanks - 1 ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => goToBank(0)}
                  className="theme-btn-outline"
                >
                  ↺ กลับธนาคารแรก
                </button>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={saveAll}
                    disabled={isSaving}
                    className="theme-btn-dark"
                  >
                    {isSaving ? (
                      <span className="theme-loading-dot">กำลังบันทึก</span>
                    ) : (
                      "เสร็จสิ้น/บันทึก"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/login?next=/calculator")}
                    className="theme-btn-dark"
                  >
                    เข้าสู่ระบบเพื่อบันทึก
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => goToBank(safeIndex + 1)}
                className="theme-btn-primary"
              >
                ถัดไป ›
              </button>
            )}
          </div>
        </section>
      )}

      <div className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetAllBanks}
            className="theme-btn-outline"
          >
            รีเซ็ตอัตราและค่าใช้จ่าย
          </button>
          <div className={calcBtnHighlight ? "calc-cta-wrap sm:items-center" : ""}>
            {calcBtnHighlight && (
              <p className="calc-cta-hint">บันทึกแล้ว — กดคำนวณเพื่อดูผลเปรียบเทียบ</p>
            )}
            <button
              type="button"
              onClick={calculateAll}
              disabled={isCalculating}
              className={calcBtnClassName}
            >
              {isCalculating ? (
                <span className="theme-loading-dot">กำลังคำนวณ</span>
              ) : calcBtnHighlight ? (
                <>
                  คำนวณทั้งหมด
                  <span className="calc-cta-btn__arrow" aria-hidden="true">
                    →
                  </span>
                </>
              ) : (
                "คำนวณทั้งหมด"
              )}
            </button>
          </div>
        </div>
      </div>

      {scenario && (
        <div className="theme-sticky-cta sm:hidden">
          <div className="theme-sticky-cta__inner">
            <button
              type="button"
              onClick={() => goToBank(safeIndex - 1)}
              className="theme-btn-outline"
            >
              ‹ ย้อนกลับ
            </button>
            {safeIndex === totalBanks - 1 ? (
              <button
                type="button"
                onClick={calculateAll}
                disabled={isCalculating}
                className={calcBtnClassName}
              >
                {isCalculating ? (
                  <span className="theme-loading-dot">กำลังคำนวณ</span>
                ) : calcBtnHighlight ? (
                  <>
                    คำนวณ
                    <span className="calc-cta-btn__arrow" aria-hidden="true">
                      →
                    </span>
                  </>
                ) : (
                  "คำนวณทั้งหมด"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToBank(safeIndex + 1)}
                className="theme-btn-primary"
              >
                ถัดไป ›
              </button>
            )}
          </div>
        </div>
      )}

      {isAddBankOpen && (
        <div
          className="theme-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsAddBankOpen(false)}
        >
          <div
            className="theme-card theme-modal-panel w-full max-w-md p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="theme-card-title text-lg">เพิ่มธนาคาร</p>
              <button
                type="button"
                onClick={() => setIsAddBankOpen(false)}
                aria-label="ปิด"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <label className="mt-4 block">
              <span className="theme-label">ชื่อธนาคาร</span>
              <input
                type="text"
                value={newBankName}
                onChange={(event) => setNewBankName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addBank(newBankName);
                  }
                }}
                placeholder="พิมพ์ชื่อธนาคารใหม่"
                autoFocus
                className="theme-input mt-1 w-full"
              />
            </label>

            {availableBanksToAdd.length > 0 && (
              <div className="mt-4">
                <p className="theme-label">หรือเลือกจากรายการเริ่มต้น</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableBanksToAdd.map((bankName) => (
                    <button
                      key={bankName}
                      type="button"
                      onClick={() => addBank(bankName)}
                      className="theme-pill px-3 py-1 text-xs font-semibold"
                    >
                      {bankName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddBankOpen(false)}
                className="theme-btn-outline"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => addBank(newBankName)}
                className="theme-btn-primary"
              >
                เพิ่มธนาคาร
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedPopup && (
        <div
          className="theme-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowSavedPopup(false)}
        >
          <div
            className="theme-card theme-modal-panel w-full max-w-sm p-6 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="theme-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-600 bg-green-100 text-green-600">
              <svg
                viewBox="0 0 24 24"
                className="theme-check-draw h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="theme-card-title mt-4 text-xl font-bold">
              บันทึกสำเร็จ
            </p>
            <p className="theme-card-text mt-2 text-sm">
              ข้อมูลทุกธนาคารถูกบันทึกเรียบร้อยแล้ว
            </p>
            <button
              type="button"
              onClick={() => setShowSavedPopup(false)}
              className="theme-btn-primary mt-5 w-full justify-center"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
