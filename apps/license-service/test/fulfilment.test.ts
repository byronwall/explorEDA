import { describe, expect, it } from "vitest";
import {
  checkLicenseKey,
  readLicensePayload,
} from "../../../packages/explorEDA/src/license/token";
import {
  DEVELOPMENT_KEY_IDS,
  LICENSE_PUBLIC_KEYS,
} from "../../../packages/explorEDA/src/license/publicKeys";
import type { PaymentEvent } from "../src/domain";
import { applyPaymentEvent, NotReady } from "../src/licenses";
import { keyIn, testServices } from "./harness";

const purchase: PaymentEvent = {
  type: "purchase",
  eventId: "evt_purchase",
  transactionId: "txn_1",
  subscriptionId: "sub_1",
  buyer: {
    email: "Buyer@Acme.example",
    name: "Pat Buyer",
    company: "Acme Corp",
    providerCustomerId: "ctm_1",
  },
  items: [{ product: "commercial", quantity: 5 }],
  periodEnd: "2027-11-01T12:00:00Z",
};

/** The package's own check, as a customer's app would run it. */
function check(key: string, releaseDate = "2026-11-01") {
  return checkLicenseKey(key, {
    publicKeys: LICENSE_PUBLIC_KEYS,
    developmentKeyIds: DEVELOPMENT_KEY_IDS,
    developmentHost: true,
    releaseDate,
    now: new Date("2026-11-02T00:00:00Z"),
  });
}

describe("fulfilment", () => {
  it("turns a purchase into a license, a key the package accepts, and one email", async () => {
    const { services, mailer } = testServices();
    expect(await applyPaymentEvent(services, purchase)).toBe("applied");

    expect(mailer.sent).toHaveLength(1);
    const email = mailer.sent[0]!;
    expect(email.to).toBe("buyer@acme.example");
    expect(email.subject).toBe("Your explorEDA license key");
    expect(email.text).toContain("https://license.test/c/");

    const key = keyIn(email.text);
    const status = await check(key);
    expect(status.state).toBe("licensed");
    expect(status.license).toMatchObject({
      licensee: "Acme Corp",
      plan: "commercial",
      seats: 5,
      scope: "internal",
      updatesUntil: "2027-11-01",
    });
  });

  it("ignores a repeated delivery and a second event for the same transaction", async () => {
    const { services, mailer } = testServices();
    await applyPaymentEvent(services, purchase);
    expect(await applyPaymentEvent(services, purchase)).toBe("duplicate");
    await applyPaymentEvent(services, { ...purchase, eventId: "evt_other" });
    expect(mailer.sent).toHaveLength(1);
    expect(await services.store.licensesByTransaction("txn_1")).toHaveLength(1);
  });

  it("retries a renewal that arrives before its purchase", async () => {
    const { services, mailer } = testServices();
    const renewal: PaymentEvent = {
      type: "renewal",
      eventId: "evt_renew",
      transactionId: "txn_2",
      subscriptionId: "sub_1",
      periodEnd: "2028-11-01T12:00:00Z",
    };
    await expect(applyPaymentEvent(services, renewal)).rejects.toBeInstanceOf(
      NotReady
    );
    // A not-yet-ready event is not a failure worth an email.
    expect(mailer.sent).toHaveLength(0);

    await applyPaymentEvent(services, purchase);
    expect(await applyPaymentEvent(services, renewal)).toBe("applied");
    const key = keyIn(mailer.sent.at(-1)!.text);
    expect(readLicensePayload(key)?.updatesUntil).toBe("2028-11-01");
    expect(mailer.sent.at(-1)!.subject).toContain("renewed");
  });

  it("reissues the key when seats change, and only then", async () => {
    const { services, mailer } = testServices();
    await applyPaymentEvent(services, purchase);
    await applyPaymentEvent(services, {
      type: "seats-changed",
      eventId: "evt_seats",
      subscriptionId: "sub_1",
      seats: 8,
    });
    expect(readLicensePayload(keyIn(mailer.sent.at(-1)!.text))?.seats).toBe(8);
    await applyPaymentEvent(services, {
      type: "seats-changed",
      eventId: "evt_seats_same",
      subscriptionId: "sub_1",
      seats: 8,
    });
    expect(mailer.sent).toHaveLength(2);
  });

  it("marks cancellations and refunds, and says covered versions stay licensed", async () => {
    const { services, mailer } = testServices();
    await applyPaymentEvent(services, purchase);
    await applyPaymentEvent(services, {
      type: "canceled",
      eventId: "evt_cancel",
      subscriptionId: "sub_1",
    });
    const [license] = await services.store.licensesBySubscription("sub_1");
    expect(license?.status).toBe("canceled");
    expect(mailer.sent.at(-1)!.text).toContain("stays licensed for good");

    await applyPaymentEvent(services, {
      type: "refunded",
      eventId: "refund:adj_1",
      transactionId: "txn_1",
    });
    expect((await services.store.license(license!.id))?.status).toBe(
      "refunded"
    );
    expect(mailer.sent.at(-1)!.subject).toBe("Your explorEDA refund");
  });

  it("makes one redistribution license per product bought", async () => {
    const { services, mailer } = testServices();
    await applyPaymentEvent(services, {
      ...purchase,
      eventId: "evt_oem",
      transactionId: "txn_oem",
      items: [
        { product: "commercial", quantity: 2 },
        { product: "oem", quantity: 2 },
      ],
    });
    const licenses = await services.store.licensesByTransaction("txn_oem");
    expect(licenses.map((item) => item.plan).sort()).toEqual([
      "commercial",
      "oem",
      "oem",
    ]);
    expect(mailer.sent).toHaveLength(3);
  });

  it("emails Byron when an event fails for a reason other than ordering", async () => {
    const { services, mailer } = testServices();
    services.signing = { kid: "dev-1", privateKey: "not-a-key" };
    await expect(applyPaymentEvent(services, purchase)).rejects.toThrow();
    expect(mailer.sent.at(-1)!.to).toBe("byron@site.test");
    expect(await services.store.failedEvents()).toHaveLength(1);
  });
});
