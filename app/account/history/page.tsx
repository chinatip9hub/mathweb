import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/format-date";
import { getBankAbbreviation } from "@/lib/banks";
import { loanTypeLabel } from "@/lib/bankRates";
import {
  summarizeHistoryScenarios,
  type HistoryScenario,
} from "@/lib/history-summary";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency } from "@/lib/calculator";

export const metadata = {
  title: "ประวัติการคำนวณ | RefiLab",
};

function parseScenarios(value: unknown): HistoryScenario[] {
  return Array.isArray(value) ? (value as HistoryScenario[]) : [];
}

export default async function AccountHistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account/history");
  }

  const [runs, savedScenarios] = await Promise.all([
    prisma.comparisonRun.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        shareToken: true,
        createdAt: true,
        scenariosJson: true,
      },
    }),
    prisma.calculationScenario.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        bankName: true,
        loanType: true,
        principal: true,
        monthlyPayment: true,
        resultFinal: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6">
      <article className="theme-card space-y-8 p-6 sm:p-8">
        <div>
          <p className="theme-kicker">บัญชี</p>
          <h1 className="theme-card-title mt-2 text-2xl font-bold">
            ประวัติและข้อมูลที่บันทึก
          </h1>
          <p className="theme-card-text mt-2 text-sm leading-6">
            แสดงเฉพาะข้อมูลของบัญชีที่คุณเข้าสู่ระบบอยู่
            ไม่มีชื่อหรืออีเมลของผู้อื่นในหน้านี้
          </p>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="theme-card-title text-lg font-bold">
              รอบการเปรียบเทียบ
            </h2>
            <p className="theme-card-text mt-1 text-sm">
              บันทึกอัตโนมัติเมื่อกดคำนวณขณะล็อกอิน (สูงสุด 50 รายการล่าสุด)
            </p>
          </div>

          {runs.length === 0 ? (
            <p className="theme-card-text text-sm">
              ยังไม่มีประวัติ — ไปที่{" "}
              <Link href="/calculator" className="theme-link">
                หน้าคำนวณ
              </Link>{" "}
              แล้วกดคำนวณขณะเข้าสู่ระบบ
            </p>
          ) : (
            <ul className="space-y-3">
              {runs.map((run) => {
                const scenarios = parseScenarios(run.scenariosJson);
                const summary = summarizeHistoryScenarios(scenarios);

                return (
                  <li
                    key={run.id}
                    className="rounded-xl border border-slate-200 bg-white/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="theme-card-title text-sm font-semibold">
                          {formatThaiDateTime(run.createdAt)}
                        </p>
                        <p className="theme-card-text text-xs">
                          {summary.bankCount} ธนาคาร · {summary.loanTypeLabel}
                        </p>
                        {summary.bankAbbreviations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {summary.bankAbbreviations.map((bank) => (
                              <span
                                key={`${run.id}-${bank}`}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700"
                              >
                                {bank}
                              </span>
                            ))}
                          </div>
                        )}
                        {summary.bestBank && (
                          <p className="theme-card-text text-xs">
                            ต้นทุนต่ำสุดในรอบนี้:{" "}
                            <span className="font-semibold text-orange-700">
                              {summary.bestBank.bankShort}
                            </span>{" "}
                            ({formatCurrency(summary.bestBank.resultFinal)})
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/calculator/results?run=${run.shareToken}`}
                        className="theme-btn-outline shrink-0 text-center text-sm"
                      >
                        ดูผลลัพธ์
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="theme-card-title text-lg font-bold">
              ธนาคารที่บันทึกในหน้าคำนวณ
            </h2>
            <p className="theme-card-text mt-1 text-sm">
              ข้อมูลที่คุณกดบันทึกไว้ทีละธนาคาร — แก้ไขได้ที่หน้าคำนวณ
            </p>
          </div>

          {savedScenarios.length === 0 ? (
            <p className="theme-card-text text-sm">
              ยังไม่มีข้อมูลที่บันทึก — ล็อกอินแล้วกรอกข้อมูลที่{" "}
              <Link href="/calculator" className="theme-link">
                หน้าคำนวณ
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {savedScenarios.map((scenario) => (
                <li
                  key={scenario.id}
                  className="rounded-xl border border-slate-200 bg-white/60 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="theme-card-title text-sm font-semibold">
                        {getBankAbbreviation(scenario.bankName)}
                        <span className="theme-card-text font-normal">
                          {" "}
                          · {loanTypeLabel(scenario.loanType as "refinance" | "retention")}
                        </span>
                      </p>
                      <p className="theme-card-text mt-1 text-xs leading-5">
                        เงินต้น {formatCurrency(Number(scenario.principal))} · งวด{" "}
                        {formatCurrency(Number(scenario.monthlyPayment))}
                      </p>
                      <p className="theme-card-text text-xs">
                        บันทึกเมื่อ {formatThaiDateTime(scenario.createdAt)}
                        {scenario.updatedAt > scenario.createdAt
                          ? ` · แก้ไขล่าสุด ${formatThaiDateTime(scenario.updatedAt)}`
                          : ""}
                      </p>
                    </div>
                    <Link href="/calculator" className="theme-link shrink-0 text-sm">
                      ไปหน้าคำนวณ
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/account/profile" className="theme-link text-sm">
            โปรไฟล์
          </Link>
          <Link href="/" className="theme-link text-sm">
            ← กลับหน้าแรก
          </Link>
        </div>
      </article>
    </main>
  );
}
