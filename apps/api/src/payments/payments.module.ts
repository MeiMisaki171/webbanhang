import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { StubPaymentProvider } from "./stub-payment.provider";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, StubPaymentProvider],
})
export class PaymentsModule {}
