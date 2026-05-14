import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CheckoutInput, OrderView, ShippingAddressSnapshot } from "@repo/shared";
import { PaymentMethod, PaymentStatus } from "@repo/shared";
import { CartRepository } from "../cart/cart.repository";
import { GeoService } from "../geo/geo.service";
import { CheckoutRepository, resolveShippingFee } from "./checkout.repository";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly checkoutRepository: CheckoutRepository,
    private readonly geoService: GeoService,
  ) {}

  getSummary() {
    return {
      shippingFee: resolveShippingFee(),
    };
  }

  async checkout(
    userId: string | undefined,
    guestToken: string | undefined,
    input: CheckoutInput,
  ): Promise<OrderView> {
    const cart = userId
      ? await this.cartRepository.findCartByUserId(userId)
      : guestToken
        ? await this.cartRepository.findCartByGuestToken(guestToken)
        : null;

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Giỏ hàng trống.");
    }

    const provinces = await this.geoService.listProvinces();
    const province = provinces.find((item) => item.code === input.provinceCode);
    if (!province) {
      throw new BadRequestException("Tỉnh/thành không hợp lệ.");
    }

    const wards = await this.geoService.listWards(input.provinceCode);
    const ward = wards.find((item) => item.code === input.wardCode);
    if (!ward) {
      throw new BadRequestException("Phường/xã không hợp lệ.");
    }

    const shippingAddress: ShippingAddressSnapshot = {
      recipientName: input.recipientName,
      phone: input.phone,
      email: input.email,
      provinceCode: province.code,
      provinceName: province.name,
      wardCode: ward.code,
      wardName: ward.name,
      line1: input.line1,
    };

    try {
      const order = await this.checkoutRepository.createOrderFromCart({
        cartId: cart.id,
        userId,
        shippingAddress,
        note: input.note,
        paymentMethod: input.paymentMethod,
        shippingFee: resolveShippingFee(),
      });

      return this.toOrderView(order, input.paymentMethod);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "EMPTY_CART") {
          throw new BadRequestException("Giỏ hàng trống.");
        }
        if (error.message === "INSUFFICIENT_STOCK") {
          throw new BadRequestException("Một số sản phẩm không đủ tồn kho.");
        }
        if (error.message === "INACTIVE_PRODUCT") {
          throw new BadRequestException("Giỏ hàng có sản phẩm không còn bán.");
        }
      }

      throw error;
    }
  }

  private toOrderView(
    order: Awaited<ReturnType<CheckoutRepository["createOrderFromCart"]>>,
    paymentMethod: PaymentMethod,
  ): OrderView {
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
        method: (order.payment?.method ?? paymentMethod) as PaymentMethod,
        status: (order.payment?.status ?? PaymentStatus.UNPAID) as PaymentStatus,
      },
    };

    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
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
