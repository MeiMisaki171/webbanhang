import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { addCartItemSchema, updateCartItemSchema } from "@repo/shared";
import { AuthService } from "../auth/auth.service";
import { readGuestToken, writeGuestTokenCookie } from "../common/guest-cart-cookie";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getCart(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.resolveUser(request);
    const guestToken = readGuestToken(request);
    const result = await this.cartService.getOrCreateCart(user?.id, guestToken);

    if (!user && result.guestToken && result.created) {
      writeGuestTokenCookie(response, result.guestToken);
    }

    return result.cart;
  }

  @Post("items")
  async addItem(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const user = await this.authService.resolveUser(request);
    const guestToken = readGuestToken(request);
    const result = await this.cartService.addItem(user?.id, guestToken, parsed.data);

    if (!user && result.guestToken && result.created) {
      writeGuestTokenCookie(response, result.guestToken);
    }

    return result.cart;
  }

  @Patch("items/:id")
  async updateItem(
    @Req() request: Request,
    @Param("id") itemId: string,
    @Body() body: unknown,
  ) {
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const user = await this.authService.resolveUser(request);
    const guestToken = readGuestToken(request);
    return this.cartService.updateItem(user?.id, guestToken, itemId, parsed.data);
  }

  @Delete("items/:id")
  async removeItem(@Req() request: Request, @Param("id") itemId: string) {
    const user = await this.authService.resolveUser(request);
    const guestToken = readGuestToken(request);
    return this.cartService.removeItem(user?.id, guestToken, itemId);
  }
}
