import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@repo/db";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
