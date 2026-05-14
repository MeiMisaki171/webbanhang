import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const CART_EXPIRY_DAYS = 30;

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" as const },
            take: 1,
          },
        },
      },
    },
    orderBy: { id: "asc" as const },
  },
} as const;

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCartByGuestToken(guestToken: string) {
    return this.prisma.cart.findUnique({
      where: { guestToken },
      include: cartInclude,
    });
  }

  findCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
  }

  createGuestCart(guestToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

    return this.prisma.cart.create({
      data: {
        guestToken,
        expiresAt,
      },
      include: cartInclude,
    });
  }

  createUserCart(userId: string) {
    return this.prisma.cart.create({
      data: {
        userId,
      },
      include: cartInclude,
    });
  }

  findProductForCart(productId: string) {
    return this.prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
        stock: true,
      },
    });
  }

  findCartItem(cartId: string, itemId: string) {
    return this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });
  }

  upsertCartItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
      update: {
        quantity,
      },
    });
  }

  updateCartItemQuantity(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  deleteCartItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  touchCart(cartId: string) {
    return this.prisma.cart.update({
      where: { id: cartId },
      data: { updatedAt: new Date() },
    });
  }

  clearCartItems(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  deleteCart(cartId: string) {
    return this.prisma.cart.delete({
      where: { id: cartId },
    });
  }
}
