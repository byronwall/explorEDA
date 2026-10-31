# Reuse an explicitly repaired entity source

Build a named repaired source with exact-record collapse and explicit whole-record choices.
Use it in existing source reads, relationships, and notebooks. Keep every original occurrence accessible.
Add ordered selection second. Add composite identity and relationship endpoints third.

This is a proposed plan, not approval to implement. Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Read the [summary](../../research/duplicate-repair-design-2026-10-31/README.md),
[local dispositions](../../research/duplicate-repair-design-2026-10-31/decisions.md),
and [original asset index](assets/pro-results/README.md).

## Product and semantic decisions

- Repair the full physical source. Chart filters and inspector searches change the displayed list only.
- Confirm what one output row represents. Preserve legitimate events through an event key or expansion.
- Compare all user fields, including types and property presence. Selected display fields do not define exactness.
- Omit technical fields only with positive metadata. A user field named `row_number` remains data.
- Emit one whole original value class. Represent every identical original copy; do not privilege one physical twin.
- Separate logical entity identity, full-record value class, and snapshot-bound original occurrence.
- Keep represented, excluded, and unresolved occurrence sets disjoint and complete. Excluded evidence is not numeric input.
- Use finite numbers, booleans, and nonblank strings as typed keys. Preserve nonblank text verbatim.
- Default missing, blank, absent, undefined, and nonfinite keys to review. Exclusion requires an explicit choice.
- Normalize signed zero for key identity. Preserve its sign in original records and exact-record comparison.
- A ready empty source can count zero. Missing evidence, unresolved groups, or stale acceptance are unavailable.
- Reorder preserves content-based choices. Content changes require an accepted new run before becoming current.
- Guard manual choices with the entire reviewed group multiset, including multiplicity, schema, and field presence.
- A changed key schema starts a new identity epoch. A new winner for the same entity keeps logical identity.

M1 accepts one physical input and one scalar entity key. Reject prepared chains and query-output inputs.
No general query graph, fuzzy merge, field coalescing, or relationship-local winner rule is required.

## M1: exact and manual repair, complete reuse

The analyst opens an ambiguous relationship, reviews key groups, selects whole records, and creates a repaired source.
The same action can redirect the selected relationship after validating its dependent queries.
A notebook immediately uses the accepted result and opens original evidence. Save and reopen preserve that result.

### Work order and files

1. Extend `packages/explorEDA/src/types/AnalysisProject.ts` with one bounded preparation definition and evidence references.
   Add small source-resolution, duplicate-repair, and evidence helpers under `src/lib/analysis/`.
   The output source owns its key and fields. `tables` continues to hold physical inputs.
   Store immutable accepted snapshots and decisions; preview state stays local.
2. Route `sourceFrame`, `lookupFrame`, and `expandedFrame` in `lib/analysis/evaluateProject.ts` through one source resolver.
   Also route `components/project/relationshipEditing.ts`, Schema previews, parameter options, and source navigation through it.
   Cache by immutable input and policy; include physical ancestors, accepted run, and availability in revisions.
   Extend `useAnalysisEvaluation.ts` and `analysisWorkerProtocol.ts` using the same evaluator and request-ID guard.
3. Add a compact repair editor beside `ProjectSchemaPanel.tsx` and the ambiguous relationship evidence.
   Extend `ProjectQueryPanel.tsx`, `QueryStageRows.tsx`, `queryEditing.ts`, and `sourceRowIdentity.ts` where needed.
   Show groups, full-record alternatives, conflict fields, exact count units, affected consumers, and original-record actions.
   Resolve old occurrence references against their immutable snapshot, never the current array position.
4. Extend the existing `ExplorEdaProject.tsx` project-change operation to carry the desired definition and evidence together.
   A host that exposes Apply must persist both. Use one acknowledged operation and one user edit checkpoint.
   In `apps/app/src/saver.ts`, add a dependent write operation with an evidence-success barrier.
   Finish older project writes before this operation; prevent stale queued definitions from overwriting it.
   Recheck the preview's project and source revisions before writing the project pointer.
   Publish the desired project/evidence state after saving. Check that desired state after acknowledgement, not the old base.
   A source change during the final write leaves valid historical evidence and unavailable current results.
   Keep this operation local and direct; do not add a generic transaction or retry framework.
