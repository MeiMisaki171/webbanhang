import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import type { AuthUser, OrderListItemView, OrderView, ShippingAddressSnapshot } from "@repo/shared";

import { PaymentMethod, PaymentStatus, UserRole } from "@repo/shared";

import { PrismaService } from "../prisma/prisma.service";



@Injectable()

export class OrdersService {

  constructor(private readonly prisma: PrismaService) {}



  async listOrdersForUser(userId: string): Promise<OrderListItemView[]> {

    const orders = await this.prisma.order.findMany({

      where: { userId },

      include: {

        items: true,

        payment: true,

      },

      orderBy: { createdAt: "desc" },

    });



    return orders.map((order) => ({

      code: order.code,

      status: order.status,

      total: order.total,

      createdAt: order.createdAt.toISOString(),

      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),

      payment: {

        method: order.payment?.method ?? PaymentMethod.COD,

        status: order.payment?.status ?? PaymentStatus.UNPAID,

      },

    }));

  }



  async getOrderByCode(code: string, user?: AuthUser): Promise<OrderView> {

    const order = await this.prisma.order.findUnique({

      where: { code },

      include: {

        items: true,

        payment: true,

      },

    });



    if (!order) {

      throw new NotFoundException("Không tìm thấy đơn hàng.");

    }



    if (user && user.role !== UserRole.ADMIN && order.userId && order.userId !== user.id) {
      throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");
    }



    const view: OrderView = {

      code: order.code,

      status: order.status,

      subtotal: order.subtotal,

      shippingFee: order.shippingFee,

      discount: order.discount,

      total: order.total,

      shippingAddress: order.shippingAddress as ShippingAddressSnapshot,

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

        method: (order.payment?.method ?? PaymentMethod.COD) as PaymentMethod,

        status: (order.payment?.status ?? PaymentStatus.UNPAID) as PaymentStatus,

      },

    };



    if (order.payment?.method === PaymentMethod.BANK_TRANSFER) {

      view.bankTransfer = {

        bankName: process.env.BANK_NAME ?? "",

        bankAccount: process.env.BANK_ACCOUNT ?? "",

        bankHolder: process.env.BANK_HOLDER ?? "",

        bankQrUrl: process.env.BANK_QR_URL ?? null,

      };

    }



    return view;

  }

}


