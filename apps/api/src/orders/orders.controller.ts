import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "@repo/shared";
import { AuthService } from "../auth/auth.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.listOrdersForUser(user.id);
  }

  @Get(":code")
  async getOrder(@Req() request: Request, @Param("code") code: string) {
    const user = await this.authService.resolveUser(request);
    return this.ordersService.getOrderByCode(code, user ?? undefined);
  }
}
