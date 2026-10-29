# R008 — Engineering histograms and specification limits

- ID: R008
- Category: Distribution semantics
- Priority: 51
- Kind: follow-up
- Status: planned; implementation proposed
- Confidence: high for numerical contract; browser acceptance pending
- Reviewed baseline: `95832bd4`

## Direction

Build authored regular bins, independent specification compliance, numeric groups, and short complete edge lists in the existing Bar chart.
The [implementation plan](../../engineering-histograms/implementation-plan.md) starts with width/origin and exact coverage records.
Its four milestones pair each feature with docs and runnable examples.

The [Design research](../../../research/engineering-histograms-2026-10-23/README.md) scored 20/20 under the current research direction.
It supersedes the earlier audit's named-demand gate. Byron is the demand.
The existing endpoint repair remains the baseline; this plan adds capability.

Specification equality passes. Both failure tails use one focused filter atom.
Saved authored coverage survives refresh; exact Records uses the same contributor IDs as each displayed count.
Group-valid denominators include coverage tails. Unequal widths require density geometry.
Frozen selection semantics apply only to explicitly configured engineering histograms.

Keep Auto and categorical series behavior. Defer fitted capability, control charts, weights, and per-group limits.
See the research summary for local Build/Explore/Defer/Avoid decisions and verification limits.
