"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
};

type AuthNavClientProps = {
  initialUser: AuthUser | null;
};

export default function AuthNavClient({ initialUser }: AuthNavClientProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setUser(null);
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-100 sm:inline">
          {user.name || user.email}
        </span>
        <button type="button" onClick={handleLogout} className="theme-btn-secondary">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link href="/login" className="theme-btn-secondary">
        Login
      </Link>
      <Link href="/register" className="theme-btn-primary">
        Register
      </Link>
    </div>
  );
}
