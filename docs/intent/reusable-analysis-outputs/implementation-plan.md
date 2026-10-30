# Reuse grouped results across analyses

Build a live reference from one query to another query's output. Define **Experiment means** once, then plot, filter, and summarize its experiment rows. Trace each answer through its experiment operands to the original measurements.

Status: proposed implementation, ready for review. Build dispositions place work in this plan; they do not approve implementation.
Baseline: `5594c95690859e8ce456aa3228fa9265ba686d12`, refreshed October 30, 2026.
Read the [research summary](../../research/reusable-outputs-design-2026-10-30/README.md), [checked evidence](../../research/reusable-outputs-design-2026-10-30/evidence.md), and [original asset index](assets/pro-results/reusable-outputs-design-2026-10-30/index.md).
The [full Pro plan](assets/pro-results/reusable-outputs-design-2026-10-30/implementation-plan.md) supplies detailed acceptance cases.

## Contract

- Add a root `ResultStep { id, kind: "result", queryId }`. It reads the producer's designated output.
- Keep `AnalysisProject.queries` as the definition owner. Reuse current frame operations and reducers.
- Distinguish source occurrences, result rows, immediate measure operands, and distinct original members.
- Qualify trace addresses by query instance, revision, stage, row, and field. Keep physical relationship origins too.
- Derive grain and output field types structurally, including empty and all-invalid results.
- Producer query filters change inputs. Consumer query filters select result rows. Chart selections do not feed producer queries.
- Keep one coherent applied result and its dependencies during refresh. Resolve old row keys only against that snapshot.
- Treat missing inputs as unavailable. A valid empty table remains an ordinary successful result.
- Save definitions and references. Recompute rows and trace data after reopening.
- Keep current version 1 and one deployed reader. Validate new syntax explicitly; no migration framework is needed.

## Exact proof

Use the original [typed fixture](assets/pro-results/reusable-outputs-design-2026-10-30/proof-fixtures.json), not a CSV conversion.

| Experiment | Raw readings                  | Members | Numeric count | Sum         | Mean        |
| ---------- | ----------------------------- | ------- | ------------- | ----------- | ----------- |
| A          | `0, 20, null`                 | 3       | 2             | 20          | 10          |
| B          | `20, 40, 60, "n/a", ""`       | 5       | 3             | 120         | 40          |
| C          | `null, " ", "Infinity", true` | 4       | 0             | unavailable | unavailable |

The equal-experiment mean is **25**. The pooled measurement mean is **28**, from `140/5`.
Existing present-value counts total 10; `140/10=14` is not the pooled mean.
Add numeric eligibility only to query count measures with a field. Preserve current `count(field)` semantics.
Use `numericExclusionReason` and `parseNumber`; the supplied Python oracle is not the production parser.

Filtering completed means at `>=20` selects B without changing its mean of 40.
A numeric input filter `<=20` before grouping leaves A=10 and B=20; equal=15 and pooled=`40/3`.
Changing B's 60 to 90 gives B=50, equal=30, and pooled=34.
Keep C inspectable with four members and zero eligible readings.
An empty keyed grouping emits zero rows. An empty global summary emits one row with count zero and unavailable numeric statistics.

Overlapping category groups must retain their arithmetic too: Red=120 and Blue=100 sum to 220 over three memberships.
Their unique source orders are two records totaling 120. Deduplicating navigation members must not change the reduced value.

## M1 — Embedded projects and authored text

Ship parameter-free producer references in React projects and the demo. Users can create two consumers and trace both levels.

Change `types/AnalysisProject.ts`, `lib/analysis/evaluateProject.ts`, worker protocol/hook, and `lib/analysis/projectFile.ts` under `packages/explorEDA/src/`.
Add result roots, qualified immediate lineage, count contributors, numeric eligibility, structural grain/types, and reachable dependency validation.
Reject duplicate query IDs, cycles, missing producers, removed fields, and unavailable sources with named errors.
Keep unrelated valid query branches usable. Use request-local memoization; separate mounted views need no global once-only guarantee.

Extend `components/ExplorEdaProject.tsx`, `AnalysisChartContext.tsx`, `project/QueryStageRows.tsx`, `ProjectQueryPanel.tsx`, and `queryEditing.ts`.
Use completed metadata for rows, scope labels, counts, and traces. Preserve matching immutable tables while showing previous results.
Disable stale capture and selection changes. Preserve authored predicates; invalidate transient row selections when result revisions change.
Show members and measure operands separately. Existing related-record browsing and whole-source opening are not exact-contributor actions.

