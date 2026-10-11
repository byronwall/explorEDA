import { signLicense } from "../../../packages/explorEDA/src/license/sign";
import type {
  CustomerRecord,
  LicensePlan,
  LicenseRecord,
  LicenseScope,
  PaymentEvent,
} from "./domain";
import {
  canceledEmail,
  keyEmail,
  notifyEmail,
  refundedEmail,
  type Links,
} from "./emails";
import type { Mailer } from "./mailer";
import type { PaymentProvider } from "./payments/types";
import type { Store } from "./store";
import { addMonths, isoDate, randomId, randomToken } from "./util";

export interface Services {
  store: Store;
  mailer: Mailer;
  payments: PaymentProvider;
  signing: { kid: string; privateKey: string };
  now: () => Date;
  config: {
    publicBaseUrl: string;
    siteUrl: string;
    notifyEmail: string;
    termsVersion: string;
  };
}

export function linksFor(services: Services, license: LicenseRecord): Links {
  const { publicBaseUrl, siteUrl } = services.config;
  return {
    certificate: `${publicBaseUrl}/c/${license.publicToken}`,
    portal: `${siteUrl}/license#manage`,
    pricing: `${siteUrl}/pricing`,
    install: `${siteUrl}/license#install`,
  };
}

/** Signs and stores a new key for a license's current terms. */
export async function issueKey(
  services: Services,
  license: LicenseRecord
): Promise<string> {
  const key = await signLicense(
    {
      v: 1,
      kid: services.signing.kid,
      id: license.id,
      licensee: license.licensee,
      plan: license.plan,
      seats: license.seats,
      scope: license.scope,
      issued: isoDate(services.now()),
      updatesUntil: license.updatesUntil,
      ...(license.expires ? { expires: license.expires } : {}),
    },
    services.signing.privateKey
  );
  await services.store.insertKey(license.id, services.signing.kid, key);
  return key;
}

export async function createLicense(
  services: Services,
  customer: CustomerRecord,
  input: {
    plan: LicensePlan;
    scope: LicenseScope;
    seats: number;
    updatesUntil: string;
    expires?: string;
    licensee?: string;
    subscriptionId?: string;
    transactionId?: string;
  }
): Promise<{ license: LicenseRecord; key: string }> {
  const license: LicenseRecord = {
    id: randomId("lic"),
    customerId: customer.id,
    licensee:
      input.licensee?.trim() ||
      customer.company ||
      customer.name ||
      customer.email,
    plan: input.plan,
    scope: input.scope,
    seats: input.seats,
    status: "active",
    issued: isoDate(services.now()),
    updatesUntil: input.updatesUntil,
    expires: input.expires,
    subscriptionId: input.subscriptionId,
    transactionId: input.transactionId,
    termsVersion: services.config.termsVersion,
    publicToken: randomToken(),
  };
  await services.store.insertLicense(license);
  const key = await issueKey(services, license);
  return { license, key };
}

/** Thrown when an event needs a record that hasn't arrived yet; the provider retries. */
export class NotReady extends Error {}

/**
 * Applies one payment event. Each event runs at most once to completion;
 * a failure leaves it retryable.
 */
export async function applyPaymentEvent(
  services: Services,
  event: PaymentEvent
): Promise<"applied" | "duplicate"> {
  const { store } = services;
  if (
    !(await store.claimEvent(event.eventId, services.payments.name, event.type))
  ) {
    return "duplicate";
  }
  try {
    await apply(services, event);
    await store.finishEvent(event.eventId, "done");
    return "applied";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await store.finishEvent(event.eventId, "failed", message);
    if (!(error instanceof NotReady)) {
      await services.mailer
        .send(
          notifyEmail(
            services.config.notifyEmail,
            `Payment event ${event.type} failed`,
            `${event.eventId}\n${message}\n\nThe provider will retry. Run \`pnpm admin failures\` to see open failures.`
          )
        )
        .catch(() => undefined);
    }
    throw error;
  }
}

