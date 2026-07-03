import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";
import { resolveAvatarId } from "@/lib/avatars";
import { formatThaiDate } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "โปรไฟล์ | RefiLab",
};

export default async function AccountProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account/profile");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarId: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!profile) {
    redirect("/login?next=/account/profile");
  }

  const resolvedAvatarId = resolveAvatarId(profile.avatarId);
  if (profile.avatarId && resolvedAvatarId && profile.avatarId !== resolvedAvatarId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarId: resolvedAvatarId },
    });
    profile.avatarId = resolvedAvatarId;
  }

  return (
    <ProfileClient
      profile={{
        ...profile,
        emailVerifiedAt: profile.emailVerifiedAt?.toISOString() ?? null,
        createdAt: profile.createdAt.toISOString(),
        memberSince: formatThaiDate(profile.createdAt),
      }}
    />
  );
}
