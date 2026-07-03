import NextImage from "next/image";
import {
  getAvatarOption,
  resolveAvatarId,
} from "@/lib/avatars";

type UserAvatarProps = {
  name?: string | null;
  email: string;
  avatarId?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: { box: "h-11 w-11 text-lg", px: 44 },
  md: { box: "h-14 w-14 text-2xl", px: 56 },
  lg: { box: "h-20 w-20 text-3xl", px: 80 },
} as const;

export default function UserAvatar({
  name,
  email,
  avatarId,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const dimensions = SIZE_MAP[size];
  const resolvedAvatarId = resolveAvatarId(avatarId);
  const avatarOption = getAvatarOption(avatarId);
  const avatarSrc = avatarOption?.src ?? null;
  const initial = (name || email).charAt(0).toUpperCase();
  const alt = resolvedAvatarId
    ? `รูปโปรไฟล์ ${name || email}`
    : `อักษรย่อ ${initial}`;

  if (avatarSrc && resolvedAvatarId) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-full border-2 border-slate-900 bg-[#F6F1E9] ${dimensions.box} ${className}`.trim()}
      >
        <NextImage
          key={resolvedAvatarId}
          src={avatarSrc}
          alt={alt}
          width={dimensions.px}
          height={dimensions.px}
          unoptimized
          className="h-full w-full object-contain object-center"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-orange-100 font-bold text-orange-700 ${dimensions.box} ${className}`.trim()}
      aria-hidden={!name && !email ? true : undefined}
    >
      {initial}
    </span>
  );
}
