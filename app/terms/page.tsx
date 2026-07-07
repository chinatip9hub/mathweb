import Link from "next/link";

export const metadata = {
  title: "ข้อกำหนดการใช้งาน | RefiLab",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <article className="theme-card space-y-6 p-6 sm:p-8">
        <div>
          <p className="theme-kicker">กฎหมาย</p>
          <h1 className="theme-card-title mt-2 text-2xl font-bold">
            ข้อกำหนดการใช้งาน
          </h1>
          <p className="theme-card-text mt-2 text-sm">
            อัปเดตล่าสุด: 3 กรกฎาคม 2026
          </p>
        </div>

        <section className="theme-card-text space-y-3 text-sm leading-7">
          <p>
            การใช้งาน RefiLab หมายความว่าท่านยอมรับข้อกำหนดนี้
            หากไม่ยอมรับ กรุณาหยุดใช้บริการ
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            บริการที่ให้
          </h2>
          <p>
            RefiLab เป็นเครื่องมือเปรียบเทียบอัตราดอกเบี้ยและต้นทุนสินเชื่อบ้าน
            (รีไฟแนนซ์และรีเทนชั่น) จากหลายธนาคาร
            ท่านสามารถใช้งานคำนวณเบื้องต้นได้โดยไม่ต้องสมัครสมาชิก
            การสมัครสมาชิกเป็นทางเลือกสำหรับผู้ที่ต้องการบันทึกข้อมูล
            ประวัติการคำนวณ และจัดการโปรไฟล์
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            บัญชีผู้ใช้
          </h2>
          <p>
            หากสมัครสมาชิก ท่านต้องให้ข้อมูลที่ถูกต้อง รักษาความลับรหัสผ่าน
            และรับผิดชอบกิจกรรมภายใต้บัญชีของท่าน
            เราอาจขอให้ยืนยันอีเมลก่อนใช้งานบางส่วนของบริการ
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การใช้งานที่อนุญาต
          </h2>
          <p>
            ใช้เว็บไซต์เพื่อเปรียบเทียบสินเชื่อบ้านส่วนบุคคลเท่านั้น
            ห้ามใช้ในทางที่ผิดกฎหมาย รบกวนระบบ
            สแปมการเรียก API หรือพยายามเข้าถึงข้อมูลผู้อื่น
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ทรัพย์สินทางปัญญา
          </h2>
          <p>
            เนื้อหา ดีไซน์ ตัวละคร และซอฟต์แวร์ของ RefiLab เป็นทรัพย์สินของเรา
            ห้ามคัดลอกหรือนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ข้อจำกัดความรับผิดชอบ
          </h2>
          <p>
            ผลลัพธ์จาก RefiLab เป็นการประมาณการเพื่อประกอบการตัดสินใจเท่านั้น
            ไม่ใช่คำแนะนำทางการเงิน
            อัตราค่าเริ่มต้นเป็นข้อมูลที่รวบรวมจากธนาคาร/เว็บธนาคาร อาจไม่ตรงกับปัจจุบัน
            โปรดอ่าน{" "}
            <Link href="/disclaimer" className="theme-link">
              ข้อจำกัดความรับผิดชอบ
            </Link>{" "}
            และ{" "}
            <Link href="/privacy" className="theme-link">
              นโยบายความเป็นส่วนตัว
            </Link>{" "}
            ประกอบกัน
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การระงับบริการ
          </h2>
          <p>
            เราอาจระงับหรือยกเลิกการเข้าถึงหากพบการใช้งานที่ละเมิดข้อกำหนด
            หรือเพื่อบำรุงรักษาระบบ
          </p>
        </section>

        <Link href="/" className="theme-link inline-block text-sm">
          ← กลับหน้าแรก
        </Link>
      </article>
    </main>
  );
}
