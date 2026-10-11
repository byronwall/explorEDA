import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { keyEmail } from "./emails";
import {
  applyPaymentEvent,
  createLicense,
  issueKey,
  linksFor,
  type Services,
} from "./licenses";
import { certificatePage, messagePage, portalPage } from "./pages";
import { WebhookRejected } from "./payments/types";
import {
  RequestError,
  requestKey,
  requestPortalLink,
  requestQuote,
  verifyKeyRequest,
} from "./requests";
import { isEmail, randomId, safeEqual } from "./util";
import type { LicensePlan, LicenseScope } from "./domain";

export interface AppOptions {
  adminToken: string;
  /** Checks a Turnstile token; omit to skip the check (local development). */
  verifyHuman?: (token: unknown, ip: string | undefined) => Promise<boolean>;
}

type Factory = (context: Context) => Services;

async function readJson(context: Context): Promise<Record<string, unknown>> {
  try {
    const body = (await context.req.json()) as unknown;
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    throw new RequestError("Send a JSON body.");
  }
}

/**
 * The license service. Services are built per request from the Worker's
 * bindings, so tests pass their own store, mailer, and provider.
 */
export function createApp(services: Factory, options: AppOptions) {
  const app = new Hono();

  app.onError((error, context) => {
    if (error instanceof RequestError) {
      return context.json({ error: error.message }, error.status);
    }
    console.error(error);
    return context.json({ error: "Something went wrong. Try again." }, 500);
  });

  app.get("/", (context) =>
    context.redirect(`${services(context).config.siteUrl}/license`)
  );
  app.get("/health", (context) => context.json({ ok: true }));

  // Payment webhooks ------------------------------------------------------

  app.post("/webhooks/payments", async (context) => {
    const svc = services(context);
    let events;
    try {
      events = await svc.payments.parseWebhook(context.req.raw);
    } catch (error) {
      if (error instanceof WebhookRejected) {
        return context.json({ error: error.message }, 401);
      }
      throw error;
    }
    const results = [];
    for (const event of events) {
      results.push({
        eventId: event.eventId,
        result: await applyPaymentEvent(svc, event),
      });
    }
    return context.json({ ok: true, results });
  });

  // Site requests ---------------------------------------------------------

  app.use("/api/*", async (context, next) =>
    cors({
      origin: services(context).config.siteUrl,
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      maxAge: 86400,
    })(context, next)
  );

  async function human(context: Context, body: Record<string, unknown>) {
    if (!options.verifyHuman) return;
    const ok = await options.verifyHuman(
      body.turnstileToken,
      context.req.header("cf-connecting-ip")
    );
    if (!ok) throw new RequestError("Please complete the check and try again.");
  }

  app.post("/api/trial", async (context) => {
    const body = await readJson(context);
    await human(context, body);
    await requestKey(services(context), {
      ...body,
      kind: "trial",
      email: body.email,
    });
    return context.json({ ok: true });
  });

  app.post("/api/community", async (context) => {
    const body = await readJson(context);
    await human(context, body);
    await requestKey(services(context), {
      ...body,
      kind: "community",
      email: body.email,
    });
    return context.json({ ok: true });
  });

  app.post("/api/quote", async (context) => {
    const body = await readJson(context);
    await human(context, body);
    await requestQuote(services(context), { ...body, email: body.email });
    return context.json({ ok: true });
  });

  app.post("/api/portal-link", async (context) => {
    const body = await readJson(context);
    await human(context, body);
    await requestPortalLink(services(context), body.email);
    return context.json({ ok: true });
  });

  // Pages -----------------------------------------------------------------

  app.get("/verify/:token", async (context) => {
    const svc = services(context);
    try {
      const license = await verifyKeyRequest(svc, context.req.param("token"));
      return context.redirect(
        `${svc.config.publicBaseUrl}/c/${license.publicToken}?new=1`
      );
    } catch (error) {
      if (error instanceof RequestError) {
        return context.html(
          messagePage("Link not valid", error.message),
          error.status
        );
      }
      throw error;
    }
  });

  app.get("/c/:token", async (context) => {
    const svc = services(context);
    const license = await svc.store.licenseByPublicToken(
      context.req.param("token")
    );
    if (!license) {
      return context.html(
        messagePage(
          "Certificate not found",
          "Check the link in your license email."
        ),
        404
      );
    }
    const html = certificatePage(license, svc.config.siteUrl);
    return context.html(
      context.req.query("new")
        ? html.replace(
            "<h1>",
            "<p><strong>Your key is on its way by email.</strong> This is your license certificate; bookmark it.</p><h1>"
          )
        : html
    );
  });

  app.get("/portal/:token", async (context) => {
    const svc = services(context);
    const customer = await svc.store.portalCustomer(context.req.param("token"));
    if (!customer) {
      return context.html(
        messagePage(
          "Link expired",
          "Sign-in links work for 24 hours. Request a new one from exploreda.dev/license."
        ),
        404
      );
    }
    const licenses = await svc.store.licensesByCustomer(customer.id);
    const rows = await Promise.all(
      licenses.map(async (license) => ({
        license,
        key:
          license.status === "refunded" || license.status === "revoked"
            ? undefined
            : await svc.store.latestKey(license.id),
        certificate: linksFor(svc, license).certificate,
      }))
    );
    const subscriptions = [
      ...new Set(licenses.flatMap((license) => license.subscriptionId ?? [])),
    ];
    const billingUrl = await svc.payments
      .billingPortalUrl(customer, subscriptions)
      .catch(() => undefined);
    return context.html(
      portalPage(customer, rows, billingUrl, svc.config.siteUrl)
    );
  });

  // Admin -----------------------------------------------------------------

  app.use("/admin/*", async (context, next) => {
    const header = context.req.header("authorization") ?? "";
    if (
      !options.adminToken ||
      !safeEqual(header, `Bearer ${options.adminToken}`)
    ) {
      return context.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });

  app.get("/admin/licenses", async (context) =>
    context.json(await services(context).store.allLicenses())
  );

  app.get("/admin/failures", async (context) =>
    context.json(await services(context).store.failedEvents())
  );

  app.get("/admin/report", async (context) => {
    const svc = services(context);
    const licenses = await svc.store.allLicenses();
    const soon = new Date(svc.now().getTime() + 45 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const today = svc.now().toISOString().slice(0, 10);
    const count = (plan: LicensePlan) =>
      licenses.filter((item) => item.plan === plan && item.status === "active")
        .length;
    return context.json({
      active: {
        commercial: count("commercial"),
        seats: licenses
          .filter(
            (item) => item.plan === "commercial" && item.status === "active"
          )
          .reduce((sum, item) => sum + item.seats, 0),
        oem: count("oem"),
        community: count("community"),
        trialsRunning: licenses.filter(
          (item) => item.plan === "trial" && (item.expires ?? "") >= today
        ).length,
      },
      renewingWithin45Days: licenses
        .filter(
          (item) =>
            item.status === "active" &&
            item.subscriptionId &&
            item.updatesUntil <= soon
        )
        .map(({ id, licensee, email, updatesUntil, seats }) => ({
          id,
          licensee,
          email,
          updatesUntil,
          seats,
        })),
      failedEvents: (await svc.store.failedEvents()).length,
    });
  });

  /** A free or manual license: Byron's own site, a non-profit, a deal outside Paddle. */
  app.post("/admin/licenses", async (context) => {
    const svc = services(context);
    const body = await readJson(context);
    if (!isEmail(body.email)) throw new RequestError("email is required");
    const plan = (body.plan ?? "commercial") as LicensePlan;
    if (!["commercial", "oem", "trial", "community"].includes(plan)) {
      throw new RequestError(
        "plan must be commercial, oem, trial, or community"
      );
    }
    if (
      typeof body.updatesUntil !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.updatesUntil)
    ) {
      throw new RequestError("updatesUntil must be YYYY-MM-DD");
    }
    const customer = await svc.store.upsertCustomer({
      id: randomId("cus"),
      email: body.email,
      name: typeof body.name === "string" ? body.name : undefined,
      company: typeof body.company === "string" ? body.company : undefined,
    });
    const { license, key } = await createLicense(svc, customer, {
      plan,
      scope: (plan === "oem" ? "oem" : "internal") as LicenseScope,
      seats: Number(body.seats ?? (plan === "commercial" ? 1 : 0)),
      updatesUntil: body.updatesUntil,
      expires: typeof body.expires === "string" ? body.expires : undefined,
      licensee: typeof body.licensee === "string" ? body.licensee : undefined,
    });
    if (body.sendEmail !== false) {
      await svc.mailer.send(
        keyEmail(
          customer.email,
          license,
          key,
          linksFor(svc, license),
          "reissue"
        )
      );
    }
    return context.json({
      license,
      key,
      certificate: linksFor(svc, license).certificate,
    });
  });

  app.post("/admin/licenses/:id/reissue", async (context) => {
    const svc = services(context);
    const license = await svc.store.license(context.req.param("id"));
    if (!license) throw new RequestError("No such license", 404);
    const key = await issueKey(svc, license);
    const customer = await svc.store.customer(license.customerId);
    await svc.mailer.send(
      keyEmail(customer!.email, license, key, linksFor(svc, license), "reissue")
    );
    return context.json({ license, key });
  });

  app.post("/admin/licenses/:id/revoke", async (context) => {
    const svc = services(context);
    const license = await svc.store.license(context.req.param("id"));
    if (!license) throw new RequestError("No such license", 404);
    await svc.store.updateLicense(license.id, { status: "revoked" });
    return context.json({ ok: true });
  });

  return app;
}
