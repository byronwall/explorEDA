---
title: "Sell explorEDA commercial licenses — shape brief"
slug: "commercial-license"
phase: shape
status: current
last_updated: "2026-10-11"
---

# Sell explorEDA commercial licenses — what we are adding

**Outcome:** A company can buy, install, and prove an explorEDA commercial license without contacting Byron, and Byron is paid with no manual step.

**Primary flow:** Install from npm → see the unlicensed notice → pricing page → card checkout or invoice → email with key and certificate → `licenseKey` in code → licensed in the app, console, and CI.

## Feature scope

```text
Commercial licensing
├── PLANNED ADDITIONS
│   ├── License terms
│   │   ├── LICENSE: free for evaluation, non-commercial, and small teams; commercial use needs a key
│   │   ├── Commercial terms: developer seats, internal and SaaS use, OEM add-on, perpetual use of versions released in the term
│   │   ├── Terms of sale, refund, and privacy pages the payment provider requires
│   │   └── Contributor agreement; clean author records
│   ├── License key in the package
│   │   ├── Signed offline key naming licensee, plan, seats, scope, and update end date
│   │   ├── `licenseKey` prop on ExplorEda and ExplorEdaProject, plus setLicenseKey()
│   │   ├── Unlicensed or expired: corner notice and one console message; everything works
│   │   ├── Licensed: one console line naming the licensee
│   │   ├── License status in workspace settings
│   │   └── `exploreda license check` for CI, with exit codes
│   ├── Buying
│   │   ├── /pricing: plans, "do I need a license?" questions, FAQ, terms
│   │   ├── Card checkout overlay: seats, company name, tax ID
│   │   ├── Quote request → invoice → bank transfer, same fulfilment
│   │   └── 30-day trial key by verified email
│   ├── License service
│   │   ├── Payment webhook → signed key → stored record → email
│   │   ├── Certificate page per license, printable
│   │   ├── Customer page by emailed link: keys, certificates, add seats
│   │   ├── Renewal reissues the key; lapse keeps old versions licensed
│   │   └── Admin command: comp, reissue, revoke from records
│   └── Buyer trust
│       ├── Current npm release with license field and provenance
│       ├── SECURITY.md, support and stability policy, security page
│       ├── PR CI; internal notes moved out of the public tree
│       └── Next.js and browser-support notes
├── EVALUATE BEFORE COMMITTING
│   └── Paddle versus Polar as merchant of record, after account approval and an invoice trial
└── LATER POSSIBILITIES
    ├── VPAT and accessibility conformance report
    ├── Published row-count performance envelope
    └── Volume, education, and multi-year discounts
```

## Behavior

| Situation                                       | Expected result                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| No key, any host                                | Works fully; small "Unlicensed" corner link; one console message.      |
| Valid key                                       | No notice; console names licensee, seats, update end date.             |
| Update period ended, version released before it | Licensed. Customers keep what they paid for.                           |
| Update period ended, newer version installed    | Works with notice; console says renew or pin the older version.        |
| Trial key past expiry                           | Notice returns; nothing else changes.                                  |
| Malformed or tampered key                       | Treated as no key; console says why.                                   |
| Payment provider sends the same event twice     | One license; second delivery acknowledged.                             |
| Seats added mid-term                            | New key with the higher seat count; old key stays valid until renewal. |

## Examples

Provisional key shape: `EDA1.<base64url JSON>.<Ed25519 signature>`, where the JSON holds `id`, `licensee`, `plan`, `seats`, `scope`, `issued`, `updatesUntil`, optional `expires` for trials, and the signing key id. Prices default to $499 per developer per year and $1,490 per redistributed product per year, set in one config file.

## Decisions and boundaries

**Appetite:** One initiative that ends with a live, paid purchase. Engineering is a key module, a small serverless service, and static pages; legal text and account approvals take calendar time, not code.

**Key decision:** One package under a source-available license, as Handsontable does, instead of the research's MIT core with a paid superset. Moving project mode, tracing, and advanced charts into a second package is the most expensive part of the open-core route, and a key check in MIT code is legally meaningless. Starting restrictive is also the reversible direction: a core can be relicensed to MIT later without backlash, while closing an MIT core is what caused Handsontable's. A watermark, not a feature gate, keeps evaluation frictionless.

**Key decision:** Keys are signed offline so the component never calls home, the purchaser's security review stays simple, and the service is needed only to issue keys. If it is down, customers are unaffected.

**Boundary:** The merchant of record owns checkout, tax, invoices, refunds, and the billing portal. The service stores emails, license records, and order IDs only. The site stays static; the checkout overlay runs in the browser.

**First proof:** **Try:** Sign keys with a local dev keypair and render the demo with no key, a valid key, an expired-updates key, and a tampered key. **Observe:** Each state shows the expected notice, console line, settings status, and CLI exit code, with no network request. **Decide:** If the four states read clearly at wide and narrow widths, build the service against the same codec; if the notice is intrusive or ambiguous, fix the UI before any payment work.

**Open choices:** Confirm the single-package license model. Name the selling entity and lawyer.

Intent: [intent brief](intent-brief.md). Plan: [implementation plan](implementation-plan.md).
