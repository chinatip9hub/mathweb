"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type DeliveryMode = "email" | "dev" | null;

type ForgotPasswordFormProps = {
  contactEmail?: string;
};

export default function ForgotPasswordForm({
  contactEmail = "",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setDelivery(null);
    setIsLoading(true);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok) {
      setMessage(data?.message ?? "ส่งคำขอไม่สำเร็จ");
      return;
    }

    setSent(true);
    setDelivery(data?.delivery === "dev" ? "dev" : "email");
    setMessage(
      data?.message ??
        "หากอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้",
    );
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
          ลืมรหัสผ่าน
        </h1>
        <p className="theme-card-text mt-2 text-center text-sm leading-6">
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่
        </p>

        {sent ? (
          <div className="mt-7 space-y-3">
            <p className="theme-alert-success text-center text-sm">{message}</p>
            {delivery === "email" && (
              <p className="theme-card-text text-center text-xs leading-5">
                ยังไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์สแปม หรือรอสักครู่แล้วลองใหม่
                {contactEmail ? (
                  <>
                    {" "}
                    หากยังไม่ได้รับ ติดต่อ{" "}
                    <a href={`mailto:${contactEmail}`} className="theme-link">
                      {contactEmail}
                    </a>{" "}
                    ได้
                  </>
                ) : (
                  <>
                    {" "}
                    หากยังไม่ได้รับ สามารถติดต่อเราได้ตามช่องทางในหน้า{" "}
                    <Link href="/privacy" className="theme-link">
                      นโยบายความเป็นส่วนตัว
                    </Link>
                  </>
                )}
              </p>
            )}
            {delivery === "dev" && (
              <p className="theme-card-text text-center text-xs leading-5">
                โหมดพัฒนา — ดูรายละเอียดใน terminal ที่รัน{" "}
                <code className="rounded bg-slate-100 px-1">npm run dev</code>
                {message.includes("ไม่พบบัญชี") ? (
                  <>
                    {" "}
                    · ถ้ายังไม่เคยสมัคร ไปที่{" "}
                    <Link href="/register" className="theme-link">
                      สมัครสมาชิก
                    </Link>
                  </>
                ) : (
                  <> · Resend อาจส่งเมลจริงไม่ได้จนกว่าจะ verify โดเมน</>
                )}
              </p>
            )}
          </div>
        ) : (
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

            {message && <p className="theme-alert-error">{message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="theme-btn-primary w-full disabled:cursor-not-allowed"
            >
              {isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
          </form>
        )}

        <p className="theme-card-text mt-5 text-center text-sm">
          <Link href="/login" className="theme-link">
            ← กลับเข้าสู่ระบบ
          </Link>
        </p>
      </section>
    </main>
  );
}
