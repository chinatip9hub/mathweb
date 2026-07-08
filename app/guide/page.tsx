import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "วิธีใช้งาน | RefiLab",
  description:
    "คู่มือทดลองใช้ RefiLab เปรียบเทียบรีไฟแนนซ์และรีเทนชันสินเชื่อบ้าน",
};

const STEPS = [
  {
    num: 1,
    title: "เปิดเว็บไซต์ RefiLab",
    body: (
      <>
        เข้าหน้าแรกของ RefiLab จะเห็นปุ่มเริ่มใช้งาน
        กด <strong>「เริ่มคำนวณ」</strong> หรือเมนู{" "}
        <strong>「คำนวณ」</strong> ด้านล่าง
      </>
    ),
    images: [{ src: "/guide/step-01-home.png", alt: "หน้าแรก RefiLab" }],
  },
  {
    num: 2,
    title: "กรอกข้อมูลพื้นฐาน (ใช้ได้ทุกธนาคาร)",
    body: (
      <>
        ในหน้า <strong>「คำนวณ」</strong> กรอกในส่วน{" "}
        <strong>「กรอกครั้งเดียว ใช้ได้ทุกธนาคาร」</strong> ได้แก่ เงินต้น
        ค่างวดต่อเดือน และประเภทสินเชื่อ:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>รีไฟแนนซ์</strong> — ย้ายสินเชื่อไปธนาคารอื่น
          </li>
          <li>
            <strong>รีเทนชัน</strong> — ต่อสัญญากับธนาคารเดิม
          </li>
        </ul>
        <p className="mt-2">
          จากนั้นกดปุ่ม <strong>「ใช้…ทุกธนาคาร」</strong>{" "}
          เพื่อคัดลอกค่าไปทุกธนาคารพร้อมกัน
        </p>
      </>
    ),
    images: [
      { src: "/guide/step-02-bulk-entry.png", alt: "กรอกข้อมูลพื้นฐานทุกธนาคาร" },
    ],
  },
  {
    num: 3,
    title: "ตั้งค่าแต่ละธนาคาร (ถ้าต้องการ)",
    body: (
      <>
        เลือกธนาคารจากแถบด้านบน แล้วปรับรายละเอียดเพิ่มเติมได้ เช่น
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            อัตราดอกเบี้ย 3 ปี (ใช้ค่าเริ่มต้นธนาคาร หรือติ๊ก「กำหนดอัตราเอง」)
          </li>
          <li>
            ค่าใช้จ่ายเพิ่มเติม เช่น ค่าจดจำนอง ค่าอากรแสตมป์ ค่าประเมิน
            ค่าประกัน
          </li>
        </ul>
        <p className="mt-2">
          กด <strong>「เสร็จสิ้น/บันทึก」</strong>{" "}
          เมื่อกรอกครบทุกธนาคารที่ต้องการเปรียบเทียบ
        </p>
      </>
    ),
    tip: "อัตราดอกเบี้ยในระบบเป็นข้อมูลอ้างอิงที่รวบรวมไว้ สามารถแก้เป็นค่าจากใบเสนอของธนาคารจริงได้",
    images: [{ src: "/guide/step-03-fill-data.png", alt: "ตั้งค่าแต่ละธนาคาร" }],
  },
  {
    num: 4,
    title: "ดูผลเปรียบเทียบธนาคาร",
    body: (
      <>
        ไปที่เมนู <strong>「ผลลัพธ์」</strong>{" "}
        ระบบจะเรียงธนาคารจากต้นทุนรวมต่ำสุดและแสดงธนาคารที่แนะนำ
        สลับดูได้หลายรูปแบบ:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>สรุป</strong> — เปรียบเทียบอัตราดอกเบี้ยเฉลี่ยและยอดคงเหลือหลังผ่อน
            3 ปี
          </li>
          <li>
            <strong>กราฟ</strong> — ดูดอกเบี้ยสะสม / ต้นทุนรวม 3 ปีของแต่ละธนาคาร
          </li>
          <li>
            <strong>ตาราง / รายละเอียด</strong> — ดูตัวเลขละเอียดเพิ่มเติม
          </li>
        </ul>
      </>
    ),
    tip: "กด「กลับไปแก้ไขข้อมูล」ได้ถ้าต้องการเปลี่ยนตัวเลขแล้วคำนวณใหม่",
    images: [
      {
        label: "4.1 แท็บ「สรุป」— เปรียบเทียบธนาคารที่แนะนำ",
        src: "/guide/step-04-results-summary.png",
        alt: "ผลเปรียบเทียบแท็บสรุป",
      },
      {
        label: "4.2 แท็บ「กราฟ」— ดูดอกเบี้ยรวม 3 ปีของแต่ละธนาคาร",
        src: "/guide/step-04-results-graph.png",
        alt: "ผลเปรียบเทียบแท็บกราฟ",
      },
    ],
  },
] as const;

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <article className="theme-card space-y-8 p-6 sm:p-8">
        <div className="text-center">
          <p className="theme-kicker">คู่มือ</p>
          <h1 className="theme-card-title mt-2 text-2xl font-bold sm:text-3xl">
            วิธีใช้งาน RefiLab
          </h1>
          <p className="theme-card-text mx-auto mt-3 max-w-xl text-sm leading-7">
            คู่มือทดลองใช้เว็บเปรียบเทียบรีไฟแนนซ์และรีเทนชันสินเชื่อบ้าน
            ไม่ต้องติดตั้งแอป — เปิดผ่านมือถือหรือคอมพิวเตอร์ได้เลย
            (ล็อกอินเพื่อบันทึกข้อมูลเป็นทางเลือก ไม่บังคับ)
          </p>
          <Link href="/calculator" className="theme-btn-primary mt-5 inline-flex">
            เริ่มคำนวณเลย →
          </Link>
        </div>

        {STEPS.map((step) => (
          <section key={step.num} className="border-t border-slate-200/80 pt-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                {step.num}
              </span>
              <h2 className="theme-card-title pt-1.5 text-xl font-bold">
                {step.title}
              </h2>
            </div>
            <div className="theme-card-text mt-3 pl-0 text-sm leading-7 sm:pl-15">
              {step.body}
            </div>
            <div className="mt-4 space-y-4 sm:pl-15">
              {step.images.map((img) => (
                <figure key={img.src}>
                  {"label" in img && img.label ? (
                    <figcaption className="theme-card-title mb-2 text-sm font-semibold">
                      {img.label}
                    </figcaption>
                  ) : null}
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1920}
                      height={1080}
                      className="h-auto w-full"
                      sizes="(max-width: 768px) 100vw, 720px"
                    />
                  </div>
                </figure>
              ))}
            </div>
            {"tip" in step && step.tip ? (
              <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800 sm:ml-15">
                💡 {step.tip}
              </p>
            ) : null}
          </section>
        ))}

        <footer className="border-t border-slate-200/80 pt-6 text-center text-sm leading-7 text-slate-500">
          <p>
            <strong className="text-slate-700">หมายเหตุ:</strong>{" "}
            โครงงานนี้จัดทำเพื่อการศึกษา อัตราดอกเบี้ยเป็นข้อมูลอ้างอิง
            ไม่ใช่อัตราจริงแบบเรียลไทม์จากธนาคาร และไม่ใช่คำแนะนำทางการเงิน
          </p>
          <p className="mt-2">
            <Link href="/disclaimer" className="theme-link">
              อ่านข้อจำกัดความรับผิดชอบ
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
