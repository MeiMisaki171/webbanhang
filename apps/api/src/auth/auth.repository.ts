import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  createUser(params: {
    email?: string;
    phone?: string;
    passwordHash: string;
    fullName?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: params.email,
        phone: params.phone,
        passwordHash: params.passwordHash,
        fullName: params.fullName,
      },
    });
  }
}
