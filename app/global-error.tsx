"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-100 p-6 font-sans">
        <main className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">RefiLab</h1>
          <p className="mt-3 text-sm text-slate-600">
            เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            ลองใหม่
          </button>
        </main>
      </body>
    </html>
  );
}
