"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState("กำลังยืนยันอีเมล...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("ลิงก์ยืนยันไม่ถูกต้อง");
      return;
    }

    let cancelled = false;

    async function verify() {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json().catch(() => null);

      if (cancelled) {
        return;
      }

      if (response.ok) {
        setOk(true);
        setMessage(data?.message ?? "ยืนยันอีเมลเรียบร้อยแล้ว");
      } else {
        setMessage(data?.message ?? "ยืนยันอีเมลไม่สำเร็จ");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="theme-card theme-auth-card">
      <Image
        src="/icon.png"
        alt="RefiLab"
        width={48}
        height={48}
        className="theme-auth-logo"
        priority
      />
      <h1 className="theme-card-title mt-5 text-center text-2xl tracking-tight">
        ยืนยันอีเมล
      </h1>
      <p
        className={`mt-7 text-center text-sm ${
          ok ? "theme-alert-success" : "theme-card-text"
        }`}
      >
        {message}
      </p>
      {ok && (
        <p className="theme-card-text mt-5 text-center text-sm">
          <Link href="/" className="theme-link">
            ไปหน้าแรก →
          </Link>
        </p>
      )}
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="theme-auth-shell">
      <Suspense
        fallback={
          <section className="theme-card theme-auth-card p-8 text-center theme-card-text">
            กำลังโหลด...
          </section>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
