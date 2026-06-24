import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_BANKS } from "@/lib/banks";
import type { LoanType } from "@/lib/bankRates";
import { getFeesForBank, getRatesForBank } from "@/lib/bankRates";
import { prisma } from "@/lib/prisma";
import { serializeScenario, toNumber } from "@/lib/scenario-serialize";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

function parseLoanType(value: unknown): LoanType {
  return value === "retention" ? "retention" : "refinance";
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const scenarios = await prisma.calculationScenario.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "asc" }],
  });

  return NextResponse.json({
    scenarios: scenarios.map(serializeScenario),
    defaultBanks: DEFAULT_BANKS,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const bankName =
    typeof body?.bankName === "string" && body.bankName.trim()
      ? body.bankName.trim()
      : DEFAULT_BANKS[0];
  const loanType = parseLoanType(body?.loanType);
  const defaultRates = getRatesForBank(bankName, loanType);
  const defaultFees = getFeesForBank(bankName);
  const useCustomRates = Boolean(body?.useCustomRates);

  const scenario = await prisma.calculationScenario.create({
    data: {
      userId: user.id,
      bankName,
      loanType,
      principal: toNumber(body?.principal),
      monthlyPayment: toNumber(body?.monthlyPayment),
      rateYear1: useCustomRates
        ? toNumber(body?.rateYear1, defaultRates[0])
        : defaultRates[0],
      rateYear2: useCustomRates
        ? toNumber(body?.rateYear2, defaultRates[1])
        : defaultRates[1],
      rateYear3: useCustomRates
        ? toNumber(body?.rateYear3, defaultRates[2])
        : defaultRates[2],
      useCustomRates,
      feeMortgage: toNumber(body?.feeMortgage, defaultFees.Z),
      feeStamp: toNumber(body?.feeStamp, defaultFees.I),
      feeAppraisal: toNumber(body?.feeAppraisal, defaultFees.P),
      feeInsurance: toNumber(body?.feeInsurance, defaultFees.G),
      resultFinal:
        body?.resultFinal === null || body?.resultFinal === undefined
          ? null
          : toNumber(body?.resultFinal),
    },
  });

  return NextResponse.json(
    { scenario: serializeScenario(scenario) },
    { status: 201 },
  );
}
