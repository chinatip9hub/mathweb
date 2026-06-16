import AuthNavClient, { AuthUser } from "@/components/AuthNavClient";
import { getCurrentUser } from "@/lib/session";

export default async function AuthNav() {
  const user: AuthUser | null = await getCurrentUser();

  return <AuthNavClient key={user?.id ?? "guest"} initialUser={user} />;
}
