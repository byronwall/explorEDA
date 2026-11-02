# Decisions and code checks

All dispositions refer to the [original recommendations](assets/pro-results/narrow-reading-design-2026-11-02/originals/recommendations.md). Build means include in planning; it does not approve implementation.

| IDs    | Disposition | Local reason                                                                               |
| ------ | ----------- | ------------------------------------------------------------------------------------------ |
| NAR-01 | Build       | An explicit reader adds ordered reading beyond grid reflow.                                |
| NAR-02 | Build       | Existing readOnly makes chart areas inert; reading must allow selection and traces.        |
| NAR-03 | Build       | Owner eligibility, selected rows, and valid numeric inputs differ.                         |
| NAR-04 | Build       | The current phone projection follows array order; reader DOM order needs a clear rule.     |
| NAR-05 | Build       | Small chart-reference groups express author order without another canvas.                  |
| NAR-06 | Build       | Native notebook source and local selections already provide the needed model.              |
| NAR-07 | Build       | Existing header tracing supplies a discoverable route without mark-level Inspect controls. |
| NAR-08 | Build       | Evidence return needs actual host scroll-root and focus checks.                            |
| NAR-09 | Build       | Current metric plans retain candidates and exclusions; comparisons retain operands.        |
| NAR-10 | Build       | Keep existing callbacks; block notebook source writes explicitly.                          |
| NAR-11 | Build       | Manual selection and local evidence search need separate state.                            |
| NAR-12 | Build       | Authors own conclusions; current settings and plans supply facts.                          |
| NAR-13 | Build       | Existing revisions support stale evidence closure, without persistent row identity.        |
| NAR-14 | Build       | Extend full contributor paging instead of promoting a capped preview.                      |
| NAR-15 | Build       | Real narrow examples can prove the promised interactions.                                  |
| NAR-16 | Build       | Record keys, callbacks, focus and widths need product checks.                              |
| NAR-17 | Explore     | Rich semantic navigation needs a bounded prototype after ordinary tracing works.           |
| NAR-18 | Explore     | A comparison strip may help; sequential groups are sufficient initially.                   |
| NAR-19 | Defer       | Portable evidence identity and new research infrastructure expand the scope.               |
| NAR-20 | Avoid       | Duplicate renderers, generated conclusions and phone authoring add unnecessary systems.    |

## Decisive checks

Checked against unchanged current main `d3920a285f3755a8324998775deb131747e959f5`:

- `components/ChartGridLayout.tsx` and `chartGridPlacement.ts`: narrow container threshold960, two columns from640, array-index phone projection, and sorted shorter-column packing.
- `components/PlotManager.tsx`: readOnly marks chart, status and authoring areas inert. `GridChartPanel.tsx` skips function identities in its memo comparator.
- `components/PlotChartPanel.tsx`: expanded/inline panel under one trace scope. Opening details changes render location; logical target continuity still needs browser proof.
- `components/charts/ChartTraceControl.tsx`: current trace button and responsive popover. A visible Records label is proposed, not shipped.
- `hooks/CrossfilterWrapper.ts`: actual positive live groups exclude the owner dimension; all-filter row IDs do not. Local-selection mode clears chart dimensions.
- `notebook/ExplorEdaNotebook.tsx`: one provider with local selections; input-driven state changes can invoke source writeback. Reader mode needs an explicit gate.
- `notebook/NotebookFindings.tsx`: calculation-aware evaluation and revision checks; chartless findings use source IDs. `lib/notebook/findings.ts` retains operands and distinct unavailable states.
- `MetricCardTraceBody.tsx` and `BarChart/GroupedAggregateInspector.tsx`: complete contributors with50-row paging. `ChartDataPreview.tsx` caps at100.
- `providers/DataLayerProvider.tsx`: save lists fields explicitly. `utils/saveDataUtils.ts` validates known fields; it does not reject every unknown optional property. New reading validation is implementation work.
- Demo `docs/paths.ts`: docs viewport boundary1024. `LiveExample.tsx` uses it for live/screenshot behavior. This differs from notebook article and grid container widths.

Local corrections: expect two compiler warnings for deliberate empty Wholesale predicates. Keep that diagnostic acceptance beside M3. Preserve the new property's explicit validation requirement without claiming current unknown metadata is rejected. Treat original scripts and scratch commands as historical proposals; do not execute them.

## Independent local execution

A locally written temporary Vitest probe ran18 tests:15 population cases, one compiled-notebook state sequence, actual linked Crossfilter eligibility, and exact six-chart placement. Fourteen existing finding/layout tests also passed. The probe used product code, not Pro's programs. It remains in ignored `tmp/pro-narrow-reading-2026-11-02/native-probe.test.ts`.

The probe verified initial, East, owner-local Web, and workspace-West notebook values. It verified candidate IDs and used-input counts, invalid/missing/zero/empty reducers, linked selected O01/O03, and eligible counts5/4. It did not exercise the React provider or browser. The initial no-diagnostics assertion failed, then passed after checking the two known warnings.

Both screen formats were inspected: PNG viewed, SVG parsed and text inspected. They illustrate a design, not implemented behavior. The original type sketch and both verifier programs were read but not executed. No feature, callback, touch, keyboard, screen-reader, paging, performance, or cross-width acceptance is claimed.

## Primary-source spot checks

[Tableau Stories](https://help.tableau.com/current/pro/desktop/en-us/story_create.htm) documents story views connected to originals. [Power BI phone focus](https://learn.microsoft.com/en-us/power-bi/explore-reports/mobile/mobile-apps-view-phone-report) documents selection context carried between focus and report. These support the reuse-and-return analogy, not an explorEDA performance claim.

[WAI modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) supports initial structural focus, a trapped modal tab sequence, Escape, and a connected return target. The plan's return implementation remains unbuilt.
