# Explicit join-key preparation: implementation plan

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d` · **Mode:** Design · **Date:** 2026-10-25

## Build decision and delivery order

Build reusable, source-owned join-key definitions, with explicit relationship endpoint references, exact before/after membership review, and unchanged original source records. Ship the complete scalar text workflow first; add deliberate decimal-integer conventions second and structural composite keys third. Byron supplies the demand. These milestones require implementation evidence and review, not outside users, interviews, or a demand gate.

This document is a proposed implementation plan. Codex must review it against the current checkout and own every repository change. The research run modified no application code, executed no application test suite, and did not run a browser acceptance test. Independent fixture arithmetic and a reference cost probe were executed; their limits are stated below. The companion [design-report.md](design-report.md) supplies the external comparison, reasoning, and full source discussion.

| Milestone | User-visible result | Recommendation IDs |
| --- | --- | --- |
| M1 — Reusable scalar text keys | Author trim, NFC, and ASCII lowercase conventions in Schema; review exact changes and collisions; apply, inspect, undo, save, reopen, and traverse either direction. | JK-01–08, JK-11–12 |
| M2 — Deliberate numeric identifiers | Explicitly reconcile decimal integer identifiers such as numeric `7`, text `"7"`, and text `"007"`, with conversion failures and changed memberships visible. | JK-09; extends JK-02, JK-04–08, JK-11–12 |
| M3 — Typed composite keys | Match ordered structural components, retain component types, inspect each component, and preserve source occurrence identity through aliases. | JK-10; extends JK-02, JK-04–08, JK-11–12 |

Each milestone is independently shippable with its own docs, runnable example, tests, and changeset. M1 is a complete capability, not a schema-only foundation. No milestone depends on PR523 category mappings, PR518 wide-to-long preparation, PR525 ordered difference, or PR524 parameterized local notebooks; those are unbuilt proposals.

## Stable recommendations

| ID and disposition | Decision and reason |
| --- | --- |
| **JK-01 — Build** | Source-owned definitions permit reuse across relationships and both traversal directions without rewriting raw data. |
| **JK-02 — Build** | One matching contract serves evaluation, preview, and inspection while preserving strict relationship memberships. |
| **JK-03 — Build** | Explicit trim, NFC, and ASCII lowercase cover common text encodings with understandable, testable semantics. |
| **JK-04 — Build** | Typed eligibility and specific invalid reasons prevent failed values from becoming accidental matches. |
| **JK-05 — Build** | Exact deltas, collision membership, and correctly labeled counts make consequences reviewable. |
| **JK-06 — Build** | Occurrence bindings and runtime `sourceOccurrences` distinguish repeated joins to the same source. |
| **JK-07 — Build** | Explicit cardinality and separate lookup/expansion choices preserve intentional many-to-many analysis. |
| **JK-08 — Build** | Persistence, worker, refresh, selection, and inspection lifecycle work makes the feature usable beyond one preview. |
| **JK-09 — Build** | A deliberate decimal safe-integer convention supports numeric identifiers without adopting measurement parsing. |
| **JK-10 — Build** | Ordered typed composites solve multi-column identifiers without ambiguous string concatenation. |
| **JK-11 — Build** | Docs, runnable examples, and accessible responsive controls ship with each capability. |
| **JK-12 — Build** | Measure preparation, indexing, evidence, and output costs before selecting caches or limits. |
| **JK-13 — Explore** | Manual exact typed exceptions may help reconciliation, but need separate precedence and maintenance decisions; PR523 is not a dependency. |
| **JK-14 — Explore** | Full Unicode casefolding, locale casing, and compatibility normalization have broader equivalence effects than M1. |
| **JK-15 — Defer** | Query-output endpoints and general preparation graphs add dependency and grain problems outside this source-key feature. |
| **JK-16 — Avoid** | Fuzzy matching, automatic repair, implicit coercion, and concatenated tuple keys obscure authored membership truth. |

## Contract shared by all milestones

### Ownership and smallest public model

Add optional `joinKeys` to `SourceDefinition`, separate from `fields` and `entityKey`. Definitions may reference raw fields only. Do not add prepared values to `AnalysisSourceRow`, scalar `AnalysisField` lists, or ordinary chart data. They are relationship keys, visible through the key editor and matching evidence.

The following is a proposed type shape; adapt naming to nearby code without weakening its distinctions:

```ts
type JoinKeyTransform =
  | "trim"
  | "nfc"
  | "ascii-lower"
  | "decimal-integer"; // Implement in M2; reject before then.

type JoinKeyDefinition = {
  id: string;
  name: string;
  components: Array<{
    fieldId: string;
    transforms: JoinKeyTransform[];
  }>;
};

type RelationshipEndpoint =
  | { sourceId: string; fieldId: string; keyId?: never }
  | { sourceId: string; keyId: string; fieldId?: never };

type RelationshipInputBinding = {
  side: "from" | "to";
  fieldIds: string[];
};

