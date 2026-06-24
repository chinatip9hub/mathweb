"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NumericInput from "@/components/NumericInput";
import { DEFAULT_BANKS } from "@/lib/banks";
import type { LoanType } from "@/lib/bankRates";
import {
  getFeesForBank,
  getRatesForBank,
  isKnownBank,
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
  feeMortgage: number;
  feeStamp: number;
  feeAppraisal: number;
  feeInsurance: number;
  resultFinal: number | null;
  isSaved: boolean;
};

type CalculatorClientProps = {
  initialScenarios: CalculatorScenario[];
};

function createScenarioFromBank(
  bankName: string,
  loanType: LoanType = "refinance",
): CalculatorScenario {
  const rates = getRatesForBank(bankName, loanType);
  const fees = getFeesForBank(bankName);

  return {
    id: `new-${bankName}`,
    bankName,
    loanType,
    principal: 0,
    monthlyPayment: 0,
    rateYear1: rates[0],
    rateYear2: rates[1],
    rateYear3: rates[2],
    useCustomRates: false,
    feeMortgage: fees.Z,
    feeStamp: fees.I,
    feeAppraisal: fees.P,
    feeInsurance: fees.G,
    resultFinal: null,
    isSaved: false,
  };
}

function createDefaultScenarios(): CalculatorScenario[] {
  return DEFAULT_BANKS.map((bankName) => createScenarioFromBank(bankName));
}

function getScenarioRates(scenario: CalculatorScenario): [number, number, number] {
  return [scenario.rateYear1, scenario.rateYear2, scenario.rateYear3];
}

function getScenarioFees(scenario: CalculatorScenario) {
  return {
    Z: scenario.feeMortgage,
    I: scenario.feeStamp,
    P: scenario.feeAppraisal,
    G: scenario.feeInsurance,
  };
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
  const fees = getFeesForBank(bankName);

  return {
    ...scenario,
    bankName,
    loanType,
    rateYear1: rates[0],
    rateYear2: rates[1],
    rateYear3: rates[2],
    feeMortgage: fees.Z,
    feeStamp: fees.I,
    feeAppraisal: fees.P,
    feeInsurance: fees.G,
    resultFinal: null,
  };
}

