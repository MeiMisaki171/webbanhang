import { NotFoundException } from "@nestjs/common";
import type { CategorySummary, ProductListQuery } from "@repo/shared";
import { CatalogRepository } from "./catalog.repository";
import { CatalogService } from "./catalog.service";

describe("CatalogService", () => {
  const categories: CategorySummary[] = [
    {
      id: "root",
      name: "Điện máy",
      slug: "dien-may",
      parentId: null,
      sortOrder: 1,
    },
    {
      id: "child",
      name: "Tủ lạnh",
      slug: "tu-lanh",
      parentId: "root",
      sortOrder: 1,
    },
  ];

  let repository: jest.Mocked<CatalogRepository>;
  let service: CatalogService;

  beforeEach(() => {
    repository = {
      listActiveCategories: jest.fn(),
      findCategoryBySlug: jest.fn(),
      findProducts: jest.fn(),
      findProductBySlug: jest.fn(),
      findRelatedProducts: jest.fn(),
      suggestProducts: jest.fn(),
      listBrands: jest.fn(),
      resolveCategoryIdsBySlug: jest.fn(),
    } as unknown as jest.Mocked<CatalogRepository>;

    service = new CatalogService(repository);
  });

  it("returns empty pagination when category slug is unknown", async () => {
    repository.resolveCategoryIdsBySlug.mockResolvedValue([]);
    const query: ProductListQuery = {
      category: "khong-ton-tai",
      sort: "newest",
      page: 1,
      pageSize: 12,
    };

    const result = await service.listProducts(query);

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(repository.findProducts).not.toHaveBeenCalled();
  });

  it("builds category breadcrumbs from parent chain", async () => {
    repository.listActiveCategories.mockResolvedValue(categories);

    const result = await service.getCategoryBySlug("tu-lanh");

    expect(result.breadcrumbs.map((item) => item.slug)).toEqual(["dien-may", "tu-lanh"]);
    expect(result.children).toEqual([]);
  });

  it("throws when product slug does not exist", async () => {
    repository.findProductBySlug.mockResolvedValue(null);

    await expect(service.getProductBySlug("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
