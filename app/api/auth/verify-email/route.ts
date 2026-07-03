import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "โทเคนไม่ถูกต้อง" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
    select: { id: true, userId: true, expiresAt: true },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "ลิงก์หมดอายุหรือไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.json({ message: "ยืนยันอีเมลเรียบร้อยแล้ว" });
}
