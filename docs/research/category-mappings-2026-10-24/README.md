# Build reusable category mappings

Build an explicit, row-preserving map step that creates a new categorical field in project workspaces.
Keep the source field and records. Ship manual authoring, exact review, revision, save/reload, and notebook consumption together.
Add reviewed trim/lowercase suggestions next. Byron supplies demand.

- [Implementation plan](../../intent/category-mappings/implementation-plan.md)
- [Pro conversation](https://chatgpt.com/c/6add0665-5a6c-83e9-b40e-1603bae0989d)
- [Prompt](pro-prompt.md) and [run record](run.md)

Selected score: **18/20**, Design. Baseline: `95832bd473884aeae23453af0888b4ca5187820d`.
Pro finished after 25m04s. Both complete reports were collected and read. No follow-up was needed.
Originals and scratch checks stay under ignored tmp/. This summary and plan are local decisions, not copied deliverables.

## Decision and checked seams

Choose inline typed entries over formulas or a lookup source. It fits the existing query model and avoids another recipe owner.
Canonical source-key strings survive the demo's JSON history, including special numeric source categories.
Keep unmatched categories by default. Canonicalize null/undefined to null only in the new field.

Current code confirms the main integration needs:

- `categories.ts` keeps scalar types distinct. Categorical conversion preserves raw values; labels do not combine memberships.
- `AnalysisStep` has no map. `calculateFrame` supplies the row-preserving pattern; workers already carry full project definitions.
- `projectFile.ts::fieldsAt` checks dependencies structurally. Interactive removal currently relies on empty-table evaluation.
- `ExplorEdaProject` separates project edits from chart callbacks. Its no-settings path also needs categorical output metadata.
- `QueryStageRows` formats some distinct values alike. Its related-record path includes broader children and caps nested rows at 25.
- `writeFolder.ts` omits all implicit queries. `ProjectWorkspace` dirties project text only when a project path exists.
- The folder serializer omits analysis-local sources from project text. A new explicit query needs valid source declarations.
- The app supplies notebooks with folder-load rows and lists analysis views only in `allViews`.
- Demo `captureProject` checkpoints project edits. The app saver provides delayed writes, not a generic undo stack.
- Browser discovery requires `.e2e.ts` plus an explicit project regex. A new `.spec.ts` would not run.

Local review narrows two Pro proposals. Omit the saved purpose enum; a descriptive label and editor copy explain intent.
Use one guarded previous/expected query for session undo. Invalidate it after another definition edit; avoid per-edge inverse patches.
Preserve unrelated chart edits. Keep strict entry parsing local to map declarations and measure before adding capacity machinery.

## Local dispositions

Build means planned work, not approval to ship or completed implementation.

| ID   | Disposition | Local decision                                                                                    |
| ---- | ----------- | ------------------------------------------------------------------------------------------------- |
| CM01 | Build       | One explicit row-preserving map step.                                                             |
| CM02 | Build       | Project hosts, including one-source projects, demo, and folder app.                               |
| CM03 | Build       | Inline canonical keys and finite scalar/null targets; omit the unnecessary purpose enum.          |
| CM04 | Build       | One pass, exact targets, canonical missing output, and explicit fallback.                         |
| CM05 | Build       | Query editor with local drafts, one Apply, edit, and removal.                                     |
| CM06 | Build       | Full-stage counts and all direct source records; broader relations stay separate.                 |
| CM07 | Build       | Derived categorical defaults in initial, saved, and stage-profile paths.                          |
| CM08 | Build       | Structural dependencies even on empty input; name known notebook/view consumers.                  |
| CM09 | Build       | Project callback and bounded undo; narrow its invalidation rule instead of inverse graph patches. |
| CM10 | Build       | Current-input preview checks and ordinary refresh; no new protocol or durable revision store.     |
| CM11 | Build       | Exact JSON/text/copy/history round trips; invalid maps cannot become partial queries.             |
| CM12 | Build       | Persist edited implicit queries, establish project path, and reevaluate current notebooks.        |
| CM13 | Build       | Docs, runnable project/folder examples, and meaningful acceptance evidence in M1.                 |
| CM14 | Build       | Reviewed trim/lowercase suggestions in M2; save explicit entries only.                            |
| CM15 | Explore     | Fuzzy ranking or named Unicode normalization after manual review works.                           |
| CM16 | Defer       | Automatic promotion of arbitrary standalone hosts.                                                |
| CM17 | Defer       | Shared mapping registries and externally maintained lookup maps.                                  |
| CM18 | Defer       | Formula-based authoring duplicates review and ownership.                                          |
| CM19 | Avoid       | Automatic source correction, entity resolution, and silent join-key preparation.                  |
| CM20 | Avoid       | Global identity changes, arbitrary cutoffs, and generic preparation/version machinery.            |

## Sources and remaining proof

Official comparisons support reviewed membership, a new field, and explicit unmatched behavior:
[OpenRefine](https://openrefine.org/docs/technical-reference/clustering-in-depth),
[Tableau groups](https://help.tableau.com/current/pro/desktop/en-us/sortgroup_groups_creating.htm),
[Power Query replacement](https://learn.microsoft.com/en-us/power-query/replace-values),
[JMP recoding](https://www.jmp.com/support/help/en/19.2/jmp/recode-data-in-a-column.shtml), and
[pandas map](https://pandas.pydata.org/docs/reference/api/pandas.Series.map.html).
These sources describe semantics; no comparative usability trial was run.
[ECMAScript lowercasing](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.tolowercase)
and [Unicode security guidance](https://www.unicode.org/reports/tr39/) support keeping suggestions separate from identity.

Independent local checks used current `categoryKey`: 52 assertions pass for fixture counts, memberships, refresh, fallback,
typed identity, chains/swaps, suggestion counts, and the profiling workload's category arithmetic.
Baseline category/conversion/evaluator/selection/removal tests pass: five files, 50 tests.
These checks do not accept an unbuilt feature. No downloaded program was executed.

Mounted callbacks, actual new-step evaluation, persistence, save failure, worker freshness, browser/touch flows, and performance remain proposed.
The first implementation must prove the categorical hint through every host path and first-save source declarations without rewriting data.
No product decision blocks M1. Recheck changed code and derive browser selectors from the implemented UI.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/category-mappings/assets/pro-results/category-mappings-2026-10-24/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
