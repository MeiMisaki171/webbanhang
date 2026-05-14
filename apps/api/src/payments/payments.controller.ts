import { Body, Controller, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook/:provider")
  handleWebhook(@Param("provider") provider: string, @Body() body: Record<string, unknown>) {
    return this.paymentsService.handleWebhook(provider, body);
  }
}
