import BottomNavClient from "@/components/BottomNavClient";
import type { AuthUser } from "@/components/AuthNavClient";
import { getCurrentUser } from "@/lib/session";

export default async function BottomNav() {
  const user: AuthUser | null = await getCurrentUser();

  return <BottomNavClient key={user?.id ?? "guest"} initialUser={user} />;
}
