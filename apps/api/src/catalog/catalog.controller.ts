import { BadRequestException, Controller, Get, Param, Query } from "@nestjs/common";
import { productListQuerySchema } from "@repo/shared";
import { CatalogService } from "./catalog.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Get(":slug")
  getCategory(@Param("slug") slug: string) {
    return this.catalogService.getCategoryBySlug(slug);
  }
}

@Controller("products")
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listProducts(@Query() query: Record<string, unknown>) {
    const parsed = productListQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.catalogService.listProducts(parsed.data);
  }

  @Get("brands/list")
  listBrands(@Query("category") category?: string) {
    return this.catalogService.listBrands(category);
  }

  @Get(":slug")
  getProduct(@Param("slug") slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}
