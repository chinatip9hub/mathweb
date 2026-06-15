import { cookies } from "next/headers";
import AuthNavClient, { AuthUser } from "@/components/AuthNavClient";
import { SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  let user: AuthUser | null = null;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (session && session.expiresAt > new Date()) {
      user = session.user;
    }
  }

  return <AuthNavClient key={user?.id ?? "guest"} initialUser={user} />;
}
