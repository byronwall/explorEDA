import { describe, expect, it, vi } from "vitest";
import { PaddleProvider, paddleSignature } from "../src/payments/paddle";
import { WebhookRejected } from "../src/payments/types";

// Payload shapes follow Paddle Billing's webhook reference. Record real
// sandbox deliveries into test/fixtures/paddle when milestone 4 runs, and
// replace these with them.
const SECRET = "pdl_ntfset_test_secret";
const NOW = new Date("2026-11-01T12:00:00Z");

function provider(fetch = vi.fn()) {
  return new PaddleProvider({
    webhookSecret: SECRET,
    apiKey: "pdl_sdbx_apikey_test",
    environment: "sandbox",
    prices: { commercial: "pri_commercial", oem: "pri_oem" },
    fetch: fetch as unknown as typeof globalThis.fetch,
    now: () => NOW,
  });
}

async function delivery(
  body: object,
  { secret = SECRET, at = NOW.getTime() / 1000 } = {}
) {
  const text = JSON.stringify(body);
  return new Request("https://license.test/webhooks/payments", {
    method: "POST",
    body: text,
    headers: { "Paddle-Signature": await paddleSignature(secret, text, at) },
  });
}

function json(data: unknown) {
  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" },
  });
}

const completed = {
  event_id: "evt_01",
  event_type: "transaction.completed",
  occurred_at: "2026-11-01T12:00:00Z",
  data: {
    id: "txn_01",
    status: "completed",
    origin: "web",
    customer_id: "ctm_01",
    business_id: "biz_01",
    subscription_id: "sub_01",
    items: [{ price: { id: "pri_commercial" }, quantity: 3 }],
    billing_period: {
      starts_at: "2026-11-01T12:00:00Z",
      ends_at: "2027-11-01T12:00:00Z",
    },
  },
};

describe("Paddle adapter", () => {
  it("rejects a bad or stale signature", async () => {
    await expect(
      provider().parseWebhook(await delivery(completed, { secret: "wrong" }))
    ).rejects.toBeInstanceOf(WebhookRejected);
    await expect(
      provider().parseWebhook(
        await delivery(completed, { at: NOW.getTime() / 1000 - 3600 })
      )
    ).rejects.toBeInstanceOf(WebhookRejected);
  });

  it("reads a checkout as a purchase and looks up the buyer and business", async () => {
    const fetch = vi.fn(async (url: string) =>
      url.endsWith("/customers/ctm_01")
        ? json({ email: "buyer@acme.example", name: "Pat Buyer" })
        : json({ name: "Acme Corp" })
    );
    const events = await provider(fetch).parseWebhook(
      await delivery(completed)
    );
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      "https://sandbox-api.paddle.com/customers/ctm_01",
      "https://sandbox-api.paddle.com/customers/ctm_01/businesses/biz_01",
    ]);
    expect(events).toEqual([
      {
        type: "purchase",
        eventId: "evt_01",
        transactionId: "txn_01",
        subscriptionId: "sub_01",
        buyer: {
          email: "buyer@acme.example",
          name: "Pat Buyer",
          company: "Acme Corp",
          providerCustomerId: "ctm_01",
        },
        items: [{ product: "commercial", quantity: 3 }],
        periodEnd: "2027-11-01T12:00:00Z",
      },
    ]);
  });

  it("reads a recurring charge as a renewal and skips prorated seat charges", async () => {
    const renewal = await provider().parseWebhook(
      await delivery({
        ...completed,
        event_id: "evt_02",
        data: {
          ...completed.data,
          id: "txn_02",
          origin: "subscription_recurring",
        },
      })
    );
    expect(renewal).toEqual([
      {
        type: "renewal",
        eventId: "evt_02",
        transactionId: "txn_02",
        subscriptionId: "sub_01",
        periodEnd: "2027-11-01T12:00:00Z",
      },
    ]);
    const prorated = await provider().parseWebhook(
      await delivery({
        ...completed,
        data: { ...completed.data, origin: "subscription_update" },
      })
    );
    expect(prorated).toEqual([]);
  });

  it("ignores transactions for other products", async () => {
    const events = await provider().parseWebhook(
      await delivery({
        ...completed,
        data: {
          ...completed.data,
          items: [{ price: { id: "pri_other" }, quantity: 1 }],
        },
      })
    );
    expect(events).toEqual([]);
  });

  it("reads seat changes, cancellations, and approved refunds", async () => {
    const paddle = provider();
    expect(
      await paddle.parseWebhook(
        await delivery({
          event_id: "evt_03",
          event_type: "subscription.updated",
          data: {
            id: "sub_01",
            items: [{ price: { id: "pri_commercial" }, quantity: 7 }],
          },
        })
      )
    ).toEqual([
      {
        type: "seats-changed",
        eventId: "evt_03",
        subscriptionId: "sub_01",
        seats: 7,
      },
    ]);
    expect(
      await paddle.parseWebhook(
        await delivery({
          event_id: "evt_04",
          event_type: "subscription.canceled",
          data: { id: "sub_01" },
        })
      )
    ).toEqual([
      { type: "canceled", eventId: "evt_04", subscriptionId: "sub_01" },
    ]);
    const refund = {
      event_type: "adjustment.updated",
      data: { id: "adj_01", action: "refund", transaction_id: "txn_01" },
    };
    expect(
      await paddle.parseWebhook(
        await delivery({
          ...refund,
          event_id: "evt_05",
          data: { ...refund.data, status: "pending_approval" },
        })
      )
    ).toEqual([]);
    expect(
      await paddle.parseWebhook(
        await delivery({
          ...refund,
          event_id: "evt_06",
          data: { ...refund.data, status: "approved" },
        })
      )
    ).toEqual([
      { type: "refunded", eventId: "refund:adj_01", transactionId: "txn_01" },
    ]);
  });
});
