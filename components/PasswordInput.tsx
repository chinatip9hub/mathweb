"use client";

import { useId, useState } from "react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  id?: string;
};

function EyeOpenIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a18.34 18.34 0 0 1-2.16 3.19" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  minLength,
  disabled = false,
  id,
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="theme-password-input">
      <input
        id={inputId}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="theme-input theme-password-input__field"
      />
      <button
        type="button"
        className="theme-password-input__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        aria-pressed={visible}
        aria-controls={inputId}
        disabled={disabled}
      >
        {visible ? <EyeClosedIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
}
