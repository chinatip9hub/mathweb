export const RESULT_LABELS = {
  finalResult: "ผลลัพธ์สุดท้าย",
  finalResultHint: "A₃ + ค่าใช้จ่าย",
  remainingPrincipal: "A₃ คงเหลือ",
  remainingPrincipalHint: "หลังผ่อน 3 ปี",
  totalInterest: "ดอกเบี้ยรวม 3 ปี",
  totalFees: "ค่าใช้จ่าย",
  avgRate: "อัตราดอกเบี้ยเฉลี่ย 3 ปี",
} as const;

export type ChartType = "final" | "stacked" | "remaining" | "interest";

export const CHART_OPTIONS: {
  value: ChartType;
  label: string;
  description: string;
}[] = [
  {
    value: "final",
    label: RESULT_LABELS.finalResult,
    description: "เปรียบเทียบต้นทุนรวมของแต่ละธนาคาร",
  },
  {
    value: "stacked",
    label: "โครงสร้างต้นทุน",
    description: "แยก A₃ คงเหลือกับค่าใช้จ่าย",
  },
  {
    value: "remaining",
    label: "A₃ คงเหลือรายปี",
    description: "แนวโน้มเงินต้นคงเหลือตลอด 3 ปี",
  },
  {
    value: "interest",
    label: RESULT_LABELS.totalInterest,
    description: "เปรียบเทียบดอกเบี้ยสะสมของแต่ละธนาคาร",
  },
];
