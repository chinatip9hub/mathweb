import { redirect } from "next/navigation";
import CalculatorClient, {
  CalculatorScenario,
} from "@/components/CalculatorClient";
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
    principal: Number(scenario.principal),
    monthlyPayment: Number(scenario.monthlyPayment),
    defaultRate: Number(scenario.defaultRate),
    customRate:
      scenario.customRate === null ? null : Number(scenario.customRate),
    useCustomRate: scenario.useCustomRate,
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
