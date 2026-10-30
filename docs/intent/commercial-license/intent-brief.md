---
title: "Sell explorEDA commercial licenses"
slug: "commercial-license"
phase: plan
status: current
last_updated: "2026-10-11"
---

# Sell explorEDA commercial licenses

## My read

Byron wants companies that use explorEDA in their products and internal tools to pay for it, the way they pay for Handsontable, AG Grid, or MUI X. The goal is not research. It is a working sales system: a company can find the price, buy without talking to anyone, receive a key, install it, and prove to its own legal and procurement teams that it is licensed. Byron gets paid with as little manual work as possible.

He wants every gap closed in one pass rather than a staged 90-day experiment, and he expects non-trivial changes: a server, a payment provider, a key system, legal terms, and changes to the package itself.

The audience is the purchaser, who is usually two people: the developer who installs the package and the person who approves the spend. The developer needs a fast trial and a clear licensed state in code. The approver needs a price, an invoice, terms they recognize, and a document that names their company.

The earlier [component-licensing research](../monetization-opportunities/component-licensing/report.md) recommended waiting for adoption before charging. Byron has now chosen to build the paid path. That research still supplies the comparables, prices, legal checklist, and readiness audit.

## What matters most

- Buying is self-serve by card, with an invoice path for companies that need a quote or purchase order.
- A buyer can always answer "are we licensed, for what, and until when?" from the key, the app, a CLI check, and a certificate.
- A lapsed or missing key never breaks a customer's production app. It shows a notice.
- Byron does no manual step for an ordinary purchase, renewal, or trial.
- The package, repository, and site pass the checks a procurement team runs before anyone reads the code.

## The experience or behavior you appear to want

A developer installs `exploreda` from npm and builds with it. A small notice says the copy is unlicensed for commercial use and links to pricing. Their manager opens exploreda.dev/pricing, sees what needs a license and what it costs, and pays by card for five developers. A minute later an email arrives with a license key and a link to a license certificate naming the company, seat count, scope, and update period. The developer passes the key to the workspace, the notice disappears, and the console names the licensee. CI runs a license check on every build. A year later the renewal arrives automatically; if they let it lapse, the versions they already have keep working.

A larger company asks for a quote, receives an invoice, pays by bank transfer, and gets the same email and certificate.

## Boundaries

### Must be true

- Enforcement is offline: no network call, telemetry, or license server contact from the component.
- Payment, sales tax, VAT, and invoices are handled by a merchant of record, not by Byron's own code.
- The license text, commercial terms, and certificate say the same thing about who may use what.
- Existing saved layouts and host integrations keep working; the license key is an added prop.
- Free use remains for evaluation, non-commercial work, and small teams, so the demo and docs stay usable.

### Must be avoided

- A blocking modal, broken chart, or disabled feature in a customer's production app because of a key problem.
- Card numbers, tax rules, or customer passwords stored by Byron's service.
- A private package registry or install token.
- Selling under terms no lawyer has reviewed.

## What seems settled

- Charge now rather than wait for adoption; close all gaps in one initiative.
- Per-developer commercial licenses with a separate redistribution (OEM) license, following the vendors in the research.
- Offline signed keys with a watermark and console notice, not online activation.
- A merchant of record; the research names Paddle and Polar, and Lemon Squeezy is ruled out during its Stripe migration.
- Public npm for the package.

## Possibilities, not decisions

- One package under a source-available license with a commercial key (Handsontable), rather than an MIT core plus a paid superset (AG Grid). The shape recommends the single package.
- Paddle over Polar, because Paddle also issues sales-assisted invoices for the quote and purchase-order path.
- A Cloudflare Worker with a small database as the license service.
- $499 per developer per year and $1,490 per product per year for redistribution, as provisional prices.

## Current reality that matters

- The repository, `package.json`, and npm record carry no license, so nobody may legally use the package today.
- npm has `0.1.0` from September 27; the "Version Packages" PR has been open since then, with about 150 changesets waiting.
- exploreda.dev is static on GitHub Pages; there is no server, account, email sender, or payment integration.
- The root entry registers all 20 chart types at import, and the package makes no network calls.
- The public repository holds internal audits, to-do files, transcripts, and Product Grid notes a buyer's engineer would read.
- 164 commits carry a placeholder author identity, which muddies the record of who owns the code.
- Living product docs at `/docs/<topic>` are in flight in open PRs; licensing pages should land there.

## What still needs your input

1. Confirm the single source-available package (Handsontable) over an MIT core with a paid superset (AG Grid). It decides what code moves and what the license says.
2. Choose the selling entity (you or an LLC) and a lawyer to review the license, commercial terms, and contributor agreement before launch.

## Next step after confirmation

Build milestone 1 of the [implementation plan](implementation-plan.md): the key format and the licensed and unlicensed states in the package, proven locally before any server or payment account exists. The [shape brief](shape-brief.md) lists the full scope.