// SourceDefinition: joinKeys?: JoinKeyDefinition[]
// LookupStep / ExpandStep: inputBinding?: RelationshipInputBinding
// Raw legacy inputFieldId remains supported and is mutually exclusive.
```

M1 accepts exactly one component; M3 permits multiple ordered components. `inputBinding` is required whenever either relationship endpoint is prepared, including when traversal begins at its raw endpoint. Each listed field must correspond to the selected endpoint's raw component field and source origin. All components must come from one source occurrence. A calculated field's step origin does not become a source-field origin.

Extend source field origins with `occurrenceId`: the source step ID for initial fields and the introducing lookup/expand step ID for projected fields. Add a runtime `sourceOccurrences` sidecar to result rows, mapping occurrence IDs to selected original source references. Filtering and calculation preserve it; expansion records its selected target; lookup records one target only when uniquely resolved. Ambiguous lookup candidates belong in separate evidence/contributors, not in its selected target occurrence. Aggregation unions references per occurrence for inspection, but a later join is allowed only if all bound components survive as group fields. Prepare that grouped row once; do not join each contributor separately.

Optional public properties do not make fresh evaluator evidence optional: populate occurrence origins and selected/empty maps on every raw or prepared source/projection path, including unavailable targets. Missing/ambiguous prior lookup values prepare as unavailable; their declared columns are not a structural missing-field error. Recompute an external result lacking occurrence evidence from its known snapshot or mark inspection unavailable, never fall back to the first same-source ref. These sidecars are transient evaluation evidence. Do not persist them in project definitions, source data, folder files, or notebooks. Keep existing source identity based on the original entity key. [Repository: `types/AnalysisProject.ts`; `evaluateProject.ts::sourceFrame`, `relationshipSide`, `lookupFrame`, `expandedFrame`; `projectFile.ts::fieldsAt`; paths are under `packages/explorEDA/src` unless otherwise stated.]

### Matching semantics

Use one pure component-preparation function on current input-frame values and raw target-source values. Both paths use the same operation definitions and eligibility gate. Target preparation must not depend on which query or view happened to run first. A query filter before a relationship narrows its input rows, not the target source table; a later filter narrows emitted rows. Schema review labels its complete supplied-source scope separately from a selected query stage.

Operations are a unique ordered subsequence of **trim → NFC → ASCII lowercase → decimal integer**. UI controls choose operations in that order; they do not expose arbitrary rearrangement. Text operations affect strings only; other finite scalar types pass unchanged. Do not stringify numbers or booleans. NFC is canonical normalization; ASCII lowercase changes `A`–`Z` only. Neither operation implies Unicode casefolding or compatibility normalization.

| Value or condition | Strict raw endpoint | Prepared endpoint |
| --- | --- | --- |
| Numeric `7` versus text `"7"` | Distinct | Distinct until explicit integer conversion |
| `"007"` versus `"7"` | Distinct | Distinct through M1 |
| Null, undefined, NaN | Ineligible | Ineligible, with reason |
| Infinity and negative infinity | Existing literal matching retained | Ineligible nonfinite value |
| Empty text | Existing literal matching retained | Ineligible empty value |
| Whitespace-only text | Literal text | Literal unless selected trim makes it empty |
| Booleans | Typed equality | Pass through text transforms; integer conversion fails |
| Negative and positive zero | Equal | Equal |
| Date-looking text | Literal text | Explicit text operations only; no date parsing |
| Native Date object | Outside the scalar public contract | Unsupported value; no implicit timestamp conversion |

Do not implement failed conversions as a common null key or string sentinel. Source rows remain present; an unavailable key contributes no match. Reuse typed-category encoding only after eligibility checks. `categoryEqual`'s missing-value behavior is not the relationship contract. `parseNumber` and `isExactNumberText` are not the numeric identifier convention. [Repository: `lib/categories.ts`; `lib/valueParsing.ts`; `projectFile.ts::validateAnalysisProjectFile`.]

### Cardinality and applying a change

Use **matched relation multiplicity across the complete supplied source populations**, not distinct raw variants or the currently filtered stage, for cardinality. Many-to-one requires each FROM row to have at most one TO candidate; one-to-many requires each TO row to have at most one FROM candidate; one-to-one requires both conditions; many-to-many permits both multiplicities. Unmatched duplicate buckets are warnings, not blockers: they currently create no pairs. A later refresh may make them participate and produce a cardinality violation. Raw endpoints retain raw eligibility; prepared endpoints apply prepared eligibility. This relationship contract does not assert global uniqueness of every source-key bucket.

Block a new or edited prepared relationship whose declared cardinality conflicts with these populations. Offer an explicit cardinality choice in the same apply transaction. Do not block valid many-to-many work. Do not change lookup into expansion automatically: lookup retains one row per input and leaves ambiguous target fields unavailable; expansion emits pairs. A refresh that introduces duplicates into an existing relationship reports the conflict without rewriting its definition or silently picking a target.

Editing a shared key shows every dependent relationship/query and the affected views known to the host. Apply the key edit, chosen endpoint references, needed explicit bindings, and accepted cardinality edits together, or leave the applied project unchanged. Draft changes do not alter charts, source data, saved selections, or host state. Undo restores the previous definition transaction and recomputes against the current source snapshot; it does not revert a data refresh.

## M1 — Complete scalar text preparation

### Outcome

From Schema, an analyst selects a source field, creates a named key, enables trim/NFC/ASCII lowercase, and uses it on either endpoint of one or more relationships. The editor previews original and prepared values on both sides, exact added/removed pairs, unmatched records, invalid keys, and duplicate/collision groups. Applying preserves raw data, updates every dependent query through the existing host callback, and supports lookup, expansion, reverse traversal, saving, reopening, and exact source inspection.

A standalone unused key previews its own-source prepared values, failures, and collisions and can save without a relationship. Pair deltas/cardinality are shown only after an opposite endpoint is selected. Use compact controls with visible source/field names. A definition has a stable ID and editable label. Reuse a named key by reference; copy it explicitly when a relationship needs a different convention. A rename changes labels only. Removing a referenced definition is blocked until its endpoints are reassigned or removed in the same transaction.

### Implementation work and real seams

1. **Add the public contract and pure matching core.** Modify `types/AnalysisProject.ts`. Proposed new small modules are `lib/analysis/joinKeys.ts` for typed preparation, `relationshipMatching.ts` for shared bucket matching, `relationshipBindings.ts` for endpoint/occurrence resolution, and `relationshipReview.ts` for exact review summaries and membership enumeration. They are proposed files, not existing APIs. Add identifier-specific raw-value helpers in `lib/valueParsing.ts`; `joinKeys.ts` calls them rather than reading/converting raw cells through a second parser. Extend `AnalysisDiagnostic` with focused invalid-key and cardinality-conflict codes plus optional relationship/key/component identifiers. Keep definitions serializable, input snapshots immutable, and control flow direct. Avoid a generic transformation engine or dependency graph.

2. **Integrate the evaluator.** Modify `lib/analysis/evaluateProject.ts`, specifically `sourceFrame`, `relationshipSide`, `lookupFrame`, `expandedFrame`, aggregate propagation, and revision inputs. Resolve explicit bindings before matching. Prepare current input components, index the complete available target source, and preserve existing result-row construction for lookup/expansion. Definitions without preparation take the legacy gate, so empty/infinite raw matches are not accidentally removed. Preserve original refs and target candidates separately. Existing revision inputs already include participating source and relationship definitions; make the new fields participate naturally.

3. **Replace separate preview semantics.** Adapt `components/project/relationshipEditing.ts::countMatches`, `blockedByAmbiguity`, proposal helpers, and endpoint labels to use the shared resolver/matcher. `countMatches` currently has its own equality path; extending it independently would leave preview and evaluation divergent. Update `queryEditing.ts::relationshipDirection`, `stepEditing.ts::queryFields`, `usableRelationships`, and `followRelationship` to enumerate valid occurrence bindings. Preserve aliases in copied queries and derive new occurrence IDs from copied step IDs. Existing raw `on=` behavior remains supported. Before migrating an existing consumer, resolve its side and occurrence under the OLD project, including legacy `inputFieldId`/side preference. Map proposed components onto that same occurrence in the new upstream frame; write `inputBinding` and remove `inputFieldId`. Missing/nonunique mappings require explicit repair before Apply. Never choose the first new eligible alias. Repeat this for every affected query copy, forward and reverse.

4. **Build the author/review surface.** Update `ProjectSchemaPanel.tsx` and `QueryRelationshipBuilder.tsx`; introduce focused `JoinKeyEditor.tsx` and `JoinKeyReview.tsx` components if extraction keeps the parent components readable. Reuse existing controls and field pickers. Review separates pre-existing duplicate raw keys from newly collapsed raw values, and can show both in one group. Display every count with its unit. The first visible page can show 25 pair records or key groups, labeled “25 of N”; paging reaches all exact records. Counts cover the full labeled scope, not just the visible page. Count pairs from bucket multiplicities and enumerate evidence lazily instead of materializing every pair to draw the preview.

5. **Wire source inspection.** Update `QueryStageRows.tsx::relatedRecords` and related-record presentation to consume the applied match evidence and occurrence sidecars. Do not rediscover prepared matches by raw `matchingSourceRows` scans. Show raw values, prepared values, component names, source ID, original entity ID, and the exact selected records. Ambiguous candidate rows are labeled candidates. Separate selected result records, matching candidates, and other related records; the existing two-level child traversal must never inflate contributor counts. Store bucket members by source-row position and ref, not a Map keyed by row object identity. A field alias points to its introducing occurrence, even when two aliases have identical prepared values.

6. **Complete all persistence routes.** Extend `projectFile.ts::validateAnalysisProjectFile`, `fieldsAt`, and selected-view export; `lib/dsl/project.ts` source/relationship/step compile-export paths; `lib/project/folder.ts` and `writeFolder.ts`; existing folder/text tests. Source-owned definitions belong in their owning shared project file or analysis-local source declaration. Raw data files remain unchanged. `analysisText.ts` and `readNotebook.ts` consume the shared evaluator. `compileNotebook.ts` and `writeBack.ts` retain chart-text ownership; no key pipeline is added there. New definition/operation errors must not become ignored DSL warnings.

7. **Finish refresh and interaction lifecycle.** Update `useAnalysisEvaluation.ts`, `ExplorEdaProject.tsx`, `sourceRowIdentity.ts`, and `analysisRowKeys.ts` as detailed below. Keep the host callback `{ project, view }`; other saved views revalidate when opened. Do not introduce host-wide view mutation protocols merely to clear hidden state.

8. **Register the feature and example.** Add `apps/demo/src/docs/pages/join-keys.mdx`, update project-folder/notebook documentation, `apps/demo/src/docs/catalogue.ts`, and `apps/demo/src/demos/examples.ts`. Add the proposed example ID `join-key-preparation` and link the full runnable project demo from the docs page. Update the documented `apps/demo/src/demos/coverage.ts`/coverage tests and dashboard-text checks after inspecting those files in the checkout.

**Inspect-first integration seams.** The packet supplies imports and guidance for `lib/analysis/analysisWorkerProtocol`, the worker implementation, `lib/schema/schemaGraph`, schema-diagram editors, folder-host saving/undo, and example coverage. Their complete implementations were not supplied. The row-filter action/store seam in `providers/DataLayerProvider.tsx` is likewise an inspect-first seam for proving explicit positional selection intent. Codex should locate these exact imports/callers and adapt them; no behavior inside them is claimed verified. This does not block the design: the model, matcher, UI, and persistence contracts above determine their changes. The inspected `apps/demo/src/docs/live/examples.ts::LiveExampleSpec` is single-table `data` plus settings and cannot currently render this project. M1 therefore links to the full demo using existing `ExampleData` project support. An inline project-backed docs renderer is optional future presentation work, not a feature dependency.

### Review counts and interaction contract

Provide separate counts for supplied input/source rows, target rows, eligible rows, distinct eligible keys, matched key values, inputs with any match, distinct matched target records, unique lookup inputs, ambiguous lookup inputs, unmatched inputs, pairs, and emitted rows. “Expanded” is not a sufficient label for both extra rows and total pairs. Before/after deltas compare exact original-record pairs against the applied relationship, using the same source snapshot; a new relationship can compare against strict endpoints. Changed conventions may remove matches as well as add them.

A collision group lists its prepared key, distinct raw typed values, and exact row IDs. A pre-existing duplicate has repeated rows with one raw typed value. A normalization collision combines at least two raw typed values. A legitimate one-to-many expansion describes the chosen output operation, not a data defect. Unmatched means no target candidates; ambiguous means multiple candidates. No ambiguous input becomes an unmatched parent during `keepUnmatched` expansion.

The preview states which sources, relationship direction, input stage, and snapshot it covers. Draft revision or source changes invalidate the preview immediately. Disable Apply until a current review completes. If a required source is unavailable, display that state, not zero target rows or confirmed zero matches. In `readProjectFolder`, omit table entries for failed/missing reads while retaining `missingSources` and `problems`; a present empty array means a successfully read empty table. Inspect existing callers before changing those placeholders.

### Worker, refresh, selection, and trace requirements

The existing hook uses request IDs, but before its next effect runs it can temporarily report an old finished result as ready for new inputs. Track the project/tables/query/bindings references associated with each finished result and synchronously mark it stale whenever requested inputs differ. Gate trace, row selection, and original-record actions during this mismatch. Keeping old charts visible with “Updating” is acceptable; reading fresh tables through an old evaluation's refs is not. Bind review requests to the same immutable snapshot/request generation, and reject late results even when query IDs match.

Provide immutable source arrays as the current host contract requires. Reordering a source with unique stable entity keys changes order but preserves memberships. A source refresh recomputes key diagnostics and outputs; references are resolved only against their matching current snapshot. Persisted prepared keys never become source entity identities.

For positional or nonfinite source identities, add a narrow in-memory selection scope per view and result-row key. Grant that scope only when an explicit current numeric row selection occurs; never grant it from a saved string key or a host echo of settings. Require the scope conservatively whenever a result row's `sourceRows` contains positional/nonfinite references. Expire it on relevant source-array refresh and on mount/reopen. Do not claim positional row 4 still means the same record after reordering. Stable keys remap only when present; missing keys remain unresolved. Keep the current unresolved sentinel one-way until explicit reselection, and count unresolved selections from rendered runtime decoding, not only the original saved settings. Apply the same policy to saved selected-row and inspection state where used. Observe the actual internal row-filter selection action before granting scope; numeric values in a general `onStateChange` callback or a membership diff alone do not prove selection intent. If action provenance cannot be established, leave positional IDs unresolved. Reject persisted raw numeric `__ID` values on load/reopen too. A stale X plus a new selection Y must never make X eligible.

Open traces are revision-bound and recomputed or closed on a preparation change even if a lookup parent key survives: that key can retain its identity while its target values and candidates change. These are local lifecycle changes, not a generic identity/version platform. [Repository: `useAnalysisEvaluation.ts::useWorkerEvaluation`; `ExplorEdaProject.tsx::renderedSettings`, `reported`; `analysisRowKeys.ts`; `sourceRowIdentity.ts`.]

### Persistence syntax to implement in M1

Source-local definitions and prepared relationship blocks use existing block parsing. Lookup/expand bindings use existing comma-separated pair values, as aggregate `by=` already does:

```text
source @orders key=id path=data/orders.json {
  field id string
  field code
  field amount number
  join-key @customer-code "Customer code" {
    component code trim nfc ascii-lower
  }
}

