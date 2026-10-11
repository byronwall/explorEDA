/** Worker bindings and settings. Secrets are set with `wrangler secret put`. */
export interface Env {
  DB: D1Database;
  /** `paddle` in staging and production; `fake` for local development. */
  PAYMENT_PROVIDER: "paddle" | "fake";
  PADDLE_ENV: "sandbox" | "production";
  /** Paddle price IDs: per-developer commercial license, per-product OEM add-on. */
  PADDLE_PRICE_COMMERCIAL?: string;
  PADDLE_PRICE_OEM?: string;
  /** Origin of the marketing site, allowed to call /api. */
  SITE_URL: string;
  /** Where this service is reachable, for links in emails. */
  PUBLIC_BASE_URL: string;
  MAIL_FROM: string;
  /** Byron's inbox for quote requests and failures. */
  NOTIFY_EMAIL: string;
  SIGNING_KEY_ID: string;
  TERMS_VERSION: string;

  // Secrets
  SIGNING_PRIVATE_KEY: string;
  ADMIN_TOKEN: string;
  PADDLE_WEBHOOK_SECRET?: string;
  PADDLE_API_KEY?: string;
  FAKE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
}
