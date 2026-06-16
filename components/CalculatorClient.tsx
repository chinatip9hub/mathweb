"use client";

import { useMemo, useState } from "react";
import { DEFAULT_BANK_RATE, DEFAULT_BANKS } from "@/lib/banks";

export type CalculatorScenario = {
  id: string;
  bankName: string;
  principal: number;
  monthlyPayment: number;
  defaultRate: number;
  customRate: number | null;
  useCustomRate: boolean;
  isSaved: boolean;
};

type CalculatorClientProps = {
  initialScenarios: CalculatorScenario[];
};

function createDefaultScenarios(): CalculatorScenario[] {
  return DEFAULT_BANKS.map((bankName) => ({
    id: `new-${bankName}`,
    bankName,
    principal: 0,
    monthlyPayment: 0,
    defaultRate: DEFAULT_BANK_RATE,
    customRate: null,
    useCustomRate: false,
    isSaved: false,
  }));
}

function calculateScenario(scenario: CalculatorScenario) {
  const rate = scenario.useCustomRate
    ? scenario.customRate ?? 0
    : scenario.defaultRate;
  const monthlyInterest = scenario.principal * (rate / 100 / 12);
  const estimatedRemaining = Math.max(
    scenario.principal + monthlyInterest - scenario.monthlyPayment,
    0,
  );

  return {
    rate,
    monthlyInterest,
    estimatedRemaining,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CalculatorClient({
  initialScenarios,
}: CalculatorClientProps) {
  const [scenarios, setScenarios] = useState<CalculatorScenario[]>(
    initialScenarios.length > 0 ? initialScenarios : createDefaultScenarios(),
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const summary = useMemo(() => {
    return scenarios.reduce(
      (total, scenario) => {
        const result = calculateScenario(scenario);
        return {
          monthlyInterest: total.monthlyInterest + result.monthlyInterest,
          estimatedRemaining:
            total.estimatedRemaining + result.estimatedRemaining,
        };
      },
      { monthlyInterest: 0, estimatedRemaining: 0 },
    );
  }, [scenarios]);

  function updateScenario(
    id: string,
    changes: Partial<Omit<CalculatorScenario, "id" | "isSaved">>,
  ) {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id === id ? { ...scenario, ...changes } : scenario,
      ),
    );
  }

  function addScenario() {
    setScenarios((currentScenarios) => [
      ...currentScenarios,
      {
        id: `new-${crypto.randomUUID()}`,
        bankName: "ธนาคารใหม่",
        principal: 0,
        monthlyPayment: 0,
        defaultRate: DEFAULT_BANK_RATE,
        customRate: null,
        useCustomRate: false,
        isSaved: false,
      },
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
              body: JSON.stringify({
                bankName: scenario.bankName,
                principal: scenario.principal,
                monthlyPayment: scenario.monthlyPayment,
                defaultRate: scenario.defaultRate,
                customRate: scenario.customRate,
                useCustomRate: scenario.useCustomRate,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Save failed");
          }

          const data = await response.json();
          return {
            ...data.scenario,
            isSaved: true,
          };
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
    setShowResults(true);
    setMessage("คำนวณเบื้องต้นเรียบร้อยแล้ว");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-600">
              เครื่องมือคำนวณ
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              เปรียบเทียบอัตราดอกเบี้ยแต่ละธนาคาร
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              กรอกเงินต้น ค่างวด และเลือกใช้อัตราดอกเบี้ยตั้งต้นหรือกำหนดเอง
              จากนั้นกดคำนวณหรือบันทึกข้อมูลไว้กับบัญชีของคุณ
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addScenario}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              เพิ่มบล็อก
            </button>
            <button
              type="button"
              onClick={calculateAll}
              className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              คำนวณทั้งหมด
            </button>
            <button
              type="button"
              onClick={saveAll}
              disabled={isSaving}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "กำลังบันทึก..." : "เสร็จสิ้น/บันทึก"}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {message}
          </p>
        )}
      </div>

      <div className="grid gap-5">
        {scenarios.map((scenario, index) => {
          const result = calculateScenario(scenario);

          return (
            <section
              key={scenario.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    บล็อกที่ {index + 1}
                  </p>
                  <input
                    type="text"
                    value={scenario.bankName}
                    onChange={(event) =>
                      updateScenario(scenario.id, {
                        bankName: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-xl font-bold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:min-w-80"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteScenario(scenario.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  ลบบล็อก
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    เงินต้น
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={scenario.principal}
                    onChange={(event) =>
                      updateScenario(scenario.id, {
                        principal: Number(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    ค่างวด
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={scenario.monthlyPayment}
                    onChange={(event) =>
                      updateScenario(scenario.id, {
                        monthlyPayment: Number(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    อัตราดอกเบี้ยตั้งต้น (%)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={scenario.defaultRate}
                    onChange={(event) =>
                      updateScenario(scenario.id, {
                        defaultRate: Number(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    อัตราที่กำหนดเอง (%)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={scenario.customRate ?? ""}
                    onChange={(event) =>
                      updateScenario(scenario.id, {
                        customRate:
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="กรอกเองได้"
                  />
                </label>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={scenario.useCustomRate}
                  onChange={(event) =>
                    updateScenario(scenario.id, {
                      useCustomRate: event.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-slate-300 text-sky-600"
                />
                ใช้อัตราดอกเบี้ยที่กำหนดเองแทนอัตราตั้งต้น
              </label>

              {showResults && (
                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
                  <p>
                    อัตราที่ใช้:{" "}
                    <span className="font-semibold text-slate-950">
                      {result.rate.toFixed(2)}%
                    </span>
                  </p>
                  <p>
                    ดอกเบี้ยประมาณ/เดือน:{" "}
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(result.monthlyInterest)}
                    </span>
                  </p>
                  <p>
                    ยอดหลังชำระงวดแรก:{" "}
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(result.estimatedRemaining)}
                    </span>
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {showResults && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">สรุปรวมเบื้องต้น</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              ดอกเบี้ยรวมประมาณ/เดือน:{" "}
              <span className="font-semibold text-slate-950">
                {formatCurrency(summary.monthlyInterest)}
              </span>
            </p>
            <p>
              ยอดคงเหลือรวมหลังชำระงวดแรก:{" "}
              <span className="font-semibold text-slate-950">
                {formatCurrency(summary.estimatedRemaining)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
