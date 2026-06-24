"use client";

import { useState } from "react";

type NumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  integer?: boolean;
  inputMode?: "numeric" | "decimal";
};

const DECIMAL_PATTERN = /^\d*\.?\d*$/;
const INTEGER_PATTERN = /^\d*$/;

function valueToText(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }

  return String(value);
}

function parseText(text: string): number {
  const trimmed = text.trim();

  if (trimmed === "" || trimmed === ".") {
    return 0;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function NumericInput({
  value,
  onChange,
  disabled = false,
  className = "theme-input",
  integer = false,
  inputMode,
}: NumericInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;
  const displayValue = isEditing ? draft : valueToText(value);

  function handleChange(raw: string) {
    const pattern = integer ? INTEGER_PATTERN : DECIMAL_PATTERN;

    if (raw !== "" && !pattern.test(raw)) {
      return;
    }

    setDraft(raw);
  }

  return (
    <input
      type="text"
      inputMode={inputMode ?? (integer ? "numeric" : "decimal")}
      autoComplete="off"
      disabled={disabled}
      value={displayValue}
      onChange={(event) => handleChange(event.target.value)}
      onFocus={() => setDraft(valueToText(value))}
      onBlur={() => {
        const parsed = parseText(draft ?? "");
        onChange(parsed);
        setDraft(null);
      }}
      className={className}
    />
  );
}
