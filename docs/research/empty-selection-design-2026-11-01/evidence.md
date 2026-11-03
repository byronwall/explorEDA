# Evidence review

Reviewed against current `origin/main`, unchanged at `d3920a285f3755a8324998775deb131747e959f5` on collection.
Read all original report, plan, recommendations, and fixture-guide content; inspected JSON data/results,
the complete 936-line verifier, and all three SVGs. No downloaded program was executed.

## Decisive source checks

| Claim                                                | Current source and result                                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Context excludes its owner                           | `CrossfilterWrapper.getAllData` uses owner groups, then `getPopulationTest`. Workspace IDs use `allFiltered`. Confirmed.                                           |
| Local notebook selections do not filter peers        | `updateChartFilters` clears the live dimension in local mode; notebook provider enables that mode. Confirmed.                                                      |
| Removal can expose an older range                    | `BarChart/definition.ts::getFilterFunction` uses the last numeric/date range for aggregate bars. Simple bars ignore off-field predicates. Confirmed.               |
| Display inactivity is not predicate inactivity       | `ActiveFilterStatus.isActiveFilter` hides empty sets/bounds/text; `applyFilter` still imposes type or empty-set semantics. Confirmed.                              |
| Table search is local and includes calculated values | `DataTable/definition.ts` compiles field filters only. `DataTable.tsx::resolvedRows` adds calculations; `filteredRows` searches all non-ID fields. Confirmed.      |
| Holds are not atomic transactions                    | Provider holds update the hold counter; the subscription returns while held. Existing setters still publish store changes. Confirmed.                              |
| JSON differs from runtime filters                    | History/session clones use JSON. `stringifySavedData` validates first; filter `isDatum` permits finite numbers only. Raw-row special tags are separate. Confirmed. |
| Notebook findings have distinct scopes               | `evaluateFinding` uses all IDs when unbound, eligible IDs for eligible findings, then owning selection otherwise. Confirmed.                                       |
| Notebook writes do not persist selections            | `writeBack.textPart` drops filters; `skippedKey` ignores select tokens; results are per chart. Confirmed.                                                          |
| Folder convenience serialization loses diagnostics   | `analysisFileText` takes only text from `exportAnalysisText`; DSL export records omitted workspace filters. Confirmed.                                             |
| Persistence belongs to the host                      | ProjectWorkspace has dashboard settings and notebook text handlers; notebook local settings have no file callback. Confirmed.                                      |

## Independent local check

Authored an ignored temporary Vitest review using the actual `CrossfilterWrapper`, registered Bar/DataTable definitions,
and real `getFilteredRows`. It decodes fixture-only special values, builds fresh wrappers, and checks explicit expected arrays.
It covers all 29 fixture baselines, all 72 preview alternatives, supplied population checks, and replacement variants.
The temporary patch helper removes original array positions together. It does not import or execute the supplied verifier.

Result: **1 file, 29 tests passed**. This establishes fixture membership against real current helpers and live Crossfilter.
It does not exercise a mounted provider, actual Apply/Cancel, history, finding reductions, stale guards, notebook text, or file saves.
Pro's additional monotonicity, classification, and finding assertions were inspected, not independently rerun.
The local test and log remain ignored under `tmp/`.

Preparation baseline: 3 files, 28 tests passed. Docs check: 3 files, 74 tests passed, with existing React act warnings.
Collection reruns and format checks are recorded in the run record.
No full `pnpm check` is required: this PR changes research and plans only.

## Primary-source checks and visuals

[Mosaic's Selection API](https://idl.uw.edu/mosaic/api/core/selection.html) documents client-specific clause exclusion and cloned removal.
[The VLDB paper](https://www.vldb.org/pvldb/vol6/p1762-mottin.pdf) describes interactive removal and application-dependent objectives.
Its actual title is _A Probabilistic Optimization Framework for the Empty-Answer Problem_; the originals use another title.
These sources support the approach, not the proposed cap, budgets, or cost estimates.

Safely extracted ten unique ZIP files after path, size, symlink, and CRC checks.
All originals retain exact bytes and relative names. ZIP and source packet remain ignored; no Library upload was needed.
Quick Look thumbnails cropped content; full local Chromium rendering replaced that inspection.
Viewed complete 1280×880, 783×1000, and 390×1000 mockups. They show scope, records, retained filter, and explicit Apply.
They are design assets, not browser acceptance evidence. Long-label, loading, stale, and error states still need implementation review.
