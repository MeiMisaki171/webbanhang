import { Injectable } from "@nestjs/common";
import { PaymentMethod, PaymentStatus } from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";

function resolveShippingFee(): number {
  const configured = Number(process.env.SHIPPING_FLAT_FEE ?? 30000);
  return Number.isFinite(configured) && configured >= 0 ? configured : 30000;
}

function createOrderCode(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DGP-${y}${m}${d}-${suffix}`;
}

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderFromCart(params: {
    cartId: string;
    userId?: string;
    shippingAddress: Record<string, string>;
    note?: string;
    paymentMethod: PaymentMethod;
    shippingFee: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: params.cartId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("EMPTY_CART");
      }

      let subtotal = 0;
      const orderItems: Array<{
        productId: string;
        productName: string;
        sku: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }> = [];

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new Error("INACTIVE_PRODUCT");
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            isActive: true,
          },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const lineTotal = item.product.price * item.quantity;
        subtotal += lineTotal;
        orderItems.push({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          unitPrice: item.product.price,
          quantity: item.quantity,
          lineTotal,
        });
      }

      const discount = 0;
      const total = subtotal + params.shippingFee - discount;
      const code = createOrderCode();

      const order = await tx.order.create({
        data: {
          code,
          userId: params.userId,
          status: "PENDING",
          subtotal,
          shippingFee: params.shippingFee,
          discount,
          total,
          shippingAddress: params.shippingAddress,
          note: params.note,
          items: {
            create: orderItems,
          },
          payment: {
            create: {
              method: params.paymentMethod,
              status: PaymentStatus.UNPAID,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: params.cartId },
      });

      return order;
    });
  }
}

export { resolveShippingFee };
