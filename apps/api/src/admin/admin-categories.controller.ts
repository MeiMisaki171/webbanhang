import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { adminCategoryInputSchema, UserRole } from "@repo/shared";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminCategoriesService } from "./admin-categories.service";

@Controller("admin/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  listTree() {
    return this.adminCategoriesService.listTree();
  }

  @Post()
  create(@Body() body: unknown) {
    const parsed = adminCategoryInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminCategoriesService.create(parsed.data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    const parsed = adminCategoryInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminCategoriesService.update(id, parsed.data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminCategoriesService.remove(id);
  }
}
