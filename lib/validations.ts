import { z } from "zod";
import { AVATAR_IDS } from "@/lib/avatars";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("กรุณากรอกอีเมลให้ถูกต้อง");

export const passwordSchema = z
  .string()
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");

export const registerSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().max(120, "ชื่อยาวเกินไป").optional(),
    avatarId: z.union([z.enum(AVATAR_IDS), z.null()]).optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarId !== undefined, {
    message: "ไม่มีข้อมูลที่จะอัปเดต",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  newPassword: passwordSchema,
});

const scenarioSchema = z.object({
  id: z.string(),
  bankName: z.string().min(1).max(120),
  loanType: z.enum(["refinance", "retention"]),
  principal: z.number().finite(),
  monthlyPayment: z.number().finite(),
  rateYear1: z.number().finite(),
  rateYear2: z.number().finite(),
  rateYear3: z.number().finite(),
  useCustomRates: z.boolean(),
  useCustomFees: z.boolean(),
  feeMortgage: z.number().finite(),
  feeStamp: z.number().finite(),
  feeAppraisal: z.number().finite(),
  feeInsurance: z.number().finite(),
  resultFinal: z.number().finite().nullable(),
  isSaved: z.boolean().optional(),
});

export const comparisonRunSchema = z.object({
  scenarios: z.array(scenarioSchema).min(1).max(32),
});
