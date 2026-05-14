import { Injectable } from "@nestjs/common";
import { Prisma, type Product } from "@repo/db";
import type { ProductListQuery, ProductSort } from "@repo/shared";
import { PrismaService } from "../prisma/prisma.service";

type ProductWithRelations = Product & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
};

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
      },
    });
  }

  async findCategoryBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
      },
    });
  }

  async findProducts(
    query: ProductListQuery,
    options?: { searchTerm?: string; categoryIds?: string[] },
  ): Promise<{ items: ProductWithRelations[]; total: number }> {
    const where = this.buildProductWhere(query, options);
    const orderBy = this.buildProductOrderBy(query.sort);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
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
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findProductBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true, parentId: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async findRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId,
        id: { not: excludeProductId },
      },
      orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
  }

  async suggestProducts(searchTerm: string, limit: number) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: this.buildSearchConditions(searchTerm),
      },
      orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
  }

  async listBrands(categoryIds?: string[]) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryIds?.length ? { categoryId: { in: categoryIds } } : {}),
      },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    });

    return products.map((product) => product.brand);
  }

  async resolveCategoryIdsBySlug(slug: string): Promise<string[]> {
    const categories = await this.listActiveCategories();
    const root = categories.find((category) => category.slug === slug);
    if (!root) {
      return [];
    }

    const ids = new Set<string>([root.id]);
    let added = true;

    while (added) {
      added = false;
      for (const category of categories) {
        if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
          ids.add(category.id);
          added = true;
        }
      }
    }

    return [...ids];
  }

  private buildProductWhere(
    query: ProductListQuery,
    options?: { searchTerm?: string; categoryIds?: string[] },
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (options?.categoryIds?.length) {
      where.categoryId = { in: options.categoryIds };
    }

    if (query.brand) {
      where.brand = query.brand;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.inStock) {
      where.stock = { gt: 0 };
    }

    if (query.onSale) {
      where.compareAtPrice = { not: null };
    }

    if (options?.searchTerm) {
      where.OR = this.buildSearchConditions(options.searchTerm);
    }

    return where;
  }

  private buildSearchConditions(searchTerm: string): Prisma.ProductWhereInput[] {
    return [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { shortDescription: { contains: searchTerm, mode: "insensitive" } },
      { sku: { contains: searchTerm, mode: "insensitive" } },
      { brand: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  private buildProductOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case "price_asc":
        return [{ price: "asc" }];
      case "price_desc":
        return [{ price: "desc" }];
      case "bestseller":
        return [{ soldCount: "desc" }, { createdAt: "desc" }];
      case "newest":
      default:
        return [{ createdAt: "desc" }];
    }
  }
}
