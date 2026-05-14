import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "@repo/shared";
import { AuthService } from "../../auth/auth.service";
import { readAccessToken } from "../auth-cookies";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = readAccessToken(request);

    if (!token) {
      throw new UnauthorizedException("Vui lòng đăng nhập.");
    }

    const user = await this.authService.validateAccessToken(token);
    if (!user) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
    }

    request.user = user;
    return true;
  }
}
