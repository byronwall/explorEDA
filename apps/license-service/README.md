# License service

Issues explorEDA license keys. It runs as a Cloudflare Worker with a D1
(SQLite) database, and the explorEDA package never contacts it: keys are
checked offline.

It does four jobs:

- **Fulfilment.** Payment webhooks become licenses, signed keys, and emails.
  Purchase, renewal, seat change, cancellation, and refund are handled; each
  provider event applies once.
- **Self-serve requests from the site.** 30-day trial keys and free
  community keys after email confirmation, quote requests forwarded to
  Byron, and sign-in links to a customer's license page.
- **Pages.** A printable license certificate per license (`/c/<token>`) and
  the customer's license page (`/portal/<token>`) with keys, certificates,
  and a link to Paddle's billing portal.
- **Admin.** `pnpm admin` lists licenses, reports renewals and failures,
  and issues, reissues, or revokes licenses.

Payments, tax, invoices, and refunds stay with the merchant of record
(Paddle). The service stores emails, names, license records, and keys only.

## Layout

| File                                    | What it holds                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/app.ts`                            | Routes.                                                                                |
| `src/licenses.ts`                       | Fulfilment: events to licenses, keys, and emails.                                      |
| `src/requests.ts`                       | Trial, community, quote, and portal-link requests.                                     |
| `src/payments/paddle.ts`                | The only Paddle code: signature check, event mapping, customer lookup, billing portal. |
| `src/payments/fake.ts`                  | A provider for local runs and tests.                                                   |
| `src/store.ts`                          | Every SQL query.                                                                       |
| `src/emails.ts`, `src/pages.ts`         | Email and page text.                                                                   |
| `migrations/`                           | D1 schema.                                                                             |
| `../../packages/explorEDA/src/license/` | The key format and signer, shared with the package.                                    |

To switch payment providers, write another `PaymentProvider` beside
`paddle.ts` and select it in `src/index.ts`. Nothing else changes.

## Run it locally

No account is needed.

```bash
cp apps/license-service/.dev.vars.example apps/license-service/.dev.vars
```

```bash
pnpm --filter license-service db:migrate:local
```

```bash
pnpm --filter license-service dev
```

In another terminal, replay a purchase. The email prints in the dev
server's log, with the key and certificate link:

```bash
pnpm --filter license-service replay fixtures/purchase.json
```

```bash
pnpm --filter license-service admin list
```

Keys from a local run are signed with the development key, so they only
count on localhost. Use one in the demo with `VITE_EXPLOREDA_LICENSE_KEY` in
`apps/demo/.env.development.local`.

## Tests

```bash
pnpm --filter license-service test
```

The tests run the real migrations on Node's built-in SQLite through a
D1-shaped wrapper, the fake provider, and an in-memory mailer. Paddle
payloads in `test/paddle.test.ts` follow Paddle's webhook reference; replace
them with recorded sandbox deliveries once the sandbox is connected.

## Deploying

The For Byron doc (`docs/intent/commercial-license/for-byron.md`) covers
accounts, secrets, and the first deploy. In short:

```bash
pnpm --filter license-service exec wrangler d1 migrations apply exploreda-licenses-staging --env staging --remote
```

```bash
pnpm --filter license-service deploy:staging
```

Secrets per environment, set with `wrangler secret put <NAME> --env <env>`:
`SIGNING_PRIVATE_KEY`, `ADMIN_TOKEN`, `PADDLE_WEBHOOK_SECRET`,
`PADDLE_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET`.
