import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionExpiresAt,
  setSessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`login:${ip}`, 12, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.json(
      { message: "ลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  const isPasswordValid =
    user && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !isPasswordValid) {
    return NextResponse.json(
      { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );
  }

  const token = createSessionToken();
  const expiresAt = getSessionExpiresAt();

  await prisma.session.create({
    data: {
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
    },
  });
  setSessionCookie(response, token, expiresAt);

  return response;
}
