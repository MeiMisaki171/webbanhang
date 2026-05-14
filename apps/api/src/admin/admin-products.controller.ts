import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { adminProductInputSchema, UserRole } from "@repo/shared";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminProductsService } from "./admin-products.service";

@Controller("admin/products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  list(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    const parsedPage = Number(page ?? 1);
    const parsedPageSize = Number(pageSize ?? 20);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException("Tham số page không hợp lệ.");
    }

    if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 50) {
      throw new BadRequestException("Tham số pageSize không hợp lệ.");
    }

    return this.adminProductsService.list(parsedPage, parsedPageSize);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.adminProductsService.getById(id);
  }

  @Post()
  create(@Body() body: unknown) {
    const parsed = adminProductInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminProductsService.create(parsed.data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    const parsed = adminProductInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminProductsService.update(id, parsed.data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminProductsService.remove(id);
  }
}
