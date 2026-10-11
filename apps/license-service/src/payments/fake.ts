import type { PaymentEvent } from "../domain";
import { safeEqual } from "../util";
import { WebhookRejected, type PaymentProvider } from "./types";

/**
 * A provider for local development and tests. Its webhook body is a list of
 * events in the service's own shape, authorized by a shared secret header.
 * `pnpm replay <fixture>` posts to it.
 */
export class FakeProvider implements PaymentProvider {
  readonly name = "fake";
  constructor(private readonly secret: string | undefined) {}

  async parseWebhook(request: Request): Promise<PaymentEvent[]> {
    const header = request.headers.get("x-fake-signature") ?? "";
    if (!this.secret || !safeEqual(header, this.secret)) {
      throw new WebhookRejected("Bad fake signature");
    }
    const body = (await request.json()) as PaymentEvent | PaymentEvent[];
    return Array.isArray(body) ? body : [body];
  }

  async billingPortalUrl(): Promise<string | undefined> {
    return undefined;
  }
}
