import { BadRequestException, Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { checkoutSchema } from "@repo/shared";
import { AuthService } from "../auth/auth.service";
import { readGuestToken } from "../common/guest-cart-cookie";
import { CheckoutService } from "./checkout.service";

@Controller("checkout")
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly authService: AuthService,
  ) {}

  @Get("summary")
  getSummary() {
    return this.checkoutService.getSummary();
  }

  @Post()
  async checkout(@Req() request: Request, @Body() body: unknown) {
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const user = await this.authService.resolveUser(request);
    const guestToken = readGuestToken(request);
    return this.checkoutService.checkout(user?.id, guestToken, parsed.data);
  }
}
