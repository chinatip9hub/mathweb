export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden">
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="h-72 w-72 rounded-full bg-sky-200/60 blur-3xl sm:h-96 sm:w-96" />
        </div>

        <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          เปรียบเทียบรีไฟแนนซ์และรีเทนชั่นสินเชื่อบ้าน
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          เปรียบเทียบอัตราดอกเบี้ยบ้านจากหลายธนาคารได้ง่ายในที่เดียว
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          ข้อความ placeholder สำหรับอธิบายวิธีใช้เว็บ: กรอกข้อมูลสินเชื่อบ้าน
          เลือกธนาคารที่สนใจ แล้วเปรียบเทียบทางเลือกรีไฟแนนซ์หรือรีเทนชั่น
          เพื่อช่วยประกอบการตัดสินใจเบื้องต้น
        </p>

        <div className="mt-10 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-sky-600">ขั้นตอนที่ 1</p>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              ใส่ข้อมูลสินเชื่อ
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ข้อความ placeholder สำหรับยอดคงเหลือ ระยะเวลากู้ และดอกเบี้ยปัจจุบัน
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-sky-600">ขั้นตอนที่ 2</p>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              เปรียบเทียบข้อเสนอ
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ข้อความ placeholder สำหรับดูอัตราดอกเบี้ย เงื่อนไข และค่าใช้จ่าย
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-sky-600">ประโยชน์</p>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              ตัดสินใจง่ายขึ้น
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              ข้อความ placeholder สำหรับช่วยประหยัดเวลาและเห็นภาพรวมแต่ละธนาคาร
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-12 flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-[2rem] bg-sky-600 px-8 py-8 text-white shadow-xl shadow-sky-200 transition hover:-translate-y-1 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 sm:max-w-md"
        >
          <span className="relative flex h-20 w-24 items-end justify-center">
            <span className="absolute top-0 h-14 w-14 rotate-45 rounded-tl-lg bg-white" />
            <span className="relative h-14 w-20 rounded-b-2xl rounded-t-md bg-white" />
            <span className="absolute bottom-0 h-8 w-5 rounded-t-md bg-sky-600" />
          </span>
          <span className="text-lg font-bold sm:text-xl">
            เริ่มคำนวณอัตราดอกเบี้ย
          </span>
        </button>
      </section>
    </main>
  );
}
