import { PaymentMethod, PaymentStatus } from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutRepository } from "./checkout.repository";

describe("CheckoutRepository", () => {
  let prisma: {
    $transaction: jest.Mock;
  };
  let repository: CheckoutRepository;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
    };
    repository = new CheckoutRepository(prisma as unknown as PrismaService);
  });

  it("rejects checkout when stock update fails", async () => {
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: "cart-1",
          items: [{
            productId: "product-1",
            quantity: 2,
            product: {
              id: "product-1",
              name: "Nồi cơm",
              sku: "SKU-1",
              price: 1_000_000,
              isActive: true,
            },
          }],
        }),
      },
      product: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      order: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };

    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
    );

    await expect(
      repository.createOrderFromCart({
        cartId: "cart-1",
        shippingAddress: { line1: "123" },
        paymentMethod: PaymentMethod.COD,
        shippingFee: 30_000,
      }),
    ).rejects.toThrow("INSUFFICIENT_STOCK");
  });

  it("decrements stock and clears cart items on success", async () => {
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: "cart-1",
          items: [{
            productId: "product-1",
            quantity: 1,
            product: {
              id: "product-1",
              name: "Nồi cơm",
              sku: "SKU-1",
              price: 1_000_000,
              isActive: true,
            },
          }],
        }),
      },
      product: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: jest.fn().mockResolvedValue({
          code: "DGP-20260514-ABC123",
          status: "PENDING",
          subtotal: 1_000_000,
          shippingFee: 30_000,
          discount: 0,
          total: 1_030_000,
          shippingAddress: {},
          note: null,
          createdAt: new Date(),
          items: [],
          payment: {
            method: PaymentMethod.COD,
            status: PaymentStatus.UNPAID,
          },
        }),
      },
      cartItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
    );

    const order = await repository.createOrderFromCart({
      cartId: "cart-1",
      shippingAddress: { line1: "123" },
      paymentMethod: PaymentMethod.COD,
      shippingFee: 30_000,
    });

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: "product-1",
        stock: { gte: 1 },
        isActive: true,
      },
      data: {
        stock: { decrement: 1 },
        soldCount: { increment: 1 },
      },
    });
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: "cart-1" } });
    expect(order.code).toBe("DGP-20260514-ABC123");
  });
});
