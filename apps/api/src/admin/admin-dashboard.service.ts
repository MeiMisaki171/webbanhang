import { Injectable } from "@nestjs/common";
import type { AdminDashboardStats } from "@repo/shared";
import { OrderStatus, PaymentStatus } from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminDashboardStats> {
    const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

    const [orderCount, revenueAggregate, lowStockProducts] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: {
          OR: [
            { status: OrderStatus.COMPLETED },
            { payment: { status: PaymentStatus.PAID } },
          ],
        },
        _sum: { total: true },
      }),
      this.prisma.product.findMany({
        where: {
          isActive: true,
          stock: { lte: lowStockThreshold },
        },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stock: true,
        },
      }),
    ]);

    return {
      orderCount,
      revenue: revenueAggregate._sum.total ?? 0,
      lowStockThreshold,
      lowStockProducts,
    };
  }
}
