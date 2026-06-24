import type { BankFees } from "@/lib/bankRates";

export type YearlyResult = {
  year: number;
  rate: number;
  interest: number;
  principalPaid: number;
  remaining: number;
};

export type CalculationResult = {
  yearly: YearlyResult[];
  remainingPrincipal: number;
  totalFees: number;
  finalResult: number;
};

export function calculate3YearLoan(input: {
  principal: number;
  monthlyPayment: number;
  rates: [number, number, number];
  fees: BankFees;
}): CalculationResult {
  const annualPayment = input.monthlyPayment * 12;
  let remaining = input.principal;
  const yearly: YearlyResult[] = [];

  for (let yearIndex = 0; yearIndex < 3; yearIndex++) {
    const rate = input.rates[yearIndex];
    const interest = remaining * (rate / 100);
    const principalPaid = annualPayment - interest;
    remaining = remaining - principalPaid;

    yearly.push({
      year: yearIndex + 1,
      rate,
      interest,
      principalPaid,
      remaining,
    });
  }

  const totalFees =
    input.fees.Z + input.fees.I + input.fees.P + input.fees.G;

  return {
    yearly,
    remainingPrincipal: remaining,
    totalFees,
    finalResult: remaining + totalFees,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(value);
}
