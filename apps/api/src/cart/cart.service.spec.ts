import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CartRepository } from "./cart.repository";
import { CartService } from "./cart.service";

describe("CartService", () => {
  let repository: jest.Mocked<CartRepository>;
  let service: CartService;

  beforeEach(() => {
    repository = {
      findCartByGuestToken: jest.fn(),
      findCartByUserId: jest.fn(),
      createGuestCart: jest.fn(),
      createUserCart: jest.fn(),
      findProductForCart: jest.fn(),
      findCartItem: jest.fn(),
      upsertCartItem: jest.fn(),
      updateCartItemQuantity: jest.fn(),
      deleteCartItem: jest.fn(),
      touchCart: jest.fn(),
      clearCartItems: jest.fn(),
      deleteCart: jest.fn(),
    } as unknown as jest.Mocked<CartRepository>;

    service = new CartService(repository);
  });

  it("rejects add when quantity exceeds stock", async () => {
    repository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });
    repository.findProductForCart.mockResolvedValue({ id: "product-1", stock: 2 });

    await expect(
      service.addItem(undefined, "guest-1", { productId: "product-1", quantity: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates cart item quantity when stock allows", async () => {
    repository.findCartByGuestToken
      .mockResolvedValueOnce({
        id: "cart-1",
        guestToken: "guest-1",
        userId: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item-1",
            cartId: "cart-1",
            productId: "product-1",
            quantity: 1,
            product: {
              id: "product-1",
              categoryId: "cat-1",
              name: "Nồi cơm",
              slug: "noi-com",
              sku: "SKU-1",
              shortDescription: "Mô tả",
              description: "Mô tả dài",
              price: 1000000,
              compareAtPrice: null,
              stock: 5,
              brand: "Brand",
              specs: {},
              soldCount: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              images: [],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        id: "cart-1",
        guestToken: "guest-1",
        userId: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item-1",
            cartId: "cart-1",
            productId: "product-1",
            quantity: 2,
            product: {
              id: "product-1",
              categoryId: "cat-1",
              name: "Nồi cơm",
              slug: "noi-com",
              sku: "SKU-1",
              shortDescription: "Mô tả",
              description: "Mô tả dài",
              price: 1000000,
              compareAtPrice: null,
              stock: 5,
              brand: "Brand",
              specs: {},
              soldCount: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              images: [],
            },
          },
        ],
      });

    repository.findCartItem.mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      productId: "product-1",
      quantity: 1,
    });
    repository.findProductForCart.mockResolvedValue({ id: "product-1", stock: 5 });

    const result = await service.updateItem(undefined, "guest-1", "item-1", { quantity: 2 });

    expect(repository.updateCartItemQuantity).toHaveBeenCalledWith("item-1", 2);
    expect(result.itemCount).toBe(2);
    expect(result.subtotal).toBe(2000000);
  });

  it("throws when cart item is missing", async () => {
    repository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });
    repository.findCartItem.mockResolvedValue(null);

    await expect(
      service.updateItem(undefined, "guest-1", "missing", { quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("merges guest cart into user cart with stock clamp", async () => {
    repository.findCartByGuestToken.mockResolvedValue({
      id: "guest-cart",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "guest-item-1",
          cartId: "guest-cart",
          productId: "product-1",
          quantity: 3,
          product: {
            id: "product-1",
            categoryId: "cat-1",
            name: "Nồi cơm",
            slug: "noi-com",
            sku: "SKU-1",
            shortDescription: "Mô tả",
            description: "Mô tả dài",
            price: 1000000,
            compareAtPrice: null,
            stock: 4,
            brand: "Brand",
            specs: {},
            soldCount: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
          },
        },
      ],
    });
    repository.findCartByUserId.mockResolvedValue({
      id: "user-cart",
      guestToken: null,
      userId: "user-1",
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "user-item-1",
          cartId: "user-cart",
          productId: "product-1",
          quantity: 2,
          product: {
            id: "product-1",
            categoryId: "cat-1",
            name: "Nồi cơm",
            slug: "noi-com",
            sku: "SKU-1",
            shortDescription: "Mô tả",
            description: "Mô tả dài",
            price: 1000000,
            compareAtPrice: null,
            stock: 4,
            brand: "Brand",
            specs: {},
            soldCount: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
          },
        },
      ],
    });
    repository.findProductForCart.mockResolvedValue({ id: "product-1", stock: 4 });

    await service.mergeGuestCartIntoUser("user-1", "guest-1");

    expect(repository.upsertCartItem).toHaveBeenCalledWith("user-cart", "product-1", 4);
    expect(repository.deleteCart).toHaveBeenCalledWith("guest-cart");
  });
});
