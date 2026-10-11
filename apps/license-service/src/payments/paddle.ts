import type { Buyer, CustomerRecord, PaymentEvent, Product } from "../domain";
import { safeEqual } from "../util";
import { WebhookRejected, type PaymentProvider } from "./types";

/**
 * Paddle Billing. Verifies the `Paddle-Signature` header, maps the events
 * fulfilment needs, and looks up the buyer's email and business name.
 *
 * Events used:
 * - transaction.completed: a purchase (checkout or paid invoice) or, with
 *   origin `subscription_recurring`, a renewal.
 * - subscription.updated: the seat quantity changed.
 * - subscription.canceled: the license won't renew.
 * - adjustment.created / adjustment.updated: an approved refund.
 */
export interface PaddleSettings {
  webhookSecret: string;
  apiKey: string;
  environment: "sandbox" | "production";
  prices: Partial<Record<Product, string>>;
  /** Seconds a signature stays valid. */
  tolerance?: number;
  fetch?: typeof fetch;
  now?: () => Date;
}

type PaddleItem = { price?: { id?: string }; quantity?: number };

interface PaddleNotification {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: Record<string, unknown> & {
    id?: string;
    status?: string;
    origin?: string;
    customer_id?: string;
    business_id?: string | null;
    subscription_id?: string | null;
    transaction_id?: string;
    action?: string;
    items?: PaddleItem[];
    billing_period?: { starts_at?: string; ends_at?: string } | null;
    current_billing_period?: { ends_at?: string } | null;
  };
}

const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Builds a `Paddle-Signature` header; used by tests and the replay script. */
export async function paddleSignature(
  secret: string,
  body: string,
  timestamp: number
): Promise<string> {
  return `ts=${timestamp};h1=${await hmacHex(secret, `${timestamp}:${body}`)}`;
}

export class PaddleProvider implements PaymentProvider {
  readonly name = "paddle";
  private readonly fetch: typeof fetch;
  private readonly now: () => Date;

  constructor(private readonly settings: PaddleSettings) {
    this.fetch = settings.fetch ?? fetch.bind(globalThis);
    this.now = settings.now ?? (() => new Date());
  }

  private get apiBase() {
    return this.settings.environment === "production"
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";
  }

  private async api<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.settings.apiKey}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Paddle ${path} failed: ${response.status} ${await response.text()}`
      );
    }
    return ((await response.json()) as { data: T }).data;
  }

  private async verify(request: Request): Promise<string> {
    const body = await request.text();
    const header = request.headers.get("paddle-signature") ?? "";
    const parts = Object.fromEntries(
      header.split(";").map((part) => part.split("=") as [string, string])
    );
    const timestamp = Number(parts.ts);
    const tolerance = this.settings.tolerance ?? 300;
    if (
      !parts.h1 ||
      !Number.isFinite(timestamp) ||
      Math.abs(this.now().getTime() / 1000 - timestamp) > tolerance
    ) {
      throw new WebhookRejected("Missing or stale Paddle-Signature");
    }
    const expected = await hmacHex(
      this.settings.webhookSecret,
      `${parts.ts}:${body}`
    );
    if (!safeEqual(expected, parts.h1)) {
      throw new WebhookRejected("Paddle-Signature does not match");
    }
    return body;
  }

  private product(priceId: string | undefined): Product | undefined {
    const entry = Object.entries(this.settings.prices).find(
      ([, id]) => id && id === priceId
    );
    return entry?.[0] as Product | undefined;
  }

  private items(items: PaddleItem[] | undefined) {
    return (items ?? []).flatMap((item) => {
      const product = this.product(item.price?.id);
      return product ? [{ product, quantity: item.quantity ?? 1 }] : [];
    });
  }

  private async buyer(
    customerId: string,
    businessId: string | null | undefined
  ): Promise<Buyer> {
    const customer = await this.api<{ email: string; name?: string | null }>(
      `/customers/${customerId}`
    );
    let company: string | undefined;
    if (businessId) {
      const business = await this.api<{ name?: string }>(
        `/customers/${customerId}/businesses/${businessId}`
      );
      company = business.name ?? undefined;
    }
    return {
      email: customer.email,
      name: customer.name ?? undefined,
      company,
      providerCustomerId: customerId,
    };
  }

  async parseWebhook(request: Request): Promise<PaymentEvent[]> {
    const notification = JSON.parse(
      await this.verify(request)
    ) as PaddleNotification;
    const { event_id: eventId, event_type: type, data } = notification;

    switch (type) {
      case "transaction.completed": {
        const items = this.items(data.items);
        if (items.length === 0 || !data.id) return [];
        if (data.origin === "subscription_recurring" && data.subscription_id) {
          return [
            {
              type: "renewal",
              eventId,
              transactionId: data.id,
              subscriptionId: data.subscription_id,
              periodEnd: data.billing_period?.ends_at ?? "",
            },
          ];
        }
        // Prorated charges for a quantity change; subscription.updated
        // carries the new seat count.
        if (data.origin === "subscription_update") return [];
        if (!data.customer_id) return [];
        return [
          {
            type: "purchase",
            eventId,
            transactionId: data.id,
            subscriptionId: data.subscription_id ?? undefined,
            buyer: await this.buyer(data.customer_id, data.business_id),
            items,
            periodEnd: data.billing_period?.ends_at,
          },
        ];
      }
      case "subscription.updated": {
        const seats = this.items(data.items).find(
          (item) => item.product === "commercial"
        )?.quantity;
        if (!data.id || seats === undefined) return [];
        return [
          { type: "seats-changed", eventId, subscriptionId: data.id, seats },
        ];
      }
      case "subscription.canceled":
        return data.id
          ? [{ type: "canceled", eventId, subscriptionId: data.id }]
          : [];
      case "adjustment.created":
      case "adjustment.updated":
        return data.action === "refund" &&
          data.status === "approved" &&
          data.transaction_id
          ? [
              {
                type: "refunded",
                // Created and updated can both be approved; one refund either way.
                eventId: `refund:${data.id}`,
                transactionId: data.transaction_id,
              },
            ]
          : [];
      default:
        return [];
    }
  }

  async billingPortalUrl(
    customer: CustomerRecord,
    subscriptionIds: string[]
  ): Promise<string | undefined> {
    if (!customer.providerCustomerId) return undefined;
    const session = await this.api<{ urls: { general: { overview: string } } }>(
      `/customers/${customer.providerCustomerId}/portal-sessions`,
      {
        method: "POST",
        body: JSON.stringify({ subscription_ids: subscriptionIds }),
      }
    );
    return session.urls.general.overview;
  }
}
