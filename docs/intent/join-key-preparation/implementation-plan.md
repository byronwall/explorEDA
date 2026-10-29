# Reusable join-key preparation

Build named keys owned by a source. Let authors review changed matches before they apply a convention.
Keep original records and entity keys unchanged. Ship text preparation, integer identifiers, then composite keys.

Status: proposed, unbuilt. No feature or browser acceptance has run.
Source review: `95832bd473884aeae23453af0888b4ca5187820d`, October 25, 2026.
Read the [research summary](../../research/join-key-2026-10-25/README.md) and [Pro conversation](https://chatgpt.com/c/6ade5df0-561c-83e9-ba33-402c8fd09cb7).
Build dispositions include work in this plan. They do not approve implementation or release.
Category mappings, wide-to-long, ordered difference, and parameterized notebooks remain separate unbuilt proposals.

## Contract

Add optional `joinKeys` to `SourceDefinition` in `packages/explorEDA/src/types/AnalysisProject.ts`.
Each definition has a stable ID, name, and ordered components: raw `fieldId` plus selected transforms.
M1 permits one component; M3 permits several. Definitions cannot reference another key or a query output.
A relationship endpoint selects either `fieldId` or `keyId`, with its `sourceId`.
Keep keys separate from ordinary columns, source rows, and `entityKey`.

For a prepared relationship, store an explicit input binding on lookup/expand:
`{ side: "from" | "to", fieldIds: string[] }`.
The fields follow component order and identify one occurrence of that source in the current frame.
Resolve a current raw consumer before changing its endpoint. Preserve its direction and chosen alias in the new binding.
Never select the first new eligible alias. Require repair when a component is absent or ambiguous.
Existing raw relationships keep their current stored form and matching behavior.
Do not add version migration machinery or support several deployed readers.

Add an introducing step ID to source-field origins.
Keep selected source references by occurrence in transient result evidence.
This distinguishes two aliases of one source even when their prepared values are equal.
Source/lookup/expand establish occurrences; filter/calculate retain them; aggregate combines references within each occurrence.
An ambiguous lookup has candidates but no selected target occurrence.
Do not join once per aggregate contributor. A grouped row can match only when all raw components survive as group fields.
No saved occurrence maps, prepared arrays, indexes, or review snapshots belong in project files.

Use one small preparation and matching path for Schema, query evaluation, and inspection.
Target values come from raw target rows. Input values come from the bound frame fields.
Index original row positions and references, not object identity or printed prepared values.
Keep every supplied occurrence, including repeated object instances and duplicate entity IDs.
Use focused functions; split modules only when responsibilities justify them.

| Operation             | Rule                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| M1 text preparation   | Select a subsequence of trim → NFC → ASCII lowercase. No operation starts enabled.                                 |
| Types                 | Text operations change strings only. Numbers and booleans keep their types.                                        |
| ASCII lowercase       | Change A–Z only. The label must name this limit.                                                                   |
| NFC                   | Canonical normalization; no compatibility folding or accent removal.                                               |
| Prepared eligibility  | Null, undefined, NaN, infinities, and empty text cannot match. Whitespace stays literal unless trim removes it.    |
| Raw eligibility       | Preserve existing typed equality, including literal empty strings and infinities. Null/undefined/NaN do not match. |
| Failure               | Preserve the row and raw value; show a reason. Never fall back to the raw key or match failure sentinels.          |
| M2 integer identifier | Accept safe integer numbers or whole text matching `[+-]?[0-9]+` within ±9007199254740991. Trim only if selected.  |
| M3 tuple              | Equal ordered length and typed components. Any unavailable component makes the tuple unavailable.                  |

Put raw identifier operations in `lib/valueParsing.ts`, with a distinct identifier contract.
Do not use measurement parsing or missing-category equality as join equality.
Reject duplicate/unknown/out-of-order transforms, missing fields/keys, mixed occurrences, wrong arity, and calculated-origin components.
Do not parse a date-looking identifier as a date.

Use complete supplied-source matched multiplicity for cardinality review.
Many-to-one permits at most one TO candidate per FROM record. One-to-many checks the reverse. One-to-one checks both.
Many-to-many permits both multiplicities. Unmatched duplicate buckets are warnings, since they create no pairs.
An incompatible authored change requires an explicit declaration change in the same Apply transaction.
A source refresh reports a conflict without rewriting the declaration or dropping records.
Lookup keeps one parent and leaves ambiguous target fields unavailable. Expansion emits every pair.
Changing cardinality never changes a lookup into an expansion.

## M1 — Author, review, and reuse text keys

Outcome: create a key in Schema, review exact consequences, apply once, inspect originals, undo, save, and reopen.
The same definition works on either relationship endpoint and in reverse traversal.

1. Extend project types and validation. Integrate `sourceFrame`, `relationshipSide`, `lookupFrame`, and `expandedFrame` in `lib/analysis/evaluateProject.ts`.
   Share endpoint resolution with `projectFile.ts::fieldsAt`, `queryEditing.ts::relationshipDirection`, and `stepEditing.ts`.
   Keep existing raw memberships and result-key construction. Definitions already participate in the evaluation revision.
2. Replace the independent matching path in `components/project/relationshipEditing.ts::countMatches`.
   Route `QueryStageRows.tsx::relatedRecords` through the same contract.
   Show selected originals, ambiguous candidates, and other related records separately.
   Related child traversal must not enlarge contributor counts.
3. Add key editing and review to `ProjectSchemaPanel.tsx` and `QueryRelationshipBuilder.tsx`.
   Use compact extracted components if needed. Update `SchemaInspector.tsx`, `SchemaDiagram.tsx`, and `lib/schema/schemaGraph.ts`.
   Diagram edges must reach the key item. Current graph filtering assumes raw endpoint fields and would otherwise omit prepared edges.
4. Keep a local draft with its base project and table snapshot.
   Compare Saved and Draft on that same snapshot. Invalidate review immediately after a relevant source or definition change.
   Apply key, endpoints, repaired bindings, and chosen cardinalities in one `onProjectChange({ project, view })` callback.
   Show all dependent relationships/queries and only the views known to the host.
   Cancel/Escape makes no project change. An unused key can save without an opposite endpoint.
5. Complete JSON, text, folder, selected-view export, and notebook consumption.
   Update `lib/analysis/projectFile.ts`, `lib/dsl/project.ts`, `lib/project/folder.ts`, and `writeFolder.ts`.
   Shared definitions stay in project text; analysis-local sources retain their definitions in their owning file.
   Preserve raw source file bytes and inferred short declarations when only a key changes.
   `analysisText.ts` and `readNotebook.ts` use the evaluator. Notebook writeback remains chart-only.
   Current notebooks pass empty bindings; parameterized notebook work is not a prerequisite.
6. Check `apps/app/src/ProjectWorkspace.tsx`, its save path, and demo project callbacks.
   The current app marks shared/local definition files dirty and owns view state.
   Prove one undo step for Apply and exact save/reopen. Do not add a host-wide hidden-view rewrite protocol.
7. Ship `apps/demo/src/docs/pages/join-keys.mdx`, folder/notebook syntax updates, and the `join-key-preparation` example.
   Register catalogue and coverage entries. Use typed JSON source files and a runnable folder/notebook example.
   Link the full project example from docs: current inline `LiveExampleSpec` accepts one data file, not project tables.
   Do not add an inline renderer merely to meet this milestone.

### Review and applied state

Keep source scope distinct from query-stage scope. A stage uses current input occurrences and the full target table.
Before-filter and after-filter counts describe different stages. They cannot replace source-wide cardinality evidence.
Separate pre-existing duplicate raw keys from distinct raw values that become one prepared key.
Both can occur in the same bucket. Show exact original IDs and raw/prepared typed values on both sides.

Let `N` be inputs, `d(i)` candidates, `M` matched inputs, and `P = sum(d(i))` pairs.
Unmatched inputs are `U = N - M`; ambiguous inputs have `d(i) > 1`.
Lookup emits `N`; expansion emits `P`; keepUnmatched emits `P + U`; extra expansion rows are `P - M`.
Also show eligible rows, distinct keys, and matched target records with their units.
Do not label row ambiguity as a count of ambiguous keys.

Show full counts and bounded, labeled evidence pages. Paging must reach every exact member.
For the same populations, count common pairs by joint `(oldKey,newKey)` buckets on each side.
Added pairs = new pairs − common; removed pairs = old pairs − common.
This avoids allocating a Cartesian product merely to preview it.
If an edit changes earlier query stages, reevaluate both prefixes before comparing that stage.
Do not present source-scope deltas as proof of downstream output changes.

`folder.ts` currently puts empty arrays in failed-read slots and also records `missingSources`/`problems`.
For prepared-key review, the app must forward that existing availability evidence separately from tables.
Use a small source-availability input at this boundary; do not change the folder table representation for this feature.
An embedded host's absent table means unavailable; a present empty array means supplied empty rows.
An unavailable affected source blocks semantic Apply, preserves the draft, and permits saving existing definitions.
Nonsemantic renaming needs no completed match review.

### Worker and selection boundary

`useAnalysisEvaluation.ts` starts requests in an effect and retains completed rows while pending.
Track the inputs associated with completed results and compare them synchronously with requested inputs.
A mismatch disables old trace, selection, and original-record actions before the next effect.
Keep displayed evidence bound to the applied project/tables/bindings; never resolve old references against refreshed arrays.
Update `analysisWorkerProtocol.ts` only as needed for review requests. Use the same matcher in direct and worker paths.
Late results cannot enable Apply. Existing read-only behavior permits inspection, so readOnly alone is not this guard.

Local review narrows Pro's proposed selection bookkeeping:
For a query that uses prepared keys, bind exact selections and inspection to the mounted applied generation.
After a new evaluation or reopen, keep them visibly unresolved until an explicit new selection.
This includes stable IDs; a surviving lookup parent can have changed target evidence.
Do not revive a saved selection from a host echo, a layout callback, or selection of another row.
Use one generation boundary, not per-key source-array maps or action-provenance tracking across the store.
Wire `analysisRowKeys.ts` decoding and the component's reported/rendered settings to enforce this rule.
Read unresolved counts from runtime decoding. Preserve ordinary field filters and unaffected raw-only query behavior.
The cost is explicit reselection after reevaluation, including a pure reorder. Document it.

### Fixture and proof

Use unique string `id` fields as entity keys. `code` is the join field; amounts remain unchanged.

| ID  | Left code    | Amount | ID  | Right code   |
| --- | ------------ | ------ | --- | ------------ |
| L1  | number 7     | 10     | R1  | number 7     |
| L2  | text "7"     | 20     | R2  | text "7"     |
| L3  | text "007"   | 30     | R3  | text "007"   |
| L4  | text " A "   | 40     | R4  | text "A"     |
| L5  | text "a"     | 50     | R5  | text "A"     |
| L6  | null         | 60     | R6  | text "a"     |
| L7  | three spaces | 70     | R7  | null         |
| L8  | text "bad"   | 80     | R8  | empty text   |
| L9  | text "A"     | 90     | R9  | text "bad"   |
| L10 | empty text   | 100    | R10 | three spaces |

Strict pairs: L1–R1, L2–R2, L3–R3, L5–R6, L7–R10, L8–R9, L9–R4/R5, L10–R8.
Trim adds L4–R4/R5 and removes the two blank pairs.
Lowercase forms `{L4,L5,L9} × {R4,R5,R6}`, plus L1–R1, L2–R2, L3–R3, L8–R9.

| Convention             | Inner / retained-unmatched / lookup rows | Amount sums in that order | Added / removed pairs |
| ---------------------- | ---------------------------------------- | ------------------------- | --------------------- |
| Strict                 | 9 / 11 / 10                              | 540 / 640 / 550           | 0 / 0                 |
| Trim                   | 9 / 12 / 10                              | 450 / 680 / 550           | 2 / 2                 |
| Trim + ASCII lowercase | 13 / 16 / 10                             | 680 / 910 / 550           | 6 / 2                 |

Lowercase lookup selects R1/R2/R3 for L1/L2/L3 and R9 for L8. All other target assignments are unavailable.
L4/L5/L9 have three candidates each; they are ambiguous, not unmatched.
Reverse strict lookup has nine unique inputs and one unmatched input. Direction changes ambiguity, not the transposed pair set.
Reversing source arrays preserves membership but changes emission order.
Adding R11 with code " a " under lowercase adds three pairs: 16 inner and 19 retained-unmatched rows, sums 860/1090.
Prefilter amount ≥50 yields six inputs, seven pairs, ten retained-unmatched rows, sums 500/730.
Postfilter right ID R4 yields L4/L5/L9 with amount sum 180.

Use one fixture across a few important test groups:

- Membership, preview, direction, and totals: evaluator tests plus a focused preparation test.
  Use manually enumerated keys and literal pair lists as the oracle; do not compute expectations with the production matcher.
  Pin NFC `e\u0301`/`é` and `É`/`E\u0301`; fullwidth A stays distinct. ASCII folding does not equate İ/i or ß/ss.
  Pin boundary NBSP versus zero-width/internal whitespace, typed booleans, signed zero, empty/nonfinite values, and unchanged raw matching.
- Occurrence inspection: T1 has primary/secondary code "a", amount 10; P1 code " A ", P2 code "a".
  Two expansions emit T1–P1–P1, T1–P1–P2, T1–P2–P1, T1–P2–P2: sum 40, distinct-task sum 10.
  On the mixed row, primary resolves P1 and secondary resolves P2. Reject mixed-occurrence bindings.
  Duplicate entity IDs and repeated object instances stay separately inspectable within their snapshot.
- Lifecycle roundtrip: extend existing evaluator JSON tests, `lib/dsl/project.test.ts`, folder, notebook, and hook/component tests.
  Verify definitions, bindings, raw bytes, exact outputs, one Apply/undo, and shared/local file ownership.
  Prove stale worker rejection, synchronous action gating, unresolved selections after refresh/reopen, and no echo revival.
  Distinguish unavailable source from an available empty source.

Cardinality witness: FROM a, TO z/z creates zero pairs and permits many-to-one with a duplicate warning.
Adding TO a creates one pair; adding another TO a creates two and requires a declaration change.
Do not substitute global key uniqueness for matched multiplicity.

At 1280/783/390px, complete create → review → inspect → apply → undo → save/reopen with pointer and keyboard.
Use labeled controls and viewport-bounded sheets/tabs. Keep endpoint names, count units, primary actions, and focus visible.
Check long names, nulls, empty results, unavailable sources, active filters, many buckets, and light/dark borders.
Escape closes the deepest editor and restores focus. No drag-only action or page-level horizontal overflow.
Register `apps/demo/e2e/join-keys.e2e.ts` explicitly in the restrictive Playwright project list.
Main risk: preview, evaluator, inspection, and persistence disagree despite a convincing match count.

## M2 — Deliberate decimal integer identifiers

Add the terminal integer operation to parser, validator, key editor, and review reasons.
Do not accept decimals, exponents, radix forms, booleans, fractions, units, or unsafe integers.
Only the authored convention equates number 7, text "7", and text "007".
Negative zero becomes zero. Preserve raw text and failed-conversion reasons.

F1 leaves only L1–L3 and R1–R3 eligible. Their Cartesian product has nine pairs; none resolves a unique lookup target.
Inner/retained-unmatched/lookup counts are 9/16/10; sums are 180/670/550; six strict pairs are added and six removed.
Text " 7 " requires trim; "7.0", "7e0", "0x7", true, and 7.5 fail.
Pin ±9007199254740991 and the adjacent unsafe values without rounding.
Extend the same docs page, folder/notebook example, roundtrip test, and three-width pointer/keyboard journey.
Show leading-zero loss and the 3×3 group before Apply. Main risk: a measurement parser silently changes identity.

## M3 — Ordered typed composite keys

Allow multiple components in the existing definition, binding, validator, editor, and evidence columns.
Use typed structural tokens or nested maps. Never join printed values with a separator.
Require equal arity, component order, and one source occurrence. Missing/invalid/empty components prevent the whole match.
Provide Move up/down alongside any drag control. Definition edits trigger the same dependency review.

Fixture: C1 `["a|b","c"]` amount5; C2 `["a","b|c"]` amount7; C3 `[7,"x"]` amount11;
C4 `["7","x"]` amount13; C5 `[" A ","US"]` amount17; C6 `["a","us"]` amount19;
C7 `["a",null]` amount23; C8 `["a",""]` amount29.
Targets D1–D4 match the first four exact tuples; D5 is `["a","us"]`; D6/D7 have null/empty final components.
Exact and trim produce C1–D1, C2–D2, C3–D3, C4–D4, C6–D5: five inner rows, sum55; eight retained-unmatched, sum124.
Trim/lower adds C5–D5: six inner, sum72; eight retained-unmatched, sum124.
Forward many-to-one remains valid; reverse D5 is ambiguous. The separator collision and number/text pair stay separate.
Integer conversion on component one leaves C3/C4 × D3/D4: four inner, sum48; ten retained-unmatched, sum148.
Roundtrip component order and reject cross-alias tuples. Extend docs, examples, and the three-width journey in this milestone.
Main risk: plausible false matches from flattened tuples or components taken from different aliases.

## Verification and measurement

For each package feature PR, add a minor changeset. Run focused membership/roundtrip tests and package types while working.
Run demo coverage/dashboard-text tests immediately after example registration.
Build and run the new Playwright project and docs page. Capture PR evidence with `pnpm shot`.
Run `pnpm check` once before the feature PR; stop the dev server afterward.
This planning PR changes no package/demo code and requires doc/format checks only.

Measure the actual resolver, full counts/deltas, first evidence page, Apply, worker transfer, and modest complete expansion.
Use 10k/100k rows, unique keys, duplicate buckets, Unicode, and one large bucket; repeat with integers and tuples later.
Record runtime/hardware, distributions, p50/p95, memory, and responsiveness during refresh and overlapping draft edits.
Keep count-only stress separate from allocated expansion. Pro's scratch timings are not product measurements.
Choose caching or expansion limits only after a measured need. Never silently sample counts or truncate output.
No merge, deployment, paid service, or feature implementation is part of this research run.

## Preserved Pro result materials

[Original Pro reports and artifacts for #527](assets/pro-results/join-key-2026-10-25/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
