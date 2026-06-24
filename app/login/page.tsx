"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
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

    const redirectTo =
      new URLSearchParams(window.location.search).get("next") ?? "/";

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <section className="theme-card w-full max-w-md p-8">
        <p className="theme-kicker">Login</p>
        <h1 className="theme-card-title mt-3 text-3xl tracking-tight">
          เข้าสู่ระบบ
        </h1>
        <p className="theme-card-text mt-4 text-sm leading-6">
          เข้าสู่ระบบเพื่อใช้งานข้อมูลและบันทึกการเปรียบเทียบในอนาคต
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="theme-label">อีเมล</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="theme-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="theme-label">รหัสผ่าน</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="theme-input"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </label>

          {message && <p className="theme-alert-error">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="theme-btn-primary w-full disabled:cursor-not-allowed"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "Login"}
          </button>
        </form>

        <p className="theme-card-text mt-6 text-center text-sm">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="theme-link">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
