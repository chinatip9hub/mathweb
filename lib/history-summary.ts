import { getBankAbbreviation } from "@/lib/banks";
import { loanTypeLabel, type LoanType } from "@/lib/bankRates";

export type HistoryScenario = {
  bankName?: string;
  loanType?: LoanType | string;
  resultFinal?: number | null;
};

export function summarizeHistoryScenarios(scenarios: HistoryScenario[]) {
  const banks = scenarios
    .map((scenario) => scenario.bankName?.trim())
    .filter((bankName): bankName is string => Boolean(bankName));

  const abbreviations = banks.map((bankName) => getBankAbbreviation(bankName));

  const loanTypes = new Set(
    scenarios
      .map((scenario) => scenario.loanType)
      .filter((loanType): loanType is LoanType => loanType === "refinance" || loanType === "retention"),
  );

  let loanTypeLabelText = "—";
  if (loanTypes.size === 1) {
    loanTypeLabelText = loanTypeLabel([...loanTypes][0]);
  } else if (loanTypes.size > 1) {
    loanTypeLabelText = "รีไฟ + รีเทนชั่น";
  }

  const ranked = scenarios
    .filter(
      (scenario) =>
        scenario.bankName &&
        scenario.resultFinal !== null &&
        scenario.resultFinal !== undefined &&
        Number.isFinite(Number(scenario.resultFinal)),
    )
    .map((scenario) => ({
      bankName: scenario.bankName as string,
      bankShort: getBankAbbreviation(scenario.bankName as string),
      resultFinal: Number(scenario.resultFinal),
    }))
    .sort((left, right) => left.resultFinal - right.resultFinal);

  return {
    bankCount: banks.length,
    bankAbbreviations: abbreviations,
    bankListText: abbreviations.join(", "),
    loanTypeLabel: loanTypeLabelText,
    bestBank: ranked[0] ?? null,
  };
}