Extend `lib/dsl/project.ts` with `result @step query=producer` and `eligibility=numeric`.
Update portable JSON validation and selected-view export to include transitive producer queries, physical sources, relationships, and parameters.
Include selected-view binding definitions and parameter-option sources. Preserve omitted tables as omitted, distinct from empty arrays.
Retain physical origins for grouped keys so lookup after a result read still works.

**Acceptance:** producer A/B/C; consumer mean25; consumer high means B40; pooled28; definition edits propagate to both.
Test two-level field-specific traces, overlapping members, typed keys, duplicate occurrences, and producer/consumer local-step ID collisions.
Test empty versus unavailable, cycles, declaration order, removed fields, output types, source reorder, and reversed worker completion.
Export only the downstream view, reopen, and reproduce25/28 with full lineage. Old text fixtures must still round-trip.
Exercise the guarded pooled formula with the actual Calculator when no groups or only C remain.

**Docs/example:** add `reusable-results.mdx` to demo docs, register its live example, and add API guidance to the package README.
Add `apps/demo/src/demos/reusableExperiments.ts`, register `/examples/reusable-experiments`, and update example coverage.
Show experiment means, summary, and high means together. Docs and examples ship in M1.

**Risk:** correct numbers with flattened or stale provenance. M1 requires trace and source-reorder proof before release.

## M2 — Compact authoring and explicit inputs

Add a focused grouped-result editor inside the Query panel. Reuse field pickers, reducers, preview, and host callbacks.
The form creates ordinary queries. Preview row grain, output fields, eligible counts, and unavailable values.
Show direct uses before editing a shared definition. Keep invalid drafts separate from applied definitions.

Add literal `ResultStep.bindings` and `bind.<id>=<scalar>` syntax. Bindings belong to that reference in the consumer definition.
Determine required values from reachable producer filters. Nested references own their own bindings; no ambient values cross them.
Reject missing, unknown, unused, invalid-type, and nonfinite values. Capture only relevant completed `appliedBindings` while ready.
Keep typed values and canonical key order. A quoted `$phase` is literal string data.
Keep **Copy this definition** independent for its own steps, with upstream references visibly retained.
Prevent silent producer deletion while consumers remain. File edits retain repairable broken references.

**Acceptance:** phase-prefixed baseline/followup fixtures contain24 occurrences. B1/B2 and C start25/28.
Changing B's reference to followup gives B1/B2=30/34 while C stays25/28. Direct producer-view input edits change neither reference.
Shared producer edits affect both bound instances. Test copy semantics, cancel, rename, removed fields, input types, and pending capture.

**Docs/example:** extend `reusable-results.mdx`, project text/API examples, and `/examples/reusable-experiments` with create/edit/reuse and phase inputs.
**Risk:** mistaking a reference edit for a single-view change. Keep its consumer ownership visible.

## M3 — Local folders

Extend `lib/project/folder.ts`, `writeFolder.ts`, and `apps/app/src/ProjectWorkspace.tsx`.
Wire view creation, source availability, canonical project definitions, and consuming analysis saves through the existing host.
Reuse the save ordering work in open PR #566 when available; inspect its final state before changing the saver.
Do not introduce another transaction system.

Initially allow cross-file references only to explicit queries with project-owned source definitions.
Use a clear project-owned-source prerequisite in this milestone. Guided source-declaration promotion can follow separately.
This avoids references to `implicitQueries` or `localSources` that the project serializer omits.
Do not move source data or rewrite unrelated analysis files. Do not promise comment preservation for reconstructed edited files.

**Acceptance:** save/reopen producer and both consumers with one canonical definition, then refresh to30/34.
Missing source files block dependent results; valid empty files succeed. Restoring sources recovers the result.
Test broken producer references, duplicate-key source reorder during trace, failed refresh, and implicit/local source restrictions.
Verify CLI and browser folder adapters through the shared app integration.

**Docs/example:** extend `project-folders.mdx` and `reusable-results.mdx`; add a runnable `apps/demo/public/reusable-experiments/` folder.
Include canonical `exploreda.eda`, experiment/summary analyses, and typed `data/measurements.json`.
**Risk:** saving references to definitions the writer omits, or presenting missing source data as successful empty data.

