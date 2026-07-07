import { BankName, DEFAULT_BANKS } from "@/lib/banks";

/** Short disclaimer shown in footer, calculator, and results. */
export const RATES_DATA_NOTE_SHORT =
  "อัตราและค่าธรรมเนียมค่าเริ่มต้นเป็นข้อมูลที่รวบรวมจากการสอบถามธนาคารและ/หรือเว็บไซต์ธนาคาร (บางสินเชื่อ/บางโปรโมชัน) อาจไม่ตรงกับอัตราปัจจุบัน";

export type LoanType = "refinance" | "retention";

export type RateValue =
  | { type: "fixed"; value: number }
  | { type: "formula"; base: "MRR" | "MLR"; offset: number };

/** Resolved fee amounts in baht used by the calculator. */
export type BankFees = {
  Z: number;
  I: number;
  P: number;
  G: number;
};

/** Default Z/I fee rates as % of principal (refinance). P/G defaults are baht. */
export const DEFAULT_FEE_PERCENTAGES = {
  Z: 1,
  I: 0.05,
} as const;

export type ScenarioFeeInputs = {
  feeMortgagePct: number;
  feeStampPct: number;
  feeAppraisalBaht: number;
  feeInsuranceBaht: number;
};

export function getDefaultScenarioFeeInputs(bankName: string): ScenarioFeeInputs {
  const percentages = getFeesForBank(bankName);

  return {
    feeMortgagePct: percentages.Z,
    feeStampPct: percentages.I,
    feeAppraisalBaht: 0,
    feeInsuranceBaht: 0,
  };
}

export function resolveScenarioFees(
  loanType: LoanType,
  principal: number,
  inputs: ScenarioFeeInputs,
): BankFees {
  if (!loanTypeHasAdditionalFees(loanType)) {
    return { Z: 0, I: 0, P: 0, G: 0 };
  }

  return {
    Z: principal * (inputs.feeMortgagePct / 100),
    I: principal * (inputs.feeStampPct / 100),
    P: inputs.feeAppraisalBaht,
    G: inputs.feeInsuranceBaht,
  };
}

export type BankRateConfig = {
  referenceRates: { MLR: number; MRR: number };
  refinance: [RateValue, RateValue, RateValue];
  retention: [RateValue, RateValue, RateValue];
  fees: BankFees;
};

const MISSING_RATE = 1;

const fixed = (value: number): RateValue => ({ type: "fixed", value });
const mrr = (offset: number): RateValue => ({
  type: "formula",
  base: "MRR",
  offset,
});
const mlr = (offset: number): RateValue => ({
  type: "formula",
  base: "MLR",
  offset,
});

export const BANK_RATE_CONFIG: Record<BankName, BankRateConfig> = {
  ธนาคารทหารไทยธนชาต: {
    referenceRates: { MLR: 6.95, MRR: 7.105 },
    refinance: [fixed(1.5), fixed(3.675), fixed(3.675)],
    retention: [fixed(3.35), fixed(3.35), fixed(3.35)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารกรุงศรีอยุธยา: {
    referenceRates: { MLR: 6.55, MRR: 6.67 },
    refinance: [fixed(1.79), fixed(2.99), mrr(-2.93)],
    retention: [fixed(3.35), fixed(3.35), fixed(3.35)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารออมสิน: {
    referenceRates: { MLR: 6.025, MRR: 6.045 },
    refinance: [fixed(1.38), fixed(3.585), fixed(3.585)],
    retention: [fixed(3.4), fixed(3.4), fixed(3.4)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารอาคารสงเคราะห์: {
    referenceRates: { MLR: 6.15, MRR: 6.145 },
    refinance: [fixed(1.75), fixed(2.75), mrr(-2.495)],
    retention: [fixed(3.14), fixed(3.14), fixed(3.14)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารกรุงเทพ: {
    referenceRates: { MLR: 6.35, MRR: 6.5 },
    refinance: [fixed(3.25), fixed(4.0), fixed(4.0)],
    retention: [fixed(3.8), fixed(3.8), fixed(3.8)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารไทยพาณิชย์: {
    referenceRates: { MLR: 6.35, MRR: 6.575 },
    refinance: [fixed(1.49), fixed(4.72), fixed(4.72)],
    retention: [fixed(3.5), fixed(3.5), fixed(3.5)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารกรุงไทย: {
    referenceRates: { MLR: 6.3, MRR: 6.845 },
    refinance: [fixed(1.33), mlr(-3.72), mlr(-2.95)],
    retention: [fixed(3.45), fixed(3.45), fixed(3.45)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
  ธนาคารกสิกรไทย: {
    referenceRates: { MLR: 6.52, MRR: 6.58 },
    refinance: [fixed(1.5), mrr(-3.18), mrr(-3.18)],
    retention: [fixed(3.35), fixed(3.35), fixed(3.35)],
    fees: { Z: 1, I: 0.05, P: 0, G: 0 },
  },
};

export function resolveRate(
  rate: RateValue,
  referenceRates: { MLR: number; MRR: number },
): number {
  if (rate.type === "fixed") {
    return rate.value;
  }

  return referenceRates[rate.base] + rate.offset;
}

export function getRatesForBank(
  bankName: string,
  loanType: LoanType,
): [number, number, number] {
  const config = BANK_RATE_CONFIG[bankName as BankName];

  if (!config) {
    return [MISSING_RATE, MISSING_RATE, MISSING_RATE];
  }

  const rateDefs = config[loanType];
  return rateDefs.map((rate) => resolveRate(rate, config.referenceRates)) as [
    number,
    number,
    number,
  ];
}

export function getFeesForBank(bankName: string): { Z: number; I: number } {
  const config = BANK_RATE_CONFIG[bankName as BankName];
  const fees = config?.fees ?? { Z: 1, I: 0.05, P: 0, G: 0 };

  return { Z: fees.Z, I: fees.I };
}

export function isKnownBank(bankName: string): bankName is BankName {
  return DEFAULT_BANKS.includes(bankName as BankName);
}

export function loanTypeLabel(loanType: LoanType) {
  return loanType === "refinance" ? "รีไฟแนนซ์" : "รีเทนชั่น";
}

export function loanTypeHasAdditionalFees(loanType: LoanType) {
  return loanType === "refinance";
}