5. Extend `lib/analysis/projectFile.ts`, `lib/dsl/project.ts`, `lib/project/folder.ts`, and `lib/project/writeFolder.ts`.
   Choose the new format discriminator during implementation. Validate preparation and accepted-evidence references together.
   Extend the existing scalar codec for signed zero and preserve absent versus explicit undefined properties.
   Save immutable evidence before its project pointer; a failed evidence write prevents the pointer write.
   Include prepared source, physical ancestor, and evidence in selected-view and folder exports.
   Recognize prepared sources before the folder's no-path/raw-inference branch.
   Promote analysis-local source declarations when the project-level repair depends on them.
6. Extend `lib/notebook/readNotebook.ts` to retain full evaluation, availability, and record identity.
   In `apps/app/src/ProjectWorkspace.tsx`, evaluate the notebook against current project state after Apply.
   Adapt `AnalysisChartContext.tsx`, `ExplorEdaNotebook.tsx`, `NotebookFindings.tsx`, and `lib/notebook/findings.ts`.
   Keep `compileNotebook.ts` focused on chart compilation, not source execution.
   Guard both live and static reducers before unavailable data can become zero.
   Finding and open-record revisions include accepted evidence even when the numeric answer does not change.

Retargeting can invalidate a later relationship's field origin while keeping its visible alias.
Validate the whole affected query. Initially block an incompatible retarget and permit source-only creation.
Automatic cloning or repair of downstream relationships is deferred.
Also preserve ambiguity when an alternate target field remains nonunique.

Use the current project API and one deployed format. Do not add Pro's legacy adapters or v1-normalization layer by default.
If saved-file migration becomes a concrete requirement, resolve that product decision separately before adding support.
The new reader must diagnose unsupported syntax. A new header cannot make an older reader reject unknown children.

### Exact acceptance

Use the original [fixtures](assets/pro-results/duplicate-repair-design-2026-10-31/duplicate-key-repair/fixtures.json) as a design oracle.
Fixture aliases such as `c1` identify snapshot occurrences, not durable product IDs.

| Case                 | Required outcome                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DR-F01               | Eight customer occurrences become A10/B25/C35/E50. Represent `{c1,c2,c4,c6,c7}`; exclude `{c3,c5,c8}`. Preserve all eight.                                                          |
| DR-F01 relationships | Six order inputs remain six lookup rows. Raw matched/unmatched/ambiguous/extra fanout = `4/2/4/4`; repaired = `4/2/0/0`. Inner/keep-unmatched expansion changes `8/10` to `4/6`.    |
| DR-F01 populations   | Order sum `90`; credit over order rows `80`; credit once per matched customer `70`; full repaired customer credit `120`.                                                            |
| DR-F02/F14/F15       | Hidden conflicts, number/string, null/undefined/absent, and signed zero remain distinct. Only marked technical fields can be omitted.                                               |
| DR-F04/F06           | Eleven typed keys remain distinct. DR-F06 excludes eight invalid occurrences and retains valid `0` and `false`: two outputs. Add a separate invalid-only case expecting zero.       |
| DR-F09               | Reorder keeps the accepted result ready. Changed group membership or multiplicity makes its manual guard stale. Old snapshot ordinal 5 still opens `c6`, not current-position `c3`. |
| DR-F10/F11           | Missing evidence/dependency and unresolved repair are unavailable. A source unique by ID can still have an ambiguous email lookup.                                                  |
| DR-F12               | x:{10,20}, y:{5}: entity count `2`, measured count/sum/average unavailable. x:{10,10}, y:{5}: `2/2/15/7.5`.                                                                         |
| DR-F13/F16           | Project, text+sidecars, folder, and selected-view saves preserve originals, roles, identity, and dependencies. Cancel emits none; Apply creates one project edit.                   |

