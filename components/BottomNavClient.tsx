"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AuthUser } from "@/components/AuthNavClient";
import UserAvatar from "@/components/UserAvatar";
import {
  hasCalculatorResultsServerSnapshot,
  hasCalculatorResultsSnapshot,
  subscribeToCalculatorResults,
} from "@/lib/calculator-storage";

type BottomNavClientProps = {
  initialUser: AuthUser | null;
};

const HIDDEN_PATHS: string[] = [];

function useHasCalculatorResults() {
  return useSyncExternalStore(
    subscribeToCalculatorResults,
    hasCalculatorResultsSnapshot,
    hasCalculatorResultsServerSnapshot,
  );
}

export default function BottomNavClient({ initialUser }: BottomNavClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userOverride, setUserOverride] = useState<AuthUser | null | undefined>(
    undefined,
  );
  const [trackedUserId, setTrackedUserId] = useState(initialUser?.id ?? null);
  const currentUserId = initialUser?.id ?? null;

  if (currentUserId !== trackedUserId) {
    setTrackedUserId(currentUserId);
    setUserOverride(undefined);
  }

  const user = userOverride !== undefined ? userOverride : initialUser;

  // Revalidate auth on the client. Some devices (iOS Safari, in-app browsers)
  // restore a stale guest render from bfcache after login, so we confirm the
  // real session on mount and whenever the page is restored from cache.
  useEffect(() => {
    let cancelled = false;

    async function syncUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (cancelled) {
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as { user: AuthUser | null };
          setUserOverride(data.user ?? null);
        } else {
          setUserOverride(null);
        }
      } catch {
        // ignore network errors; keep current state
      }
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void syncUser();
      }
    }

    void syncUser();
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountPath, setAccountPath] = useState(pathname);

  if (pathname !== accountPath) {
    setAccountPath(pathname);
    if (accountOpen) {
      setAccountOpen(false);
    }
  }

  const hasResults = useHasCalculatorResults();

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  const calculatorHref = "/calculator";
  const resultsHref = "/calculator/results";

  const homeActive = pathname === "/";
  const calcActive =
    pathname.startsWith("/calculator") &&
    !pathname.startsWith("/calculator/results");
  const resultsActive = pathname.startsWith("/calculator/results");
  const accountActive = accountOpen || pathname.startsWith("/account");

  const activeIndex = accountOpen
    ? 3
    : pathname.startsWith("/account")
      ? 3
      : resultsActive
        ? 2
        : calcActive
          ? 1
          : 0;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserOverride(null);
    setAccountOpen(false);
    router.refresh();
    router.push("/");
  }

  function closeAccountMenu() {
    setAccountOpen(false);
  }

  return (
    <>
      {accountOpen && (
        <button
          type="button"
          aria-label="ปิดเมนูบัญชี"
          className="theme-bottom-sheet-backdrop fixed inset-0 z-40 bg-black/30"
          onClick={() => setAccountOpen(false)}
        />
      )}

      {accountOpen && (
        <div className="theme-bottom-sheet fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 mx-auto w-full max-w-lg px-4">
          <div className="theme-card p-5">
            {user ? (
              <>
                <Link
                  href="/account/profile"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 rounded-xl transition hover:bg-orange-50/80"
                >
                  <UserAvatar
                    name={user.name}
                    email={user.email}
                    avatarId={user.avatarId}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="theme-card-title truncate font-semibold">
                      {user.name || "ผู้ใช้"}
                    </p>
                    <p className="theme-card-text truncate text-sm">{user.email}</p>
                  </div>
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setAccountOpen(false)}
                  className="theme-btn-primary mt-4 block w-full text-center"
                >
                  ตั้งค่าบัญชี
                </Link>
                <Link
                  href="/account/history"
                  onClick={() => setAccountOpen(false)}
                  className="theme-btn-outline mt-3 block w-full text-center"
                >
                  ประวัติการคำนวณ
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="theme-btn-outline mt-3 w-full"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <p className="theme-card-title font-semibold">เข้าสู่ระบบเพื่อบันทึกข้อมูล</p>
                <p className="theme-card-text mt-1 text-sm">
                  คำนวณและดูผลลัพธ์ได้โดยไม่ต้องสมัคร — เข้าสู่ระบบเมื่อต้องการบันทึกข้อมูลธนาคาร
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href="/login" className="theme-btn-primary flex-1 text-center">
                    เข้าสู่ระบบ
                  </Link>
                  <Link href="/register" className="theme-btn-outline flex-1 text-center">
                    สมัครสมาชิก
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="theme-bottom-nav" aria-label="เมนูหลัก">
        <div className="theme-bottom-nav-pill">
          <div
            className="theme-bottom-nav-indicator"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
            aria-hidden
          />

          <Link
            href="/"
            onClick={closeAccountMenu}
            className={`theme-bottom-nav-item ${homeActive && !accountOpen ? "is-active" : ""}`}
          >
            หน้าแรก
          </Link>

          <Link
            href={calculatorHref}
            onClick={closeAccountMenu}
            className={`theme-bottom-nav-item ${calcActive && !accountOpen ? "is-active" : ""}`}
          >
            คำนวณ
          </Link>

          {hasResults ? (
            <Link
              href={resultsHref}
              onClick={closeAccountMenu}
              className={`theme-bottom-nav-item ${resultsActive && !accountOpen ? "is-active" : ""}`}
            >
              ผลลัพธ์
            </Link>
          ) : (
            <span
              className="theme-bottom-nav-item is-disabled"
              aria-disabled="true"
              title="คำนวณก่อนเพื่อดูผลลัพธ์"
            >
              ผลลัพธ์
            </span>
          )}

          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            className={`theme-bottom-nav-item ${accountActive ? "is-active" : ""}`}
            aria-expanded={accountOpen}
            aria-label="บัญชี"
          >
            บัญชี
          </button>
        </div>
      </nav>
    </>
  );
}
