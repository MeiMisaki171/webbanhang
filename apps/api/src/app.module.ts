import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { CartModule } from "./cart/cart.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { GeoModule } from "./geo/geo.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SearchModule } from "./search/search.module";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    CatalogModule,
    SearchModule,
    GeoModule,
    AuthModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    AdminModule,
    UploadModule,
    PaymentsModule,
  ],
})
export class AppModule {}
