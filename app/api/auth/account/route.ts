import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { resolveAvatarId } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({ message: "ลบบัญชีเรียบร้อยแล้ว" });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Delete account error", error);
    return NextResponse.json(
      { message: "ลบบัญชีไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  try {
    const data: {
      name?: string | null;
      avatarId?: string | null;
    } = {};

    if (parsed.data.name !== undefined) {
      data.name = parsed.data.name || null;
    }

    if (parsed.data.avatarId !== undefined) {
      data.avatarId = resolveAvatarId(parsed.data.avatarId);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarId: true,
      },
    });

    const message =
      parsed.data.avatarId !== undefined && parsed.data.name === undefined
        ? "บันทึกรูปโปรไฟล์เรียบร้อยแล้ว"
        : parsed.data.name !== undefined && parsed.data.avatarId === undefined
          ? "บันทึกชื่อเรียบร้อยแล้ว"
          : "บันทึกโปรไฟล์เรียบร้อยแล้ว";

    return NextResponse.json({
      message,
      user: updated,
    });
  } catch (error) {
    console.error("Update profile error", error);
    return NextResponse.json(
      { message: "บันทึกไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 },
    );
  }
}