## M4 — Notebook sheets

Add a project-aware notebook wrapper using the same evaluator and trace bundle. Keep the generic data-array notebook API.
Change `lib/notebook/readNotebook.ts` to resolve its query without discarding provenance. Mount the wrapper in `ProjectWorkspace.tsx`.
Reuse notebook compilation, writeback, last-valid blocks, and sheet navigation. Diagnose conflicting query declarations.
All sheets use one query instance and grain. Parameterized producers work through a parameter-free wrapper with literal-bound references.
Keep notebook chart selections local and existing explicitly selection-bound findings intact.

**Acceptance:** both sheets retain three experiment rows, two plotted means, and C's unavailable mean.
Refresh B to50 and preserve the applied revision across sheets. Trace through the same operands and original members as project views.
Verify producer edits, conflicts, invalid blocks, missing parameters, writeback, save/reopen, and sheet keyboard navigation.

**Docs/example:** extend `notebooks.mdx`, `project-folders.mdx`, and `reusable-results.mdx`.
Add `experiments.eda.md` to the M3 folder with distribution and coverage sheets over the same producer.
**Risk:** displaying correct flattened values while losing lineage or refresh after the initial notebook load.

## Local dispositions

These retain Pro's stable IDs. The reasons below are local integration decisions.

| IDs   | Disposition | Reason                                                                            |
| ----- | ----------- | --------------------------------------------------------------------------------- |
| RO-01 | Build       | Query-output references add the missing cross-query capability.                   |
| RO-02 | Build       | A compact editor can use ordinary query definitions.                              |
| RO-03 | Build       | Structural grain/types prevent result rows from posing as observations.           |
| RO-04 | Build       | Literal reference inputs keep ownership explicit without ambient coupling.        |
| RO-05 | Build       | Immediate qualified operands preserve multi-stage meaning and weights.            |
| RO-06 | Build       | Authored filters permit live reuse without selection feedback.                    |
| RO-07 | Build       | Matching numeric counts make pooled means explicit and correct.                   |
| RO-08 | Build       | A retained applied snapshot prevents stale keys from resolving into new rows.     |
| RO-09 | Build       | Canonical recipes and transitive exports support reopening without result caches. |
| RO-10 | Build       | Embedded projects provide the first useful slice; folders and notebooks follow.   |
| RO-11 | Build       | A notebook adapter restores trace and refresh across its sheets.                  |
| RO-12 | Build       | Uses and honest copy semantics explain shared editing.                            |
| RO-13 | Explore     | Predicate capture needs a bounded exact mapping before inclusion.                 |
| RO-14 | Explore     | Dependency cloning is optional; local copy already has a clear contract.          |
| RO-15 | Defer       | Arbitrary chart output needs separate bin/subtotal/generated-row semantics.       |
| RO-16 | Defer       | Cross-grain selection propagation needs its own direction and feedback design.    |
| RO-17 | Defer       | Mixed-grain sheets and parameter forwarding are separate capabilities.            |
| RO-18 | Avoid       | A universal engine, graph editor, and cache platform do not serve this scope.     |
| RO-19 | Avoid       | Changed legacy count meaning or flattened weights would change answers silently.  |
| RO-20 | Build       | Each slice must include its docs, runnable example, and interaction proof.        |

## Verification and remaining choices

Use targeted evaluator, entity-grain, worker, DSL, portable-file, folder, and notebook tests for the milestone being built.
Run demo coverage/text and docs checks for each new example. Use shared test time limits.
Verify real pointer and keyboard flows at1280,783,390 pixels: scope stays visible, tables scroll internally, actions remain reachable.
Test Enter/Space pickers, Escape/focus return, Alt-Enter tracing, invalid drafts, long labels, pending, failure, and legitimate empty states.
Take implementation screenshots with `pnpm shot`; use `scripts/app-shot.mjs` for the folder host.
Run `pnpm check` once before each code PR and add a minor changeset for the new package capability.

Trace memory limits remain unmeasured. Keep one current/previous snapshot; add transfer optimizations only if measurements require them.
Exact internal type names and module factoring remain implementation choices. No new Pro round or outside-demand gate is required.
