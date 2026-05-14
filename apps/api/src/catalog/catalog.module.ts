import { Module } from "@nestjs/common";
import { CategoriesController, ProductsController } from "./catalog.controller";
import { CatalogRepository } from "./catalog.repository";
import { CatalogService } from "./catalog.service";

@Module({
  controllers: [CategoriesController, ProductsController],
  providers: [CatalogRepository, CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
