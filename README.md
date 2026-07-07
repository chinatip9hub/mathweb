# RefiLab

เว็บเปรียบเทียบอัตราดอกเบี้ยรีไฟแนนซ์และรีเทนชั่นสินเชื่อบ้านจาก 8 ธนาคาร

## เริ่มต้น (Local)

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```

เปิด http://localhost:3000

## Environment Variables

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `DATABASE_URL` | PostgreSQL (Neon) |
| `APP_URL` | URL สาธารณะ (ใช้ในลิงก์อีเมล) |
| `RESEND_API_KEY` | ส่งอีเมล — ต้อง verify โดเมนก่อนส่งให้ผู้ใช้จริง (ดูด้านล่าง) |
| `EMAIL_FROM` | ผู้ส่ง — ใช้ `@โดเมนที่ verify แล้ว` ไม่ใช่ `onboarding@resend.dev` ตอน production |
| `CONTACT_EMAIL` | อีเมลติดต่อในหน้า Privacy |

## Deploy (Vercel) — อัปเดตเวอร์ชันใหม่

**ไม่ต้องสร้าง URL ใหม่** ถ้าใช้โปรเจกต์ Vercel เดิม — แค่ push โค้ดแล้ว redeploy

### ก่อน deploy ครั้งแรก / หลังเปลี่ยน schema

```bash
# บนเครื่องคุณ (ใช้ DATABASE_URL ของ Neon production)
npx prisma db push
```

### ขั้นตอน deploy

1. Commit + push ขึ้น GitHub (`chinatip9hub/mathweb`)
2. Vercel จะ build อัตโนมัติ (หรือกด Redeploy ใน Dashboard)
3. ตั้ง **Root Directory** = `math` (ถ้า repo มีโฟลเดอร์ math)
4. ตรวจ env ใน Vercel → Settings → Environment Variables

### Environment Variables (ครบชุด)

| ตัวแปร | จำเป็น | หมายเหตุ |
|--------|--------|----------|
| `DATABASE_URL` | ใช่ | connection string จาก Neon (ตัวเดิมที่เคยใช้ได้) |
| `APP_URL` | แนะนำ | URL จริง เช่น `https://your-app.vercel.app` — ใช้ในลิงก์อีเมล |
| `RESEND_API_KEY` | ถ้าใช้อีเมล | คีย์จาก Resend |
| `EMAIL_FROM` | ถ้าใช้อีเมล | ต้องเป็นโดเมนที่ verify แล้ว (ไม่ใช่ `onboarding@resend.dev`) |
| `CONTACT_EMAIL` | แนะนำ | แสดงในหน้า Privacy / ลืมรหัสผ่าน |

ถ้าไม่ตั้ง `APP_URL` บน Vercel ระบบจะใช้ `VERCEL_URL` อัตโนมัติ (ลิงก์อีเมลยังทำงานได้)

**ไม่ต้องเพิ่ม** `NEXT_PUBLIC_*` อื่น — โปรเจกต์นี้ไม่ได้ใช้

### หลัง deploy — ทดสอบ

1. เปิด `https://your-app.vercel.app/api/health` → ต้องได้ `{"ok":true}`
2. คำนวณแบบไม่ล็อกอิน → ดูผลลัพธ์
3. สมัคร/ล็อกอิน → บันทึกข้อมูล → `/account/history`
4. ลองลืมรหัสผ่าน (ถ้า verify โดเมน Resend แล้ว)

## ฟีเจอร์

- คำนวณ 8 ธนาคาร, guest mode, บันทึกข้อมูล (login)
- ผลลัพธ์: กราฟ, CSV, แชร์ลิงก์, พิมพ์
- ประวัติการคำนวณ: `/account/history`
- ลบบัญชี: เมนูบัญชี
- กฎหมาย: `/privacy`, `/terms`, `/disclaimer`

## อีเมล (Resend)

