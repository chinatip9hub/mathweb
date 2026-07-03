import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { getCurrentUser } from "@/lib/session";

const FEATURE_DELAYS = [
  "home-reveal-delay-4",
  "home-reveal-delay-5",
  "home-reveal-delay-6",
  "home-reveal-delay-7",
  "home-reveal-delay-8",
  "home-reveal-delay-9",
] as const;

const STATS = [
  { value: "8 ธนาคาร", label: "เปรียบเทียบพร้อมกัน" },
  { value: "3 ปี", label: "ต้นทุนรวมชัดเจน" },
  { value: "2 ประเภท", label: "รีไฟ + รีเทนชั่น" },
];

const STAT_DELAYS = [
  "home-reveal-delay-4",
  "home-reveal-delay-5",
  "home-reveal-delay-6",
] as const;

const STEP_DELAYS = [
  "home-reveal-delay-4",
  "home-reveal-delay-5",
  "home-reveal-delay-6",
] as const;

const STEPS = [
  {
    title: "ใส่ข้อมูลสินเชื่อ",
    text: "ระบุเงินต้น ค่างวด และประเภทสินเชื่อให้แต่ละธนาคาร หรือใช้ค่าเดียวกันทุกธนาคารได้ในคลิกเดียว",
  },
  {
    title: "เปรียบเทียบข้อเสนอ",
    text: "ดูอัตราดอกเบี้ย 3 ปี ค่าใช้จ่ายเพิ่มเติม และผลลัพธ์สุดท้าย เรียงจากต้นทุนต่ำสุดอัตโนมัติ",
  },
  {
    title: "เลือกธนาคารที่คุ้ม",
    text: "เห็นภาพรวมทุกธนาคารในที่เดียว บันทึกข้อมูลไว้กลับมาแก้ไขและคำนวณใหม่ได้ทุกเมื่อ",
  },
];

