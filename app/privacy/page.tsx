import Link from "next/link";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | RefiLab",
};

export default function PrivacyPage() {
  const contactEmail = process.env.CONTACT_EMAIL?.trim() ?? "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <article className="theme-card space-y-6 p-6 sm:p-8">
        <div>
          <p className="theme-kicker">กฎหมาย</p>
          <h1 className="theme-card-title mt-2 text-2xl font-bold">
            นโยบายความเป็นส่วนตัว (PDPA)
          </h1>
          <p className="theme-card-text mt-2 text-sm">
            อัปเดตล่าสุด: 8 กรกฎาคม 2026
          </p>
        </div>

        <section className="theme-card-text space-y-3 text-sm leading-7">
          <p>
            RefiLab (&quot;เรา&quot;) ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน
            ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            ข้อมูลที่เราเก็บ
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              อีเมล ชื่อ และรหัสผ่าน (เข้ารหัส) เมื่อสมัครสมาชิก
              รวมถึงสถานะการยืนยันอีเมล
            </li>
            <li>รูปโปรไฟล์ที่ท่านเลือก (รหัสตัวละคร avatar) หากตั้งค่า</li>
            <li>
              ข้อมูลสถานการณ์คำนวณสินเชื่อที่ท่านบันทึกขณะเข้าสู่ระบบ
              (เช่น ธนาคาร เงินต้น ค่างวด อัตราดอกเบี้ย และค่าธรรมเนียม)
            </li>
            <li>
              ผลการเปรียบเทียบที่บันทึกในประวัติ
              (ทั้งขณะเข้าสู่ระบบและกรณีที่ยังไม่ได้เข้าสู่ระบบ)
            </li>
            <li>
              รหัสลิงก์แชร์ผลลัพธ์ (share token) สำหรับเปิดดูผลการคำนวณซ้ำ
            </li>
            <li>
              ข้อมูลเทคนิคชั่วคราว เช่น ที่อยู่ IP
              เพื่อจำกัดความถี่การเรียกใช้บริการ (rate limit)
              โดยไม่จัดเก็บถาวรในฐานข้อมูลของแอป
            </li>
          </ul>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การสมัครสมาชิกและความยินยอม
          </h2>
          <p>
            การสมัครสมาชิกต้องติ๊กยืนยันว่าท่านได้อ่านและยอมรับ{" "}
            <Link href="/terms" className="theme-link">
              ข้อกำหนดการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link href="/privacy" className="theme-link">
              นโยบายความเป็นส่วนตัว
            </Link>{" "}
            ก่อนกดสมัคร — เป็นการให้ความยินยอมอย่างชัดเจนตาม PDPA
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การใช้งานโดยไม่สมัครสมาชิก
          </h2>
          <p>
            ท่านสามารถคำนวณและดูผลลัพธ์ได้โดยไม่ต้องสมัครสมาชิก
            ข้อมูลชั่วคราวจะเก็บในเบราว์เซอร์ของท่าน (sessionStorage)
            หากท่านกดคำนวณหรือสร้างลิงก์แชร์ผลลัพธ์
            ระบบอาจบันทึกผลการเปรียบเทียบลงฐานข้อมูลโดยไม่ผูกกับบัญชีผู้ใช้
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            วัตถุประสงค์
          </h2>
          <p>
            เราใช้ข้อมูลเพื่อให้บริการคำนวณ เปรียบเทียบ บันทึกข้อมูล
            ยืนยันตัวตน จัดการโปรไฟล์
            และส่งอีเมลที่เกี่ยวข้องกับบัญชี (เช่น ยืนยันอีเมล รีเซ็ตรหัสผ่าน)
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            การเปิดเผยข้อมูล
          </h2>
          <p>
            เราไม่ขายข้อมูลส่วนบุคคล
            อาจเปิดเผยต่อผู้ให้บริการที่จำเป็นต่อการให้บริการ
            เช่น ผู้ให้บริการฐานข้อมูล โฮสติ้ง และบริการส่งอีเมล
            เท่าที่จำเป็นและตามที่กฎหมายกำหนด
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            คุกกี้และการจัดเก็บในเบราว์เซอร์
          </h2>
          <p>
            RefiLab ใช้คุกกี้และพื้นที่จัดเก็บของเบราว์เซอร์เฉพาะเท่าที่จำเป็นต่อการให้บริการ
            เราไม่ใช้คุกกี้เพื่อโฆษณา การตลาด หรือติดตามพฤติกรรมข้ามเว็บไซต์
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="theme-card-title">คุกกี้เซสชัน (`mathweb_session`)</strong> —
              ใช้เมื่อท่านเข้าสู่ระบบ เพื่อจำสถานะการล็อกอิน (คุกกี้จำเป็น)
              หมดอายุเมื่อออกจากระบบหรือครบกำหนดเวลา
            </li>
            <li>
              <strong className="theme-card-title">sessionStorage</strong> —
              เก็บผลการคำนวณชั่วคราวในเบราว์เซอร์ของท่านขณะใช้งาน
              (ไม่ใช่คุกกี้) ข้อมูลจะถูกลบเมื่อปิดแท็บเบราว์เซอร์
            </li>
          </ul>
          <p>
            ท่านสามารถลบคุกกี้เซสชันได้โดยกด &quot;ออกจากระบบ&quot;
            หรือลบคุกกี้ของเว็บไซต์จากการตั้งค่าเบราว์เซอร์
            หากปิดการใช้คุกกี้ที่จำเป็น อาจไม่สามารถเข้าสู่ระบบได้
          </p>

          <h2 className="theme-card-title pt-2 text-base font-semibold">
            สิทธิของเจ้าของข้อมูล
          </h2>
          <p>
            ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือถอนความยินยอม
            โดยติดต่อเราทางอีเมล{" "}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="theme-link">
                {contactEmail}
              </a>
            ) : (
              <span className="theme-card-title">(ยังไม่ได้ตั้งค่าอีเมลติดต่อ)</span>
            )}{" "}
            หรือจัดการบัญชีได้ที่{" "}
            <Link href="/account/profile" className="theme-link">
              หน้าโปรไฟล์
            </Link>{" "}
            (แก้ไขชื่อ รูปโปรไฟล์ รหัสผ่าน และลบบัญชีถาวร)
          </p>
        </section>

        <Link href="/" className="theme-link inline-block text-sm">
          ← กลับหน้าแรก
        </Link>
      </article>
    </main>
  );
}
