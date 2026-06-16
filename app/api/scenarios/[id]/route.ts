import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function serializeScenario(scenario: {
  id: string;
  bankName: string;
  principal: unknown;
  monthlyPayment: unknown;
  defaultRate: unknown;
  customRate: unknown;
  useCustomRate: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: scenario.id,
    bankName: scenario.bankName,
    principal: Number(scenario.principal),
    monthlyPayment: Number(scenario.monthlyPayment),
    defaultRate: Number(scenario.defaultRate),
    customRate:
      scenario.customRate === null ? null : Number(scenario.customRate),
    useCustomRate: scenario.useCustomRate,
    createdAt: scenario.createdAt.toISOString(),
    updatedAt: scenario.updatedAt.toISOString(),
  };
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

  const scenario = await prisma.calculationScenario.update({
    where: { id },
    data: {
      bankName:
        typeof body?.bankName === "string" && body.bankName.trim()
          ? body.bankName.trim()
          : existingScenario.bankName,
      principal: toNumber(body?.principal, Number(existingScenario.principal)),
      monthlyPayment: toNumber(
        body?.monthlyPayment,
        Number(existingScenario.monthlyPayment),
      ),
      defaultRate: toNumber(
        body?.defaultRate,
        Number(existingScenario.defaultRate),
      ),
      customRate:
        body?.customRate === null || body?.customRate === ""
          ? null
          : toNumber(body?.customRate, Number(existingScenario.customRate ?? 0)),
      useCustomRate:
        typeof body?.useCustomRate === "boolean"
          ? body.useCustomRate
          : existingScenario.useCustomRate,
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
