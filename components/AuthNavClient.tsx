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
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:inline">
          {user.name || user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Register
      </Link>
    </div>
  );
}
