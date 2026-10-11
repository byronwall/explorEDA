import { describePlan } from "../../../packages/explorEDA/src/license/token";
import type { LicenseRecord } from "./domain";
import type { Email } from "./mailer";
import { escapeHtml } from "./util";

export interface Links {
  certificate: string;
  portal: string;
  pricing: string;
  install: string;
}

function planText(license: LicenseRecord): string {
  return describePlan({
    v: 1,
    kid: "",
    id: license.id,
    licensee: license.licensee,
    plan: license.plan,
    seats: license.seats,
    scope: license.scope,
    issued: license.issued,
    updatesUntil: license.updatesUntil,
  });
}

function layout(paragraphs: string[], key?: string): string {
  const body = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
  const keyBlock = key
    ? `<pre style="white-space:pre-wrap;word-break:break-all;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:6px;padding:12px;font-size:12px">${escapeHtml(key)}</pre>`
    : "";
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#18181b;max-width:600px">${body.replace("{{KEY}}", keyBlock)}</body></html>`;
}

function link(href: string, label: string) {
  return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

/** Sent after a purchase, renewal, or seat change: the key and how to use it. */
export function keyEmail(
  to: string,
  license: LicenseRecord,
  key: string,
  links: Links,
  reason: "purchase" | "renewal" | "seats" | "reissue" | "trial" | "community"
): Email {
  const subject = {
    purchase: "Your explorEDA license key",
    renewal: "Your renewed explorEDA license key",
    seats: "Your updated explorEDA license key",
    reissue: "Your explorEDA license key",
    trial: "Your 30-day explorEDA trial key",
    community: "Your explorEDA community license key",
  }[reason];
  const intro = {
    purchase: `Thank you for buying explorEDA. Your license is for ${license.licensee}: ${planText(license)}.`,
    renewal: `Your explorEDA license for ${license.licensee} is renewed. Updates now run through ${license.updatesUntil}.`,
    seats: `Your explorEDA license for ${license.licensee} now covers ${planText(license)}.`,
    reissue: `Here is the current license key for ${license.licensee} (${planText(license)}).`,
    trial: `Your explorEDA trial for ${license.licensee} runs through ${license.expires}. It works in development and production, with no notice.`,
    community: `Here is a community license key for ${license.licensee}. It removes the unlicensed notice for free use under the explorEDA License.`,
  }[reason];
  const covered =
    reason === "trial"
      ? `When the trial ends, the notice returns. ${link(links.pricing, "Buy a license")} to keep going.`
      : `Every explorEDA version released through ${license.updatesUntil} stays licensed for good, even if you don't renew.`;
  const replace =
    reason === "renewal" || reason === "seats"
      ? "Replace your old key with this one when you next deploy; the old key keeps working for the versions it covered."
      : "";
  const installText = `Pass it to the workspace as licenseKey, or call setLicenseKey() from "exploreda/license". The key is checked offline and is safe to ship in your client code. Details: ${links.install}`;
  const text = [
    intro,
    "",
    "License key:",
    key,
    "",
    installText,
    replace,
    covered,
    "",
    `License certificate: ${links.certificate}`,
    `Your licenses and billing: ${links.portal}`,
    "",
    `License ID ${license.id}. Reply to this email for help.`,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
  const html = layout(
    [
      escapeHtml(intro),
      "{{KEY}}",
      `Pass it to the workspace as <code>licenseKey</code>, or call <code>setLicenseKey()</code> from <code>exploreda/license</code>. The key is checked offline and is safe to ship in your client code. ${link(links.install, "Installing your key")}.`,
      ...(replace ? [escapeHtml(replace)] : []),
      reason === "trial"
        ? `When the trial ends, the notice returns. ${link(links.pricing, "Buy a license")} to keep going.`
        : escapeHtml(covered),
      `${link(links.certificate, "License certificate")} · ${link(links.portal, "Your licenses and billing")}`,
      `License ID ${escapeHtml(license.id)}. Reply to this email for help.`,
    ],
    key
  );
  return { to, subject, text, html };
}

export function canceledEmail(
  to: string,
  license: LicenseRecord,
  links: Links
): Email {
  const text = `Your explorEDA license for ${license.licensee} won't renew. Every version released through ${license.updatesUntil} stays licensed for good; keep using your current key. To install later versions, buy again at ${links.pricing}.\n\nLicense certificate: ${links.certificate}`;
  return {
    to,
    subject: "Your explorEDA license won't renew",
    text,
    html: layout([
      escapeHtml(
        `Your explorEDA license for ${license.licensee} won't renew. Every version released through ${license.updatesUntil} stays licensed for good; keep using your current key.`
      ),
      `To install later versions, ${link(links.pricing, "buy again")}. ${link(links.certificate, "License certificate")}.`,
    ]),
  };
}

export function refundedEmail(to: string, license: LicenseRecord): Email {
  const text = `Your refund for explorEDA license ${license.id} (${license.licensee}) is processed. The license key no longer covers commercial use. Free use under the explorEDA License is still open to you if you qualify.`;
  return {
    to,
    subject: "Your explorEDA refund",
    text,
    html: layout([escapeHtml(text)]),
  };
}

export function verifyEmail(
  to: string,
  kind: "trial" | "community",
  verifyUrl: string
): Email {
  const what = kind === "trial" ? "30-day trial key" : "community license key";
  const text = `Confirm your email to get your explorEDA ${what}:\n\n${verifyUrl}\n\nIf you didn't ask for this, ignore this email.`;
  return {
    to,
    subject: `Confirm your email for an explorEDA ${what}`,
    text,
    html: layout([
      `Confirm your email to get your explorEDA ${what}.`,
      link(verifyUrl, "Confirm and get my key"),
      "If you didn't ask for this, ignore this email.",
    ]),
  };
}

export function portalEmail(to: string, portalUrl: string): Email {
  const text = `Open your explorEDA licenses (link valid for 24 hours):\n\n${portalUrl}`;
  return {
    to,
    subject: "Your explorEDA licenses",
    text,
    html: layout([
      link(portalUrl, "Open your explorEDA licenses"),
      "The link works for 24 hours.",
    ]),
  };
}

export function quoteReceivedEmail(to: string): Email {
  const text =
    "Thanks for asking about an explorEDA quote. We'll reply within one business day with a quote and, when you're ready, an invoice you can pay by bank transfer or card.";
  return {
    to,
    subject: "Your explorEDA quote request",
    text,
    html: layout([escapeHtml(text)]),
  };
}

export function notifyEmail(to: string, subject: string, body: string): Email {
  return {
    to,
    subject: `[explorEDA licenses] ${subject}`,
    text: body,
    html: layout([`<pre>${escapeHtml(body)}</pre>`]),
  };
}
