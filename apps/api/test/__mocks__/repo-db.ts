export class PrismaClient {
  async $queryRaw(): Promise<unknown[]> {
    return [];
  }

  async $disconnect(): Promise<void> {
    return;
  }
}

export const prisma = new PrismaClient();
