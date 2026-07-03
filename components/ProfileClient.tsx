"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import UserAvatar from "@/components/UserAvatar";
import {
  AVATAR_OPTIONS,
  type AvatarId,
  isSameAvatar,
  resolveAvatarId,
} from "@/lib/avatars";

export type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  avatarId: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  memberSince: string;
};

type ProfileClientProps = {
  profile: ProfileData;
};

export default function ProfileClient({ profile }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? "");
  const [avatarId, setAvatarId] = useState<string | null>(() =>
    resolveAvatarId(profile.avatarId),
  );

  useEffect(() => {
    setAvatarId(resolveAvatarId(profile.avatarId));
  }, [profile.avatarId]);
  const [nameMessage, setNameMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isVerified = Boolean(profile.emailVerifiedAt);

  async function handleSelectAvatar(nextAvatarId: AvatarId | null) {
    if (isSameAvatar(nextAvatarId, avatarId) || isSavingAvatar) {
      return;
    }

    setAvatarMessage("");
    setAvatarError("");
    setIsSavingAvatar(true);

    const response = await fetch("/api/auth/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId: nextAvatarId }),
    });

    const data = await response.json().catch(() => null);
    setIsSavingAvatar(false);

    if (!response.ok) {
      setAvatarError(data?.message ?? "บันทึกรูปโปรไฟล์ไม่สำเร็จ");
      return;
    }

    setAvatarId(resolveAvatarId(data?.user?.avatarId ?? nextAvatarId));
    setAvatarMessage(data?.message ?? "บันทึกรูปโปรไฟล์เรียบร้อยแล้ว");
    router.refresh();
  }

  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameMessage("");
    setNameError("");
    setIsSavingName(true);

    const response = await fetch("/api/auth/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await response.json().catch(() => null);
    setIsSavingName(false);

    if (!response.ok) {
      setNameError(data?.message ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setNameMessage(data?.message ?? "บันทึกชื่อเรียบร้อยแล้ว");
    router.refresh();
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    setIsSavingPassword(true);

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json().catch(() => null);
    setIsSavingPassword(false);

    if (!response.ok) {
      setPasswordError(data?.message ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      return;
    }

    setPasswordMessage(data?.message ?? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "ลบบัญชีถาวร? ข้อมูลที่บันทึกทั้งหมดจะหายและกู้คืนไม่ได้",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    const response = await fetch("/api/auth/account", { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setIsDeleting(false);

    if (!response.ok) {
      setDeleteError(data?.message ?? "ลบบัญชีไม่สำเร็จ");
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6">
      <article className="theme-card space-y-6 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={name}
            email={profile.email}
            avatarId={avatarId}
            size="lg"
          />
          <div className="min-w-0">
            <p className="theme-kicker">บัญชี</p>
            <h1 className="theme-card-title mt-1 text-2xl font-bold">
              โปรไฟล์
            </h1>
            <p className="theme-card-text mt-1 text-sm">
              สมาชิกตั้งแต่ {profile.memberSince}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white/60 p-5">
          <h2 className="theme-card-title text-lg font-bold">รูปโปรไฟล์</h2>
          <p className="theme-card-text mt-1 text-sm">
            เลือกตัวละครการ์ตูน RefiLab
          </p>

          <div
            className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4"
            role="listbox"
            aria-label="เลือกรูปโปรไฟล์"
          >
            <button
              type="button"
              role="option"
              aria-selected={avatarId === null}
              disabled={isSavingAvatar}
              onClick={() => handleSelectAvatar(null)}
              className={`profile-avatar-option${
                avatarId === null ? " profile-avatar-option--active" : ""
              }`}
            >
              <UserAvatar
                name={name}
                email={profile.email}
                avatarId={null}
                size="md"
              />
              <span className="profile-avatar-option__label">ตัวอักษร</span>
            </button>

            {AVATAR_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSameAvatar(avatarId, option.id)}
                aria-label={option.label}
                disabled={isSavingAvatar}
                onClick={() => handleSelectAvatar(option.id)}
                className={`profile-avatar-option${
                  isSameAvatar(avatarId, option.id)
                    ? " profile-avatar-option--active"
                    : ""
                }`}
              >
                <UserAvatar
                  name={name}
                  email={profile.email}
                  avatarId={option.id}
                  size="md"
                />
                <span className="profile-avatar-option__label">
                  {option.label.split(" — ")[0]}
                </span>
              </button>
            ))}
          </div>

          {avatarError && (
            <p className="theme-alert-error mt-3 text-sm">{avatarError}</p>
          )}
          {avatarMessage && (
            <p className="theme-alert-success mt-3 text-sm">{avatarMessage}</p>
          )}
          {isSavingAvatar && (
            <p className="theme-card-text mt-3 text-sm">กำลังบันทึกรูป...</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/60 p-5">
          <h2 className="theme-card-title text-lg font-bold">ข้อมูลส่วนตัว</h2>

          <form onSubmit={handleSaveName} className="mt-4 space-y-4">
            <label className="block">
              <span className="theme-label">ชื่อที่แสดง</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                className="theme-input mt-2"
                placeholder="ชื่อของคุณ"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="theme-label">อีเมล</span>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="theme-input mt-2 cursor-not-allowed bg-slate-100 text-slate-600"
              />
            </label>

            <p className="theme-card-text text-xs leading-5">
              {isVerified ? (
                <span className="font-semibold text-emerald-700">
                  ✓ ยืนยันอีเมลแล้ว
                </span>
              ) : (
                <span>
                  ยังไม่ได้ยืนยันอีเมล — ตรวจสอบกล่องจดหมาย (รวมโฟลเดอร์สแปม) หลังสมัครสมาชิก
                </span>
              )}
            </p>

            {nameError && <p className="theme-alert-error text-sm">{nameError}</p>}
            {nameMessage && (
              <p className="theme-alert-success text-sm">{nameMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSavingName}
              className="theme-btn-primary disabled:cursor-not-allowed"
            >
              {isSavingName ? "กำลังบันทึก..." : "บันทึกชื่อ"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/60 p-5">
          <h2 className="theme-card-title text-lg font-bold">เปลี่ยนรหัสผ่าน</h2>
          <p className="theme-card-text mt-1 text-sm">
            ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร
          </p>

          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <label className="block">
              <span className="theme-label">รหัสผ่านปัจจุบัน</span>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
                required
              />
            </label>

            <label className="block">
              <span className="theme-label">รหัสผ่านใหม่</span>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>

            {passwordError && (
              <p className="theme-alert-error text-sm">{passwordError}</p>
            )}
            {passwordMessage && (
              <p className="theme-alert-success text-sm">{passwordMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="theme-btn-outline disabled:cursor-not-allowed"
            >
              {isSavingPassword ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/60 p-5">
          <h2 className="theme-card-title text-lg font-bold">เมนูบัญชี</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href="/account/history" className="theme-btn-outline text-center">
              ประวัติการคำนวณ
            </Link>
            <Link href="/privacy" className="theme-btn-outline text-center">
              นโยบายความเป็นส่วนตัว
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="theme-btn-outline"
            >
              ออกจากระบบ
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
          <h2 className="text-lg font-bold text-red-800">ลบบัญชี</h2>
          <p className="mt-1 text-sm leading-6 text-red-900/80">
            ข้อมูลที่บันทึก ประวัติการคำนวณ และบัญชีจะถูกลบถาวร
          </p>
          {deleteError && (
            <p className="theme-alert-error mt-3 text-sm">{deleteError}</p>
          )}
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="mt-4 text-sm font-semibold text-red-700 underline disabled:opacity-50"
          >
            {isDeleting ? "กำลังลบบัญชี..." : "ลบบัญชีถาวร"}
          </button>
        </section>

        <Link href="/" className="theme-link inline-block text-sm">
          ← กลับหน้าแรก
        </Link>
      </article>
    </main>
  );
}
