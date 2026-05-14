import { z } from "zod";
import { OrderStatus, PaymentStatus } from "./enums.js";
import type { PaginatedResponse, PaginationMeta } from "./catalog.js";

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ.")
    .optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export type AdminCategoryInput = z.infer<typeof adminCategoryInputSchema>;

export const adminProductImageInputSchema = z.object({
  url: z.string().trim().url(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  alt: z.string().trim().max(200).nullable().optional(),
});

export const adminProductInputSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ.")
    .optional(),
  sku: z.string().trim().min(1).max(80),
  shortDescription: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1),
  price: z.coerce.number().int().nonnegative(),
  compareAtPrice: z.coerce.number().int().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().nonnegative(),
  brand: z.string().trim().min(1).max(120),
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  isActive: z.boolean().default(true),
  images: z.array(adminProductImageInputSchema).default([]),
});

export type AdminProductInput = z.infer<typeof adminProductInputSchema>;

export const adminOrderListQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;

export const adminUpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type AdminUpdateOrderStatusInput = z.infer<typeof adminUpdateOrderStatusSchema>;

export const adminUpdatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export type AdminUpdatePaymentStatusInput = z.infer<typeof adminUpdatePaymentStatusSchema>;

export const uploadPresignSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(120),
  folder: z
    .string()
    .trim()
    .regex(/^[a-z0-9/_-]+$/, "Thư mục không hợp lệ.")
    .default("products"),
});

export type UploadPresignInput = z.infer<typeof uploadPresignSchema>;

export type AdminCategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children: AdminCategoryNode[];
};

export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  brand: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  imageUrl: string | null;
};

export type AdminProductDetail = AdminProductSummary & {
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
};

export type AdminOrderListItem = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  payment: {
    method: string;
    status: PaymentStatus;
  };
  customerEmail: string | null;
};

export type AdminOrderDetail = {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  note: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  payment: {
    id: string;
    method: string;
    status: PaymentStatus;
    providerRef: string | null;
  };
};

export type AdminDashboardStats = {
  orderCount: number;
  revenue: number;
  lowStockThreshold: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    stock: number;
  }>;
};

export type AdminPaginatedProducts = PaginatedResponse<AdminProductSummary>;

export type AdminPaginatedOrders = PaginatedResponse<AdminOrderListItem>;

export type UploadPresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
};

export type AdminAuthUser = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
};

export type AdminLoginResponse = {
  user: AdminAuthUser;
};

export { type PaginationMeta };
