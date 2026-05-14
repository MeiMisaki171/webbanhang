import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { uploadPresignSchema, UserRole } from "@repo/shared";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("presign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  presign(@Body() body: unknown) {
    const parsed = uploadPresignSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.uploadService.createPresignedUpload(parsed.data);
  }
}
