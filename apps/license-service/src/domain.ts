import type {
  LicensePlan,
  LicenseScope,
} from "../../../packages/explorEDA/src/license/token";

export type { LicensePlan, LicenseScope };

/** What the merchant of record sold, in the service's own terms. */
export type Product = "commercial" | "oem";

export interface Buyer {
  email: string;
  name?: string;
  company?: string;
  /** The provider's customer ID, for its billing portal. */
  providerCustomerId?: string;
}

/**
 * A payment provider event after the adapter has read it. Fulfilment only
 * sees these, so a provider swap changes one adapter.
 */
export type PaymentEvent =
  | {
      type: "purchase";
      eventId: string;
      transactionId: string;
      subscriptionId?: string;
      buyer: Buyer;
      items: Array<{ product: Product; quantity: number }>;
      /** End of the paid period; the update period ends with it. */
      periodEnd?: string;
    }
  | {
      type: "renewal";
      eventId: string;
      transactionId: string;
      subscriptionId: string;
      periodEnd: string;
    }
  | {
      type: "seats-changed";
      eventId: string;
      subscriptionId: string;
      seats: number;
    }
  | {
      type: "canceled";
      eventId: string;
      subscriptionId: string;
    }
  | {
      type: "refunded";
      eventId: string;
      transactionId: string;
    };

export type LicenseStatusValue = "active" | "canceled" | "refunded" | "revoked";

export interface LicenseRecord {
  id: string;
  customerId: string;
  licensee: string;
  plan: LicensePlan;
  scope: LicenseScope;
  seats: number;
  status: LicenseStatusValue;
  issued: string;
  updatesUntil: string;
  expires?: string;
  subscriptionId?: string;
  transactionId?: string;
  termsVersion: string;
  publicToken: string;
}

export interface CustomerRecord {
  id: string;
  email: string;
  name?: string;
  company?: string;
  providerCustomerId?: string;
}
