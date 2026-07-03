"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("ลิงก์ไม่ถูกต้อง");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setMessage(data?.message ?? "ตั้งรหัสผ่านไม่สำเร็จ");
      return;
    }

    router.push("/login");
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
        ตั้งรหัสผ่านใหม่
      </h1>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="theme-label">รหัสผ่านใหม่</span>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="theme-label">ยืนยันรหัสผ่าน</span>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        {message && <p className="theme-alert-error">{message}</p>}

        <button
          type="submit"
          disabled={isLoading || !token}
          className="theme-btn-primary w-full disabled:cursor-not-allowed"
        >
          {isLoading ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
        </button>
      </form>

      <p className="theme-card-text mt-5 text-center text-sm">
        <Link href="/login" className="theme-link">
          ← กลับเข้าสู่ระบบ
        </Link>
      </p>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="theme-auth-shell">
      <Suspense
        fallback={
          <section className="theme-card theme-auth-card p-8 text-center theme-card-text">
            กำลังโหลด...
          </section>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