source @customers key=id path=data/customers.json {
  field id string
  field code
  join-key @customer-code "Customer code" {
    component code trim nfc ascii-lower
  }
}

relate @order-customer many-to-many {
  from orders key=customer-code
  to customers key=customer-code
}

query @matches glyph=M {
  source orders
  expand customer via=order-customer input-side=from input-fields=orders.code keep-unmatched
}
```

The equivalent step persists `inputBinding: { side: "from", fieldIds: ["orders.code"] }`. Keep legacy `relate @r orders.code -> customers.code` and `on=orders.code` unchanged for raw relationships. Read `input-fields` from `pair.value.items`, preserving order and individual quoted field names; do not collapse it through `single()`. Reject both/neither binding settings, invalid sides, empty lists, duplicate settings, and coexistence with `on=`. Reject component-origin mismatches during shared validation.

Current `readNotebookText` passes `{}` bindings to evaluation. M1 notebooks consume prepared relationships for their existing unparameterized query contract. They do not gain parameterized notebook authoring; PR524 remains separate. A frozen notebook block preserves its prior chart definition, not an old source or join snapshot.

### M1 exact fixtures and meaningful tests

Use a new shared fixture module, proposed `src/test/fixtures/joinKeyProject.ts`, with **separate unique string IDs as entity keys**. Raw typed data for F1 is:

```text
Left (ID, code, amount):
(L1,7,10), (L2,"7",20), (L3,"007",30), (L4," A ",40),
(L5,"a",50), (L6,null,60), (L7,"   ",70), (L8,"bad",80),
(L9,"A",90), (L10,"",100)

