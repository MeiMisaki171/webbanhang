import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { SearchController } from "./search.controller";

@Module({
  imports: [CatalogModule],
  controllers: [SearchController],
})
export class SearchModule {}
