# For Byron: accounts, decisions, and go-live

The code for selling explorEDA licenses is built in PRs 1–4. What remains needs a person: legal decisions, account sign-ups, secrets, and a few real purchases. This document is written so you, or an agent working for you (such as ChatGPT's desktop agent), can do each step without the earlier conversation.

**Rules for whoever runs these steps**

- Never commit a secret. Secrets go into `wrangler secret put`, GitHub repository _secrets_, or a password manager. Values marked **public** may go into the repository or GitHub repository _variables_.
- Never put the production signing private key in the repository, in chat, or in a shared document. It lives in one file outside the repository, in the Worker's secrets, and in one offline backup.
- Do not merge the "Version Packages" pull request until step 9. Merging it publishes to npm.
- Do the sandbox steps (1–7) before anything live.
- When a step produces a **public** value, record it in the table at the end of this document and send that table back to Claude. Claude commits it.

## How the pieces fit

| Piece                     | Where                                           | What it does                                                                                                            |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `exploreda` package       | npm                                             | Checks the license key offline and shows a notice without one. Changed in PR 1.                                         |
| License text and terms    | `LICENSE`, `docs/legal/`                        | The free-use terms, the commercial agreement, terms of sale, refunds, privacy. Drafts in PR 2.                          |
| License service           | Cloudflare Worker + D1 (`apps/license-service`) | Turns Paddle payments into keys, certificates, and emails. Handles trials, quotes, and the customer license page. PR 3. |
| Pricing and license pages | exploreda.dev (GitHub Pages)                    | `/pricing`, `/license`, `/legal/*`, `/security`, `/support`, plus Paddle checkout. PR 4.                                |
| Paddle                    | paddle.com                                      | Merchant of record. Takes payment, charges sales tax and VAT, issues invoices and refunds, and runs the billing portal. |
| Resend                    | resend.com                                      | Sends license emails from `licenses@exploreda.dev`.                                                                     |
| Cloudflare                | cloudflare.com                                  | Hosts the Worker and database, Turnstile (bot check on forms), and DNS and email forwarding for exploreda.dev.          |

**Why Paddle.** It is a merchant of record, so it handles tax worldwide. It also handles card checkout and quote-based invoices paid by bank transfer, which enterprise buyers need. All Paddle code is in one file, `apps/license-service/src/payments/paddle.ts`, plus the checkout loader `apps/demo/src/commerce/paddle.ts`. Moving to Polar or Stripe Managed Payments later means rewriting those two files. Keys, certificates, and customer records stay as they are.

## Order of work

1. Make the business decisions and fill in the placeholders.
2. Send the legal drafts to a lawyer. Review takes calendar time, so start now.
3. Move exploreda.dev DNS to Cloudflare, and set up email addresses.
4. Set up the Cloudflare Worker, database, and Turnstile (staging).
5. Set up Resend.
6. Set up the Paddle **sandbox**.
7. Run the sandbox purchase tests and send Claude the recorded webhooks.
8. Generate the production signing key.
9. Go live: Paddle live account, production Worker, merge, release.
10. Make the first real purchase.

Steps 1–2 can run in parallel with 3–7.

## 1. Decisions and placeholders

Decide these, then replace the placeholders. Search the repository for `{{` to find every one.

| Decision                                   | Default in the drafts                                 | Where it appears                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Who sells: you personally, or an LLC       | `{{SELLER_LEGAL_NAME}}`                               | `LICENSE`, `packages/explorEDA/LICENSE` (must match the root copy; a test checks this), `docs/legal/*.md`, `CONTRIBUTING.md` |
| Seller mailing address                     | `{{SELLER_ADDRESS}}`                                  | `docs/legal/terms-of-sale.md`, `docs/legal/privacy-policy.md`                                                                |
| Governing law and courts                   | `{{GOVERNING_LAW}}`, `{{VENUE}}`                      | `docs/legal/commercial-license.md` §12                                                                                       |
| Email provider name                        | `{{EMAIL_PROVIDER}}` → "Resend"                       | `docs/legal/privacy-policy.md`                                                                                               |
| Price per developer per year               | $499                                                  | `apps/demo/src/commerce/config.ts`, the Paddle catalog (step 6)                                                              |
| Redistribution add-on per product per year | $1,490                                                | Same two places                                                                                                              |
| Free-use threshold                         | Under US$1M revenue and funding, fewer than 10 people | `LICENSE` §1c, `/pricing`, `/license`, `LicenseQuiz.tsx`, `.changeset/the-package-now-ships-with-the-exploreda-license.md`   |
| Evaluation period                          | 90 days                                               | `LICENSE` §1a                                                                                                                |
| Refund window                              | 30 days                                               | `docs/legal/refund-policy.md`, `/pricing`                                                                                    |
| Renewal price cap                          | 7% a year                                             | `docs/legal/commercial-license.md` §6                                                                                        |
| Support response                           | 2 business days, 1 for enterprise                     | `SUPPORT.md`, `/pricing`                                                                                                     |
| Quote threshold                            | 10 developers                                         | `apps/demo/src/commerce/config.ts` (`QUOTE_SEATS`)                                                                           |

If you sell through an LLC, form it and open a business bank account before step 9. Paddle pays out to the account named in your Paddle profile. An accountant should confirm how Paddle payouts are reported. Paddle is the reseller, so you receive payouts, not customer revenue.

Also decide whether `docs/transcripts/` and `pgm/data/` stay in the public repository. Buyers' engineers read the repository. Moving them to a private repository doesn't block launch.

## 2. Lawyer review

Send a lawyer these files from PR 2. The site renders them exactly as written.

- `LICENSE`: source-available free-use terms
- `docs/legal/commercial-license.md`: the agreement buyers accept
- `docs/legal/terms-of-sale.md`, `docs/legal/refund-policy.md`, `docs/legal/privacy-policy.md`
- `CONTRIBUTING.md`: the contributor license agreement

Questions to ask:

1. Is the free-use test in `LICENSE` §1 (evaluation, non-commercial, small organization) clear and enforceable? It was drafted from PolyForm Small Business and Handsontable's non-commercial license.
2. Does the commercial agreement work with Paddle as reseller? Paddle requires its buyer terms to apply to the sale.
3. Can a license grant cover code partly written with AI assistants? Many commits are co-authored by Claude or made by agents under your account.
4. Did any employer have an IP-assignment claim on work done on explorEDA? If none, relicensing is yours alone.
5. Is the CLA text enough to let you relicense outside contributions? There are none yet.
6. Should explorEDA be trademarked? Nobody has searched for conflicts with the name.

When the text is final, remove each `<!-- DRAFT … -->` comment line from `docs/legal/*.md`.

## 3. Domain, DNS, and email addresses

exploreda.dev is served by GitHub Pages. Putting its DNS on Cloudflare (free) gives you email forwarding, a custom domain for the license service, and Turnstile in one place.

1. Create a Cloudflare account at dash.cloudflare.com and add the site `exploreda.dev` on the Free plan.
2. Cloudflare scans the existing records. Confirm that the GitHub Pages records came across, normally `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`, or a `CNAME` to `byronwall.github.io`. Set them to **DNS only** (grey cloud) so GitHub keeps issuing the HTTPS certificate.
3. At the registrar where exploreda.dev was bought, change the nameservers to the two Cloudflare gives you. Wait until Cloudflare shows the site as Active.
4. Check that https://exploreda.dev still loads.
5. Cloudflare → exploreda.dev → Email → Email Routing → enable. Add forwarding rules to your inbox for `sales@`, `support@`, `security@`, `privacy@`, and `licenses@` (the sender address; replies to license emails land here).

Record: nothing secret. Note in the table that DNS is on Cloudflare.

## 4. Cloudflare Worker, database, and Turnstile (staging)

On your machine, in the repository (with the stack checked out, or after it merges):

```bash
pnpm install
```

```bash
pnpm --filter license-service exec wrangler login
```

Create the two databases and note each `database_id` printed (**public**):

```bash
pnpm --filter license-service exec wrangler d1 create exploreda-licenses-staging
```

```bash
pnpm --filter license-service exec wrangler d1 create exploreda-licenses
```

Put the IDs into `apps/license-service/wrangler.toml` in place of `{{STAGING_DATABASE_ID}}` and `{{PRODUCTION_DATABASE_ID}}`, or send them to Claude. Then apply the schema to staging:

```bash
pnpm --filter license-service exec wrangler d1 migrations apply exploreda-licenses-staging --env staging --remote
```

**Turnstile.** Cloudflare dashboard → Turnstile → Add widget. Name it "exploreda.dev forms", add the hostnames `exploreda.dev` and `localhost`, and choose Managed mode. You get:

- a **site key** (public) for the GitHub variable `TURNSTILE_SITE_KEY`
- a **secret key** (secret) for the Worker

**Admin token.** Generate one with `openssl rand -base64 32`. Keep it in your password manager; `pnpm admin` uses it.

Set staging secrets. Each command prompts for the value:

```bash
pnpm --filter license-service exec wrangler secret put ADMIN_TOKEN --env staging
```

```bash
pnpm --filter license-service exec wrangler secret put TURNSTILE_SECRET --env staging
```

```bash
pnpm --filter license-service exec wrangler secret put SIGNING_PRIVATE_KEY --env staging
```

For the staging signing key, use the development key: `OQUkqhgAWUY6KYM6jaUiV2yk2SvsO2iARwJN7NiowEo`, which is public on purpose and in `apps/license-service/dev-keys.json`. Keys it signs only work on localhost, so staging can't produce keys that unlock real sites.

Paddle and Resend secrets come in steps 5 and 6. Deploy staging after those:

```bash
pnpm --filter license-service deploy:staging
```

Wrangler prints the URL, such as `https://exploreda-license-staging.<your-subdomain>.workers.dev` (**public**). To use `license-staging.exploreda.dev` instead, uncomment the `routes` line under `[env.staging]` in `wrangler.toml` and deploy again; this needs step 3. Then open `<staging URL>/health`. It should show `{"ok":true}`.

## 5. Resend (email)

1. Create an account at resend.com.
2. Domains → Add domain → `exploreda.dev`. Resend lists DNS records (SPF `TXT`, DKIM `TXT`/`CNAME`, and an `MX` for bounces on a `send` subdomain). Add each in Cloudflare DNS exactly as shown, DNS only. Wait for Resend to show Verified.
3. Add a DMARC record in Cloudflare: `TXT` at `_dmarc` with `v=DMARC1; p=none; rua=mailto:postmaster@exploreda.dev`. Add a forwarding rule for `postmaster@`.
4. API Keys → Create → "license-service", permission "Sending access", domain exploreda.dev. This is a **secret**:

```bash
pnpm --filter license-service exec wrangler secret put RESEND_API_KEY --env staging
```

Staging sends from `licenses@staging.exploreda.dev` (see `MAIL_FROM` in `wrangler.toml`). Either verify `staging.exploreda.dev` as a second Resend domain, or change staging's `MAIL_FROM` to `licenses@exploreda.dev`.

## 6. Paddle sandbox

Sandbox is a separate account at sandbox-login.paddle.com. No approval is needed, and it uses test cards.

1. **Sign up** at https://sandbox-login.paddle.com/signup.
2. **Products.** Paddle → Catalog → Products → New product.
   - "explorEDA Commercial License", tax category Standard digital goods. Add a price: $499.00 USD, recurring every 1 year, quantity min 1, max 100. Its ID starts `pri_…` (**public**) and goes into `PADDLE_PRICE_COMMERCIAL`.
   - "explorEDA Redistribution add-on", same tax category. Price $1,490.00 USD, every 1 year, quantity min 1, max 10. Its ID goes into `PADDLE_PRICE_OEM`.
   - If you changed prices in step 1, use your prices here and in `apps/demo/src/commerce/config.ts`.
3. **Checkout settings.** Paddle → Checkout → Checkout settings → Default payment link: `http://localhost:5291/pricing` (sandbox allows localhost). Under the same settings, allow customers to enter a business name and tax number if the option is shown.
4. **Client-side token.** Paddle → Developer tools → Authentication → Client-side tokens → New, named "exploreda.dev". It starts `test_…` and is **public** (`PADDLE_CLIENT_TOKEN`).
5. **API key.** Developer tools → Authentication → API keys → New, named "license-service", with these permissions only:

   - `customer.read`
   - `business.read`
   - `customer_portal_session.write`

   This is a **secret**:

   ```bash
   pnpm --filter license-service exec wrangler secret put PADDLE_API_KEY --env staging
   ```

6. **Webhook.** Developer tools → Notifications → New destination.

   - Type URL. Address: `<staging URL>/webhooks/payments`.
   - Events: `transaction.completed`, `subscription.updated`, `subscription.canceled`, `adjustment.created`, `adjustment.updated`.
   - Save, then open the destination and copy its secret key (**secret**):

   ```bash
   pnpm --filter license-service exec wrangler secret put PADDLE_WEBHOOK_SECRET --env staging
   ```

7. Put the two sandbox price IDs into `apps/license-service/wrangler.toml` under `[env.staging.vars]` (`{{SANDBOX_PRICE_COMMERCIAL}}`, `{{SANDBOX_PRICE_OEM}}`), or send them to Claude. Then deploy staging (step 4's command).

## 7. Sandbox purchase tests

Run the site locally against staging. Create `apps/demo/.env.development.local`:

```bash
VITE_LICENSE_SERVICE_URL=<staging URL>
VITE_PADDLE_ENV=sandbox
VITE_PADDLE_CLIENT_TOKEN=<test_… token>
VITE_PADDLE_PRICE_COMMERCIAL=<pri_… commercial>
VITE_PADDLE_PRICE_OEM=<pri_… oem>
VITE_TURNSTILE_SITE_KEY=<site key>
```

The staging Worker only accepts browser requests from `SITE_URL`. For local testing, temporarily set `SITE_URL = "http://localhost:5291"` under `[env.staging.vars]` and deploy staging, then set it back afterward.

```bash
pnpm --filter demo dev --port 5291 --strictPort
```

Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any name. Work through each test and note what happened:

| #   | Do this                                                                          | Expect                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/pricing` → 3 developers → Buy now → pay with a business name and tax ID        | Overlay opens; after paying, you land on `/license?purchased=1#install`. Within a minute, an email "Your explorEDA license key" arrives with the key, certificate link, and license page link.                                              |
| 2   | Open the certificate link                                                        | Page shows your business name, "3 developers", update date a year out.                                                                                                                                                                      |
| 3   | Paste the key at `/license#check`                                                | "Licensed to …" (on localhost; staging keys are development keys).                                                                                                                                                                          |
| 4   | Put the key in `VITE_EXPLOREDA_LICENSE_KEY`, restart, open `/viewer`             | No "Unlicensed" notice; workspace settings → License shows your business.                                                                                                                                                                   |
| 5   | `/license#manage` → your email                                                   | Email with a link; the page lists the license and key and links to Paddle's billing portal.                                                                                                                                                 |
| 6   | Paddle → Subscriptions → this subscription → change quantity to 5                | Email "Your updated explorEDA license key" with 5 developers.                                                                                                                                                                               |
| 7   | Paddle → the transaction → Refund (full)                                         | Email "Your explorEDA refund"; certificate shows Refunded.                                                                                                                                                                                  |
| 8   | Buy again; then in Paddle cancel the subscription                                | Email "won't renew"; certificate says covered versions stay licensed.                                                                                                                                                                       |
| 9   | Invoice path: `/pricing#quote`, request a quote for 12 developers                | You get a quote email at `NOTIFY_EMAIL` (sales@); the buyer gets an acknowledgement. Then in Paddle create a manually collected invoice for that customer with 12 × commercial, issue it, and pay it in sandbox. The license email arrives. |
| 10  | `/license#trial`                                                                 | Confirmation email → link → certificate page → trial key email. A second request with the same email is refused.                                                                                                                            |
| 11  | `pnpm admin report` with `LICENSE_SERVICE_URL=<staging URL>` and `ADMIN_TOKEN=…` | Counts match what you did; `failedEvents` is 0.                                                                                                                                                                                             |

**Record the webhooks.** Paddle → Developer tools → Notifications → the destination → Logs. For one of each event type (`transaction.completed` from checkout, from an invoice, and from a renewal if you can simulate one; `subscription.updated`; `subscription.canceled`; `adjustment.updated`), copy the request body JSON. Save them as `apps/license-service/test/fixtures/paddle/<event>.json` with emails replaced by `buyer@example.test`, or send them to Claude. Claude will replace the hand-written payloads in `test/paddle.test.ts` with these, which proves the adapter against Paddle's real shapes.

If anything in the table didn't happen, run `pnpm admin failures` and send Claude the output plus the Paddle log entry.

## 8. Production signing key

Do this on your own machine, once:

```bash
pnpm --filter license-service keygen prod-2026 ~/Secure/exploreda-signing-prod-2026.json
```

It does three things:

- writes the private key to that file (mode 600). **Back the file up offline**, for example in a password manager attachment.
- adds the public key to `packages/explorEDA/src/license/publicKeys.ts`. Commit that change; the public key is meant to be public.
- prints the command to load the private key into the production Worker. Run it once the production Worker exists (step 9).

Set `SIGNING_KEY_ID = "prod-2026"` under `[env.production.vars]` in `wrangler.toml`.

The site needs its own key so exploreda.dev shows no notice. After step 9's production deploy:

```bash
LICENSE_SERVICE_URL=<production URL> ADMIN_TOKEN=<production admin token> pnpm --filter license-service admin issue --email you@exploreda.dev --licensee "exploreda.dev" --plan community --until 2099-12-31 --no-email
```

Put the printed key into the GitHub repository variable `EXPLOREDA_SITE_LICENSE_KEY`.

## 9. Go live

**Paddle live account.**

1. Sign up at https://login.paddle.com/signup with the selling entity's details. Paddle asks for identity verification, business details, and payout bank details.
2. Paddle → Checkout → Website approval → add `exploreda.dev`. Paddle reviews the live site: it needs a description of what you sell, pricing, terms, refund policy, privacy policy, and contact details. Those pages ship with PR 4, so merge the stack (below) and deploy the site first. Approval usually takes a few days.
3. Repeat step 6 in the live account: products and prices (new `pri_…` IDs), default payment link `https://exploreda.dev/pricing`, a client-side token (starts `live_…`), an API key with the same three permissions, and a notification destination pointing at the production Worker `/webhooks/payments` with the same five events.

**Production Worker.**

```bash
pnpm --filter license-service exec wrangler d1 migrations apply exploreda-licenses --env production --remote
```

Set the production secrets: `ADMIN_TOKEN` (a new one), `TURNSTILE_SECRET`, `SIGNING_PRIVATE_KEY` (from step 8), `PADDLE_API_KEY` (live), `PADDLE_WEBHOOK_SECRET` (live), and `RESEND_API_KEY`:

```bash
pnpm --filter license-service exec wrangler secret put <NAME> --env production
```

Put the live price IDs into `[env.production.vars]`, then deploy:

```bash
pnpm --filter license-service deploy:production
```

To serve it at `license.exploreda.dev`, uncomment the production `routes` line first. Check `/health`.

**GitHub repository variables.** Repository → Settings → Secrets and variables → Actions → Variables. These are all public values:

| Variable                     | Value                                    |
| ---------------------------- | ---------------------------------------- |
| `EXPLOREDA_SITE_LICENSE_KEY` | The site key from step 8                 |
| `LICENSE_SERVICE_URL`        | Production Worker URL, no trailing slash |
| `PADDLE_ENV`                 | `production`                             |
| `PADDLE_CLIENT_TOKEN`        | `live_…` token                           |
| `PADDLE_PRICE_COMMERCIAL`    | Live commercial price ID                 |
| `PADDLE_PRICE_OEM`           | Live redistribution price ID             |
| `TURNSTILE_SITE_KEY`         | Turnstile site key                       |

Until `PADDLE_CLIENT_TOKEN` and `PADDLE_PRICE_COMMERCIAL` are set, the pricing page offers invoices instead of checkout, so it's safe to deploy before Paddle approves the domain.

**CLA Assistant.** Go to https://cla-assistant.io, sign in with GitHub, and link `byronwall/explorEDA`. Put the "Contributor license agreement" section of `CONTRIBUTING.md` in a public GitHub gist and choose it as the agreement.

**Merge and release.**

1. Merge the stack from the bottom: #220, then #311, #312, #313, #315, and the handoff PR. GitHub retargets each to `main` as the one below merges, if "Automatically delete head branches" is on in the repository settings. Otherwise, change each PR's base to `main` before merging it.
2. Each merge to `main` deploys exploreda.dev. Set `EXPLOREDA_SITE_LICENSE_KEY` before the first merge so the site shows no notice.
3. The Release workflow updates the open "Version Packages" PR. Check it includes the production public key (step 8's commit). Merge it to publish to npm.
4. Confirm the npm version and `latest` tag (`npm view exploreda version dist-tags license`), provenance on the npm page, and the GitHub release. The license field should read `SEE LICENSE IN LICENSE`.
5. Run `npx exploreda@latest license check --key <your site key>`. It should exit 0.

## 10. First real purchase

1. Paddle (live) → Catalog → Discounts → create a 100% discount code, single use.
2. Buy one seat at https://exploreda.dev/pricing with the code.
3. Confirm the email, certificate page, license page, and billing portal link, and that `npx exploreda license check --key <that key>` exits 0.
4. Refund it in Paddle and confirm the refund email.
5. Tell Claude the outcome. It marks milestone 6 complete in the initiative map.

## Running it day to day

- **Weekly:** `pnpm --filter license-service admin report` with the production URL and token. It shows active licenses, seats, trials, renewals due in 45 days, and failed webhook events. Failures also email `sales@`.
- **Quote requests** arrive at `sales@` with the buyer as reply-to. Reply with a price. To invoice, create a manually collected transaction in Paddle for the customer, with the commercial price × seats (and the add-on if needed), then issue it. When it's paid, the license is issued automatically.
- **More seats:** in Paddle, update the subscription quantity. The customer gets a new key automatically.
- **Free licenses** (non-profits, friends, the site itself): `pnpm admin issue --email … --licensee … --plan community --until YYYY-MM-DD`. Use `--plan commercial --seats N` for a paid deal outside Paddle.
- **Lost key:** `pnpm admin reissue lic_…` emails the current key again. The customer can also use `/license#manage`.
- **Refunds** happen in Paddle. The service marks the license refunded and emails the customer. Keys are checked offline and can't be switched off remotely. The EULA, not the key, governs a refunded customer.
- **If the Worker is down:** customers' apps are unaffected. Paddle retries webhooks for days, and they apply once the Worker is back.
- **If a signing key leaks:** run `keygen` with a new ID (`prod-2027`), deploy the Worker with the new key, and reissue keys (`admin reissue` for each license). Remove the old public key in a release only if the leak is being abused.
- **Price change:** change the price in Paddle, `apps/demo/src/commerce/config.ts`, and the decisions table in step 1. Existing subscriptions keep their price unless you migrate them; the terms cap increases at 7% a year.

## Values to send back to Claude

Fill this in as you go and paste it into a message to Claude. Everything here is public. Never include secrets.

| Value                                                               | Step | Filled in |
| ------------------------------------------------------------------- | ---- | --------- |
| Seller legal name, address, governing law, venue                    | 1    |           |
| Final prices and free-use threshold, if changed                     | 1    |           |
| DNS moved to Cloudflare (yes/no)                                    | 3    |           |
| Staging D1 `database_id`                                            | 4    |           |
| Production D1 `database_id`                                         | 4    |           |
| Staging Worker URL                                                  | 4    |           |
| Production Worker URL                                               | 9    |           |
| Sandbox price IDs (commercial, OEM)                                 | 6    |           |
| Live price IDs (commercial, OEM)                                    | 9    |           |
| Sandbox test results (table in step 7)                              | 7    |           |
| Recorded Paddle webhook files                                       | 7    |           |
| Production key ID (e.g. `prod-2026`) and the `publicKeys.ts` commit | 8    |           |
| First purchase result                                               | 10   |           |
