import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { comparisonRunSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const runs = await prisma.comparisonRun.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        shareToken: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("List comparison runs error", error);
    return NextResponse.json(
      { message: "โหลดประวัติไม่สำเร็จ" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`comparison-run:${ip}`, 30, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.json(
      { message: "ลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = comparisonRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const user = await getCurrentUser();

    const run = await prisma.comparisonRun.create({
      data: {
        userId: user?.id ?? null,
        scenariosJson: parsed.data.scenarios,
      },
      select: {
        id: true,
        shareToken: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      runId: run.id,
      shareToken: run.shareToken,
      createdAt: run.createdAt,
    });
  } catch (error) {
    console.error("Create comparison run error", error);
    return NextResponse.json(
      { message: "บันทึกผลไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
