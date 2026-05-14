import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  buildPaginationMeta,
  type AdminPaginatedProducts,
  type AdminProductDetail,
  type AdminProductInput,
} from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";
import { normalizeSpecs, slugify } from "./admin.utils";

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, pageSize: number): Promise<AdminPaginatedProducts> {
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: pageSize,
        orderBy: [{ updatedAt: "desc" }],
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: items.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        brand: product.brand,
        isActive: product.isActive,
        category: product.category,
        imageUrl: product.images[0]?.url ?? null,
      })),
      meta: buildPaginationMeta(page, pageSize, total),
    };
  }

  async getById(id: string): Promise<AdminProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    return this.toDetail(product);
  }

  async create(input: AdminProductInput): Promise<AdminProductDetail> {
    await this.ensureCategoryExists(input.categoryId);
    const slug = input.slug ?? slugify(input.name);
    await this.ensureUniqueSlug(slug);
    await this.ensureUniqueSku(input.sku);

    const product = await this.prisma.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug,
        sku: input.sku,
        shortDescription: input.shortDescription,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        stock: input.stock,
        brand: input.brand,
        specs: normalizeSpecs(input.specs),
        isActive: input.isActive,
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            sortOrder: image.sortOrder ?? index,
            alt: image.alt ?? null,
          })),
        },
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return this.toDetail(product);
  }

  async update(id: string, input: AdminProductInput): Promise<AdminProductDetail> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    await this.ensureCategoryExists(input.categoryId);
    const slug = input.slug ?? slugify(input.name);
    if (slug !== existing.slug) {
      await this.ensureUniqueSlug(slug, id);
    }
    if (input.sku !== existing.sku) {
      await this.ensureUniqueSku(input.sku, id);
    }

    const product = await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          categoryId: input.categoryId,
          name: input.name,
          slug,
          sku: input.sku,
          shortDescription: input.shortDescription,
          description: input.description,
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          stock: input.stock,
          brand: input.brand,
          specs: normalizeSpecs(input.specs),
          isActive: input.isActive,
          images: {
            create: input.images.map((image, index) => ({
              url: image.url,
              sortOrder: image.sortOrder ?? index,
              alt: image.alt ?? null,
            })),
          },
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    return this.toDetail(product);
  }

  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { id };
  }

  private toDetail(product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    brand: string;
    specs: unknown;
    isActive: boolean;
    category: { id: string; name: string; slug: string };
    images: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
  }): AdminProductDetail {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      brand: product.brand,
      isActive: product.isActive,
      category: product.category,
      imageUrl: product.images[0]?.url ?? null,
      specs: this.normalizeSpecs(product.specs),
      images: product.images,
    };
  }

  private normalizeSpecs(specs: unknown): Record<string, string> {
    if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(specs).map(([key, value]) => [key, String(value)]),
    );
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException("Danh mục không tồn tại.");
    }
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Slug sản phẩm đã tồn tại.");
    }
  }

  private async ensureUniqueSku(sku: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: {
        sku,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("SKU đã tồn tại.");
    }
  }
}
