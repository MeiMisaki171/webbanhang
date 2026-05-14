import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  adminOrderListQuerySchema,
  adminUpdateOrderStatusSchema,
  adminUpdatePaymentStatusSchema,
  UserRole,
} from "@repo/shared";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminOrdersService } from "./admin-orders.service";

@Controller("admin/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    const parsed = adminOrderListQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminOrdersService.list(parsed.data);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.adminOrdersService.getById(id);
  }

  @Patch(":id")
  updateStatus(@Param("id") id: string, @Body() body: unknown) {
    const parsed = adminUpdateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminOrdersService.updateOrderStatus(id, parsed.data);
  }
}

@Controller("admin/payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPaymentsController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Patch(":id")
  updateStatus(@Param("id") id: string, @Body() body: unknown) {
    const parsed = adminUpdatePaymentStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminOrdersService.updatePaymentStatus(id, parsed.data);
  }
}
