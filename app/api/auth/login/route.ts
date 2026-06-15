import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionExpiresAt,
  setSessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "กรุณากรอกอีเมลและรหัสผ่าน" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
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
    },
  });
  setSessionCookie(response, token, expiresAt);

  return response;
}
