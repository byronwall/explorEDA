import type { CustomerRecord, PaymentEvent } from "../domain";

export class WebhookRejected extends Error {}

/**
 * The only code that knows a payment provider. Swapping Paddle for Polar or
 * Stripe means writing another of these and changing PAYMENT_PROVIDER.
 */
export interface PaymentProvider {
  readonly name: string;
  /**
   * Checks a webhook's signature and turns it into zero or more events.
   * Throws WebhookRejected for a bad signature; other errors mean "retry".
   */
  parseWebhook(request: Request): Promise<PaymentEvent[]>;
  /** A link to the provider's billing portal for a customer, if it has one. */
  billingPortalUrl(
    customer: CustomerRecord,
    subscriptionIds: string[]
  ): Promise<string | undefined>;
}