const FEATURES = [
  {
    icon: "🏦",
    title: "ครบ 8 ธนาคาร",
    text: "เปรียบเทียบข้อเสนอจากธนาคารชั้นนำในหน้าเดียว ไม่ต้องไล่เช็คทีละแห่ง",
  },
  {
    icon: "📊",
    title: "ตาราง + กราฟ",
    text: "ดูผลลัพธ์แบบตารางและกราฟ ช่วยให้เห็นความต่างของแต่ละธนาคารชัดเจน",
  },
  {
    icon: "💰",
    title: "ต้นทุนรวม 3 ปี",
    text: "คำนวณดอกเบี้ยและค่าใช้จ่ายเพิ่มเติม (Z, I, P, G) รวมเป็นต้นทุนจริง",
  },
  {
    icon: "🔄",
    title: "รีไฟ & รีเทนชั่น",
    text: "รองรับทั้งสองประเภทสินเชื่อ เลือกประเภทที่ตรงกับสถานการณ์ของคุณ",
  },
  {
    icon: "💾",
    title: "บันทึกข้อมูล",
    text: "ล็อกอินแล้วบันทึกข้อมูลไว้ กลับมาแก้ไขและคำนวณใหม่ได้สะดวก",
  },
  {
    icon: "⚡",
    title: "ใช้งานง่าย",
    text: "ออกแบบสำหรับมือถือ กรอกข้อมูลและดูผลลัพธ์ได้รวดเร็ว",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__visual theme-animate-in">
          <HomeHero />
        </div>

        <div className="home-hero__copy">
          <span className="home-hero__badge theme-animate-in theme-animate-delay-1">
            <span className="home-hero__badge-dot" aria-hidden />
            รีไฟแนนซ์ · รีเทนชั่นสินเชื่อบ้าน
          </span>

          <h1 className="home-lab-title theme-animate-in theme-animate-delay-1">
            <span className="home-lab-title__hud" aria-hidden>
              <span className="home-lab-title__tag">REFILAB // ANALYSIS MODULE</span>
              <span className="home-lab-title__status">
                <span className="home-lab-title__status-dot" />
                ONLINE
              </span>
            </span>
            <span className="home-lab-title__frame" aria-hidden />
            <span className="home-lab-title__grid" aria-hidden />
            <span className="home-lab-title__scan" aria-hidden />
            <span className="home-lab-title__line home-lab-title__line--primary">
              เปรียบเทียบดอกเบี้ยบ้าน
            </span>
            <span className="home-lab-title__line home-lab-title__line--accent">
              จากหลายธนาคารในที่เดียว
              <span className="home-lab-title__cursor" aria-hidden />
            </span>
          </h1>

          <p className="home-hero__desc theme-animate-in theme-animate-delay-2">
            กรอกเงินต้นและค่างวดของคุณ เปรียบเทียบอัตราดอกเบี้ยจาก 8 ธนาคารในครั้งเดียว
            ดูต้นทุนรวม 3 ปีและผลลัพธ์สุดท้าย เพื่อเลือกธนาคารที่คุ้มที่สุด
          </p>

          <div className="home-hero__actions theme-animate-in theme-animate-delay-3">
            <div className="home-hero__cta-wrap">
              <Link
                href="/calculator"
                className="theme-btn-primary home-hero__cta-btn inline-flex items-center px-7 py-3.5 text-base font-bold"
              >
                เริ่มคำนวณอัตราดอกเบี้ย
                <span className="home-hero__cta-btn__arrow" aria-hidden>
                  →
                </span>
              </Link>
              <p className="home-hero__cta-hint">
                {user
                  ? "กดเพื่อเปรียบเทียบดอกเบี้ยจาก 8 ธนาคาร"
                  : "ลองคำนวณได้เลย ไม่ต้องสมัคร — เข้าสู่ระบบเมื่อต้องการบันทึกข้อมูล"}
              </p>
            </div>
            {!user && (
              <Link
                href="/register"
                className="theme-btn-secondary inline-flex px-6 py-3.5 text-base font-semibold"
              >
                สมัครฟรี
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="จุดเด่น">
        {STATS.map((item, index) => (
          <div
            key={item.value}
            className={`home-stat home-reveal ${STAT_DELAYS[index]}`}
          >
            <p className="home-stat__value">{item.value}</p>
            <p className="home-stat__label">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section__head home-reveal home-reveal-delay-4">
          <h2 className="home-section__title">วิธีใช้งาน</h2>
          <p className="home-section__sub">3 ขั้นตอนง่ายๆ จากกรอกข้อมูลถึงตัดสินใจ</p>
        </div>
        <ol className="home-steps">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className={`home-step home-reveal home-step--hover ${STEP_DELAYS[index]}`}
            >
              <span className="home-step__num" aria-hidden>
                {index + 1}
              </span>
              <h3 className="home-step__title">{step.title}</h3>
              <p className="home-step__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section">
        <div className="home-section__head home-reveal home-reveal-delay-4">
          <h2 className="home-section__title">ทำไมต้อง RefiLab</h2>
          <p className="home-section__sub">เครื่องมือเปรียบเทียบสินเชื่อบ้านที่ออกแบบมาเพื่อคุณ</p>
        </div>
        <div className="home-features">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`home-feature home-feature--hover home-reveal ${FEATURE_DELAYS[index]}`}
            >
              <span className="home-feature__icon" aria-hidden>
                {feature.icon}
              </span>
              <div>
                <h3 className="home-feature__title">{feature.title}</h3>
                <p className="home-feature__text">{feature.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta home-reveal home-reveal-delay-5">
        <h2 className="home-cta__title">พร้อมเปรียบเทียบดอกเบี้ยแล้วหรือยัง?</h2>
        <p className="home-cta__text">
          เริ่มกรอกข้อมูลวันนี้ แล้วดูว่าธนาคารไหนให้ต้นทุนรวมต่ำสุดสำหรับคุณ
        </p>
        <Link
          href="/calculator"
          className="theme-btn-primary home-hero__cta-btn home-cta__btn inline-flex items-center px-8 py-3.5 text-base font-bold"
        >
          เริ่มคำนวณเลย
          <span className="home-hero__cta-btn__arrow" aria-hidden>
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
