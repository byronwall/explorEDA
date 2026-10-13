---
title: "Dedicated customer-instance hosting — shape brief"
slug: "customer-instance-hosting"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Dedicated customer-instance hosting — what we are adding

**Outcome:** Each paying customer gets a separately identified runtime with separate credentials and application state. One release image serves every customer.

**Primary flow:** Create two synthetic customer instances locally → run the same bounded source snapshot path → verify identity and resource separation → restart either instance and verify its saved state.

## Feature scope

```text
Customer instances
├── PLANNED ADDITIONS
│   ├── One separately identified runtime per customer
│   │   ├── Same release image, fixed customer identity
│   │   └── Separate credentials and application state
│   └── Operator lifecycle automation, after the local boundary proof
│       ├── Small desired-state manifest and idempotent script
│       ├── Create and verify; update and roll back
│       ├── Suspend and resume; restore and remove
│       └── Delete only owned app resources; leave the customer database untouched
├── FIRST PROOF
│   ├── Two local instances from one image
│   │   ├── Separate secrets, state, and synthetic database access
│   │   └── Complete bounded source snapshot into existing row tables
│   └── Show cross-customer denial and one-instance restart recovery
├── EVALUATE BEFORE COMMITTING
│   ├── Cloud Run service per customer as the current front-runner
│   ├── Render service per customer if always-on operation changes the decision
│   └── Cloudflare Containers if network, rollout, and measured cost can change it
└── LATER POSSIBILITIES
    ├── Customer-specific network profiles when a real database requires them
    └── A warmer or stronger account boundary when a customer need justifies its cost
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Customer A presents a valid request to A's instance | The fixed A identity selects only A's configured database credential and state. |
| A request names customer B, B's secret, or B's state | Reject it. The runtime cannot look up fleet-wide credentials. |
| One local instance stops or restarts | The other instance remains available. Each resumes only its own saved state. |
| A source result fits the current bounded snapshot path | Return all declared source rows and fields into the existing row-based tables. Do not require server pushdown, binary encoding, or streaming for this case. |
| A result exceeds a proved bound or cannot preserve query meaning | Report the exact limit or unsupported operation. Do not claim silent truncation is complete. |

## Decisions and boundaries

**Appetite:** First prove two synthetic customer runtimes locally. Then add one small desired-state manifest and idempotent operator script. Keep provider integration to one selected platform and one customer lifecycle path.

**Key decision:** Separate the local customer-boundary proof from the operator lifecycle tool. The later script can create, verify, update, roll back, suspend, resume, restore, and remove only explicitly owned app resources. This provides useful automation without a custom fleet platform. Cloud Run remains under investigation; provider documents and modeled prices cannot prove this application works there.

**Boundary:** The provisional dedicated promise is service-specific runtime, credentials, and application state. It does not promise a physical host, exclusive physical CPU, customer-owned account, or multi-region recovery. The lifecycle script manages only customer-owned application resources; customer databases remain untouched. The existing browser still pays its current decode, row-object, index, and chart memory costs. The first source result is complete into current tables; later server pushdown needs parity against the same analysis meaning. Do not build a fleet controller, custom scheduler, dual-provider deployment, permanent cache, or billing flow.

**First proof:** **Try:** Start two copies of one local image with fixed synthetic identities, separate secrets and state, and separate test database access. Run the same bounded complete source snapshot through both, then restart one. **Observe:** Image digest, customer identity, selected credential and state path, row count and values, cross-customer denial, memory, restart recovery, and whether the other instance changes. **Decide:** If both return complete expected data, every cross-customer attempt fails, and restart preserves only that customer's acknowledged state, shape the manifest and idempotent script against a local adapter. Otherwise revise the runtime boundary. A provider sandbox remains conditional on a specific unresolved provider property and separate authorization.

**Open choices:** Confirm whether this service-level boundary matches the customer promise. Name any launch database that requires private routing or customer-exclusive egress before the hosted proof; public TLS is the provisional test path.

See the [intent brief](intent-brief.md) and [recommendation review](evidence/recommendation-review.md).
