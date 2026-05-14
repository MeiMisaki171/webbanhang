import { Module } from "@nestjs/common";
import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SearchModule } from "./search/search.module";

@Module({
  imports: [PrismaModule, HealthModule, CatalogModule, SearchModule],
})
export class AppModule {}