export default function CalculatorClient({
  initialScenarios,
}: CalculatorClientProps) {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<CalculatorScenario[]>(
    initialScenarios.length > 0 ? initialScenarios : createDefaultScenarios(),
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateScenario(
    id: string,
    changes: Partial<Omit<CalculatorScenario, "id" | "isSaved">>,
  ) {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id === id
          ? { ...scenario, ...changes, resultFinal: null }
          : scenario,
      ),
    );
  }

  function handleBankChange(id: string, bankName: string) {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) => {
        if (scenario.id !== id) {
          return scenario;
        }

        if (scenario.useCustomRates) {
          return { ...scenario, bankName, resultFinal: null };
        }

        return applyBankDefaults(scenario, bankName, scenario.loanType);
      }),
    );
  }

  function handleLoanTypeChange(id: string, loanType: LoanType) {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) => {
        if (scenario.id !== id) {
          return scenario;
        }

        if (scenario.useCustomRates) {
          return { ...scenario, loanType, resultFinal: null };
        }

        return applyBankDefaults(scenario, scenario.bankName, loanType);
      }),
    );
  }

  function addScenario() {
    setScenarios((currentScenarios) => [
      ...currentScenarios,
      createScenarioFromBank(DEFAULT_BANKS[0]),
    ]);
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
      feeMortgage: scenario.feeMortgage,
      feeStamp: scenario.feeStamp,
      feeAppraisal: scenario.feeAppraisal,
      feeInsurance: scenario.feeInsurance,
      resultFinal: result.finalResult,
    };
  }

  async function saveAll() {
    setIsSaving(true);
    setMessage("");

    try {
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
    } catch {
      setMessage("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }

  function calculateAll() {
    saveCalculatorResults(scenarios);
    router.push("/calculator/results");
  }

  return (
    <div className="space-y-6">
      <div className="theme-card p-5 sm:p-6">
        <div>
          <p className="theme-kicker">เครื่องมือคำนวณ</p>
          <h1 className="theme-card-title mt-2 text-3xl tracking-tight">
            เปรียบเทียบอัตราดอกเบี้ยแต่ละธนาคาร
          </h1>
          <p className="theme-card-text mt-3 max-w-2xl text-sm leading-6">
            กรอกเงินต้นและค่างวดต่อเดือน เลือกรีไฟแนนซ์หรือรีเทนชั่น
            ระบบจะคำนวณอัตราดอกเบี้ย 3 ปีและค่าใช้จ่ายเพิ่มเติมให้
          </p>
        </div>

        {message && (
          <p className="theme-alert mt-5">
            {message}
          </p>
        )}
      </div>

      <div className="grid gap-5">
        {scenarios.map((scenario, index) => {
          return (
            <section
              key={scenario.id}
              className="theme-card p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="w-full space-y-4">
                  <p className="theme-card-text text-sm font-semibold">
                    บล็อกที่ {index + 1}
                  </p>
                  <label className="block">
                    <span className="theme-label">
                      ธนาคาร
                    </span>
                    <select
                      value={scenario.bankName}
                      onChange={(event) =>
                        handleBankChange(scenario.id, event.target.value)
                      }
                      className="theme-input text-lg font-bold"
                    >
                      {DEFAULT_BANKS.map((bankName) => (
                        <option key={bankName} value={bankName}>
                          {bankName}
                        </option>
                      ))}
                      {!isKnownBank(scenario.bankName) && (
                        <option value={scenario.bankName}>
                          {scenario.bankName}
                        </option>
                      )}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => deleteScenario(scenario.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  ลบบล็อก
                </button>
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
                          handleLoanTypeChange(scenario.id, loanType)
                        }
                        className="sr-only"
                      />
                      {loanTypeLabel(loanType)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="theme-label">
                    เงินต้น (A₀)
                  </span>
                  <NumericInput
                    value={scenario.principal}
                    onChange={(principal) =>
                      updateScenario(scenario.id, { principal })
                    }
                    integer
                  />
                </label>

                <label className="block">
                  <span className="theme-label">
                    ค่างวดต่อเดือน
                  </span>
                  <NumericInput
                    value={scenario.monthlyPayment}
                    onChange={(monthlyPayment) =>
                      updateScenario(scenario.id, { monthlyPayment })
                    }
                    integer
                  />
                  <span className="theme-card-text mt-1 block text-xs">
                    ระบบจะแปลงเป็นค่างวดต่อปี (B) อัตโนมัติ
                  </span>
                </label>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="theme-label">
                  อัตราดอกเบี้ย 3 ปี (%)
                </p>
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

                      setScenarios((currentScenarios) =>
                        currentScenarios.map((item) =>
                          item.id === scenario.id
                            ? applyBankDefaults(
                                { ...item, useCustomRates: false },
                                item.bankName,
                                item.loanType,
                              )
                            : item,
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
                    <span className="theme-label">
                      {label}
                    </span>
                    <NumericInput
                      value={scenario[key as keyof CalculatorScenario] as number}
                      disabled={!scenario.useCustomRates}
                      onChange={(rate) =>
                        updateScenario(scenario.id, {
                          [key]: rate,
                          useCustomRates: true,
                        })
                      }
                      className="theme-input disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="theme-label">
                    ค่าจดจำนอง (Z)
                  </span>
                  <NumericInput
                    value={scenario.feeMortgage}
                    onChange={(feeMortgage) =>
                      updateScenario(scenario.id, { feeMortgage })
                    }
                    integer
                  />
                </label>
                <label className="block">
                  <span className="theme-label">
                    ค่าอากรแสตมป์ (I)
                  </span>
                  <NumericInput
                    value={scenario.feeStamp}
                    onChange={(feeStamp) =>
                      updateScenario(scenario.id, { feeStamp })
                    }
                    integer
                  />
                </label>
                <label className="block">
                  <span className="theme-label">
                    ค่าประเมิน (P)
                  </span>
                  <NumericInput
                    value={scenario.feeAppraisal}
                    onChange={(feeAppraisal) =>
                      updateScenario(scenario.id, { feeAppraisal })
                    }
                    integer
                  />
                </label>
                <label className="block">
                  <span className="theme-label">
                    ค่าประกัน (G)
                  </span>
                  <NumericInput
                    value={scenario.feeInsurance}
                    onChange={(feeInsurance) =>
                      updateScenario(scenario.id, { feeInsurance })
                    }
                    integer
                  />
                </label>
              </div>
            </section>
          );
        })}
      </div>

      <div className="theme-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={addScenario}
            className="theme-btn-outline"
          >
            เพิ่มบล็อก
          </button>
          <button
            type="button"
            onClick={calculateAll}
            className="theme-btn-primary"
          >
            คำนวณทั้งหมด
          </button>
          <button
            type="button"
            onClick={saveAll}
            disabled={isSaving}
            className="theme-btn-dark"
          >
            {isSaving ? "กำลังบันทึก..." : "เสร็จสิ้น/บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
