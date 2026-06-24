import { NextRequest, NextResponse } from "next/server";
import type { LoanType } from "@/lib/bankRates";
import { getFeesForBank, getRatesForBank, getEffectiveFees, loanTypeHasAdditionalFees } from "@/lib/bankRates";
import { prisma } from "@/lib/prisma";
import { serializeScenario, toNumber } from "@/lib/scenario-serialize";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

function parseLoanType(value: unknown): LoanType {
  return value === "retention" ? "retention" : "refinance";
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const existingScenario = await prisma.calculationScenario.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingScenario) {
    return NextResponse.json(
      { message: "ไม่พบข้อมูลที่ต้องการแก้ไข" },
      { status: 404 },
    );
  }

  const bankName =
    typeof body?.bankName === "string" && body.bankName.trim()
      ? body.bankName.trim()
      : existingScenario.bankName;
  const loanType =
    body?.loanType !== undefined
      ? parseLoanType(body.loanType)
      : parseLoanType(existingScenario.loanType);
  const useCustomRates =
    typeof body?.useCustomRates === "boolean"
      ? body.useCustomRates
      : existingScenario.useCustomRates;
  const useCustomFees =
    loanTypeHasAdditionalFees(loanType) &&
    (typeof body?.useCustomFees === "boolean"
      ? body.useCustomFees
      : existingScenario.useCustomFees);
  const defaultRates = getRatesForBank(bankName, loanType);
  const defaultFees = getFeesForBank(bankName);
  const effectiveFees = getEffectiveFees(loanType, {
    Z: useCustomFees
      ? toNumber(body?.feeMortgage, Number(existingScenario.feeMortgage))
      : defaultFees.Z,
    I: useCustomFees
      ? toNumber(body?.feeStamp, Number(existingScenario.feeStamp))
      : defaultFees.I,
    P: useCustomFees
      ? toNumber(body?.feeAppraisal, Number(existingScenario.feeAppraisal))
      : defaultFees.P,
    G: useCustomFees
      ? toNumber(body?.feeInsurance, Number(existingScenario.feeInsurance))
      : defaultFees.G,
  });

  const scenario = await prisma.calculationScenario.update({
    where: { id },
    data: {
      bankName,
      loanType,
      principal: toNumber(body?.principal, Number(existingScenario.principal)),
      monthlyPayment: toNumber(
        body?.monthlyPayment,
        Number(existingScenario.monthlyPayment),
      ),
      rateYear1: useCustomRates
        ? toNumber(body?.rateYear1, Number(existingScenario.rateYear1))
        : defaultRates[0],
      rateYear2: useCustomRates
        ? toNumber(body?.rateYear2, Number(existingScenario.rateYear2))
        : defaultRates[1],
      rateYear3: useCustomRates
        ? toNumber(body?.rateYear3, Number(existingScenario.rateYear3))
        : defaultRates[2],
      useCustomRates,
      useCustomFees,
      feeMortgage: effectiveFees.Z,
      feeStamp: effectiveFees.I,
      feeAppraisal: effectiveFees.P,
      feeInsurance: effectiveFees.G,
      resultFinal:
        body?.resultFinal === null || body?.resultFinal === undefined
          ? existingScenario.resultFinal === null
            ? null
            : Number(existingScenario.resultFinal)
          : toNumber(body?.resultFinal),
    },
  });

  return NextResponse.json({ scenario: serializeScenario(scenario) });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.calculationScenario.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
