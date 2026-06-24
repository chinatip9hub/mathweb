"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setMessage(data?.message ?? "สมัครสมาชิกไม่สำเร็จ");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <section className="theme-card w-full max-w-md p-8">
        <p className="theme-kicker">Register</p>
        <h1 className="theme-card-title mt-3 text-3xl tracking-tight">
          สมัครสมาชิก
        </h1>
        <p className="theme-card-text mt-4 text-sm leading-6">
          สร้างบัญชีเพื่อเตรียมใช้งานฟีเจอร์บันทึกผลการคำนวณในอนาคต
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="theme-label">ชื่อ</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="theme-input"
              placeholder="ชื่อของคุณ"
            />
          </label>

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
              minLength={8}
              className="theme-input"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </label>

          <label className="block">
            <span className="theme-label">ยืนยันรหัสผ่าน</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="theme-input"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </label>

          {message && <p className="theme-alert-error">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="theme-btn-primary w-full disabled:cursor-not-allowed"
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "Register"}
          </button>
        </form>

        <p className="theme-card-text mt-6 text-center text-sm">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="theme-link">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
