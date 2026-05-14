import { BadRequestException, ConflictException } from "@nestjs/common";
import { AdminCategoriesService } from "./admin-categories.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AdminCategoriesService", () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: AdminCategoriesService;

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      product: {
        count: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new AdminCategoriesService(prisma);
  });

  it("rejects create when slug already exists", async () => {
    prisma.category.findFirst.mockResolvedValue({ id: "existing" } as never);

    await expect(
      service.create({
        name: "Nồi cơm",
        slug: "noi-com",
        sortOrder: 0,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects delete when category still has products", async () => {
    prisma.category.findUnique.mockResolvedValue({
      id: "cat-1",
      name: "Nồi cơm",
      slug: "noi-com",
      parentId: null,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prisma.category.count.mockResolvedValue(0);
    prisma.product.count.mockResolvedValue(2);

    await expect(service.remove("cat-1")).rejects.toBeInstanceOf(BadRequestException);
  });
});
