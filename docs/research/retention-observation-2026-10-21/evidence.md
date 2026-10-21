# Independent review evidence

Reviewed 2026-10-21 against 9b16d78e3ed0742ed4d5858c1939fec9e758b510.
Refreshed origin/main still matches that baseline. Open PR454 owns axes; prior research PRs remain separate.

## Collection and source identity

Pro finished after 15m38s. The ZIP and manifest match their published SHA-256 values.
CRC, safe root paths, no symlinks, exact inventory, UTF8 and every report size/hash pass.
All four substantive reports were read. Originals remain unchanged.
The standalone decision click opened raw text; its 12-second download event timed out.
No independent standalone/archive equality is claimed. All required contents are preserved from the verified ZIP.
See [collection.json](collection.json).

All32 uploaded entries authenticate against their headers. All29 baseline files match Git objects.
Seven supplemental source files match baseline and current bytes. See [source-review.json](source-review.json).
The historical handoff summary is from ae2716a2; local links now point to that original folder.
The source manifest preserves the uploaded bytes, including the queue before hook formatting.

## Decisive current-source checks

- retentionPlan.ts reads entry/activity from ids and the event maximum from allIds. Invalid-entity or nonqualifying late rows can move that maximum.
- useGetAllIds restricts chart-local population. useGetLiveIds adds positive grouped counts and nonempty facet membership.
- CrossfilterWrapper.getAllData applies chart-local population after grouping. The provider reads those groups. Own dimensions, peer/workspace filters and localSelections have distinct scopes.
- FacetContainer uses chart-local all IDs for members. Retention passes facet IDs only to live IDs, preserving a common chart-local horizon.
- The partial predicate compares period end with midnight after the latest event's UTC date. Daily partial is false; final-day week/month timestamps clear partial.
- summary includes partial reached cohorts. The All renderer has no partial field, hatch or summary trace. Full plan cohorts contribute even when old rows are hidden.
- Trace rows contain one activity event per active entity. Cohort entry rows and denominator members are separate sets. Selection stores active entity values.
- Current registry, docs and examples deliver Funnel, Retention and Timeline. The domain plan's delivery language is historical.

These checks establish source behavior and a source/prose discrepancy. They do not establish a runtime defect or reader failure.
The new fixture, facet flow, browser checks, source refresh, export/history/restore and author task remain unrun.
[16 rational/calendar anchors](fixture-audit.json) passed independently. Pro's own16 checks remain attributed, not inherited product acceptance.

## Current primary sources

Independent retrieval on2026-10-21 confirms these bounded claims:

- [Amplitude calculation](https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-calculation): incomplete cells are excluded from All Users totals. Return On and On or After differ.
- [Mixpanel retention](https://docs.mixpanel.com/docs/reports/retention): completed buckets enter Average Retention. Its worked weighting example has inconsistent arithmetic; do not use it as an oracle.
- [PostHog retention](https://posthog.com/docs/product-analytics/retention): simple versus weighted means are separate choices. The page does not establish exact parity with explorEDA.
- [BigQuery Export](https://support.google.com/analytics/answer/9358801?hl=en): streaming export has a separate completeness contract. A source-processing signal is not inferred from the latest event.
- [NIST censoring](https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm): known observation time and failures define censored reliability data. Applying that model to returning activity is a separate inference and is rejected here.

The [GA4 cohort page](https://support.google.com/analytics/answer/9670133?hl=en) timed out twice during independent retrieval.
Its detailed calendar/mode claims remain Pro-attributed. They do not determine the retained recommendation.
Other details in the original comparison remain attributed unless checked above. No competitor UI was operated.
No follow-up was needed:0/2. Missing product choices remain explicit proposals rather than research gaps to force closed.
