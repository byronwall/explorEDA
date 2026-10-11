import {
  keyEmail,
  notifyEmail,
  portalEmail,
  quoteReceivedEmail,
  verifyEmail,
} from "./emails";
import { createLicense, linksFor, type Services } from "./licenses";
import type { LicenseRecord } from "./domain";
import {
  addDays,
  addMonths,
  isEmail,
  isoDate,
  randomId,
  randomToken,
} from "./util";

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409 | 429 = 400
  ) {
    super(message);
  }
}

export interface KeyRequestInput {
  kind: "trial" | "community";
  email: unknown;
  name?: unknown;
  company?: unknown;
  /** Community requests must confirm they qualify for free use. */
  eligible?: unknown;
}

function text(value: unknown, max = 200): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

/** One trial per email and three per domain, every 90 days. */
async function checkTrialLimits(services: Services, email: string) {
  const since = addDays(services.now(), -90).toISOString();
  const domain = email.split("@")[1] ?? "";
  if ((await services.store.countVerified("trial", since, { email })) >= 1) {
    throw new RequestError(
      "This email already had a trial in the last 90 days. Write to sales@exploreda.dev to extend it.",
      429
    );
  }
  if ((await services.store.countVerified("trial", since, { domain })) >= 3) {
    throw new RequestError(
      "Your company already has several trials. Write to sales@exploreda.dev and we'll help.",
      429
    );
  }
}

/** Records a trial or community request and emails a confirmation link. */
export async function requestKey(
  services: Services,
  input: KeyRequestInput
): Promise<void> {
  if (!isEmail(input.email)) throw new RequestError("Enter a valid email.");
  const email = input.email.trim().toLowerCase();
  if (input.kind === "community" && input.eligible !== true) {
    throw new RequestError(
      "Confirm that your use qualifies for free use under the explorEDA License."
    );
  }
  if (input.kind === "trial") await checkTrialLimits(services, email);
  const token = randomToken();
  await services.store.insertRequest({
    token,
    kind: input.kind,
    email,
    name: text(input.name),
    company: text(input.company),
    createdAt: services.now().toISOString(),
  });
  await services.mailer.send(
    verifyEmail(
      email,
      input.kind,
      `${services.config.publicBaseUrl}/verify/${token}`
    )
  );
}

/** Confirms an emailed link and issues the key. Safe to open twice. */
export async function verifyKeyRequest(
  services: Services,
  token: string
): Promise<LicenseRecord> {
  const { store } = services;
  const request = await store.request(token);
  if (!request || request.kind === "quote") {
    throw new RequestError("This link isn't valid. Request a new one.", 404);
  }
  if (request.licenseId) {
    const existing = await store.license(request.licenseId);
    if (existing) return existing;
  }
  if (addDays(new Date(request.createdAt), 7) < services.now()) {
    throw new RequestError("This link has expired. Request a new one.", 404);
  }
  if (request.kind === "trial") await checkTrialLimits(services, request.email);
  const customer = await store.upsertCustomer({
    id: randomId("cus"),
    email: request.email,
    name: request.name,
    company: request.company,
  });
  const now = services.now();
  const trialEnd = isoDate(addDays(now, 30));
  const { license, key } = await createLicense(
    services,
    customer,
    request.kind === "trial"
      ? {
          plan: "trial",
          scope: "internal",
          seats: 0,
          updatesUntil: trialEnd,
          expires: trialEnd,
        }
      : {
          plan: "community",
          scope: "internal",
          seats: 0,
          updatesUntil: isoDate(addMonths(now, 12)),
        }
  );
  await store.completeRequest(token, license.id);
  await services.mailer.send(
    keyEmail(
      customer.email,
      license,
      key,
      linksFor(services, license),
      request.kind
    )
  );
  return license;
}

/** Sends Byron a quote request and the buyer an acknowledgement. */
export async function requestQuote(
  services: Services,
  input: {
    email: unknown;
    name?: unknown;
    company?: unknown;
    seats?: unknown;
    redistribution?: unknown;
    message?: unknown;
  }
): Promise<void> {
  if (!isEmail(input.email)) throw new RequestError("Enter a valid email.");
  const company = text(input.company);
  if (!company) throw new RequestError("Enter your company name.");
  const email = input.email.trim().toLowerCase();
  const seats = Math.max(1, Math.min(10_000, Number(input.seats) || 1));
  const detail = [
    `Seats: ${seats}`,
    `Redistribution add-on: ${input.redistribution === true ? "yes" : "no"}`,
    `Message: ${text(input.message, 2000) ?? "(none)"}`,
  ].join("\n");
  await services.store.insertRequest({
    token: randomToken(),
    kind: "quote",
    email,
    name: text(input.name),
    company,
    detail,
    createdAt: services.now().toISOString(),
  });
  await services.mailer.send({
    ...notifyEmail(
      services.config.notifyEmail,
      `Quote request from ${company}`,
      `${text(input.name) ?? ""} <${email}>\n${company}\n${detail}\n\nCreate the invoice in Paddle: Customers → New invoice. When it's paid, the license is issued automatically.`
    ),
    replyTo: email,
  });
  await services.mailer.send(quoteReceivedEmail(email));
}

/**
 * Emails a sign-in link to the customer's license page. Says nothing about
 * whether the email has licenses, so it can't be used to look customers up.
 */
export async function requestPortalLink(
  services: Services,
  emailInput: unknown
): Promise<void> {
  if (!isEmail(emailInput)) throw new RequestError("Enter a valid email.");
  const customer = await services.store.customerByEmail(emailInput);
  if (!customer) return;
  const token = randomToken();
  await services.store.insertPortalToken(
    token,
    customer.id,
    addDays(services.now(), 1).toISOString()
  );
  await services.mailer.send(
    portalEmail(
      customer.email,
      `${services.config.publicBaseUrl}/portal/${token}`
    )
  );
}