`onboarding@resend.dev` ใช้ทดสอบได้**เฉพาะส่งไปอีเมลที่สมัครบัญชี Resend** — ส่งให้ผู้ใช้อื่นจะได้ **403** (ตามที่เห็นใน Resend Logs)

ขั้นตอนใช้งานจริง:

1. [resend.com/domains](https://resend.com/domains) → Add Domain → ใส่ DNS ตามที่ Resend ให้
2. รอสถานะ **Verified**
3. ตั้ง env:
   - `EMAIL_FROM="RefiLab <noreply@yourdomain.com>"`
   - `APP_URL` = URL จริงของเว็บ (Vercel)
4. รีสตาร์ท server / redeploy

ตอน `npm run dev` บน localhost ถ้า Resend ส่งไม่ได้ ลิงก์รีเซ็ต/ยืนยันจะโผล่ใน **terminal** (`[RefiLab password reset]`)

## แก้อัตราดอกเบี้ย

แก้ใน `lib/bankRates.ts` แล้วรีสตาร์ท server (ยังไม่มีหน้า Admin)

## สคริปต์

```bash
npm run dev
npm run build
npm run lint
npm run export:stats
```

## ส่งออกข้อมูลสำหรับรายงาน / สถิติ

รันคำสั่งนี้เพื่อสร้างไฟล์ CSV ในโฟลเดอร์ `exports/`:

```bash
npm run export:stats
```

ไฟล์ที่ได้:

| ไฟล์ | เนื้อหา |
|------|---------|
| `bank-reference-rates.csv` | อัตราดอกเบี้ยและค่าธรรมเนียมอ้างอิงจาก `lib/bankRates.ts` |
| `summary.csv` | สรุปจำนวนผู้ใช้ รอบคำนวณ สถานการณ์ที่บันทึก |
| `saved-scenarios-by-bank.csv` | สถิติ `CalculationScenario` แยกตามธนาคาร |
| `saved-scenarios-detail.csv` | รายการบันทึกทีละธนาคาร พร้อมอัตรา/ค่าธรรมเนียมและวันที่ (ไม่ระบุตัวตน) |
| `comparison-runs-detail.csv` | รายการรอบเปรียบเทียบ พร้อมธนาคาร ประเภทสินเชื่อ และต้นทุนต่ำสุด (ไม่ระบุตัวตน) |
| `comparison-scenarios-detail.csv` | **รายละเอียดทีละธนาคารต่อรอบ** — อัตรา 3 ปี ค่าธรรมเนียม เงินต้น งวด ผลลัพธ์ (ไม่ระบุตัวตน) |
| `comparison-rates-by-bank.csv` | อัตราเฉลี่ยและจำนวนครั้งที่กำหนดอัตราเอง แยกตามธนาคาร |
| `comparison-custom-usage.csv` | สรุปว่ามีกี่ครั้งที่ผู้ใช้กำหนดอัตรา/ค่าธรรมเนียมเอง (login vs guest) |
| `comparison-bank-usage.csv` | ธนาคารที่ปรากฏใน `ComparisonRun` บ่อยแค่ไหน |
| `comparison-loan-type-usage.csv` | สัดส่วนรีไฟ / รีเทนชั่น |
| `comparison-principal-buckets.csv` | ช่วงเงินต้นที่ผู้ใช้กรอก |
| `comparison-runs-by-day.csv` | จำนวนรอบเปรียบเทียบรายวัน |
| `comparison-scenario-total.csv` | จำนวนสถานการณ์รวมใน ComparisonRun |

ข้อมูลที่ export **ไม่มีอีเมลหรือชื่อผู้ใช้** — ไฟล์ aggregate และ detail ใช้รหัสรายการแทนตัวตน เหมาะใช้ทำกราฟหรือตารางในรายงานโครงงาน
แต่ควรระบุในรายงานว่าเป็นข้อมูลประมาณการจากระบบ RefiLab ไม่ใช่ข้อมูลทางการจากธนาคาร
