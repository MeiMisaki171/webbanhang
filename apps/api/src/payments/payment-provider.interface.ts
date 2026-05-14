import type { PaymentStatus } from "@repo/shared";

export type PaymentWebhookPayload = {
  providerRef?: string;
  status?: PaymentStatus;
  metadata?: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: string;
  handleWebhook(payload: PaymentWebhookPayload): Promise<{ acknowledged: boolean }>;
}