async function apply(services: Services, event: PaymentEvent) {
  const { store, mailer } = services;
  switch (event.type) {
    case "purchase": {
      if ((await store.licensesByTransaction(event.transactionId)).length > 0) {
        return;
      }
      const customer = await store.upsertCustomer({
        id: randomId("cus"),
        ...event.buyer,
      });
      const updatesUntil = isoDate(
        event.periodEnd
          ? new Date(event.periodEnd)
          : addMonths(services.now(), 12)
      );
      for (const item of event.items) {
        const { license, key } = await createLicense(services, customer, {
          plan: item.product === "oem" ? "oem" : "commercial",
          scope: item.product === "oem" ? "oem" : "internal",
          seats: item.product === "oem" ? 0 : item.quantity,
          updatesUntil,
          subscriptionId: event.subscriptionId,
          transactionId: event.transactionId,
        });
        await mailer.send(
          keyEmail(
            customer.email,
            license,
            key,
            linksFor(services, license),
            "purchase"
          )
        );
        // An OEM item bought in several units makes one license per product.
        for (
          let extra = 1;
          item.product === "oem" && extra < item.quantity;
          extra++
        ) {
          const another = await createLicense(services, customer, {
            plan: "oem",
            scope: "oem",
            seats: 0,
            updatesUntil,
            subscriptionId: event.subscriptionId,
            transactionId: event.transactionId,
          });
          await mailer.send(
            keyEmail(
              customer.email,
              another.license,
              another.key,
              linksFor(services, another.license),
              "purchase"
            )
          );
        }
      }
      return;
    }
    case "renewal": {
      const licenses = await store.licensesBySubscription(event.subscriptionId);
      if (licenses.length === 0) {
        throw new NotReady(
          `No license for subscription ${event.subscriptionId} yet`
        );
      }
      const updatesUntil = isoDate(
        event.periodEnd
          ? new Date(event.periodEnd)
          : addMonths(services.now(), 12)
      );
      for (const license of licenses) {
        if (license.status === "refunded" || license.status === "revoked")
          continue;
        await store.updateLicense(license.id, {
          updatesUntil,
          status: "active",
          transactionId: event.transactionId,
        });
        const renewed = { ...license, updatesUntil, status: "active" as const };
        const key = await issueKey(services, renewed);
        const customer = await store.customer(license.customerId);
        await mailer.send(
          keyEmail(
            customer!.email,
            renewed,
            key,
            linksFor(services, renewed),
            "renewal"
          )
        );
      }
      return;
    }
    case "seats-changed": {
      const license = (
        await store.licensesBySubscription(event.subscriptionId)
      ).find((item) => item.plan === "commercial");
      if (!license) {
        throw new NotReady(
          `No license for subscription ${event.subscriptionId} yet`
        );
      }
      if (license.seats === event.seats) return;
      await store.updateLicense(license.id, { seats: event.seats });
      const changed = { ...license, seats: event.seats };
      const key = await issueKey(services, changed);
      const customer = await store.customer(license.customerId);
      await mailer.send(
        keyEmail(
          customer!.email,
          changed,
          key,
          linksFor(services, changed),
          "seats"
        )
      );
      return;
    }
    case "canceled": {
      for (const license of await store.licensesBySubscription(
        event.subscriptionId
      )) {
        if (license.status !== "active") continue;
        await store.updateLicense(license.id, { status: "canceled" });
        const customer = await store.customer(license.customerId);
        await mailer.send(
          canceledEmail(customer!.email, license, linksFor(services, license))
        );
      }
      return;
    }
    case "refunded": {
      const licenses = await store.licensesByTransaction(event.transactionId);
      if (licenses.length === 0) {
        throw new NotReady(
          `No license for transaction ${event.transactionId} yet`
        );
      }
      for (const license of licenses) {
        if (license.status === "refunded") continue;
        await store.updateLicense(license.id, { status: "refunded" });
        const customer = await store.customer(license.customerId);
        await mailer.send(refundedEmail(customer!.email, license));
      }
      return;
    }
  }
}
