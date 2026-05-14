import { z } from "zod";
import { UserRole } from "./enums.js";

export const AUTH_ACCESS_COOKIE = "dgp_access_token";
export const AUTH_REFRESH_COOKIE = "dgp_refresh_token";

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
  .max(100, "Mật khẩu quá dài.");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ.");

const emailSchema = z.string().trim().email("Email không hợp lệ.");

export function normalizePhone(phone: string): string {
  return phone.trim();
}

export function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes("@");
}

export const registerSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
    fullName: z.string().trim().min(2).max(120).optional(),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng nhập email hoặc số điện thoại.",
        path: ["email"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Vui lòng nhập email hoặc số điện thoại."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
};

export type OrderListItemView = {
  code: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  payment: {
    method: string;
    status: string;
  };
};
