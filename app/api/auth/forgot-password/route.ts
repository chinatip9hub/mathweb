import { NextRequest, NextResponse } from "next/server";
import { emailLayout, getAppUrl, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createOpaqueToken, getTokenExpiresAt } from "@/lib/auth-tokens";
import { forgotPasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.json(
      { message: "ลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "กรุณากรอกอีเมลให้ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true },
    });

    if (user) {
      const token = createOpaqueToken();
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: getTokenExpiresAt(2),
        },
      });

      const link = `${getAppUrl()}/reset-password?token=${token}`;

      if (process.env.NODE_ENV === "development") {
        console.info("[RefiLab password reset]", {
          to: user.email,
          link,
        });
      }

      const emailResult = await sendEmail({
        to: user.email,
        subject: "รีเซ็ตรหัสผ่าน RefiLab",
        html: emailLayout(
          "รีเซ็ตรหัสผ่าน",
          `<p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ใช้ได้ 2 ชั่วโมง)</p>
           <p><a href="${link}">${link}</a></p>`,
        ),
      });

      if (!emailResult.ok) {
        return NextResponse.json(
          { message: "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่ภายหลัง" },
          { status: 500 },
        );
      }

      if (emailResult.dev) {
        return NextResponse.json({
          delivery: "dev",
          message:
            "สร้างลิงก์รีเซ็ตแล้ว — Resend ยังส่งอีเมลจริงไม่ได้ (ต้อง verify โดเมน) ดูลิงก์ใน terminal ที่รัน npm run dev",
        });
      }

      return NextResponse.json({
        delivery: "email",
        message:
          "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลและโฟลเดอร์สแปม (ใช้ได้ 2 ชั่วโมง)",
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        "[RefiLab password reset] skipped — no account for email:",
        parsed.data.email,
      );
    }

    return NextResponse.json({
      delivery:
        process.env.NODE_ENV === "development" ? "dev" : "email",
      message:
        process.env.NODE_ENV === "development"
          ? "ไม่พบบัญชีอีเมลนี้ในระบบ RefiLab — ลองสมัครที่ /register หรือใช้อีเมลที่เคยสมัครจริง"
          : "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้",
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return NextResponse.json(
      { message: "ส่งคำขอไม่สำเร็จ กรุณารีสตาร์ทเซิร์ฟเวอร์แล้วลองใหม่" },
      { status: 500 },
    );
  }
}
