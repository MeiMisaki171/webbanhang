import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  buildPaginationMeta,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  type AdminOrderDetail,
  type AdminOrderListQuery,
  type AdminPaginatedOrders,
  type AdminUpdateOrderStatusInput,
  type AdminUpdatePaymentStatusInput,
} from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminOrderListQuery): Promise<AdminPaginatedOrders> {
    const skip = (query.page - 1) * query.pageSize;
    const where = query.status ? { status: query.status } : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          payment: true,
          user: {
            select: { email: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: items.map((order) => ({
        id: order.id,
        code: order.code,
        status: order.status as OrderStatus,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        payment: {
          method: (order.payment?.method ?? PaymentMethod.COD) as PaymentMethod,
          status: (order.payment?.status ?? PaymentStatus.UNPAID) as PaymentStatus,
        },
        customerEmail: order.user?.email ?? null,
      })),
      meta: buildPaginationMeta(query.page, query.pageSize, total),
    };
  }

  async getById(id: string): Promise<AdminOrderDetail> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order || !order.payment) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }

    return {
      id: order.id,
      code: order.code,
      status: order.status as OrderStatus,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress as Record<string, unknown>,
      note: order.note,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      payment: {
        id: order.payment.id,
        method: order.payment.method as PaymentMethod,
        status: order.payment.status as PaymentStatus,
        providerRef: order.payment.providerRef,
      },
    };
  }

  async updateOrderStatus(id: string, input: AdminUpdateOrderStatusInput): Promise<AdminOrderDetail> {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: input.status },
    });

    return this.getById(id);
  }

  async updatePaymentStatus(
    paymentId: string,
    input: AdminUpdatePaymentStatusInput,
  ): Promise<AdminOrderDetail> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, orderId: true },
    });

    if (!payment) {
      throw new NotFoundException("Không tìm thấy thanh toán.");
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: input.status },
    });

    return this.getById(payment.orderId);
  }
}
