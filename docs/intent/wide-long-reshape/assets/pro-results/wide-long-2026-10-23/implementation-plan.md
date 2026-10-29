Build a saved `unpivot` query step that turns an explicit ordered set of repeated-measurement fields into an inspectable long table. First application opens a copied query in a fresh view, preserving the original analysis. Ship the complete authoring, lineage, persistence, documentation, and example path in the first release; then add explicit refresh repair and broader input-row selection as a separate improvement.

# Wide-to-long implementation plan

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d`. **Mode:** Design.  
**Companion:** [report.md](report.md), especially §4 (contract), §5 (provenance), and §8 (exact fixtures).  
**Execution status:** proposed work only; repository code, tests, and browser flows were not run.

## Decisions to carry into implementation

| IDs | Decision | Acceptance consequence |
| --- | --- | --- |
| WL-01/02 | One `UnpivotStep`, explicit ordered selected/kept fields, mappings, stable output IDs/labels/type. | No wildcard selection; schema available with no rows. |
| WL-03/04 | Preserve scalars; keep missing pairs by default; explicit type/unit review. | Zero and false survive; invalid numeric text stays inspectable; known type/unit conflicts fail. |
| WL-05 | A long row is an immediate input row × selected field. | Value origins, raw memberships, and related-record navigation remain distinct. |
| WL-06/07 | New query/view on first Apply; complete UI and persistence in M1. | Bindings carry over; charts/filters do not; preview/cancel do not save anything. |
| WL-08 | Start with cumulative limits of 100,000 candidate pairs and 2,000,000 projected cells per evaluation. | Preflight before allocation, identical direct/worker behavior; calibrate with actual runtime evidence. |
| WL-09 | Explicit refresh repair and optional broader selection in M2. | M1 already blocks missing fields and ignores added fields correctly. |
| WL-10/11 | Explore multiple value families and global unit metadata separately. | Neither is a prerequisite for a useful M1. |
| WL-12–15 | Defer patterns/reverse pivot; avoid visual-only reshape, implicit coercion/identity, and new execution/catalogue infrastructure. | Preserve ordinary prepared-long sources and the existing evaluator. |

`docs/research/DIRECTION.md` supersedes the prior demand gates in DP-04/DP-06. Use React, TypeScript, and pnpm. Keep the one-developer/one-server/one-client/one-version model. Do not expand plans #507, #514, or #517.

## M1 — Complete saved single-measure unpivot

**Release outcome:** an analyst can choose fields from a project query, review counts and grain, open a long view, inspect an exact value origin, edit/remove the step, and restore the project with its charts and selections intact.

The batches below are implementation order within one complete milestone. An evaluator-only batch is not the release.

### A. Contract, schema, evaluator, and bounds

**Files:** `packages/explorEDA/src/types/AnalysisProject.ts`; `lib/analysis/evaluateProject.ts`; proposed `lib/analysis/unpivot.ts`. Paths after the first are relative to `packages/explorEDA/src/`.

- Add `UnpivotStep` exactly as scoped in report §4: `keep`, ordered `columns`, independent output IDs/labels, value family/unit, missing policy, and authored compatibility declaration.
- Construct the output schema before iterating rows. Known type conflicts fail; unknown/calculated/grouped field types require an explicit compatible family. Per-cell invalid values are retained.
- Emit rows in input-row order, then selected-column order. Key rule: step ID plus JSON `[inputRow.key, selectedFieldId]`.
- Keep raw scalar values. Drop only `isMissingValue` pairs when explicitly requested. Preserve current aggregate-count and query-filter semantics.
- Add stage pair/missing counters and truthful `rowUnit`; reserve pair/cell budget before allocation. Do not serialize cached long results.
- Keep `AnalysisField.origin` on the unpivot step; resolve its possible inputs through the saved selection. Do not assign one source-column origin to the entire value field.

**Important tests:** extend `test/lib/analysis/evaluateProject.test.ts` or add focused `unpivot.test.ts`; add `test/fixtures/repeatedMeasurements.ts`. F1 must yield **10 pairs, 8 non-nullish values, 5 finite measurements, sum 28.5**; drop yields **7 pairs** and the same sum. Zero-row schema, selected order, duplicate IDs, type/unit conflicts, reserved/colliding outputs, schema drift, and exact limit boundaries are required.

### B. Exact origins and worker consistency

**Files:** `types/AnalysisProject.ts`; `lib/analysis/evaluateProject.ts`; proposed `lib/analysis/cellOrigins.ts`; `lib/analysis/useAnalysisEvaluation.ts`; `analysisWorkerProtocol.ts`; `components/project/sourceRowIdentity.ts`; `analysisRowKeys.ts`.

- Store immediate input references for expansion/grouping, exact relationship outcomes for lookup/expansion, and an input-cell reference for unpivot. Include unmatched, ambiguous, and unavailable-source outcomes.
- Resolve source presence from the applied raw snapshot; calculated dependencies from `parseExpression(...).dependencies`; aggregate evidence from immediate group membership and evaluated contributors. Add count contributor metadata using existing count semantics.
- Interpret lineage metadata only at its creating stage. Resolve aliases through the applied definitions; do not infer suppliers from source ID or parse keys for lineage.
- Retain `appliedProject`/`appliedTables` beside the completed evaluation and `appliedBindings`. Pending inspection uses that same snapshot. Existing stale-reply rejection remains in force.
- Keep pair selection exact. Source-record exploration opens an explicitly filtered source view without changing the long view. Do not rely on `AnalysisView.selectedRowKeys` alone to filter charts.

**Important tests:** `test/lib/analysis/selectionIdentity.test.ts` plus focused cell-origin/worker tests. Cover F5–F7: calculated **[11,13]**, two-alias lookup **[20,25]**, expansion **[1,2,3,4]**, grouped **[4,6]**. Assert exact cells and membership sets, unavailable suppliers, stale-worker snapshots, unique-key reorder, and documented positional instability.

### C. Project JSON, text, and no-row restore

**Files:** `lib/analysis/projectFile.ts`; `lib/dsl/project.ts` and `project.test.ts`; `lib/project/analysisText.ts`; public exports and referenced compilation/host modules after inspecting the checkout.

- Update both project-file kind allowlists and the `fieldsAt` walk; replace its implicit aggregate fallback with explicit branches for unpivot/aggregate.
- Reuse/factor unpivot validation across entry points. Validate downstream calculation/filter/group/relationship references against stage schemas when editing/removing; empty evaluator success alone is insufficient.
- Add the report §7.4 `unpivot @id { column … }` syntax to `compileStep`/`stepLines`; retain `from=` and query `output=`. Save list order, literal mappings, output IDs, types, units, and missing policy.
- Preserve existing special-value encoding, selected-view export, and version `1`. Do not add migration coexistence or a transform cache.
- Inspect `compileViews`: `analysisText.ts` currently passes row data, so ensure an empty long result supplies enough explicit schema to retain chart bindings.

**Important tests:** exact JSON and project-text roundtrips; export/compile/export stability; quoted/Unicode/comma names; absent versus own undefined; NaN/Infinity; selected-view dependencies; chart/row-key restore; empty-result analysis text. Existing projects must still roundtrip.

### D. Authoring, edit/remove, and inspection

**Files:** `components/project/stepEditing.ts` and `.test.ts`; `queryEditing.ts`; `ProjectQueryPanel.tsx`; `QueryFlow.tsx`; proposed `UnpivotStepEditor.tsx` and test; `QueryStageRows.tsx`; `components/ExplorEdaProject.tsx`; `settingsCompatibility.ts` as needed.

- Add **Unpivot columns…**, explicit column/keep pickers, ordered mappings, output labels/type/unit review, missing policy, and a same-evaluator preview labeled **First 25 of N rows**.
- **Open long table** copies the query with fresh step IDs, preserves persisted output field IDs, carries bindings, appends the step, updates frame meaning, and opens a fresh view with no copied settings/selections. One host operation; no mutations during preview/cancel. Disable when the host cannot open a view.
- Add Edit/Remove and full downstream validation. Labels/order preserve identity. Value-family/unit/meaning changes and explicit field rebinds take **Open revised long table** in M1; semantic compatibility cannot be inferred automatically.
- Preserve incompatible chart settings and the existing reset/recovery path. The callback updates one view; do not promise atomic sibling-view rewrites. Unresolved row filters stay visible and do not widen.
- Add **Value origin** beside the distinct original/related-record sections. Distinguish repeated row labels with the mapped measurement name. Use applied snapshots for inspection.

**Important tests:** keyboard selection/order; accessible errors; zero preview callbacks and one Apply callback; cancel/focus return; copied binding/field-ID preservation; removal dependencies; settings hold; exact pair selection; separate value origin versus related records; read-only/host-unavailable behavior.

### Documentation, runnable example, and release gate — part of M1

- **Docs page:** `apps/demo/src/docs/pages/project-folders.mdx`, **Unpivot repeated measurements** and **Query steps**. Explain grain, counts/missingness, units, source tracing, fixed refresh selection, and positional identity limits.
- **Runnable example:** add `apps/demo/src/demos/repeatedMeasurements.ts` using the observed project/tables/views/queryPresets shape; register proposed `/examples/repeated-measurements` in `examples.ts` and `coverage.ts`. Add required `query:unpivot` coverage. Keep the existing featured example.
- **Documentation wiring:** inspect `apps/demo/src/docs/catalogue.ts`, `live/examples.ts`, and `targets.ts` referenced by the guide; their implementations were not supplied. Wire the example and scripted steps to the existing system.
- **Browser checks:** real pointer and keyboard at **1280, 783, 390 px**. Exercise select/order/map, empty and invalid values, active filters, trace, edit/remove, saved restore, pending/error states, Escape/focus return, long names, viewport bounds, and reachable actions. Check light and dark tokens; only tables may need horizontal scrolling.
- **Main risk:** incorrect grain or value provenance, especially after grouping and while refresh is pending. F1/F5–F8 and no-row restore are acceptance gates.
- **Release:** minor changeset for the package feature. Keep docs/example in the same feature delivery; do not mark planned browser evidence as completed coverage.

## M2 — Explicit refresh repair and input-row selection

**Outcome:** review added columns without including them automatically; explicitly repair a removed field; deliberately select every current measurement for specified immediate input result rows.

- **Files:** `UnpivotStepEditor.tsx`, `ProjectQueryPanel.tsx`, `QueryStageRows.tsx`, `stepEditing.ts`, `queryEditing.ts`, `analysisRowKeys.ts`; a small `unpivotRefresh.ts` only if shared logic warrants it; repeated-measurement demo and coverage files.
- **Tests:** new columns stay inert until accepted; repair/cancel are atomic; changed IDs produce the expected new keys; type/unit/meaning changes follow the new-view rule; all-measurement selection uses input result keys, not duplicated business identifiers. Verify grouped-input selection and save/restore.
- **Docs:** **Refresh and repair** and **Selecting measurements or input rows** in `project-folders.mdx`.
- **Runnable example:** extend `/examples/repeated-measurements` with explicit refresh variants for a new occasion, renamed field, and duplicate business labels.
- **Browser checks:** select, repair, cancel, and restore at 1280/783/390 px with pointer and keyboard.
- **Main risk:** unnoticed population or selection expansion. Show the proposed pairs before acceptance.

M1 already has correct missing-field errors, inert added fields, and manual editing. M2 improves those interactions; it does not complete an unfinished M1 contract.

## Future implementation run sheet

These commands are for Codex after changes exist. None was run during this Design mission. Use the repository's shared timeout configuration; locate new test filenames before adding them to the focused run.

```bash
# Core evaluator, identity, editing, and project-text checks.
pnpm --filter exploreda exec vitest run src/test/lib/analysis src/components/project/stepEditing.test.ts src/lib/dsl/project.test.ts

