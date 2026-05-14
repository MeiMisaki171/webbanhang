import { Injectable, NotFoundException } from "@nestjs/common";
import type { PaymentWebhookPayload } from "./payment-provider.interface";
import { StubPaymentProvider } from "./stub-payment.provider";

@Injectable()
export class PaymentsService {
  constructor(private readonly stubPaymentProvider: StubPaymentProvider) {}

  async handleWebhook(provider: string, payload: PaymentWebhookPayload) {
    const providerImpl = this.resolveProvider(provider);
    return providerImpl.handleWebhook(payload);
  }

  private resolveProvider(provider: string) {
    if (provider === this.stubPaymentProvider.name) {
      return this.stubPaymentProvider;
    }

    throw new NotFoundException("Payment provider không được hỗ trợ.");
  }
}
