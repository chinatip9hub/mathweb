import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_BANK_RATE, DEFAULT_BANKS } from "@/lib/banks";
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
    defaultBanks: DEFAULT_BANKS.map((bankName) => ({
      bankName,
      defaultRate: DEFAULT_BANK_RATE,
    })),
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
      : "ธนาคารใหม่";
  const useCustomRate = Boolean(body?.useCustomRate);
  const customRate =
    body?.customRate === null || body?.customRate === ""
      ? null
      : toNumber(body?.customRate);

  const scenario = await prisma.calculationScenario.create({
    data: {
      userId: user.id,
      bankName,
      principal: toNumber(body?.principal),
      monthlyPayment: toNumber(body?.monthlyPayment),
      defaultRate: toNumber(body?.defaultRate, DEFAULT_BANK_RATE),
      customRate,
      useCustomRate,
    },
  });

  return NextResponse.json(
    { scenario: serializeScenario(scenario) },
    { status: 201 },
  );
}
