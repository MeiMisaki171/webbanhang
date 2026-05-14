import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AddCartItemInput,
  CartItemView,
  CartView,
  UpdateCartItemInput,
} from "@repo/shared";
import { randomUUID } from "node:crypto";
import { CartRepository } from "./cart.repository";

type CartWithItems = NonNullable<Awaited<ReturnType<CartRepository["findCartByGuestToken"]>>>;

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getOrCreateCart(
    userId?: string,
    guestToken?: string,
  ): Promise<{
    cart: CartView;
    guestToken?: string;
    created: boolean;
  }> {
    if (userId) {
      const existing = await this.cartRepository.findCartByUserId(userId);
      if (existing) {
        return {
          cart: this.toCartView(existing),
          created: false,
        };
      }

      const createdCart = await this.cartRepository.createUserCart(userId);
      return {
        cart: this.toCartView(createdCart),
        created: true,
      };
    }

    if (guestToken) {
      const existing = await this.cartRepository.findCartByGuestToken(guestToken);
      if (existing) {
        return {
          cart: this.toCartView(existing),
          guestToken,
          created: false,
        };
      }
    }

    const token = randomUUID();
    const createdCart = await this.cartRepository.createGuestCart(token);
    return {
      cart: this.toCartView(createdCart),
      guestToken: token,
      created: true,
    };
  }

  async addItem(
    userId: string | undefined,
    guestToken: string | undefined,
    input: AddCartItemInput,
  ): Promise<{
    cart: CartView;
    guestToken?: string;
    created: boolean;
  }> {
    const { cart, guestToken: resolvedToken, created } = await this.getOrCreateCart(
      userId,
      guestToken,
    );

    const product = await this.cartRepository.findProductForCart(input.productId);
    if (!product) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    const existingItem = cart.items.find((item) => item.productId === input.productId);
    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (nextQuantity > product.stock) {
      throw new BadRequestException("Số lượng vượt quá tồn kho.");
    }

    await this.cartRepository.upsertCartItem(cart.id, input.productId, nextQuantity);
    await this.cartRepository.touchCart(cart.id);

    const refreshed = await this.refreshCart(userId, resolvedToken);
    if (!refreshed) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    return {
      cart: this.toCartView(refreshed),
      guestToken: resolvedToken,
      created,
    };
  }

  async updateItem(
    userId: string | undefined,
    guestToken: string | undefined,
    itemId: string,
    input: UpdateCartItemInput,
  ): Promise<CartView> {
    const { cart, guestToken: resolvedToken } = await this.getOrCreateCart(userId, guestToken);
    const item = await this.cartRepository.findCartItem(cart.id, itemId);

    if (!item) {
      throw new NotFoundException("Không tìm thấy sản phẩm trong giỏ.");
    }

    const product = await this.cartRepository.findProductForCart(item.productId);
    if (!product) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    if (input.quantity > product.stock) {
      throw new BadRequestException("Số lượng vượt quá tồn kho.");
    }

    await this.cartRepository.updateCartItemQuantity(itemId, input.quantity);
    await this.cartRepository.touchCart(cart.id);

    const refreshed = await this.refreshCart(userId, resolvedToken);
    if (!refreshed) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    return this.toCartView(refreshed);
  }

  async removeItem(
    userId: string | undefined,
    guestToken: string | undefined,
    itemId: string,
  ): Promise<CartView> {
    const { cart, guestToken: resolvedToken } = await this.getOrCreateCart(userId, guestToken);
    const item = await this.cartRepository.findCartItem(cart.id, itemId);

    if (!item) {
      throw new NotFoundException("Không tìm thấy sản phẩm trong giỏ.");
    }

    await this.cartRepository.deleteCartItem(itemId);
    await this.cartRepository.touchCart(cart.id);

    const refreshed = await this.refreshCart(userId, resolvedToken);
    if (!refreshed) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    return this.toCartView(refreshed);
  }

  async mergeGuestCartIntoUser(userId: string, guestToken: string): Promise<void> {
    const guestCart = await this.cartRepository.findCartByGuestToken(guestToken);
    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) {
        await this.cartRepository.deleteCart(guestCart.id);
      }
      return;
    }

    const { cart: userCart } = await this.getOrCreateCart(userId);

    for (const guestItem of guestCart.items) {
      const product = await this.cartRepository.findProductForCart(guestItem.productId);
      if (!product) {
        continue;
      }

      const existingItem = userCart.items.find((item) => item.productId === guestItem.productId);
      const mergedQuantity = (existingItem?.quantity ?? 0) + guestItem.quantity;
      const clampedQuantity = Math.min(mergedQuantity, product.stock);

      if (clampedQuantity <= 0) {
        if (existingItem) {
          await this.cartRepository.deleteCartItem(existingItem.id);
        }
        continue;
      }

      await this.cartRepository.upsertCartItem(userCart.id, guestItem.productId, clampedQuantity);
    }

    await this.cartRepository.touchCart(userCart.id);
    await this.cartRepository.deleteCart(guestCart.id);
  }

  private async refreshCart(userId?: string, guestToken?: string) {
    if (userId) {
      return this.cartRepository.findCartByUserId(userId);
    }

    if (guestToken) {
      return this.cartRepository.findCartByGuestToken(guestToken);
    }

    return null;
  }

  private toCartView(cart: CartWithItems): CartView {
    const items: CartItemView[] = cart.items
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          sku: item.product.sku,
          price: item.product.price,
          stock: item.product.stock,
          imageUrl: item.product.images[0]?.url ?? null,
          isActive: item.product.isActive,
        },
        lineTotal: item.product.price * item.quantity,
      }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      itemCount,
      subtotal,
    };
  }
}