Add focused tests for repeated references to the same JavaScript row object, worker parity and stale replies,
failed evidence/pointer writes, stale preview, and a source changing during the final write.
Check an already-open notebook after Apply, unavailable counts, and unchanged numeric values with changed evidence.
Check the chained relationship-origin block and source-only alternative.
No current runtime test proves these new behaviors; these are implementation acceptance requirements.

### Docs, example, and risk

Ship `apps/demo/src/docs/pages/duplicate-key-repair.mdx` with the full review, Apply, refresh, and evidence flow.
Update `project-folders.mdx`, notebook guidance, and package embedding docs in this milestone.
Register a runnable eight-customer/six-order project and notebook in the demo catalogue and coverage.
Include a resettable conflicted start, manual choices, and the four correctly named populations above.
Verify pointer and keyboard operation at 1280, 783, and 390 px. Follow the existing compact side-panel controls.

Main risk: a correct-looking winner table hides lost evidence, stale notebook data, or changed aggregation grain.
M1 completes only when values, exact occurrence sets, availability, saving, and the notebook agree.
Internal commits can be separate; do not advertise a saved repair without its evidence and consumer path.

## M2: explicit ordered selection

Add authored lexicographic order fields to the same resolver and editor.
Use shared `valueParsing.ts` numeric/date rules with a saved date preset.
Call date extrema Latest/Earliest and numeric extrema Highest/Lowest.
Text order accepts nonblank strings and uses unchanged UTF-16 code-unit order; never locale order or coercion.
Distinct records tied at the best tuple remain unresolved. Exact twins share one selected class.
Invalid ranking values block a conflicting group unless explicitly excluded. Singletons need no comparison.
Numeric epoch interpretation remains deferred.

Extend the M1 helpers, editor, evidence validator, and DSL order declarations.
Keep worker, notebook, and folder execution on the same source path.
DR-F07/F08 check date extrema, equal instants, raw/parsed distinctions, invalid values, and text ordering.
DR-F01 ordered B selects 25; tied C needs a manual choice of 35.
DR-F09 later B28 proposes credit totals `83/73/123`; order sum stays `90`. Acceptance activates them.
Round-trip order-list sequence, directions, parsers, exclusions, and tie decisions.

Ship ordered-selection and refresh sections in the repair docs with the corresponding runnable project/notebook variant.
Verify the full flow at all three widths. Main risk: a Latest label conceals text order or input-order tie-breaking.

## M3: composite identity and relationships

Generalize key fields to ordered typed tuples on source grain and both relationship endpoints together.
Also cover explicit lookup/expand input overrides, field origins, preview counts, codecs, text, and saved selections.
One boundary helper can treat a scalar field as a one-component tuple.
Validate equal endpoint arity, distinct existing fields, and complete origin correspondence.
Never concatenate components with delimiters. Reject scalar parameter pickers for tuple keys until separately designed.

Extend `AnalysisProject.ts`, the source/key helpers, evaluator, identity and relationship editors, and serializers.
DR-F05's five delimiter/type-collision tuples produce five entities and five exact matches.
DR-F03 keeps E1/E2 as two events with amount `20`; customer expansion yields two rows.
A deliberately partial customer relationship stays ambiguous; composite entity identity does not repair that join.
Key-schema changes invalidate old selection identity instead of attaching it to another group.

Ship composite-key and event-grain docs, scalar/composite syntax examples, and runnable tenant/customer and event notebooks.
Verify pointer and keyboard flows at all three widths.
Main risk: a remaining scalar consumer silently drops one key component.

## Implementation checks

Run targeted semantics, evidence, persistence, worker, notebook, and editor tests using `@repo/test-config` limits.
Keep existing evaluator, entity-grain, and source-identity tests passing.
Run affected type checks, demo coverage/text tests, docs checks, and docs browser verification.
Build library types before checking demo imports that need them.
Run `pnpm check` once before each implementation PR and add its package changeset.
Capture UI evidence with `pnpm shot` or the app screenshot script for folder flows.

This research PR changes docs and preserved assets only. It does not require full `pnpm check` or a changeset.
