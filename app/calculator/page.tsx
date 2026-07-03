import CalculatorClient, {
  CalculatorScenario,
} from "@/components/CalculatorClient";
import type { LoanType } from "@/lib/bankRates";
import { getDefaultScenarioFeeInputs } from "@/lib/bankRates";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function CalculatorPage() {
  const user = await getCurrentUser();

  let initialScenarios: CalculatorScenario[] = [];

  if (user) {
    const scenarios = await prisma.calculationScenario.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: "asc" }],
    });

    initialScenarios = scenarios.map((scenario) => {
      const loanType = scenario.loanType as LoanType;
      const defaultFees =
        loanType === "refinance"
          ? getDefaultScenarioFeeInputs(scenario.bankName)
          : null;
      const feeMortgage = Number(scenario.feeMortgage);
      const feeStamp = Number(scenario.feeStamp);

      return {
        id: scenario.id,
        bankName: scenario.bankName,
        loanType,
        principal: Number(scenario.principal),
        monthlyPayment: Number(scenario.monthlyPayment),
        rateYear1: Number(scenario.rateYear1),
        rateYear2: Number(scenario.rateYear2),
        rateYear3: Number(scenario.rateYear3),
        useCustomRates: scenario.useCustomRates,
        useCustomFees: scenario.useCustomFees,
        feeMortgage:
          defaultFees && !scenario.useCustomFees && feeMortgage === 0 && feeStamp === 0
            ? defaultFees.feeMortgagePct
            : feeMortgage,
        feeStamp:
          defaultFees && !scenario.useCustomFees && feeMortgage === 0 && feeStamp === 0
            ? defaultFees.feeStampPct
            : feeStamp,
        feeAppraisal: Number(scenario.feeAppraisal),
        feeInsurance: Number(scenario.feeInsurance),
        resultFinal:
          scenario.resultFinal === null ? null : Number(scenario.resultFinal),
        isSaved: true,
      };
    });
  }

  return (
    <main className="min-h-[calc(100vh-5rem-env(safe-area-inset-bottom))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <CalculatorClient
          initialScenarios={initialScenarios}
          isLoggedIn={Boolean(user)}
        />
      </div>
    </main>
  );
}
