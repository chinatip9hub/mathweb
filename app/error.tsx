"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="theme-auth-shell">
      <section className="theme-card theme-auth-card p-8 text-center">
        <p className="theme-kicker">เกิดข้อผิดพลาด</p>
        <h1 className="theme-card-title mt-2 text-2xl font-bold">
          มีบางอย่างผิดพลาด
        </h1>
        <p className="theme-card-text mt-3 text-sm leading-6">
          ระบบไม่สามารถโหลดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="theme-btn-primary">
            ลองใหม่
          </button>
          <Link href="/" className="theme-btn-outline">
            กลับหน้าแรก
          </Link>
        </div>
      </section>
    </main>
  );
}
