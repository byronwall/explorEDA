import { describePlan } from "../../../packages/explorEDA/src/license/token";
import type { CustomerRecord, LicenseRecord } from "./domain";
import { escapeHtml } from "./util";

const STYLE = `
:root { color-scheme: light dark; --fg: #18181b; --muted: #52525b; --bg: #ffffff; --line: #e4e4e7; --code: #f4f4f5; }
@media (prefers-color-scheme: dark) { :root { --fg: #fafafa; --muted: #a1a1aa; --bg: #09090b; --line: #27272a; --code: #18181b; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 system-ui, sans-serif; }
main { max-width: 720px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 24px; margin: 0 0 4px; }
h2 { font-size: 17px; margin: 32px 0 8px; }
p, dd { color: var(--muted); }
dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 20px; margin: 16px 0; }
dt { font-weight: 600; }
dd { margin: 0; overflow-wrap: anywhere; }
pre { white-space: pre-wrap; word-break: break-all; background: var(--code); border: 1px solid var(--line); border-radius: 6px; padding: 12px; font-size: 12px; }
a { color: inherit; }
.card { border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin: 16px 0; }
.status { font-weight: 600; }
@media print { a[href]::after { content: ""; } .noprint { display: none; } }
`;

export function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${STYLE}</style></head><body><main>${body}</main></body></html>`;
}

function plan(license: LicenseRecord) {
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

const STATUS_TEXT: Record<LicenseRecord["status"], string> = {
  active: "Active",
  canceled: "Won't renew; covered versions stay licensed",
  refunded: "Refunded; no longer valid for commercial use",
  revoked: "Revoked",
};

const SCOPE_TEXT = {
  internal: "Internal applications and hosted services the licensee operates",
  oem: "Redistribution in one product, plus internal and hosted use",
} as const;

/** A printable license certificate that procurement can file. */
export function certificatePage(
  license: LicenseRecord,
  siteUrl: string
): string {
  const rows: Array<[string, string]> = [
    ["Licensee", license.licensee],
    ["License ID", license.id],
    ["Plan", plan(license)],
    ["Scope", SCOPE_TEXT[license.scope]],
    ["Status", STATUS_TEXT[license.status]],
    ["Issued", license.issued],
    [
      license.plan === "trial" ? "Trial ends" : "Updates through",
      license.expires ?? license.updatesUntil,
    ],
    [
      "Covered versions",
      license.plan === "trial"
        ? "All versions, until the trial ends"
        : `Every explorEDA version released on or before ${license.updatesUntil}, without time limit`,
    ],
    ["Terms", `explorEDA Commercial License Agreement ${license.termsVersion}`],
  ];
  return page(
    `explorEDA license certificate · ${license.licensee}`,
    `<h1>explorEDA license certificate</h1>
<p>This certifies the license below, issued under the
<a href="${escapeHtml(siteUrl)}/legal/commercial-license">explorEDA Commercial License Agreement</a>.</p>
<dl>${rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>
<p>Verify this certificate at its address, or with
<code>npx exploreda license check</code> and the license key.</p>
<p class="noprint"><a href="javascript:window.print()">Print or save as PDF</a></p>`
  );
}

/** The customer's license page: keys, certificates, billing. */
export function portalPage(
  customer: CustomerRecord,
  licenses: Array<{
    license: LicenseRecord;
    key?: string;
    certificate: string;
  }>,
  billingUrl: string | undefined,
  siteUrl: string
): string {
  const cards = licenses
    .map(
      ({ license, key, certificate }) => `<div class="card">
<p class="status">${escapeHtml(license.licensee)} · ${escapeHtml(plan(license))}</p>
<dl>
<dt>License ID</dt><dd>${escapeHtml(license.id)}</dd>
<dt>Status</dt><dd>${escapeHtml(STATUS_TEXT[license.status])}</dd>
<dt>${license.plan === "trial" ? "Trial ends" : "Updates through"}</dt><dd>${escapeHtml(license.expires ?? license.updatesUntil)}</dd>
</dl>
${key ? `<pre>${escapeHtml(key)}</pre>` : ""}
<p><a href="${escapeHtml(certificate)}">License certificate</a></p>
</div>`
    )
    .join("");
  return page(
    "Your explorEDA licenses",
    `<h1>Your explorEDA licenses</h1>
<p>${escapeHtml(customer.email)}</p>
${cards || "<p>No licenses yet.</p>"}
<h2>Billing</h2>
<p>${
      billingUrl
        ? `<a href="${escapeHtml(billingUrl)}">Invoices, payment method, and cancellation</a> (Paddle)`
        : "Invoices are in your Paddle receipt emails."
    }</p>
<h2>More developers</h2>
<p>To add developers to a license, write to
<a href="mailto:sales@exploreda.dev">sales@exploreda.dev</a> with your license ID.
You'll pay a prorated amount and get a new key.</p>
<p><a href="${escapeHtml(siteUrl)}/license#install">Installing your key</a></p>`
  );
}

export function messagePage(title: string, message: string): string {
  return page(
    title,
    `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>`
  );
}
