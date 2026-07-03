export const AVATAR_IDS = [
  "student-boy-uniform",
  "student-boy-hoodie",
  "student-boy-rmutt",
  "student-girl-atit",
  "officer-male",
  "officer-female",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export type AvatarOption = {
  id: AvatarId;
  label: string;
  src: string;
};

function avatarSrc(fileName: string) {
  return `/avatars/${fileName}`;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "student-boy-uniform",
    label: "นักเรียนชาย — ชุดนักเรียน",
    src: avatarSrc("student-boy-uniform.png"),
  },
  {
    id: "student-boy-hoodie",
    label: "นักเรียนชาย — ฮู้ดดี้",
    src: avatarSrc("student-boy-hoodie.png"),
  },
  {
    id: "student-boy-rmutt",
    label: "นักเรียนชาย — RMUTT",
    src: avatarSrc("student-boy-rmutt.png"),
  },
  {
    id: "student-girl-atit",
    label: "นักเรียนหญิง — ATIT",
    src: avatarSrc("student-girl-atit.png"),
  },
  {
    id: "officer-male",
    label: "เจ้าหน้าที่ชาย",
    src: avatarSrc("officer-male.png"),
  },
  {
    id: "officer-female",
    label: "เจ้าหน้าที่หญิง",
    src: avatarSrc("officer-female.png"),
  },
];

const avatarSet = new Set<string>(AVATAR_IDS);

/** Map old avatar ids (including generated poses) to the 5 source characters. */
const LEGACY_AVATAR_MAP: Record<string, AvatarId> = {
  "officer-male-wave": "officer-male",
  "officer-male-calc": "officer-male",
  "officer-male-point": "officer-male",
  "officer-female-point": "officer-female",
  "officer-female-thumbsup": "officer-female",
  "student-boy-think": "student-boy-uniform",
  "student-boy-uniform-wave": "student-boy-uniform",
  "student-boy-house": "student-boy-hoodie",
  "student-boy-hoodie-house": "student-boy-hoodie",
  "student-girl-wave": "student-girl-atit",
  "student-girl-atit-wave": "student-girl-atit",
};

export function resolveAvatarId(value: string | null | undefined): AvatarId | null {
  if (!value) {
    return null;
  }

  if (isAvatarId(value)) {
    return value;
  }

  return LEGACY_AVATAR_MAP[value] ?? null;
}

export function isAvatarId(value: string | null | undefined): value is AvatarId {
  return Boolean(value && avatarSet.has(value));
}

export function isSameAvatar(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  return resolveAvatarId(left) === resolveAvatarId(right);
}

export function getAvatarOption(avatarId: string | null | undefined) {
  const resolved = resolveAvatarId(avatarId);
  if (!resolved) {
    return null;
  }

  return AVATAR_OPTIONS.find((option) => option.id === resolved) ?? null;
}

export function getAvatarSrc(avatarId: string | null | undefined) {
  return getAvatarOption(avatarId)?.src ?? null;
}
