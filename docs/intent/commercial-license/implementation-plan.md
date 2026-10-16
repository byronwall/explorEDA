---
title: "Sell explorEDA commercial licenses — implementation plan"
slug: "commercial-license"
phase: plan
status: current
last_updated: "2026-10-11"
---

# Sell explorEDA commercial licenses — implementation plan

## Plan at a glance

The work has one pure core, the license key codec, and three outside dependencies: a merchant of record (MoR), an email sender, and a hosted function. The plan builds the codec and the package's licensed states first, with a local dev keypair, because that is what the purchaser lives with every day and it needs no account. Everything after signs keys with the same codec.

The license service is then built and tested entirely locally, against a fake MoR and a fake mailer that can replay duplicate, out-of-order, and failed events. Only then does it meet the MoR's sandbox, through a deployed staging function and a static pricing page. Production keys, the live MoR account, and the npm release come last, behind one switch: the site shows "Buy" only when the live MoR settings are present.

Legal and repository work runs alongside the code because it waits on people (a lawyer, the MoR's account review), not on engineering. Its drafts start in milestone 2 so review time overlaps milestones 3 and 4.

The main pushback against the earlier research is the license model: one package under a source-available license instead of moving project mode, tracing, and advanced charts into a second package. That removes the largest code move from this initiative. The other is ordering: no payment account is opened until the key UX and the service pass locally, so account review never blocks engineering.

## Implementation strategy

- **First proof:** The demo, run locally, shows the four license states (none, valid, updates-ended, tampered) with keys signed by a dev keypair, and `exploreda license check` returns the matching exit codes.
- **Primary seam:** `packages/license` (new, private workspace package): `signLicense`, `verifyLicense`, `LicensePayload`, test vectors. The library bundles verify-only code; the service uses sign and verify. The service talks to the MoR through a `PaymentEvents` adapter that turns provider webhooks into `licensePurchased`, `seatsChanged`, `renewed`, `refunded`, and to email through a `Mailer` port.
- **Fast local loop:** `pnpm --filter @exploreda/license test` and `pnpm --filter license-service test`, then `pnpm --filter license-service dev` (Wrangler with a local database) with `pnpm --filter license-service replay <fixture>`.
- **Local dependencies:** Dev Ed25519 keypair checked in as a fixture and marked as such; Wrangler's local D1; fake MoR fixtures; a mailer that writes `.eml` files to `tmp/`.
- **Provider/live confirmation:** MoR sandbox checkout and invoice to a staging Worker; one real purchase with a 100% discount code in production.
- **Rollout and rollback:** The package treats any key failure as "unlicensed with a notice," so a bad release cannot break hosts. The site hides checkout unless live MoR settings are present. Signing keys carry a key id, and the package embeds a list of public keys, so a leaked key can be rotated in a patch release.

### Material dependency proof strategy

```text
codec + package states with dev keypair                    (M1)
    → service against fake MoR, fake mailer, local D1      (M3)
    → MoR sandbox + real mailer on a staging Worker        (M4)
    → live MoR, production keypair, one real purchase      (M6)
```

The MoR protocol (signature scheme, event order, retries, invoice events) is trusted only after the sandbox rung. The fake replays recorded sandbox payloads once they exist, so later changes run against real shapes locally.

## Milestone 1: Licensed and unlicensed states in the package

The purchaser's daily experience, proven with no server and no account.

- **Change — `packages/license` codec**
  - Payload: `v`, `kid`, `id`, `licensee`, `email`, `plan` (`commercial`, `oem`, `trial`, `community`), `seats`, `scope`, `issued`, `updatesUntil`, optional `expires`. Encoding `EDA1.<base64url JSON>.<base64url sig>`, Ed25519 via `@noble/ed25519` (small, audited, no Node crypto in the browser).
  - Test vectors: valid, tampered payload, wrong `kid`, trial expired, updates ended before and after a release date, malformed text.
- **Change — package enforcement in `packages/explorEDA`**
  - `src/license/`: `setLicenseKey()`, `useLicenseStatus()`, embedded public keys, and `RELEASE_DATE` injected by tsup `define` at build (source runs use today's date).
  - `licenseKey` prop on `ExplorEda` and `ExplorEdaProject`; one module-level status so several workspaces log once.
  - `LicenseNotice`: a small corner link inside the workspace, using `--border` and semantic tokens, with an `ActionTooltip` explaining it. It is excluded from Copy PNG and composition export only when licensed.
  - License section in `WorkspaceSettingsDrawer.tsx`: licensee, plan, seats, update end, and what to do next.
  - One console line per state; no network request anywhere (a test asserts `fetch` is never called).
- **Change — CLI**
  - Add `license check [--key | EXPLOREDA_LICENSE_KEY]` to `src/cli/exploredaDsl.ts` or a second bin, `exploreda`; it prints the status and exits 0 (licensed), 2 (unlicensed or updates ended for this version), or 3 (invalid).
- **Change — demo**
  - Demo reads a dev key from `VITE_EXPLOREDA_LICENSE_KEY`; the deployed site uses Byron's own key or the community plan.
  - Verify the four states in the browser at wide, intermediate, and narrow widths.

### Desired end state

- Four states render and log as described in the shape's behavior table.
- The CLI's exit codes match the package's view of the same key.
- Package tests and `check-types` pass; no network call is made.

## Milestone 2: Terms, ownership, and a repository a buyer can read

Starts now because lawyer and MoR review take calendar time.

- **Change — license text**
  - `LICENSE` at the repo root and in `packages/explorEDA`: source-available terms, free for evaluation, non-commercial use, and organizations under a revenue and headcount threshold; commercial use requires a key. Start from PolyForm Small Business or Handsontable's non-commercial license rather than writing from scratch. Add `"license": "SEE LICENSE IN LICENSE"` to `package.json`.
  - `docs/legal/` (published to the site): commercial license (seat definition, internal and SaaS use, OEM add-on, versions released during the term licensed forever, warranty and liability cap), terms of sale, refund policy, privacy policy.
  - Mark all drafts "pending legal review" in the initiative only, not in shipped text.
- **Change — ownership**
  - `.mailmap` mapping the `--worktree` identity to Byron; fix the worktree git config that produced it.
  - CLA via CLA Assistant before any outside PR; `CONTRIBUTING.md` says so.
  - Note for the lawyer: agent-assisted commits and any employer IP clause.
- **Change — buyer-facing repository**
  - Move `AUDIT.md`, `UI_UX_AUDIT.md`, and `TODO.md` into `docs/` or Product Grid; decide whether transcripts and `pgm/data` stay public.
  - `SECURITY.md` with a `security@exploreda.dev` address; support and stability policy (saved-data versioning, deprecation window, response times); Next.js note (`"use client"` and a client-only import).
  - PR CI running `pnpm check:ui`, `check-types`, and tests; update `deploy.yml` from pnpm 8 if the living-docs PRs have not.
  - Fix the root `package.json` name (`data-viz`).

### Desired end state

- A license scanner reports a license for the repo and package.
- Commercial terms, terms of sale, refund, and privacy drafts are with a lawyer.
- The public tree contains no internal audits or to-do files; PR CI runs.

## Milestone 3: License service, proven locally

Every fulfilment path works on a laptop against fakes.

- **Change — `apps/license-service`** (Cloudflare Worker, D1, Hono)
  - Tables: `customers` (email, company), `licenses` (id, plan, seats, scope, updatesUntil, status, MoR subscription id), `keys` (license id, kid, token, issued), `events` (provider event id, unique, for idempotency).
  - `POST /webhooks/mor`: verify signature, store event id, map through `PaymentEvents`, sign key, email. Duplicate ids return 200 without effect.
  - `POST /trial`: email verification link, then a 30-day trial key; one per email and domain per 90 days; Turnstile on the form.
  - `GET /c/:licenseId/:token`: printable certificate (licensee, plan, seats, scope, update end, order id, license version, issue date).
  - `GET /portal` by emailed magic link: licenses, keys, certificates, links to the MoR's billing portal and "add seats."
  - `scripts/admin.ts`: comp a license (indie, non-profit, Byron's site), reissue, revoke from records, export.
- **Change — fakes and fixtures**
  - `FakeMor` emits purchase, seat change, renewal, refund, duplicate, and out-of-order events; `FileMailer` writes emails to `tmp/mail/`.
  - Email templates: purchase, trial, renewal, seats changed, refund.

### Desired end state

- Replaying a purchase fixture produces one license, one key that the package accepts, one email, and a working certificate URL.
- Duplicate and out-of-order replays leave the same state.
- A renewal advances `updatesUntil` and issues a new key; a refund marks the license refunded and emails nothing that breaks the customer.

## Milestone 4: Buy in the sandbox

The first live dependency: the MoR sandbox, from a real page to a real key.

- **Change — MoR adapter**
  - Paddle Billing adapter (webhook signature, `transaction.completed`, `subscription.updated`, `subscription.canceled`, adjustments for refunds); record sandbox payloads as fixtures for `FakeMor`.
  - Products: Commercial (per developer, annual, quantity = seats), OEM add-on (per product), invoice-only Enterprise.
- **Change — site pages**
  - `/pricing`, `/license` (who needs a key, FAQ), `/legal/*`, `/security`, `/trial`. Emit them as static HTML at build so they return 200 rather than through the 404 SPA fallback, which matters for MoR review and search.
  - Paddle.js overlay with seat quantity, company name, and tax ID; "Request a quote" form to the service, which emails Byron and creates a draft invoice.
  - Coordinate with the living-docs work at `/docs/<topic>`: an "Installing your license key" page.
- **Change — staging**
  - Staging Worker and database, sandbox secrets, Resend (or Postmark) on a staging subdomain.

### Desired end state

- A sandbox card purchase on the deployed pricing page delivers an email with a key and certificate within a minute, and the demo accepts the key.
- A sandbox invoice, marked paid, produces the same result.
- Recorded sandbox payloads pass the local replay tests.

## Milestone 5: Seats, renewals, and the invoice path

The second-year experience, in the sandbox.

- **Change — lifecycle**
  - Seat increase mid-term reissues the key with the new count; seat decrease applies at renewal.
  - Renewal reminders 30 and 7 days before the end, through the MoR's own emails where possible.
  - Lapse leaves old keys valid for versions released before `updatesUntil`; the console names the last covered version.
- **Change — operator view**
  - `admin.ts report`: active licenses, renewals due, trials converted, failed webhooks.
  - Failed webhook deliveries alert Byron by email; the MoR's retries recover them.

### Desired end state

- In the sandbox: buy 3 seats, add 2, renew, lapse, and refund, each with the expected key, email, and certificate.
- Byron can answer "who is licensed and what is due" from one command.

## Milestone 6: Go live

Production accounts, production keys, and a release that includes them.

- **Change — accounts and secrets**
  - MoR live approval (domain, pricing, terms, refund, and privacy pages are live by M4); payout bank account and tax forms.
  - Production Ed25519 keypair generated offline; private key only in Worker secrets and an offline backup; public key and `kid` embedded in the package.
  - DNS for `exploreda.dev` email (SPF, DKIM, DMARC); `sales@`, `security@`, `support@` addresses.
- **Change — release**
  - Merge the waiting "Version Packages" PR or replace it with a release that includes licensing; the changeset says what users must now do and links `/license`. A `minor` changeset while the version is 0.x, unless Byron chooses 1.0 as the commercial launch.
  - Confirm npm version, `latest`, provenance, license field, and GitHub release.
- **Change — first purchase**
  - Byron buys one seat with a 100% discount code; verify key, certificate, portal, and the deployed demo.
  - Issue the site's own key or community license.

### Desired end state

- npm shows the release with a license; exploreda.dev/pricing sells live.
- One real order produced a key, email, certificate, and portal entry with no manual step.
- The deployed demo runs licensed.

## Cross-cutting verification

- The same test vectors run in `packages/license`, the package, and the service, so a signer and verifier can never disagree.
- A bundle check fails if the private key or `signLicense` reaches `dist/`.

## Open decisions and spikes

- **Spike — MoR choice.** Decision: Paddle or Polar. Evidence: account approval for a solo seller of a source-available library, a sandbox invoice paid by bank transfer, and whether the invoice accepts a purchase order number. Fallback: Polar for card sales with Paddle or manual invoicing for quotes; the `PaymentEvents` adapter keeps either swap local.
- **Decision — license model.** Single source-available package (this plan) or MIT core plus paid package. Evidence: Byron's call. Fallback: if open core is chosen, insert a milestone after M1 that moves the paid chart families and project mode into `exploreda-pro`; M3–M6 are unchanged.
- **Decision — selling entity and lawyer.** Needed before M6; does not block M1–M5.

## Below the cut line

- VPAT and accessibility conformance report.
- Published performance envelope at 100k and 500k rows.
- Domain-locked keys, usage audits, or any online validation.
- Reseller and marketplace listings (ComponentSource, AWS Marketplace).
- Multi-year, education, and volume pricing beyond a discount code.
- SOC 2 or a security questionnaire library beyond the security page.
- i18n of the license notice.
