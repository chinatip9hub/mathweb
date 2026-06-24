import { redirect } from "next/navigation";
import CalculatorClient, {
  CalculatorScenario,
} from "@/components/CalculatorClient";
import type { LoanType } from "@/lib/bankRates";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function CalculatorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const scenarios = await prisma.calculationScenario.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "asc" }],
  });

  const initialScenarios: CalculatorScenario[] = scenarios.map((scenario) => ({
    id: scenario.id,
    bankName: scenario.bankName,
    loanType: scenario.loanType as LoanType,
    principal: Number(scenario.principal),
    monthlyPayment: Number(scenario.monthlyPayment),
    rateYear1: Number(scenario.rateYear1),
    rateYear2: Number(scenario.rateYear2),
    rateYear3: Number(scenario.rateYear3),
    useCustomRates: scenario.useCustomRates,
    useCustomFees: scenario.useCustomFees,
    feeMortgage: Number(scenario.feeMortgage),
    feeStamp: Number(scenario.feeStamp),
    feeAppraisal: Number(scenario.feeAppraisal),
    feeInsurance: Number(scenario.feeInsurance),
    resultFinal:
      scenario.resultFinal === null ? null : Number(scenario.resultFinal),
    isSaved: true,
  }));

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <CalculatorClient initialScenarios={initialScenarios} />
      </div>
    </main>
  );
}