Right (ID, code):
(R1,7), (R2,"7"), (R3,"007"), (R4,"A"), (R5,"A"),
(R6,"a"), (R7,null), (R8,""), (R9,"bad"), (R10,"   ")
```

Quotes distinguish strings from numbers. Prepared unavailable values are not matchable sentinels. Manually author expected key columns; do not obtain them by calling the production normalizer. Strict pairs are exactly `L1–R1, L2–R2, L3–R3, L5–R6, L7–R10, L8–R9, L9–R4, L9–R5, L10–R8`. Trim adds `L4–R4/R5` and removes `L7–R10, L10–R8`. Trim plus lowercase additionally forms the complete Cartesian pair set `{L4,L5,L9} × {R4,R5,R6}`; the other pairs are `L1–R1, L2–R2, L3–R3, L8–R9`.

| Convention | Inner / keepUnmatched / lookup row counts | Amount sums in that same order |
| --- | --- | --- |
| Strict | 9 / 11 / 10 | 540 / 640 / 550 |
| Trim | 9 / 12 / 10 | 450 / 680 / 550 |
| Trim + ASCII lowercase | 13 / 16 / 10 | 680 / 910 / 550 |

The trim-only left collision is `{L4,L9}`; right `{R4,R5}` is a pre-existing duplicate. Lowercase right `{R4,R5,R6}` has three rows, two raw values, and the old duplicate subgroup. Lowercase lookup target assignments in L1…L10 order are `[R1,R2,R3,undefined,undefined,undefined,undefined,R9,undefined,undefined]`. Every parent retains its original amount. Ambiguous L4/L5/L9 have candidates R4/R5/R6 and an empty selected target occurrence.

Add four integrated test groups, using existing suites where practical:

- **Membership and semantics:** extend `test/lib/analysis/evaluateProject.test.ts` and a proposed `test/lib/analysis/joinKeys.test.ts`. Assert the literal pair lists, lookup assignments, count units, and downstream totals above. Reverse candidates must be the transposed set; strict reverse R4 and R5 each uniquely select L9. Add isolated F2 assertions: decomposed `e\u0301` equals `é` after NFC; `É` equals `E\u0301` after NFC-before-ASCII; fullwidth `Ａ` differs from `A`; `İ` differs from `i`; `ß` differs from `ss`; boundary NBSP is trimmed but zero-width spaces remain; booleans retain types; signed zero matches; empty/nonfinite prepared values do not. Keep raw strict results for these values unchanged.
- **Occurrences, filters, and refresh:** F4 has task T1 with primary/secondary `"a"`, amount 10, and people P1 code `" A "`, P2 code `"a"`. Two explicit expansions produce `(T1,P1,P1)`, `(T1,P1,P2)`, `(T1,P2,P1)`, `(T1,P2,P2)`: sum 40, distinct-task sum 10. Inspecting primary and secondary on the mixed row must resolve different people. Reject mixed-occurrence component bindings. For F1 lowercase, a prefilter `amount >= 50` gives six inputs, seven pairs, ten outer rows, sums 500/730. A postfilter `right.id == R4` yields L4/L5/L9 and sum 180. Add R11 code `" a "`: exactly three new pairs, 16 inner rows, 19 outer rows, sums 860/1090. Reorder stable-ID arrays: membership/counts stay unchanged, ordering follows arrays. Migrate a raw consumer using `on=alias.code`, a reverse consumer, and a copied query to prepared endpoints: each preserves its old direction and occurrence, with an explicit new binding. Include F5 duplicate original entity IDs: both snapshot positions remain inspectable and old positional selections cannot follow a reordered occupant.
- **Persistence and ownership:** extend `lib/dsl/project.test.ts`, `lib/project/folder.test.ts`, and the current project-file test suite after locating it. Roundtrip keys, bindings, exact memberships, raw values, and IDs through JSON, project text, folder files, selected-view export, and notebook consumption. Test shared versus analysis-local source ownership and unchanged notebook prose/chart writeback. Reject unknown operations and missing refs. Assert existing strict export text remains unchanged.
- **Interaction lifecycle:** extend or add the hook/component tests after locating current suites. A project change must mark the old worker result stale before effects flush; a late preview must not enable Apply; stale traces cannot read new tables. Stable selections survive a pure reorder; explicit positional selections expire on refresh/reopen and are not revived by a host echo. Also refresh positional rows, render an old key unresolved, then emit a layout-only callback containing its previous numeric ID: it stays unresolved. Selecting current Y must not revive stale X. Test unavailable versus empty targets, cancel, apply, and undo in one browser flow.

Also include one matched-cardinality witness in the membership test: FROM row A has key `"a"`; TO rows Z1/Z2 both have key `"z"`. Many-to-one is allowed with zero pairs and a duplicate-bucket warning. Adding one TO row A1 with key `"a"` yields one pair and remains allowed; adding A2 with the same key yields two pairs and a cardinality conflict. This prevents accidental replacement of the relationship contract with global key-uniqueness validation.

The independent oracle is a nested loop over **manual typed prepared keys** and literal expected pair lists. It does not import or reconstruct the product's index. `keepUnmatched` adds exactly one output for each input with zero candidates; lookup selects a target only for one candidate. Aggregation assertions deliberately expose accidental multiplication instead of silently fixing it.

### M1 docs, example, acceptance, and main risk

Register `join-key-preparation` in the demo catalogue using F1/F4 and editable project state. Provide visible Strict, Trim, and Trim + lowercase views with lookup/expanded totals. Add a small proposed folder example at `packages/explorEDA/examples/join-key-preparation/` containing `exploreda.eda`, typed JSON sources, an analysis, and an unparameterized `.eda.md` notebook. Typed JSON avoids making this key feature depend on CSV lexical inference. Register any CLI example alias only after inspecting its current registry; opening that folder directly is sufficient for runnable acceptance.

The new `join-keys.mdx` teaches create → review → apply → inspect → undo → save/reopen, labels typed values, and explains duplicate versus collision and pair versus entity totals. Update `project-folders.mdx` with exact syntax and `notebooks.mdx` with project-owned preparation. A docs screenshot alone is insufficient: the linked full project demo must run the same author/review flow. Add a dedicated `apps/demo/e2e/join-keys.e2e.ts` and explicit project entry in `apps/demo/playwright.config.ts`, or integrate into its existing folder project; the current project matchers would otherwise omit a new arbitrary filename.

| Width | Pointer acceptance | Keyboard acceptance |
| --- | --- | --- |
| 1280px | Create two keys, inspect exact added/removed pairs, choose many-to-many, apply, inspect aliases, and undo. Counts and names remain visible. | Complete the same flow through labeled controls; Enter/Space activate actions; Escape cancels without saving; focus returns to the initiating control. |
| 783px | Review panels fit the viewport; long field names remain discoverable; nested scrolling does not trap actions or move the background. | Tab order follows authoring then review then Apply; row-detail navigation and paging remain reachable; no drag-only interaction. |
| 390px | Use a stacked editor/review layout; source and field names remain labeled; every pair page and primary action is reachable without page-level horizontal overflow. | Complete creation, review, explicit cardinality change, Apply, Undo, and reopen using only keys; dialogs contain focus and restore it on close. |

At every width include null/empty results, long names, active filters, many groups, unavailable sources, light/dark borders, and visible focus. Default screenshots to light mode. Acceptance requires save/reopen exact memberships and the integrated performance measurements below. **Main risk:** delivering an apparently correct scalar join while preview, occurrence inspection, persistence validation, or stale worker state still use the old raw-field assumptions. Review those paths as one feature.

## M2 — Explicit decimal safe-integer identifiers

### Outcome and work

Add a clearly labeled “Decimal integer identifier” operation after selected text preparation. Show that it removes leading-zero distinctions and merges numeric/text encodings. It accepts existing safe integer numbers and text matching `[+-]?[0-9]+`; trim occurs only if explicitly selected. Reject booleans, decimals, exponents, units, radix notation, and values outside ±9007199254740991. Convert negative zero to the same key as positive zero. Preserve all failed raw values and their specific reasons.

Extend the identifier parser in `lib/valueParsing.ts`, `joinKeys.ts`, the operation validator in project JSON/text, `JoinKeyEditor.tsx`, and review reason labels. Reuse the same matcher, occurrence bindings, callback, worker, persistence, and cardinality behavior from M1. Avoid calling the permissive measurement parser. The library remains React/TypeScript and storage-neutral; this milestone adds no backend or category-mapping service.

### Exact tests and acceptance

For F1, trim plus integer leaves only L1/L2/L3 and R1/R2/R3 eligible, all with numeric key 7. The exact pair set is their 3×3 Cartesian product: nine pairs. Lookup has ten parent rows, zero uniquely resolved targets, three ambiguous inputs, seven unmatched inputs, and sum 550. Inner expansion sum is 180; `keepUnmatched` has 16 rows and sum 670. The distinct original-left inner sum is 60; the outer distinct-left sum remains 550. Relative to strict, six pairs are added and six removed.

Use one table-driven parser/eligibility test plus the integrated F1 roundtrip/interaction test. Against numeric 7, `"7"`, `"007"`, `"+007"`, and numeric 7 match; `" 7 "` matches only with trim. `"7.0"`, `"7e0"`, `"0x7"`, `"7kg"`, boolean true, and numeric 7.5 fail. Against zero, `"-000"`, numeric -0, and numeric 0 deliberately match. The exact safe-integer boundary text converts; the next integer text and number fail. Empty or missing keys are never compared as a common failure value.

Extend the same docs page, project syntax section, and `join-key-preparation` runnable example with a Numeric convention view. The example must show the expected 3×3 group and amount totals before Apply. Save/reopen retains the selected operation, not precomputed keys. Repeat pointer and keyboard acceptance at 1280/783/390px for enabling/disabling integer conversion, opening a failed-conversion group, reviewing changed pairs, explicitly changing cardinality, undoing, and reopening. The original field and the lost leading-zero distinction stay visible in narrow layouts.

Re-run the integrated performance cases with string-integer input and failures; compare preparation cost without adding a cache preemptively. **Main risk:** numeric parsing erases identifier distinctions or accepts rounded unsafe integers. Exact lexical acceptance, safety checks, and before/after memberships are release criteria; an attractive match-rate improvement is not evidence of correctness.

## M3 — Ordered typed composite keys

### Outcome and work

Allow several ordered raw components in a source-owned definition. Each has its own existing transform list. Equality requires the same tuple length and equality of every eligible typed component. Any missing, invalid, empty, or nonfinite prepared component makes the whole tuple unavailable. No partial match and no missing-equals-missing rule is added.

Extend `joinKeys.ts` from a one-component structural representation to ordered tuples; use typed structural serialization or nested maps, not separator concatenation. Extend `relationshipMatching.ts`, `relationshipBindings.ts`, validators, editor component lists, evidence columns, and schema labels. `inputBinding.fieldIds` follows definition component order and one occurrence. If a later aggregate retains all bound group fields, prepare its current grouped tuple once; otherwise reject the join. Reordering components is an explicit definition edit with a fresh preview, even when displayed values look alike.

The existing proposed text form grows by adding ordered `component` children; step syntax becomes `input-fields=orders.country,orders.code`. Preserve individually quoted field IDs. Changing a component's convention or position triggers the existing dependency review across relationships and views. This does not permit arbitrary query-output endpoints, cross-occurrence tuples, or preparation graphs.

### Exact structural fixture and tests

F3 raw tuples and amounts are independently authored:

```text
Left:
C1 ["a|b","c"] amount5; C2 ["a","b|c"] amount7;
C3 [7,"x"] amount11; C4 ["7","x"] amount13;
C5 [" A ","US"] amount17; C6 ["a","us"] amount19;
C7 ["a",null] amount23; C8 ["a",""] amount29.

