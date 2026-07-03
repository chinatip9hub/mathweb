import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { changePasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`change-password:${user.id}:${ip}`, 8, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.json(
      { message: "ลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record) {
    return NextResponse.json({ message: "ไม่พบบัญชี" }, { status: 404 });
  }

  const isCurrentValid = await bcrypt.compare(
    parsed.data.currentPassword,
    record.passwordHash,
  );

  if (!isCurrentValid) {
    return NextResponse.json(
      { message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
      { status: 401 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
}
