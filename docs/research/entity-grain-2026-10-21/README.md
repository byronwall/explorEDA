# R043: entity grain and aggregate agreement

Keep source-occurrence identity and selected-value identity separate. Equal counts do not prove equal populations.

Three local research probes confirm the main boundaries. Source identity and copied values can both count four units,
but produce sums of 30 and 27. Shared value identity excludes missing IDs and produces 17 on that same fixture.
These results use different partitions. They must not be forced to agree.

One equivalent-partition case does disagree. For x:{10,20}, y:{5}, shared measured count is unavailable;
project measured count is 1. Both numeric totals are unavailable. Changing x's values to 10/10 makes both counts 2.
This supports a narrow conflict-policy repair proposal. It does not justify a shared reducer or new identity API.

The proposed policy makes the whole measured count unavailable when one entity has conflicting values.
Entity-only exclusion remains an explicit alternative. Keep ordinary count eligibility and unmatched item count zero.
No behavior change was made. The repair needs its own implementation review, guidance, and runnable example.

Project group references retain all conflict witnesses. The numeric per-measure ledger omits them.
First test existing diagnostic details and prior-stage navigation before expanding that ledger.
A separate static-render probe confirms the entity-count card still uses row wording. Browser and author checks remain pending.

Read the [six decisions](decisions.md), [checked evidence](evidence.md), [probe results](evidence/local-results.json),
[ranked catalogue queue](research-queue.md), and [run record](run.md).
The [Pro report](originals/report.md), [recommendations](originals/recommendations.md), and [proof plan](originals/proof-plan.md)
remain unchanged. The [collection record](collection.json) records safe archive and companion checks.
[Validation](validation.json) separates executed checks from pending proofs.

R043 synthesis is complete after the review PR is verified. R077 remains the next eligible broad study.
No new lesson, runnable project, application repair, SQL execution, or customer-demand claim is included.
