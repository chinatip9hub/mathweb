import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionExpiresAt,
  setSessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "กรุณากรอกอีเมลให้ถูกต้อง" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
      { status: 400 },
    );
  }

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

    const token = createSessionToken();
    const expiresAt = getSessionExpiresAt();

    await prisma.session.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    const response = NextResponse.json({ user }, { status: 201 });
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
