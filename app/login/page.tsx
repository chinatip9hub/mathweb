"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setMessage(data?.message ?? "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    const redirectTo = searchParams.get("next") ?? "/";
    router.push(redirectTo);
    router.refresh();
  }

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
        เข้าสู่ระบบ
      </h1>
      <p className="theme-card-text mt-2 text-center text-sm leading-6">
        เข้าสู่ระบบเพื่อบันทึกและกลับมาแก้ไขข้อมูลคำนวณได้ทุกเมื่อ
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="theme-label">อีเมล</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="theme-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="theme-label">รหัสผ่าน</span>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            placeholder="อย่างน้อย 8 ตัวอักษร"
            autoComplete="current-password"
          />
        </label>

        <p className="text-right text-sm">
          <Link href="/forgot-password" className="theme-link">
            ลืมรหัสผ่าน?
          </Link>
        </p>

        {message && <p className="theme-alert-error">{message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="theme-btn-primary w-full disabled:cursor-not-allowed"
        >
          {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <p className="theme-card-text mt-5 text-center text-sm">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="theme-link">
          สมัครสมาชิก
        </Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="theme-auth-shell">
      <Suspense
        fallback={
          <section className="theme-card theme-auth-card p-8 text-center theme-card-text">
            กำลังโหลด...
          </section>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
