import type { LoanType } from "@/lib/bankRates";

export function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function serializeScenario(scenario: {
  id: string;
  bankName: string;
  loanType: string;
  principal: unknown;
  monthlyPayment: unknown;
  rateYear1: unknown;
  rateYear2: unknown;
  rateYear3: unknown;
  useCustomRates: boolean;
  useCustomFees: boolean;
  feeMortgage: unknown;
  feeStamp: unknown;
  feeAppraisal: unknown;
  feeInsurance: unknown;
  resultFinal: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: scenario.id,
    bankName: scenario.bankName,
    loanType: scenario.loanType as LoanType,
    principal: Number(scenario.principal),
    monthlyPayment: Number(scenario.monthlyPayment),
    rateYear1: Number(scenario.rateYear1),
    rateYear2: Number(scenario.rateYear2),
    rateYear3: Number(scenario.rateYear3),
    useCustomRates: scenario.useCustomRates,
    useCustomFees: scenario.useCustomFees,
    feeMortgage: Number(scenario.feeMortgage),
    feeStamp: Number(scenario.feeStamp),
    feeAppraisal: Number(scenario.feeAppraisal),
    feeInsurance: Number(scenario.feeInsurance),
    resultFinal:
      scenario.resultFinal === null ? null : Number(scenario.resultFinal),
    createdAt: scenario.createdAt.toISOString(),
    updatedAt: scenario.updatedAt.toISOString(),
  };
}
