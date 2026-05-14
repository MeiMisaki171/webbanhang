import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { searchQuerySchema, searchSuggestQuerySchema } from "@repo/shared";
import { CatalogService } from "../catalog/catalog.service";

@Controller("search")
export class SearchController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  search(@Query() query: Record<string, unknown>) {
    const parsed = searchQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.catalogService.searchProducts(parsed.data);
  }

  @Get("suggest")
  suggest(@Query() query: Record<string, unknown>) {
    const parsed = searchSuggestQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.catalogService.suggestProducts(parsed.data.q, parsed.data.limit);
  }
}
