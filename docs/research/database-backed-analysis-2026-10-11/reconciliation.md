# Shared direction after the four research tracks

The first shape loads a bounded, complete, authorized source snapshot into `ExplorEdaProject.tables`.
The existing evaluator keeps analysis stages, contributors, and linked filtering local.
All four initiatives remain planned. This review does not approve implementation or select a production provider.

## Decisions across tracks

| Concern | Reconciled direction | Reason |
| --- | --- | --- |
| First data path | Fixed host-owned PostgreSQL reads, complete source tables, current local evaluation | The existing component consumes source arrays and retains stage and contributor evidence. |
| Projection | Candidate after dependency closure across admitted analysis, filters, and inspection | Output-only rows cannot replace a full evaluation. A hidden source field may still be required. |
| Server aggregation | Later, for a named workload that rejects complete snapshots | SQL joins, null rules, entity counts, and evidence can change analytical meaning. |
| Encoding | Benchmark lossless row JSON against Arrow IPC with equal HTTP gzip; select one | Current row objects, indexes, stages, and charts still cost memory after a smaller transfer. |
| Snapshot lifetime | One consistent read batch first; publish complete results atomically | A transaction token does not keep a database snapshot available after its owner ends. |
| New field demand | Re-read the complete required field set when snapshot reuse is unavailable | Never attach a fresh column to stale rows by position. |
| Completion | Reader proves exhaustion; browser checks delivery consistency | HTTP success, valid framing, and matching counts cannot independently prove unseen rows. |
| Cancellation | Reject stale results and separately verify bounded database work and cleanup | A browser abort is not evidence that SQL stopped. |
| Customer ownership | Fixed server-owned customer identity, separate credentials and state | Client input must not select another customer's authority or cache. |
| Hosting | Cloud Run service/customer is the front-runner; Cloudflare Containers remains a challenger | Managed runtimes fit low maintenance. Connectivity, cold behavior, and measured costs can change the choice. |
| Automation | One common image and small repeatable lifecycle commands before a fleet platform | High automation is core intent; a custom scheduler is not required to achieve it. |

## Result meaning that all tracks must preserve

Each result belongs to a registered source within one customer instance.
Its schema, value rules, row meaning, keys, population, row coverage, and field coverage must agree.
Request relevance, semantic identity, snapshot identity, and freshness have distinct meanings.
Do not add a separate version-negotiation system for this single-version project.

Selected rows apply all linked selections and workspace filters.
A chart's context excludes only that chart owner's linked predicate.
Chart-local restrictions and facets still apply.
A field control can exclude its own workspace filter when showing alternatives.
The initial source-snapshot path reuses these existing consumers instead of translating every scope to SQL.

An omitted field is unavailable, not a known null.
An ordered prefix is a page, not the complete population.
A complete filtered subset does not become complete source data when a filter clears.
Limits must produce an explicit failure before partial data reaches the existing complete-data consumer.
The 10k and 100k fixtures are starting examples. Width, keys, devices, and old/new result overlap determine capacity.

## Research choices narrowed during integration

The query report preferred complete projected output rows. Its simpler source-table alternative better fits today's evaluator and inspection.
The hosting report preferred supported SQL pushdown and streaming. Both remain conditional until the other tracks prove them.
The transport report offered JSON as a fallback. Here it is a benchmark alternative; the selected design ships one format initially.
No dual-format, dual-provider, or mixed partial-server/local fallback is part of this shape.

The later customer-instance update changes query ownership, not filter mathematics.
Query and snapshot identity are scoped to a fixed customer instance.
This resolves the update without another Pro submission. All tracks used zero follow-ups.

## Provider checks and limits

Cloud Run documents Gen2 microVM isolation and discards local state when an instance ends.
Use external state for acknowledged saves; do not promise a permanent server or physical host.
These facts support a service-per-customer candidate, not a proven application deployment.
[Cloud Run security](https://docs.cloud.google.com/run/docs/securing/security).

Cloud Run does not propagate HTTP/1.1 disconnects to the container.
HTTP/2 or WebSockets can propagate disconnects, but the adapter must still stop its own SQL.
[Cloud Run troubleshooting](https://docs.cloud.google.com/run/docs/troubleshooting#client-disconnect).

Cloudflare Containers has different predefined sizes and requires at least 3 GiB per vCPU for custom sizes.
Do not compare its measured memory ceiling with a 2-GiB Cloud Run instance as if capacities were equal.
[Container limits](https://developers.cloudflare.com/containers/platform/limits/).

The per-track recommendation reviews record further source and provider checks.
Provider prices are planning inputs, not customer quotes. No hosted runtime, driver benchmark, or network proof ran.

## Proof order

1. Prove complete source delivery and linked-view behavior with a deterministic fake and known rows.
2. Prove PostgreSQL types, snapshot consistency, limits, and cleanup in a disposable local database.
3. Compare encoding choices with the same source, consumers, and replacement lifecycle.
4. Prove two local customer instances using one image and separate authority and state.
5. After implementation authorization, test the chosen provider with two synthetic customers and one required network path.

Any failed proof can narrow the shape. A failed complete-snapshot budget should trigger one named remote-demand experiment.
It should not trigger a universal query platform or an unbounded cache.
