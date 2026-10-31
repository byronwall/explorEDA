# Code review and verification evidence

Reviewed October 31, 2026 against refreshed `origin/main` at `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Main did not change after submission. Open PRs through #579 were checked for overlap.
The geographic Design question remains distinct from the October 19 generic grouped-rate Review.

## Claims that decide the plan

| Claim                                                      | Current code evidence                                                                                                                       | Local consequence                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Maps do not own a rate definition                          | `Map/definition.ts` exposes count/sum/average; `lib/aggregates.ts` also has max/min.                                                        | Add a query binding, not another scalar reducer.                                                  |
| A lookup recipe cannot join independently evaluated frames | `lookupFrame` reads `tables[source.id]`; query steps have one `inputStepId`.                                                                | Extend both dependency branches in evaluation, validation, text, closure, and revisions.          |
| A missing file can look empty at the table boundary        | `lib/project/folder.ts` records `missingSources` while assigning `[]`.                                                                      | Availability must accompany both inputs into rate evaluation.                                     |
| Existing region selection requires rows                    | `regionFilters` returns existing filters for no `sourceIds`; `RegionMap` inspects empty regions.                                            | Select semantic result groups, including zero-event C and unavailable D.                          |
| Zoom can change geometry grain                             | `RegionMap` calls `useZoomDetail`; tests cover country/state refinement.                                                                    | Pin the rate geometry/version while pan and zoom change presentation.                             |
| Notebook loading drops analysis evidence                   | `readNotebookText` evaluates with `{}` bindings and maps to `row.data`.                                                                     | Retain full evaluation and availability alongside scalar rows.                                    |
| Mounted notebooks also lack that context                   | `ExplorEdaNotebookProps` accepts data/text; `ProjectWorkspace` passes `notebook.result.rows`.                                               | Extend both reading and mounting, including finding trace context.                                |
| A project callback already exists                          | `ExplorEdaProjectProps.onProjectChange` reports `{project, view}`; its `update` uses that callback.                                         | Resolve Pro's open callback question by reusing this API.                                         |
| Project traces already receive result rows                 | `ExplorEdaProject.chartContext` supplies fields, sources, steps, and `evaluation.rows`.                                                     | Extend this context with rate-role resolution; do not build a parallel trace service.             |
| Worker coordination already rejects late results           | `useAnalysisEvaluation` uses request IDs and retains the last result while pending. `analysisWorkerProtocol` has sources/evaluate messages. | Add availability/rate context to this protocol. Keep its coordination; no second worker manager.  |
| Definitions and settings have different owners             | `ProjectWorkspace.onProjectChange` marks project/local-source files dirty; settings update the current view.                                | Keep rate definitions in project text and presentation in existing analysis/notebook text.        |
| Folder writes already have a queue                         | `ProjectWorkspace` uses `FolderSaver.queue`; `apps/app/src/saver.ts` serializes writes.                                                     | Reuse it and require complete save/reopen proof.                                                  |
| Existing settings echoes are guarded                       | `DataLayerProvider` compares fingerprints and supports `holdStateChanges`.                                                                  | Apply semantic edits atomically; keep runtime evidence and source data out of settings callbacks. |

All library paths above are under `packages/explorEDA/src/`.
The new step also requires changes in project field validation and selected-view export, not just the evaluator switch.

## Local changes to Pro's plan

Split Pro's large M1 into prepared totals first and two-source events second.
Each remains a complete map/table/notebook/save workflow. The contract can retain both input IDs when they name the same prepared stage.
Later milestones add supported scopes, exposure preparation, and explicit live finding bindings.

Reuse the existing project callback, result-row trace context, worker request IDs, and folder saver.
Pro left those omitted implementation files for local inspection. They are now named in the local plan.

Treat disjointness as a declared population condition. Different region labels or separate shapes do not prove independent exposure.
Keep unsafe count sums and nonfinite arithmetic unavailable. Test intermediate numeric overflow separately from exact fixture fractions.
Do not add cross-version coexistence code merely to accept old and new interpretations.

Keep notebook selection writes explicit. Current `textPart` removes the entire transient `filters` array and layout before comparison.
`skippedKey` excludes `select.` tokens, and `samePart` compares the parsed declaration.
Rate edits must preserve that boundary while recompiling and checking their owned declarations.
Use `expand` for the guide's duplicated-event stage test; `lookupFrame` itself does not expand one source row into several.

The normalized oracle does not implement a full project graph or denominator-discovered universe.
Its explicit region universe and numerator discovery need a production adapter that includes denominator-only and requested keys.
It also omits real occurrence-grain validation, binary availability transitions, worker races, callbacks, and folder/UI behavior.
The local plan adds these acceptance cases. Fixture success cannot replace them.

The visual was inspected. Its B selection and A+B+C pool represent different scopes, so the pool's subset label must remain explicit.
Its layout, colors, and controls remain a proposal. Use the repository's compact controls and temporary trace surfaces during implementation.

## Primary-source checks

- [ArcGIS Calculate Rates](https://doc.esri.com/en/arcgis-pro/latest/tool-reference/spatial-statistics/calculate-rates.html)
  identifies count, population, multiplier, and null crude rates for zero population.
- [Tableau filter order](https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod_filters.htm)
  shows how an ordinary dimension filter can affect the numerator while a FIXED denominator stays unchanged.
- [Census estimates tables](https://www.census.gov/programs-surveys/popest/data/tables.html)
  distinguishes release vintages and reference dates and advises against combining separate vintages.

These support explicit roles and compatible scope. They do not prescribe the proposed query architecture.
The report's other citations remain Pro evidence; no complete external citation audit is claimed.

## Originals and independent checks

Downloaded `regional-rates-design.zip` from the linked preview under Byron's standing approval.
The first click produced no immediate local file. A bounded download-event recovery timed out.
The actual ZIP then appeared in Downloads and was verified before further action. No regeneration or follow-up was needed.
No approval rejection or Library upload occurred.

All eight archive entries pass unique/safe-path, no-symlink, CRC, size, and relevant UTF-8 checks.
Original disk bytes match the archive. The SVG parses and has no scripts, foreign objects, or external hrefs.
Both reports and the guide were read completely. The contract and verifier were inspected; neither was executed or imported.
The JSON's 46 cases were parsed and their results inspected. The PNG was viewed.
The [asset index](../../intent/regional-rate-comparisons/assets/pro-results/README.md) links every original.
Git and PR inventories must also match before completion.

The locally authored [fixture probe](check-fixture-anchors.py) passes **439 assertions across 46 cases**.
It checks available-rate fractions, source-reference existence, contributor uniqueness, canonical count/filter membership,
pooled arithmetic and membership, and named zero/unknown/duplicate/type/window/selection edge cases.
It reads fixture data and uses Python rational arithmetic. It imports no supplied or repository program.
It does not independently reproduce every availability decision or Pro's full verifier.

Pro reports **2,849 assertions across 46 cases** and a Node syntax/example check of its TypeScript companion.
Those remain Pro-reported results. No downloaded program was executed locally.

Existing map, evaluator, and notebook-findings tests pass: **3 files, 27 tests**.
These confirm the baseline behavior used for planning, not the proposed feature.
Docs, formatting, author/changeset checks, authored local links, and committed original inventory are checked before PR completion.
No full `pnpm check`, changeset, browser acceptance, callback proof, or performance benchmark is required for this docs-only PR.
