# Related sources and read times

Keep complete, independently refreshed snapshots as the default. For reconciliation, first test one SQLite SQL source at the required grain. Do not build a shared-refresh feature from this research alone.

Pro completed the [research](https://chatgpt.com/c/6ad56cea-12a8-83ea-b1e9-ee15a649fd1a) on 2026-10-19. All four reports and the ZIP remain in the Pro conversation. The [local evidence review](evidence.md) and [recommendation decisions](decisions.md) separate research from executed checks.

## What changes the decision

A complete read of each source does not establish one shared database view. Refresh All reads sources in sequence. A later failure can leave an earlier source replaced. `readAt` records when conversion finished, before file publication. It does not identify a database snapshot or business cutoff.

The proposed fixture has a valid net of 14,000 cents before and after one business transaction. Mixing old orders with new refunds produces 10,000 cents. A failed refresh after replacing orders can produce 18,000 cents. Inner joins can hide missing members and restore a plausible total. These are paper calculations, not observed application results.

Publishing those mixed inputs together would preserve the wrong result. A shared read and a shared publication boundary solve different problems. The [evidence review](evidence.md) records driver-specific limits.

## Next useful proof

The [proposed proof](https://chatgpt.com/c/6ad56cea-12a8-83ea-b1e9-ee15a649fd1a) compares exact IDs, gross, refunds, net, and missing-member diagnostics. It aggregates refunds per order before joining. It also tests a valid customer-region change and multiple refunds on one order.

First use the existing SQLite `sql=` source. Observe one author completing the task and explaining its grain. No author session or database fixture ran in this cycle. A passing arithmetic check alone would not prove a useful author handoff.

Investigate a shared transaction only after a named author needs separate source grains that this SQL result cannot preserve. A future milestone must pair `apps/demo/src/docs/pages/database-sources.mdx` with a runnable database example. Large application changes remain proposed.

The [ranked queue](research-queue.md) now puts the existing trust journey ahead of another freshness survey. No new platform, provider, or query-placement work is activated.
