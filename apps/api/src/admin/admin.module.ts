import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminCategoriesController } from "./admin-categories.controller";
import { AdminCategoriesService } from "./admin-categories.service";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminOrdersController, AdminPaymentsController } from "./admin-orders.controller";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminProductsController } from "./admin-products.controller";
import { AdminProductsService } from "./admin-products.service";

@Module({
  imports: [AuthModule],
  controllers: [
    AdminDashboardController,
    AdminCategoriesController,
    AdminProductsController,
    AdminOrdersController,
    AdminPaymentsController,
  ],
  providers: [
    AdminDashboardService,
    AdminCategoriesService,
    AdminProductsService,
    AdminOrdersService,
  ],
})
export class AdminModule {}
