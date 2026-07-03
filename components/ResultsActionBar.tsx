"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ResultsActionBarProps = {
  onExportCsv: () => void;
  onShare: () => Promise<void>;
  onPrint: () => void;
  shareUrl: string | null;
  sharePanelOpen: boolean;
  onCloseSharePanel: () => void;
  onCopyShareLink: () => Promise<void>;
  onNativeShare: () => Promise<void>;
  busyAction: "share" | "csv" | null;
  disabled?: boolean;
  canNativeShare?: boolean;
};

function ActionButton({
  children,
  onClick,
  disabled,
  busy,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled || busy}
      onClick={onClick}
      className="results-action-btn"
    >
      {children}
    </button>
  );
}

export default function ResultsActionBar({
  onExportCsv,
  onShare,
  onPrint,
  shareUrl,
  sharePanelOpen,
  onCloseSharePanel,
  onCopyShareLink,
  onNativeShare,
  busyAction,
  disabled = false,
  canNativeShare = false,
}: ResultsActionBarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    await onCopyShareLink();
    setCopied(true);
  }

  return (
    <div className="results-action-bar print:hidden">
      <div className="results-action-bar__buttons">
        <ActionButton
          title="ดาวน์โหลด CSV"
          onClick={onExportCsv}
          disabled={disabled}
          busy={busyAction === "csv"}
        >
          <span className="results-action-btn__icon" aria-hidden="true">
            ↓
          </span>
          <span className="results-action-btn__label">
            {busyAction === "csv" ? "กำลังสร้าง..." : "ดาวน์โหลด CSV"}
          </span>
        </ActionButton>

        <ActionButton
          title="แชร์ลิงก์ผลลัพธ์"
          onClick={() => void onShare()}
          disabled={disabled}
          busy={busyAction === "share"}
        >
          <span className="results-action-btn__icon" aria-hidden="true">
            ⧉
          </span>
          <span className="results-action-btn__label">
            {busyAction === "share" ? "กำลังสร้างลิงก์..." : "แชร์ลิงก์"}
          </span>
        </ActionButton>

        <ActionButton title="พิมพ์หรือบันทึกเป็น PDF" onClick={onPrint} disabled={disabled}>
          <span className="results-action-btn__icon" aria-hidden="true">
            ⎙
          </span>
          <span className="results-action-btn__label">พิมพ์ / PDF</span>
        </ActionButton>

        <Link href="/calculator" className="results-action-btn results-action-btn--link">
          <span className="results-action-btn__icon" aria-hidden="true">
            ‹
          </span>
          <span className="results-action-btn__label">กลับไปแก้ไข</span>
        </Link>
      </div>

      {sharePanelOpen && shareUrl && (
        <div className="results-share-panel results-share-panel--open">
          <div className="results-share-panel__header">
            <p className="results-share-panel__title">ลิงก์แชร์ผลการคำนวณ</p>
            <button
              type="button"
              className="results-share-panel__close"
              onClick={onCloseSharePanel}
              aria-label="ปิด"
            >
              ×
            </button>
          </div>
          <p className="results-share-panel__hint">
            ส่งลิงก์นี้ให้คนอื่นเปิดดูผลเปรียบเทียบได้ (อ่านอย่างเดียว)
          </p>
          <div className="results-share-panel__url-row">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="results-share-panel__url"
              onFocus={(event) => event.target.select()}
            />
            <button
              type="button"
              className="theme-btn-primary shrink-0 px-4 py-2 text-sm"
              onClick={() => void handleCopy()}
            >
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
          {canNativeShare && (
            <button
              type="button"
              className="theme-btn-outline mt-3 w-full text-sm"
              onClick={() => void onNativeShare()}
            >
              แชร์ผ่านแอปอื่น
            </button>
          )}
        </div>
      )}
    </div>
  );
}
