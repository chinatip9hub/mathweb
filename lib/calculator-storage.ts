import type { CalculatorScenario } from "@/components/CalculatorClient";

export const CALCULATOR_RESULTS_KEY = "mathweb-calculator-results";
export const CALCULATOR_RESULTS_EVENT = "mathweb-calculator-results-updated";

type StoredCalculatorResults = {
  scenarios: CalculatorScenario[];
  savedAt: number;
};

let cachedRaw: string | null | undefined;
let cachedScenarios: CalculatorScenario[] | null = null;

function parseStoredResults(raw: string | null): CalculatorScenario[] | null {
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as StoredCalculatorResults;
    return payload.scenarios ?? null;
  } catch {
    return null;
  }
}

export function saveCalculatorResults(scenarios: CalculatorScenario[]) {
  const payload: StoredCalculatorResults = {
    scenarios,
    savedAt: Date.now(),
  };
  const raw = JSON.stringify(payload);

  sessionStorage.setItem(CALCULATOR_RESULTS_KEY, raw);
  cachedRaw = raw;
  cachedScenarios = scenarios;

  window.dispatchEvent(new Event(CALCULATOR_RESULTS_EVENT));
}

export function loadCalculatorResults(): CalculatorScenario[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(CALCULATOR_RESULTS_KEY);

  if (raw === cachedRaw) {
    return cachedScenarios;
  }

  cachedRaw = raw;
  cachedScenarios = parseStoredResults(raw);
  return cachedScenarios;
}

export function subscribeToCalculatorResults(onStoreChange: () => void) {
  const handler = () => onStoreChange();

  window.addEventListener(CALCULATOR_RESULTS_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CALCULATOR_RESULTS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getCalculatorResultsSnapshot() {
  return loadCalculatorResults();
}

export function getCalculatorResultsServerSnapshot() {
  return null;
}
