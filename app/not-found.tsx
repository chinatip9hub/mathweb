import Link from "next/link";

export default function NotFound() {
  return (
    <main className="theme-auth-shell">
      <section className="theme-card theme-auth-card p-8 text-center">
        <p className="theme-kicker">404</p>
        <h1 className="theme-card-title mt-2 text-2xl font-bold">
          ไม่พบหน้านี้
        </h1>
        <p className="theme-card-text mt-3 text-sm leading-6">
          ลิงก์อาจผิดหรือหน้านี้ถูกย้ายไปแล้ว
        </p>
        <Link href="/" className="theme-btn-primary mt-6 inline-flex">
          กลับหน้าแรก
        </Link>
      </section>
    </main>
  );
}
