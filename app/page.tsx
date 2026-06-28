import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  const calculatorHref = user ? "/calculator" : "/login?next=/calculator";

  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="theme-badge theme-animate-in mb-8">
          เปรียบเทียบรีไฟแนนซ์และรีเทนชั่นสินเชื่อบ้าน
        </div>

        <h1 className="theme-heading theme-animate-in theme-animate-delay-1 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          เปรียบเทียบอัตราดอกเบี้ยบ้านจากหลายธนาคารได้ง่ายในที่เดียว
        </h1>

        <p className="theme-subtext theme-animate-in theme-animate-delay-2 mt-6 max-w-2xl text-base leading-8 sm:text-lg">
          ข้อความ placeholder สำหรับอธิบายวิธีใช้เว็บ: กรอกข้อมูลสินเชื่อบ้าน
          เลือกธนาคารที่สนใจ แล้วเปรียบเทียบทางเลือกรีไฟแนนซ์หรือรีเทนชั่น
          เพื่อช่วยประกอบการตัดสินใจเบื้องต้น
        </p>

        <div className="theme-card theme-animate-in theme-animate-delay-3 group mt-10 w-full max-w-4xl overflow-hidden p-3 sm:p-4">
          <div className="overflow-hidden rounded-xl">
            <Image
              src="/home-hero-banner.png"
              alt="ภาพประกอบหน้าแรก"
              width={1024}
              height={341}
              priority
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
          <div className="theme-card theme-card-hover theme-animate-in theme-animate-delay-4 p-6">
            <p className="theme-kicker">ขั้นตอนที่ 1</p>
            <h2 className="theme-card-title mt-3 text-lg">ใส่ข้อมูลสินเชื่อ</h2>
            <p className="theme-card-text mt-2 text-sm leading-6">
              ข้อความ placeholder สำหรับยอดคงเหลือ ระยะเวลากู้ และดอกเบี้ยปัจจุบัน
            </p>
          </div>
          <div className="theme-card theme-card-hover theme-animate-in theme-animate-delay-5 p-6">
            <p className="theme-kicker">ขั้นตอนที่ 2</p>
            <h2 className="theme-card-title mt-3 text-lg">เปรียบเทียบข้อเสนอ</h2>
            <p className="theme-card-text mt-2 text-sm leading-6">
              ข้อความ placeholder สำหรับดูอัตราดอกเบี้ย เงื่อนไข และค่าใช้จ่าย
            </p>
          </div>
          <div className="theme-card theme-card-hover theme-animate-in theme-animate-delay-6 p-6">
            <p className="theme-kicker">ประโยชน์</p>
            <h2 className="theme-card-title mt-3 text-lg">ตัดสินใจง่ายขึ้น</h2>
            <p className="theme-card-text mt-2 text-sm leading-6">
              ข้อความ placeholder สำหรับช่วยประหยัดเวลาและเห็นภาพรวมแต่ละธนาคาร
            </p>
          </div>
        </div>

        <Link
          href={calculatorHref}
          className="theme-hero-btn theme-animate-in theme-animate-delay-6 mt-12 sm:max-w-md"
        >
          <span className="relative flex h-20 w-24 items-end justify-center">
            <span className="absolute top-0 h-14 w-14 rotate-45 rounded-tl-lg bg-white" />
            <span className="relative h-14 w-20 rounded-b-2xl rounded-t-md bg-white" />
            <span className="absolute bottom-0 h-8 w-5 rounded-t-md bg-accent-orange" />
          </span>
          <span className="text-lg font-bold sm:text-xl">
            เริ่มคำนวณอัตราดอกเบี้ย
          </span>
        </Link>
      </section>
    </main>
  );
}
