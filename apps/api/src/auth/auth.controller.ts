import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { loginSchema, registerSchema, type AuthUser } from "@repo/shared";
import {
  clearAuthCookies,
  readRefreshToken,
  writeAuthCookies,
} from "../common/auth-cookies";
import { readGuestToken } from "../common/guest-cart-cookie";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CartService } from "../cart/cart.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
  ) {}

  @Post("register")
  async register(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const user = await this.authService.register(parsed.data);
    writeAuthCookies(response, this.authService.issueTokens(user));

    const guestToken = readGuestToken(request);
    if (guestToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestToken);
    }

    return user;
  }

  @Post("login")
  async login(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const user = await this.authService.login(parsed.data);
    writeAuthCookies(response, this.authService.issueTokens(user), {
      rememberMe: parsed.data.rememberMe,
    });

    const guestToken = readGuestToken(request);
    if (guestToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestToken);
    }

    return user;
  }

  @Post("refresh")
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = readRefreshToken(request);
    if (!refreshToken) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
    }

    const user = await this.authService.refreshSession(refreshToken);
    writeAuthCookies(response, this.authService.issueTokens(user));

    return user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }
}
