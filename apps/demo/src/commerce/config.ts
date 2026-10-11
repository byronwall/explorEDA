/**
 * Prices and the settings the pricing pages need. Prices are list prices in
 * US dollars per year; Paddle shows local currency and tax at checkout.
 * Change a price here and in the Paddle catalog together.
 */
export const PRICES = {
  /** Per developer, per year. */
  commercial: 499,
  /** Per redistributed product, per year. */
  oem: 1490,
} as const;

/** Orders at or above this many developers go through a quote and invoice. */
export const QUOTE_SEATS = 10;

const env = import.meta.env;

export const LICENSE_SERVICE_URL: string | undefined =
  env.VITE_LICENSE_SERVICE_URL || undefined;

export const TURNSTILE_SITE_KEY: string | undefined =
  env.VITE_TURNSTILE_SITE_KEY || undefined;

export interface PaddleSettings {
  token: string;
  environment: "sandbox" | "production";
  prices: { commercial: string; oem?: string };
}

/** Checkout opens only when Paddle's client token and prices are set. */
export const PADDLE: PaddleSettings | undefined =
  env.VITE_PADDLE_CLIENT_TOKEN && env.VITE_PADDLE_PRICE_COMMERCIAL
    ? {
        token: env.VITE_PADDLE_CLIENT_TOKEN,
        environment:
          env.VITE_PADDLE_ENV === "production" ? "production" : "sandbox",
        prices: {
          commercial: env.VITE_PADDLE_PRICE_COMMERCIAL,
          oem: env.VITE_PADDLE_PRICE_OEM || undefined,
        },
      }
    : undefined;

export const SALES_EMAIL = "sales@exploreda.dev";

export function formatPrice(dollars: number) {
  return `$${dollars.toLocaleString("en-US")}`;
}
