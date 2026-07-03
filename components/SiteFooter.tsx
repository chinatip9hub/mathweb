import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/40 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-sm theme-card-text print:hidden">
      <p className="font-medium theme-card-title">RefiLab</p>
      <p className="mt-1 text-xs leading-5">
        เครื่องมือเปรียบเทียบสินเชื่อบ้าน — ผลลัพธ์เป็นการประมาณการเท่านั้น
      </p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/privacy" className="theme-link text-xs">
          นโยบายความเป็นส่วนตัว
        </Link>
        <Link href="/terms" className="theme-link text-xs">
          ข้อกำหนดการใช้งาน
        </Link>
        <Link href="/disclaimer" className="theme-link text-xs">
          ข้อจำกัดความรับผิดชอบ
        </Link>
      </nav>
      <p className="mt-3 text-xs text-slate-500">© 2026 RefiLab</p>
    </footer>
  );
}
