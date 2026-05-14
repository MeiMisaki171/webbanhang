import { Injectable, NotFoundException } from "@nestjs/common";
import {
  buildPaginationMeta,
  type CategoryDetail,
  type CategorySummary,
  type PaginatedResponse,
  type ProductCard,
  type ProductDetail,
  type ProductListQuery,
  type SearchQuery,
  type SearchSuggestion,
} from "@repo/shared";
import { CatalogRepository } from "./catalog.repository";

type ProductEntity = Awaited<ReturnType<CatalogRepository["findProductBySlug"]>>;

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listCategories(): Promise<CategorySummary[]> {
    return this.catalogRepository.listActiveCategories();
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDetail> {
    const categories = await this.catalogRepository.listActiveCategories();
    const category = categories.find((item) => item.slug === slug);

    if (!category) {
      throw new NotFoundException("Không tìm thấy danh mục.");
    }

    return {
      ...category,
      breadcrumbs: this.buildBreadcrumbs(categories, category),
      children: categories
        .filter((item) => item.parentId === category.id)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    };
  }

  async listProducts(query: ProductListQuery): Promise<PaginatedResponse<ProductCard>> {
    const categoryIds = query.category
      ? await this.catalogRepository.resolveCategoryIdsBySlug(query.category)
      : undefined;

    if (query.category && categoryIds?.length === 0) {
      return {
        data: [],
        meta: buildPaginationMeta(query.page, query.pageSize, 0),
      };
    }

    const { items, total } = await this.catalogRepository.findProducts(query, {
      categoryIds,
    });

    return {
      data: items.map((product) => this.toProductCard(product)),
      meta: buildPaginationMeta(query.page, query.pageSize, total),
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const product = await this.catalogRepository.findProductBySlug(slug);
    if (!product) {
      throw new NotFoundException("Không tìm thấy sản phẩm.");
    }

    const categories = await this.catalogRepository.listActiveCategories();
    const category = categories.find((item) => item.id === product.categoryId);
    const relatedProducts = await this.catalogRepository.findRelatedProducts(
      product.categoryId,
      product.id,
    );

    return {
      ...this.toProductCard(product),
      description: product.description,
      specs: this.normalizeSpecs(product.specs),
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder,
      })),
      categoryBreadcrumbs: category
        ? this.buildBreadcrumbs(categories, category)
        : [],
      relatedProducts: relatedProducts.map((item) => this.toProductCard(item)),
    };
  }

  async searchProducts(query: SearchQuery): Promise<PaginatedResponse<ProductCard>> {
    const categoryIds = query.category
      ? await this.catalogRepository.resolveCategoryIdsBySlug(query.category)
      : undefined;

    if (query.category && categoryIds?.length === 0) {
      return {
        data: [],
        meta: buildPaginationMeta(query.page, query.pageSize, 0),
      };
    }

    const { items, total } = await this.catalogRepository.findProducts(query, {
      categoryIds,
      searchTerm: query.q,
    });

    return {
      data: items.map((product) => this.toProductCard(product)),
      meta: buildPaginationMeta(query.page, query.pageSize, total),
    };
  }

  async suggestProducts(searchTerm: string, limit: number): Promise<SearchSuggestion[]> {
    const products = await this.catalogRepository.suggestProducts(searchTerm, limit);
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
    }));
  }

  async listBrands(categorySlug?: string): Promise<string[]> {
    const categoryIds = categorySlug
      ? await this.catalogRepository.resolveCategoryIdsBySlug(categorySlug)
      : undefined;

    if (categorySlug && categoryIds?.length === 0) {
      return [];
    }

    return this.catalogRepository.listBrands(categoryIds);
  }

  private buildBreadcrumbs(
    categories: CategorySummary[],
    category: CategorySummary,
  ): CategorySummary[] {
    const breadcrumbs: CategorySummary[] = [];
    let current: CategorySummary | undefined = category;

    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId
        ? categories.find((item) => item.id === current?.parentId)
        : undefined;
    }

    return breadcrumbs;
  }

  private toProductCard(
    product: NonNullable<ProductEntity> | Awaited<ReturnType<CatalogRepository["findProducts"]>>["items"][number],
  ): ProductCard {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      brand: product.brand,
      soldCount: product.soldCount,
      imageUrl: product.images[0]?.url ?? null,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
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
}
