---
title: "Dedicated customer-instance hosting"
slug: "customer-instance-hosting"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Dedicated customer-instance hosting

## My read

You want each paying customer to use an independently operated explorEDA instance. Your main goals are low maintenance and a high level of automation. The hosting question is part of database-backed analysis: each customer runtime must reach that customer's data and keep its work separate. The current React package and demo do not provide this hosted backend.

I interpret “dedicated instance” as one independently deployable customer service with its own fixed customer identity, runtime credentials, and application state. The service may sleep and restart. The same release image can serve every customer. This proposed meaning does not promise a dedicated physical machine, separate cloud account, exclusive CPU, or automatic regional recovery. Confirm the isolation promise before publishing it to customers.

The first useful proof is local. Run the same image as two synthetic customer instances. Give each a fixed identity, separate secrets, separate state, and its own synthetic database access. Show that each can complete the same bounded analysis path and cannot read the other's resources. This can reject the design before any provider bill or live customer data is involved.

## What matters most

- Give each paying customer a separate application runtime and resource authority.
- Keep one shared release image and automate ordinary create, update, suspend, restore, and removal steps.
- Keep the application path small enough for one operator to understand and maintain.

## The experience or behavior you appear to want

An operator can create and verify a customer instance from a known release and customer configuration. The customer signs in and explores permitted database data. Saves and credentials stay with that customer. A restart or update does not lose acknowledged application state. The operator can roll back, suspend, resume, restore, or remove one customer's app resources without changing another or touching the customer's database.

## Boundaries

### Must be true

- Each instance has a fixed customer identity, separate credentials, and separate application state.
- A shared image can be deployed for every customer.
- The 10,000–100,000-row range guides a bounded proof. It is not a hard product limit or a hosting capacity claim.

### Must be avoided

- Do not describe a logical service as a dedicated physical host or customer cloud account.
- Do not let one customer runtime select another customer's credentials or state.
- Do not turn row counts, provider prices, or proposed latency targets into measured guarantees.

## What seems settled

- The user asked to compare serverless, Cloudflare, VPS, and other hosting approaches.
- The durable goal is one dedicated instance per paying customer, with minimal maintenance and high automation.
- Hosting and implementation are separate. Research does not authorize cloud accounts, paid resources, deployment, or live customer data access.
- Complete source snapshots into current row-based tables are the first data-path baseline. Server pushdown requires later semantic parity proof.

## Possibilities, not decisions

- Cloud Run is the research front-runner. Render is a qualified always-on option, and Cloudflare Containers is a challenger.
- A container, managed service, VM, or isolate has a different isolation and operator boundary.
- Per-customer state might use object storage. Exact storage, retention, identity, database engines, and network paths remain open.
- Streaming, binary transport, or a server cache may help later. None is required for a bounded response by default. Existing client memory costs remain.

## Current reality that matters

The repository is a React/TypeScript library and demo. It has no customer provisioner or hosted database API. Query, database-adapter, and transport contracts are being shaped in companion initiatives. The hosting research has not tested a live database, provider account, or hosted deployment.

## Next step after confirmation

Shape a local two-customer proof with one image and separate identities, secrets, and state. After it passes, define a small desired-state manifest and idempotent operator script. Use one provider only if a required hosted property can change the hosting choice.
