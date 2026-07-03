import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await getCurrentUser();

    const run = await prisma.comparisonRun.findFirst({
      where: {
        OR: [{ id }, { shareToken: id }],
      },
      select: {
        id: true,
        shareToken: true,
        userId: true,
        scenariosJson: true,
        createdAt: true,
      },
    });

    if (!run) {
      return NextResponse.json({ message: "ไม่พบผลการคำนวณ" }, { status: 404 });
    }

    if (run.userId && user?.id !== run.userId && run.shareToken !== id) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    return NextResponse.json({
      runId: run.id,
      shareToken: run.shareToken,
      scenarios: run.scenariosJson,
      createdAt: run.createdAt,
    });
  } catch (error) {
    console.error("Get comparison run error", error);
    return NextResponse.json(
      { message: "โหลดผลไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
