import { createApp } from "./app";
import type { Env } from "./env";
import type { Services } from "./licenses";
import { MemoryMailer, ResendMailer, type Mailer } from "./mailer";
import { FakeProvider } from "./payments/fake";
import { PaddleProvider } from "./payments/paddle";
import type { PaymentProvider } from "./payments/types";
import { Store } from "./store";

function payments(env: Env): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "fake") {
    return new FakeProvider(env.FAKE_WEBHOOK_SECRET);
  }
  if (!env.PADDLE_WEBHOOK_SECRET || !env.PADDLE_API_KEY) {
    throw new Error("PADDLE_WEBHOOK_SECRET and PADDLE_API_KEY must be set");
  }
  return new PaddleProvider({
    webhookSecret: env.PADDLE_WEBHOOK_SECRET,
    apiKey: env.PADDLE_API_KEY,
    environment: env.PADDLE_ENV,
    prices: {
      commercial: env.PADDLE_PRICE_COMMERCIAL,
      oem: env.PADDLE_PRICE_OEM,
    },
  });
}

// Without a Resend key, emails print to the Worker log (local development).
const consoleMailer = new MemoryMailer(true);

function mailer(env: Env): Mailer {
  return env.RESEND_API_KEY
    ? new ResendMailer(env.RESEND_API_KEY, env.MAIL_FROM)
    : consoleMailer;
}

export function servicesFor(env: Env): Services {
  const now = () => new Date();
  return {
    store: new Store(env.DB, now),
    mailer: mailer(env),
    payments: payments(env),
    signing: { kid: env.SIGNING_KEY_ID, privateKey: env.SIGNING_PRIVATE_KEY },
    now,
    config: {
      publicBaseUrl: env.PUBLIC_BASE_URL,
      siteUrl: env.SITE_URL,
      notifyEmail: env.NOTIFY_EMAIL,
      termsVersion: env.TERMS_VERSION,
    },
  };
}

async function verifyTurnstile(
  secret: string,
  token: unknown,
  ip: string | undefined
): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export default {
  fetch(request: Request, env: Env, context: ExecutionContext) {
    const app = createApp(
      (honoContext) => servicesFor(honoContext.env as Env),
      {
        adminToken: env.ADMIN_TOKEN,
        verifyHuman: env.TURNSTILE_SECRET
          ? (token, ip) => verifyTurnstile(env.TURNSTILE_SECRET!, token, ip)
          : undefined,
      }
    );
    return app.fetch(request, env, context);
  },
} satisfies ExportedHandler<Env>;
