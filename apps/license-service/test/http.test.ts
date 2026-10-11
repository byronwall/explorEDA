import { describe, expect, it } from "vitest";
import { readLicensePayload } from "../../../packages/explorEDA/src/license/token";
import type { PaymentEvent } from "../src/domain";
import { ADMIN_TOKEN, FAKE_SECRET, keyIn, testServices } from "./harness";

function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  return new Request(`https://license.test${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function linkIn(text: string, path: string): string {
  const match = new RegExp(`https://license\\.test${path}[\\w-]+`).exec(text);
  if (!match) throw new Error(`No ${path} link in:\n${text}`);
  return match[0];
}

const purchase: PaymentEvent = {
  type: "purchase",
  eventId: "evt_http",
  transactionId: "txn_http",
  subscriptionId: "sub_http",
  buyer: { email: "dev@globex.example", company: "Globex" },
  items: [{ product: "commercial", quantity: 2 }],
};

describe("license service over HTTP", () => {
  it("fulfils a signed webhook and rejects an unsigned one", async () => {
    const { app, mailer } = testServices();
    const rejected = await app.request(post("/webhooks/payments", purchase));
    expect(rejected.status).toBe(401);

    const accepted = await app.request(
      post("/webhooks/payments", purchase, { "x-fake-signature": FAKE_SECRET })
    );
    expect(accepted.status).toBe(200);
    expect(await accepted.json()).toMatchObject({
      results: [{ eventId: "evt_http", result: "applied" }],
    });
    expect(mailer.sent).toHaveLength(1);
  });

  it("issues a trial key after the email is confirmed, once per email", async () => {
    const { app, mailer } = testServices();
    const response = await app.request(
      post("/api/trial", { email: "eval@initech.example", company: "Initech" })
    );
    expect(response.status).toBe(200);
    const verify = linkIn(mailer.sent[0]!.text, "/verify/");

    const opened = await app.request(verify);
    expect(opened.status).toBe(302);
    const certificate = opened.headers.get("location")!;
    expect(certificate).toMatch(/\/c\/[\w-]+\?new=1$/);

    const key = keyIn(mailer.sent[1]!.text);
    expect(readLicensePayload(key)).toMatchObject({
      plan: "trial",
      licensee: "Initech",
      expires: "2026-12-01",
    });

    // Opening the link again shows the same license, without a second key.
    const again = await app.request(verify);
    expect(again.headers.get("location")).toBe(certificate);
    expect(mailer.sent).toHaveLength(2);

    const page = await app.request(certificate);
    const html = await page.text();
    expect(html).toContain("Initech");
    expect(html).toContain("Trial ends");

    const second = await app.request(
      post("/api/trial", { email: "eval@initech.example" })
    );
    expect(second.status).toBe(429);
  });

  it("asks community requests to confirm they qualify", async () => {
    const { app } = testServices();
    const missing = await app.request(
      post("/api/community", { email: "student@uni.example" })
    );
    expect(missing.status).toBe(400);
    const ok = await app.request(
      post("/api/community", { email: "student@uni.example", eligible: true })
    );
    expect(ok.status).toBe(200);
  });

  it("forwards a quote request to Byron and acknowledges the buyer", async () => {
    const { app, mailer } = testServices();
    const response = await app.request(
      post("/api/quote", {
        email: "procurement@bigco.example",
        company: "BigCo",
        seats: 25,
        redistribution: true,
      })
    );
    expect(response.status).toBe(200);
    expect(mailer.sent.map((email) => email.to)).toEqual([
      "byron@site.test",
      "procurement@bigco.example",
    ]);
    expect(mailer.sent[0]!.text).toContain("Seats: 25");
    expect(mailer.sent[0]!.replyTo).toBe("procurement@bigco.example");
  });

  it("emails a portal link only to known customers, and the portal shows the key", async () => {
    const { app, mailer, clock } = testServices();
    await app.request(
      post("/api/portal-link", { email: "nobody@else.example" })
    );
    expect(mailer.sent).toHaveLength(0);

    await app.request(
      post("/webhooks/payments", purchase, { "x-fake-signature": FAKE_SECRET })
    );
    const key = keyIn(mailer.sent[0]!.text);
    await app.request(
      post("/api/portal-link", { email: "DEV@globex.example" })
    );
    const portal = linkIn(mailer.sent[1]!.text, "/portal/");
    const html = await (await app.request(portal)).text();
    expect(html).toContain("Globex");
    expect(html).toContain(key);

    // Links stop working after a day.
    clock.now = new Date("2026-11-03T12:00:00Z");
    expect((await app.request(portal)).status).toBe(404);
  });

  it("allows the site to call the API from the browser", async () => {
    const { app } = testServices();
    const preflight = await app.request(
      new Request("https://license.test/api/trial", {
        method: "OPTIONS",
        headers: {
          Origin: "https://site.test",
          "Access-Control-Request-Method": "POST",
        },
      })
    );
    expect(preflight.headers.get("access-control-allow-origin")).toBe(
      "https://site.test"
    );
  });

  it("guards admin routes and issues a manual license", async () => {
    const { app } = testServices();
    expect((await app.request("/admin/licenses")).status).toBe(401);
    const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` };
    const created = await app.request(
      post(
        "/admin/licenses",
        {
          email: "byron@exploreda.dev",
          licensee: "exploreda.dev",
          plan: "community",
          updatesUntil: "2099-12-31",
          sendEmail: false,
        },
        auth
      )
    );
    expect(created.status).toBe(200);
    const { key } = (await created.json()) as { key: string };
    expect(readLicensePayload(key)?.licensee).toBe("exploreda.dev");

    const report = await app.request(
      new Request("https://license.test/admin/report", { headers: auth })
    );
    expect(await report.json()).toMatchObject({ active: { community: 1 } });
  });
});
