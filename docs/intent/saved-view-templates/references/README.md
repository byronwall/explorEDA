# References for reuse a view without carrying its temporary selections

[Selected Pro records](pro-candidates.json) retain the original wording and source IDs. They are historical recommendations.

- [Complete chart review](../../comparison-opportunities/resources/pro-chart-review/exploreda-chart-interaction-review/review.md), September 21, at `593ca2e`.
- [October 5 executive report](../../comparison-opportunities/resources/pro-gap-analysis/explorEDA-gap-analysis-2026-10-05/reports/00-executive-report.md), at `362db580`.
- [Complete gap register](../../comparison-opportunities/resources/pro-gap-analysis/explorEDA-gap-analysis-2026-10-05/reports/02-comprehensive-gap-register.md).
- [Source originals and checksums](../../comparison-opportunities/resources/README.md).

The review environment blocked application navigation. Proposed scenarios and prototype tests are not current browser evidence.
Current source was inspected at `a50df9985ed3ff54d0f6ca368c0b369829b8a927` on 2026-10-06. No new runtime checks ran.

## Current code and documentation

- [apps/demo/src/SavedViewsWorkspace.tsx](../../../../apps/demo/src/SavedViewsWorkspace.tsx)
- [apps/demo/src/savedViewsSession.ts](../../../../apps/demo/src/savedViewsSession.ts)
- [packages/explorEDA/src/types/SavedDataStructure.ts](../../../../packages/explorEDA/src/types/SavedDataStructure.ts)
- [packages/explorEDA/src/types/ChartTypes.ts](../../../../packages/explorEDA/src/types/ChartTypes.ts)

## Related existing intent

- [project-task-views](https://github.com/byronwall/explorEDA/blob/91b627d7307a4a14c7f123a713ce5f45662a3d22/docs/intent/project-task-views/intent-brief.md)
- [multi-source-analysis](https://github.com/byronwall/explorEDA/blob/91b627d7307a4a14c7f123a713ce5f45662a3d22/docs/intent/multi-source-analysis/intent-brief.md)

## Product feedback

[Annotated product direction](../../comparison-opportunities/resources/product-feedback-2026-10-06.md) supplies the current audience and priorities. The [full records](../../comparison-opportunities/resources/product-feedback-2026-10-06.json) preserve uncertainty.
