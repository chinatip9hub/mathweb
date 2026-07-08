"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!acceptedTerms) {
      setMessage("กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัวก่อนสมัคร");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, acceptedTerms: true }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setMessage(data?.message ?? "สมัครสมาชิกไม่สำเร็จ");
      return;
    }

    setMessage(data?.message ?? "สมัครสำเร็จ — ตรวจสอบอีเมลเพื่อยืนยันบัญชี");
    router.push("/");
    router.refresh();
  }

  return (
    <main className="theme-auth-shell">
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
          สมัครสมาชิก
        </h1>
        <p className="theme-card-text mt-2 text-center text-sm leading-6">
          สร้างบัญชีเพื่อบันทึกข้อมูลธนาคารและผลการคำนวณ
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="theme-label">ชื่อ</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="theme-input"
              placeholder="ชื่อของคุณ"
              autoComplete="name"
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
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="theme-label">รหัสผ่าน</span>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              minLength={8}
              placeholder="อย่างน้อย 8 ตัวอักษร"
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
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              autoComplete="new-password"
            />
          </label>

          {message && (
            <p
              className={
                message.includes("สำเร็จ")
                  ? "theme-alert-success"
                  : "theme-alert-error"
              }
            >
              {message}
            </p>
          )}

          <label className="flex items-start gap-2.5 text-xs leading-5 theme-card-text">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-orange-500"
            />
            <span>
              ฉันได้อ่านและยอมรับ{" "}
              <Link href="/terms" className="theme-link" target="_blank">
                ข้อกำหนดการใช้งาน
              </Link>{" "}
              และ{" "}
              <Link href="/privacy" className="theme-link" target="_blank">
                นโยบายความเป็นส่วนตัว
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !acceptedTerms}
            className="theme-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="theme-card-text mt-5 text-center text-sm">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="theme-link">
            เข้าสู่ระบบ
          </Link>
        </p>
      </section>
    </main>
  );
}
