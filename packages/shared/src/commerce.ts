import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "./enums.js";

export const GUEST_CART_COOKIE = "dgp_guest_token";

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(99),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(99),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const checkoutAddressSchema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ."),
  email: z.string().trim().email(),
  provinceCode: z.string().trim().min(1),
  wardCode: z.string().trim().min(1),
  line1: z.string().trim().min(5).max(255),
});

export const checkoutSchema = checkoutAddressSchema.extend({
  paymentMethod: z.nativeEnum(PaymentMethod),
  note: z.string().trim().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type ShippingAddressSnapshot = {
  recipientName: string;
  phone: string;
  email: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  line1: string;
};

export type CartItemView = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
  };
  lineTotal: number;
};

export type CartView = {
  id: string;
  items: CartItemView[];
  itemCount: number;
  subtotal: number;
};

export type ProvinceSummary = {
  code: string;
  name: string;
};

export type WardSummary = {
  code: string;
  provinceCode: string;
  name: string;
};

export type OrderItemView = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PaymentView = {
  method: PaymentMethod;
  status: PaymentStatus;
};

export type BankTransferInfo = {
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  bankQrUrl: string | null;
};

export type OrderView = {
  code: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddressSnapshot;
  note: string | null;
  createdAt: string;
  items: OrderItemView[];
  payment: PaymentView;
  bankTransfer?: BankTransferInfo;
};