Right:
D1 ["a|b","c"]; D2 ["a","b|c"]; D3 [7,"x"];
D4 ["7","x"]; D5 ["a","us"]; D6 ["a",null]; D7 ["a",""] .
```

Proposed exact structural equality and trim-only equality yield `C1–D1, C2–D2, C3–D3, C4–D4, C6–D5`. That is five inner outputs, sum 55; eight outer outputs, sum 124; lookup has five unique and three unmatched inputs. Trim plus ASCII lowercase adds only `C5–D5`: six inner outputs, sum 72; eight outer outputs, sum 124. Forward many-to-one is valid because D5 remains one target record despite the C5/C6 source collision. Reverse lookup at D5 is ambiguous; reverse expansion emits six pairs and reverse `keepUnmatched` eight rows.

C1 and C2 both naïvely concatenate to `"a|b|c"`; structural matching must retain their two separate pairs. C3 and C4 remain distinct until integer conversion is explicitly selected for that component on both sides. C7/C8 never match D6/D7. Assert these literal memberships, component-specific invalid reasons, JSON/text roundtrip component order, reverse bindings, and mixed-occurrence rejection in the existing shared tests. Extend F4 so an attempted tuple assembled from `primary.code` and `secondary.code` is refused even when both prepared values equal `"a"`.

Extend `join-keys.mdx`, the folder example, and the same live demo with a Composite view. Explain that composite relationships did not exist in the baseline: this exact-tuple fixture is a proposed new contract, not an executed legacy behavior. At 1280/783/390px, pointer and keyboard users must add/remove/reorder components, choose each transform, inspect raw/prepared component values, resolve a missing component, preview, apply, undo, and reopen. Provide Move up/down actions in addition to any drag affordance. Labels and validation point to the component causing a problem.

Measure tuple preparation, indexing, and occurrence evidence allocation for two and four components before optimizing. **Main risk:** flattening tuples into strings or assembling fields from different source occurrences can create plausible but false matches. Typed components, explicit order, and one-occurrence binding are mandatory.

## Performance evidence and the integrated probe

A scratch Node reference probe was executed with one warmup and seven measured runs per operation. It used complete synthetic text arrays with raw keys `" K" + zeroPad6(i % distinctKeys) + " "`, standard trim→NFC→ASCII-lower, typed JSON keys, a Map, full pair counts from bucket sizes, and only the first 25 materialized pair records. Distinct-key counts were 10,000, 100,000, 25,000, and 1 for the four rows below. Medians were:

| Rows and distribution | Preparation / index+count / first 25 records | Full pairs counted |
| --- | --- | ---: |
| 10k × 10k, unique | 14.054 / 1.575 / 0.035 ms | 10,000 |
| 100k × 100k, unique | 127.540 / 26.263 / 0.066 ms | 100,000 |
| 100k × 100k, four rows per key on each side | 104.382 / 14.792 / 0.035 ms | 400,000 |
| 10k × 10k, one common key | 9.341 / 0.411 / 0.008 ms | 100,000,000 |

Environment: Node v24.22.1, Linux x64, reported AMD EPYC 9V74 CPU, nine reported logical CPUs/eight available parallelism slots, shared container. Explicit GC ran before timed samples. These are **independent reference measurements**, not explorEDA or browser performance. They include no React, actual evaluator, worker startup/transfer, occurrence sidecars, source snapshot retention, or full output materialization. Counting 100 million pairs quickly does not mean emitting them is cheap.

Before M1 release, run the actual browser/evaluator path on the same distributions and record p50/p95 for preparation, indexing, exact count/delta computation, first evidence page, subsequent paging, Apply, and worker roundtrip. Record peak/retained memory and input responsiveness, including overlapping draft edits and a refresh. Separate count-only review from full query expansion. Repeat relevant probes in M2/M3. Use immutable snapshots, one un-cached baseline, and ordinary shared timing guidance. Do not invent an SLA from these container medians.

Use measured bottlenecks to justify any cache keyed by definitions plus source snapshot, worker changes, or an explicit user-facing expansion safeguard. Do not add an arbitrary row limit or silently truncate outputs. Full pair counts and bounded visible evidence are compatible; the scope label must make that distinction clear. If exact count exceeds safe numeric representation, report the exact count through an appropriate internal integer representation and formatted text rather than silently rounding it.

## Proposed verification run sheet

The following commands are for Codex after implementing the relevant milestone, from the repository root. New test paths are proposed above; reuse existing suites if the checkout already has them. Use repository timing configuration. Do not run `pnpm check` concurrently in multiple worktrees.

```bash
# Focused membership, occurrence, serialization, and folder verification.
pnpm --filter exploreda exec vitest run src/test/lib/analysis/evaluateProject.test.ts src/test/lib/analysis/joinKeys.test.ts src/lib/dsl/project.test.ts src/lib/project/folder.test.ts
pnpm --filter exploreda check-types

