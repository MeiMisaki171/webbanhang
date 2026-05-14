import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CartModule } from "../cart/cart.module";
import { GeoModule } from "../geo/geo.module";
import { CheckoutController } from "./checkout.controller";
import { CheckoutRepository } from "./checkout.repository";
import { CheckoutService } from "./checkout.service";

@Module({
  imports: [AuthModule, CartModule, GeoModule],
  controllers: [CheckoutController],
  providers: [CheckoutRepository, CheckoutService],
})
export class CheckoutModule {}
