# Build reusable text preparation

Build **Prepare text** as guided authoring for ordinary saved formulas.
Ship trim, literal part extraction, literal replacement, and strict concatenation with exact record review,
text-preserving types, trace, and chart/project/notebook save–reopen–refresh support.
Add explicit NFC and casing next, then code-point length and slicing.

Topic R048 scored **18/20**: capability 4, Pro advantage 5, buildability 5, momentum 4.
The [local implementation plan](../../intent/text-preparation/implementation-plan.md) is ready for implementation review.
All [seven original results](../../intent/text-preparation/assets/pro-results/text-preparation-design-2026-10-31/index.md)
and [25 local dispositions](decisions.md) are preserved.

The registry, parser, editor, and project calculate step provide the common execution path.
Current text typing handles only top-level recode; restore and flattened notebook/analysis adapters need explicit closure.
Failure maps also need to reach actual field reads. See the [code and verification record](evidence.md).

The 18-record fixture has 4 changed, 10 unchanged, 2 missing, and 2 failed trim outcomes.
The independent local checks passed **479 assertions**, covering 130 successful direct cases,
155 Unicode annotations, workflow memberships/collisions/reorder/refresh, and six-record project arithmetic.
Supplied programs were inspected, not run. Pro's 323 assertions remain Pro-reported.
These checks do not prove the proposed product feature, parser integration, worker, persistence, browser flow, or performance.

Primary-source checks support the deliberate differences: [Power Query skips nulls in Text.Combine](https://learn.microsoft.com/en-us/powerquery-m/text-combine),
while [OpenRefine normalize removes diacritics](https://openrefine.org/docs/manual/grelfunctions).
This plan instead proposes strict missing propagation and explicit NFC.
[Unicode UAX #15](https://www.unicode.org/reports/tr15/) also explains why normalizing fragments does not normalize their concatenation.

No product decision blocks M1. Implementation must verify empty text categories, supported runtime Unicode behavior,
actual worker transport, refresh through the folder/notebook host, and measured preview cost.
Keep prepared labels separate from entity keys and defer regex and locale tailoring.

[Pro conversation](https://chatgpt.com/c/6ae6522c-cde4-83e8-a3b7-7efa15b64b0c), finished in 17m51s; follow-ups 0/1.
Baseline/current main: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
[Run record](run.md). This is a plan, not an implemented capability or permission to publish.