# Verify registrations immediately after adding the example.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# Run the source-backed demo; use the URL printed for this worktree.
pnpm dev:agent

# Capture the runnable example at the repository's standard three widths.
pnpm shot /examples/join-key-preparation --name join-keys

# Build once for the docs/folder Playwright workflow and run its feature project.
# Add the explicit join-keys Playwright project described above before using it.
pnpm --filter demo build
pnpm --filter demo docs:verify --project=join-keys
pnpm --filter demo docs:verify --project=pages -g '/docs/join-keys$'

# Each user-visible library PR includes its own appropriate minor changeset.
pnpm changeset:add minor "Prepare reusable join keys and review exact matching records."

# Final broad repository gate, once per delivered PR from one worktree.
pnpm check
pnpm dev:agent --stop
```

Also run the located hook/selection tests and the new notebook/JSON integration tests, with their actual paths. Screenshots support review but do not replace real pointer/keyboard interaction. Attach visible-change screenshots according to `AGENTS.md`; keep scratch screenshots out of committed source. Do not publish, merge, or deploy as part of this research handoff.

## Access, checks, deliverables, and remaining decisions

**Access:** The attached packet identifies the requested commit and contains 45 complete files. The review covered all 45 through the team: repository instructions and direction; project types/evaluator/tests; relationship/query/schema/row identity UI; project JSON/text/folder/notebook readers and writers/tests; shared parsing/category/calculation code; and supplied docs/example registration files. The complete files-read list is in [design-report.md](design-report.md). Imported worker/host/diagram renderer implementations not included in that inventory remain inspect-first implementation seams, not invented evidence.

**Executed checks:** Independent manual-key membership arithmetic covered F1 pairs, totals, reverse/reorder/refresh behavior and F3 structural expectations; isolated standard-string probes covered the listed Unicode/whitespace behavior; the reference cost probe above was measured. No repository module was imported by those checks. Application unit tests, browser interaction, worker lifecycle tests, save/reopen integration, and integrated performance are proposed acceptance work for Codex.

**Deliverables:** [implementation-plan.md](implementation-plan.md) is this standalone milestone plan; [design-report.md](design-report.md) gives the design, comparisons, fixtures, and primary sources. Both are linked for download in the accompanying response.

**Open decisions:** Confirm the proposed public names and prepared relationship block spelling during integration; choose the exact review pagination presentation after fitting the existing controls; use actual integrated measurements to decide whether optimization or an explicit expansion safeguard is needed. Explore manual typed exceptions and broader Unicode conventions separately. None is an outside-demand gate, and none prevents starting M1 with the concrete contracts and fixtures above.