# Add the new editor, cell-origin, project-file, and analysis-text tests to the
# focused run at their actual checkout paths. Then check library types.
pnpm --filter exploreda check-types

# Verify demo registration and text compilation after adding the example.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Start this checkout's server; exercise pointer and keyboard flows manually.
pnpm dev:agent

# Capture the example at the repo's 1280, 783, and 390 px defaults.
pnpm shot /examples/repeated-measurements --name repeated-measurements

# Run the documented docs verification path.
pnpm --filter demo build
pnpm --filter demo docs:verify

# Package feature release note; never run version/publish in this mission.
pnpm changeset:add minor "Prepare repeated measurement columns as a saved long-table query with value origins."

# Run once from one worktree before the implementation PR.
pnpm check
pnpm dev:agent --stop
```

`pnpm check` builds the package. If a separate demo TypeScript check is needed after adding public types, build the library first as the agent guide requires. Attach browser screenshots to the future implementation PR using the documented workflow; do not commit them.

## Final handoff status

- **Access:** passed; all 38 complete source files at the supplied baseline were read. The full file list is in [report.md §11](report.md#11-access-files-read-evidence-status-and-open-questions).
- **Checked facts:** existing types/evaluator, identity and parsing behavior, expansion/copy precedent, validation/text/worker/UI surfaces, docs/examples, prior decisions, and current primary sources.
- **Proposals:** all unpivot behavior, API/DSL additions, limits, acceptance fixtures, milestones, and commands above. No implementation or browser result is claimed.
- **Downloads:** [report.md](report.md), [implementation-plan.md](implementation-plan.md), [wide-to-long-design.zip](wide-to-long-design.zip).
- **Open questions:** calibrate the proposed resource limits; inspect omitted `compileViews`/exports/host wiring to fulfill no-row restore; refine unit-review copy within existing controls. Defaults are specified, so none requires a new demand gate before starting M1.
