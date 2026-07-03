import type { CalculatorScenario } from "@/components/CalculatorClient";

export const CALCULATOR_RESULTS_KEY = "mathweb-calculator-results";
export const CALCULATOR_RESULTS_EVENT = "mathweb-calculator-results-updated";

type StoredCalculatorResults = {
  scenarios: CalculatorScenario[];
  savedAt: number;
  shareToken?: string;
  runId?: string;
};

let cachedRaw: string | null | undefined;
let cachedPayload: StoredCalculatorResults | null = null;

function parseStoredResults(raw: string | null): StoredCalculatorResults | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCalculatorResults;
  } catch {
    return null;
  }
}

export function saveCalculatorResults(
  scenarios: CalculatorScenario[],
  meta?: { shareToken?: string; runId?: string },
) {
  const payload: StoredCalculatorResults = {
    scenarios,
    savedAt: Date.now(),
    shareToken: meta?.shareToken,
    runId: meta?.runId,
  };
  const raw = JSON.stringify(payload);

  sessionStorage.setItem(CALCULATOR_RESULTS_KEY, raw);
  cachedRaw = raw;
  cachedPayload = payload;

  window.dispatchEvent(new Event(CALCULATOR_RESULTS_EVENT));
}

export function loadCalculatorResults(): CalculatorScenario[] | null {
  const payload = loadCalculatorResultsPayload();
  return payload?.scenarios ?? null;
}

export function loadCalculatorResultsPayload(): StoredCalculatorResults | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(CALCULATOR_RESULTS_KEY);

  if (raw === cachedRaw) {
    return cachedPayload;
  }

  cachedRaw = raw;
  cachedPayload = parseStoredResults(raw);
  return cachedPayload;
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

export function getCalculatorShareTokenSnapshot() {
  return loadCalculatorResultsPayload()?.shareToken ?? null;
}

export function hasCalculatorResultsSnapshot() {
  return Boolean(loadCalculatorResultsPayload());
}

export function hasCalculatorResultsServerSnapshot() {
  return false;
}
