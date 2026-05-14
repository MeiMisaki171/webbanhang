import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import {
  isEmailIdentifier,
  normalizePhone,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@repo/shared";
import { UserRole } from "@repo/shared";
import { compare, hash } from "bcryptjs";
import { readAccessToken } from "../common/auth-cookies";
import { AuthRepository } from "./auth.repository";

type AccessTokenPayload = {
  sub: string;
  email: string | null;
  role: UserRole;
  type: "access";
};

type RefreshTokenPayload = {
  sub: string;
  type: "refresh";
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthUser> {
    const email = input.email?.trim();
    const phone = input.phone ? normalizePhone(input.phone) : undefined;

    if (email) {
      const existingEmail = await this.authRepository.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException("Email đã được sử dụng.");
      }
    }

    if (phone) {
      const existingPhone = await this.authRepository.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictException("Số điện thoại đã được sử dụng.");
      }
    }

    const passwordHash = await hash(input.password, 12);
    const user = await this.authRepository.createUser({
      email,
      phone,
      passwordHash,
      fullName: input.fullName,
    });

    return this.toAuthUser(user);
  }

  async login(input: LoginInput): Promise<AuthUser> {
    const user = await this.findByIdentifier(input.identifier);
    if (!user) {
      throw new UnauthorizedException("Email/số điện thoại hoặc mật khẩu không đúng.");
    }

    const valid = await compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Email/số điện thoại hoặc mật khẩu không đúng.");
    }

    return this.toAuthUser(user);
  }

  issueTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      } satisfies AccessTokenPayload,
      {
        secret: process.env.JWT_SECRET,
        expiresIn: "15m",
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: "refresh",
      } satisfies RefreshTokenPayload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d",
      },
    );

    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = this.jwtService.verify<AccessTokenPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== "access") {
        return null;
      }

      const user = await this.authRepository.findById(payload.sub);
      if (!user) {
        return null;
      }

      return this.toAuthUser(user);
    } catch {
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthUser> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
      }

      const user = await this.authRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
      }

      return this.toAuthUser(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
    }
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại.");
    }

    return this.toAuthUser(user);
  }

  async resolveUser(request: Request): Promise<AuthUser | null> {
    const token = readAccessToken(request);
    if (!token) {
      return null;
    }

    return this.validateAccessToken(token);
  }

  private async findByIdentifier(identifier: string) {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return null;
    }

    if (isEmailIdentifier(trimmed)) {
      return this.authRepository.findByEmail(trimmed);
    }

    return this.authRepository.findByPhone(normalizePhone(trimmed));
  }

  private toAuthUser(user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    role: string;
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
