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
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-sky-600">Register</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          สมัครสมาชิก
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          สร้างบัญชีเพื่อเตรียมใช้งานฟีเจอร์บันทึกผลการคำนวณในอนาคต
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">ชื่อ</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="ชื่อของคุณ"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">อีเมล</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">รหัสผ่าน</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              ยืนยันรหัสผ่าน
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </label>

          {message && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-semibold text-sky-600">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
