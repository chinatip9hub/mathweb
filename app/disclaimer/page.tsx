import Link from "next/link";

export const metadata = {
  title: "ข้อจำกัดความรับผิดชอบ | RefiLab",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <article className="theme-card space-y-6 p-6 sm:p-8">
        <div>
          <p className="theme-kicker">กฎหมาย</p>
          <h1 className="theme-card-title mt-2 text-2xl font-bold">
            ข้อจำกัดความรับผิดชอบ
          </h1>
          <p className="theme-card-text mt-2 text-sm">
            อัปเดตล่าสุด: 3 กรกฎาคม 2026
          </p>
        </div>

        <section className="theme-card-text space-y-3 text-sm leading-7">
          <p>
            RefiLab เป็นเครื่องมือช่วยเปรียบเทียบเท่านั้น
            <strong className="theme-card-title"> ไม่ใช่คำแนะนำทางการเงิน </strong>
            และไม่ใช่ตัวแทนของธนาคารใดๆ
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ความถูกต้องของข้อมูล
          </h2>
          <p>
            อัตราดอกเบี้ยและค่าธรรมเนียมค่าเริ่มต้นในระบบ
            เป็นข้อมูลที่ผู้พัฒนาเว็บรวบรวมจากการสอบถามธนาคาร
            และ/หรือข้อมูลบนเว็บไซต์ธนาคาร
            สำหรับสินเชื่อบ้านบางประเภทหรือบางโปรโมชัน
            (รวมค่าใช้จ่ายประเภท Z, I, P, G ตามที่กำหนดในเครื่องมือ)
          </p>
          <p>
            ข้อมูลดังกล่าวใช้เพื่อช่วยเปรียบเทียบเท่านั้น
            <strong className="theme-card-title">
              {" "}
              ไม่ใช่อัตราปัจจุบันจากธนาคาร{" "}
            </strong>
            และไม่ครอบคลุมทุกแพ็กเกจหรือทุกเงื่อนไข
            ธนาคารอาจเปลี่ยนแปลงอัตรา โปรโมชัน หรือค่าธรรมเนียมได้ตลอดเวลา
            ผลลัพธ์จึงเป็นการประมาณการเท่านั้น
          </p>
          <p>
            หากมีใบเสนอราคาหรืออัตราจากธนาคารจริง
            กรุณากรอกอัตราและค่าธรรมเนียมเองในหน้าคำนวณ
            (ติ๊ก &quot;กำหนดอัตราเอง&quot; / &quot;กำหนดค่าใช้จ่ายเอง&quot;)
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ขอบเขตการคำนวณ
          </h2>
          <p>
            ผลลัพธ์ที่แสดง (ตาราง กราฟ ไฟล์ CSV หรือลิงก์แชร์)
            สร้างจากสมมติฐานและข้อมูลที่ป้อนในระบบ
            อาจไม่ครอบคลุมเงื่อนไขพิเศษ ค่าปรับ หรือข้อกำหนดเฉพาะรายของธนาคาร
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การตัดสินใจ
          </h2>
          <p>
            กรุณาตรวจสอบกับธนาคารหรือที่ปรึกษาทางการเงินที่ได้รับใบอนุญาต
            ก่อนตัดสินใจรีไฟแนนซ์หรือรีเทนชั่น
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ความรับผิดชอบ
          </h2>
          <p>
            เราไม่รับผิดชอบต่อความเสียหายทางตรงหรือทางอ้อม
            จากการใช้ผลการคำนวณ การดาวน์โหลดข้อมูล
            หรือการตัดสินใจที่อิงจากเว็บไซต์นี้
          </p>
        </section>

        <Link href="/" className="theme-link inline-block text-sm">
          ← กลับหน้าแรก
        </Link>
      </article>
    </main>
  );
}
