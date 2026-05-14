import { BadRequestException } from "@nestjs/common";
import { PaymentMethod, PaymentStatus } from "@repo/shared";
import { CartRepository } from "../cart/cart.repository";
import { GeoService } from "../geo/geo.service";
import { CheckoutRepository } from "./checkout.repository";
import { CheckoutService } from "./checkout.service";

const cartItemFixture = {
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
    price: 1_000_000,
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
};

const checkoutInput = {
  recipientName: "Nguyễn Văn A",
  phone: "0901234567",
  email: "a@example.com",
  provinceCode: "01",
  wardCode: "01001",
  line1: "123 Đường ABC",
  paymentMethod: PaymentMethod.COD,
};

describe("CheckoutService", () => {
  let cartRepository: jest.Mocked<CartRepository>;
  let checkoutRepository: jest.Mocked<CheckoutRepository>;
  let geoService: jest.Mocked<GeoService>;
  let service: CheckoutService;

  beforeEach(() => {
    cartRepository = {
      findCartByGuestToken: jest.fn(),
      findCartByUserId: jest.fn(),
    } as unknown as jest.Mocked<CartRepository>;

    checkoutRepository = {
      createOrderFromCart: jest.fn(),
    } as unknown as jest.Mocked<CheckoutRepository>;

    geoService = {
      listProvinces: jest.fn(),
      listWards: jest.fn(),
    } as unknown as jest.Mocked<GeoService>;

    service = new CheckoutService(cartRepository, checkoutRepository, geoService);
  });

  it("rejects checkout when guest cart is empty", async () => {
    cartRepository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    await expect(
      service.checkout(undefined, "guest-1", checkoutInput),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects checkout when ward does not belong to province", async () => {
    cartRepository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [cartItemFixture],
    });
    geoService.listProvinces.mockResolvedValue([{ code: "01", name: "Hà Nội" }]);
    geoService.listWards.mockResolvedValue([{ code: "01001", provinceCode: "01", name: "Phường A" }]);

    await expect(
      service.checkout(undefined, "guest-1", {
        ...checkoutInput,
        wardCode: "79001",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("maps insufficient stock errors from repository", async () => {
    cartRepository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [cartItemFixture],
    });
    geoService.listProvinces.mockResolvedValue([{ code: "01", name: "Hà Nội" }]);
    geoService.listWards.mockResolvedValue([{ code: "01001", provinceCode: "01", name: "Phường A" }]);
    checkoutRepository.createOrderFromCart.mockRejectedValue(new Error("INSUFFICIENT_STOCK"));

    await expect(
      service.checkout(undefined, "guest-1", checkoutInput),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates order for guest cart", async () => {
    cartRepository.findCartByGuestToken.mockResolvedValue({
      id: "cart-1",
      guestToken: "guest-1",
      userId: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [cartItemFixture],
    });
    geoService.listProvinces.mockResolvedValue([{ code: "01", name: "Hà Nội" }]);
    geoService.listWards.mockResolvedValue([{ code: "01001", provinceCode: "01", name: "Phường A" }]);
    checkoutRepository.createOrderFromCart.mockResolvedValue({
      code: "DGP-20260514-ABC123",
      status: "PENDING",
      subtotal: 1_000_000,
      shippingFee: 30_000,
      discount: 0,
      total: 1_030_000,
      shippingAddress: {
        recipientName: checkoutInput.recipientName,
        phone: checkoutInput.phone,
        email: checkoutInput.email,
        provinceCode: "01",
        provinceName: "Hà Nội",
        wardCode: "01001",
        wardName: "Phường A",
        line1: checkoutInput.line1,
      },
      note: null,
      createdAt: new Date("2026-05-14T08:00:00.000Z"),
      items: [{
        id: "order-item-1",
        productId: "product-1",
        productName: "Nồi cơm",
        sku: "SKU-1",
        unitPrice: 1_000_000,
        quantity: 1,
        lineTotal: 1_000_000,
      }],
      payment: {
        method: PaymentMethod.COD,
        status: PaymentStatus.UNPAID,
      },
    });

    const order = await service.checkout(undefined, "guest-1", checkoutInput);

    expect(checkoutRepository.createOrderFromCart).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: "cart-1",
        paymentMethod: PaymentMethod.COD,
      }),
    );
    expect(order.code).toBe("DGP-20260514-ABC123");
    expect(order.payment.status).toBe(PaymentStatus.UNPAID);
  });
});
