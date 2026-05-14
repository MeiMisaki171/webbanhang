import { Injectable } from "@nestjs/common";
import type { PaymentProvider, PaymentWebhookPayload } from "./payment-provider.interface";

@Injectable()
export class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub";

  async handleWebhook(_payload: PaymentWebhookPayload): Promise<{ acknowledged: boolean }> {
    return { acknowledged: true };
  }
}
