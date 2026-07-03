import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionExpiresAt,
  setSessionCookie,
} from "@/lib/auth";
import { createOpaqueToken, getTokenExpiresAt } from "@/lib/auth-tokens";
import { emailLayout, getAppUrl, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";

export const runtime = "nodejs";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`register:${ip}`, 8, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.json(
      { message: "ลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const verifyToken = createOpaqueToken();
    await prisma.verificationToken.create({
      data: {
        token: verifyToken,
        userId: user.id,
        expiresAt: getTokenExpiresAt(48),
      },
    });

    const verifyLink = `${getAppUrl()}/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: user.email,
      subject: "ยืนยันอีเมล RefiLab",
      html: emailLayout(
        "ยืนยันอีเมล",
        `<p>ขอบคุณที่สมัคร RefiLab กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมล (ใช้ได้ 48 ชั่วโมง)</p>
         <p><a href="${verifyLink}">${verifyLink}</a></p>`,
      ),
    });

    const token = createSessionToken();
    const expiresAt = getSessionExpiresAt();

    await prisma.session.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    const response = NextResponse.json(
      {
        user,
        message: "สมัครสำเร็จ — กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      },
      { status: 201 },
    );
    setSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว" },
        { status: 409 },
      );
    }

    console.error("Register error", error);
    return NextResponse.json(
      { message: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}
