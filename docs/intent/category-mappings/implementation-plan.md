# Reusable category mappings

Build **Map categories** as one project query step. It creates a new categorical field from explicit, typed entries.
Keep original values, row keys, and source records. Let the author review, apply, revise, remove, and undo the recipe.
Ship manual mapping first, then reviewed suggestions. This plan is proposed work; no mapping feature exists yet.

The [research summary](../../research/category-mappings-2026-10-24/README.md) records sources and local dispositions.
Baseline: `95832bd473884aeae23453af0888b4ca5187820d`. Compare the implementation checkout before editing.
Byron supplies demand. No outside user or study is a prerequisite.

## Contract

- Add `kind: "map"` to `AnalysisStep`. Save `id`, `inputStepId`, `inputFieldId`, immutable `fieldId`, and editable `label`.
- Keep `entries: { sourceKey: string; target: string | number | boolean | null }[]` inline in that step.
- Save `unmatched: { kind: "keep" } | { kind: "value"; value: target }`. Default to Keep category.
- Use canonical `categoryKey` strings for source identity. Reject malformed keys and duplicate entries before reading rows.
- Accept exact text, finite numbers, booleans, or null as targets. Normalize authored negative zero to zero.
- Match once against input-stage values. `A→B, B→C` produces `[B,C,C]`. A swap runs once without recursion.
- Keep means `categoryValue(raw)`: null and undefined become null only in the new field. Other values stay unchanged.
- Constant fallback applies to every unmatched category, including missing. An explicit missing entry takes precedence.
- Number `1`, text `"1"`, boolean `true`, and text `"true"` stay distinct. Empty text and whitespace stay present categories.
- Numeric NaN and infinities can be matched or kept. They cannot be authored targets. Literal text remains distinct.
- Preserve row count, order, keys, source references, contributors, measure contributors, and row unit.
- Give the output `{ stepId }` origin and a derived categorical default. Preserve explicit view conversions separately.
- Recipes read the complete input stage, after upstream query filters and before chart filters. Label that scope in review.
- Preserve existing filter predicates when targets change. A North filter does not become a Northern filter.
- Keep selections by logical row key. Do not claim stable refresh identity for keyless or duplicate-key data.
- Views of one query share its recipe. Copied queries own independent entries. Source files remain intact.

Explain aliases versus analytical grouping in the editor. Use the output label to describe the choice.
Do not add Pro's saved `purpose` enum: it changes no evaluation, dependency, or persistence behavior.
Reversible means changing or removing the recipe. A many-to-one map has no unique inverse.

## M1 — Complete manual mapping in project workspaces

Outcome: author a map in Query, inspect exact rows, use its field across charts, revise it, and save/reopen it.
Support one-source projects, the demo, and the folder app. Existing bare `ExplorEda(data, savedData)` hosts stay outside this feature.
Reuse `singleTableProject` when an embedding host chooses to adopt the project model.

These work packages form one complete release. They are internal implementation steps, not separate user-facing milestones.
Risk: a correct evaluator can still lose its recipe during folder save or show stale notebook rows.

### Evaluation, metadata, and dependencies

Start in `packages/explorEDA/src/types/AnalysisProject.ts`, `lib/analysis/evaluateProject.ts`, and `lib/analysis/projectFile.ts`.
Add a small proposed `lib/analysis/categoryMapping.ts` helper for matching, validation, and review counts.
Use the same semantics for preview and committed evaluation. Match with `Map.has`; null is a valid target.
Reject missing inputs, reserved/qualified output IDs, and collisions even on empty input. Generate the output ID once.

Use `calculateFrame`'s row-preserving pattern. Add the map case to `queryEditing.ts` titles/details and `schemaGraph.ts` lineage.
Do not mark the output as a source relationship field.
Thread a small categorical hint through `ExplorEdaProject.fieldTypes`, declared/restored settings, and stage profiles.
Test the no-settings path: `renderedSettings` currently returns undefined there. Do not claim a string type for mixed scalars.

Reuse or extract `projectFile.ts::fieldsAt` for structural dependency checks in candidate edits and step removal.
Check calculations, filters, aggregates, relationship inputs, and map inputs without relying on nonempty rows.
Keep this extraction local to project field validation; do not create a general dependency framework.

### Authoring, exact rows, and revision

Extend `components/project/ProjectQueryPanel.tsx`, `QueryFlow.tsx`, `QueryStageRows.tsx`, `stepEditing.ts`, and `settingsCompatibility.ts`.
Add a proposed `CategoryMappingEditor.tsx`; split local state only when that keeps the component clear.
Reuse the schema editor's callback and known-view contract. Keep one recipe owner.

The flow is Query → Map categories → input field → source values → typed target → preview → Apply.
Show Input, Output label, fallback, Values/Rows tabs, search, and reachable Apply/Cancel actions.
Keep selected category keys across search/pages. Select shown selects the displayed page only and states its count.
Render text quoted, with scalar type and visible whitespace. Make long values available through keyboard and touch.
Draft changes and Cancel emit zero project callbacks. Apply emits one `onProjectChange`; charts keep their own callback.

Review counts are independent: Mapped/Unmatched and Changed/Unchanged overlap. Missing input means null/undefined; show blanks separately.
Target membership includes passthrough values already equal to the target.
Rows show original/derived values, rule or fallback, logical row key, and direct source access.
Keep exact carried source references separate from broader `relatedRecords()` results and ambiguous candidates.
Show result-row count separately from distinct-source-record count. Make all source records reachable beyond the current 25-row cap.

Preserve output field IDs, filters, scales, chart layouts, and row selections during edits.
Name known affected views and notebooks. Block removal when later query steps need the field, including empty inputs.
For view-only dependencies, offer explicit confirmation and retain settings as unavailable. Do not delete charts or notebook text.

Reuse the existing evaluator worker. Retain the applied project/tables/query/bindings with the finished result in local hook state.
Compare them with requested inputs before preview, inspection, or Apply. Status alone misses the render before a new effect starts.
Keep stale drafts, hide stale counts, and require Refresh preview. No new worker protocol or durable revision system is needed.

Demo project history already uses `captureProject`. Test one Apply as one checkpoint.
For a folder host, provide one session-local Undo mapping change action through the same project callback.
Keep the previous and expected owning query. Invalidate undo after another query-definition edit or external reload.
Restore that query into the current project/view and recheck dependencies. This preserves unrelated chart edits.
Do not build Pro's per-edge inverse patch system or promise persistent history.

### Persistence and folder notebooks

Extend project JSON validation, selected-view export closure, and immutable query copies.
Keep project/file version 1. Canonical source-key strings avoid demo history's JSON loss of nonfinite rule values.
The existing source codec can reload negative zero as positive zero; assert category membership, not bit-exact archival.

Extend `lib/dsl/project.ts` compilation, export, and default IDs. Use a small nested declaration:

```text
map @map-region region_group "Region group" on=records.value otherwise=keep {
  entry source="North" target="North"
  entry source="north" target="North"
  entry source="North " target="North"
  entry source=missing target=null
}
```

Use the existing `from=` convention for a nonprevious input.
Sources accept JSON strings/numbers, booleans, missing, NaN, Infinity, or -Infinity. Targets accept JSON scalars with finite numbers.
Quote every exported string. `otherwise="keep"` is a text fallback; `otherwise=keep` preserves categories.
Parse quoted entry values from raw tokens with `JSON.parse`. Existing `scalar` and generic unquoting do not enforce this contract.
Reject duplicates and malformed entries with location errors. A rejected map must not leave a plausible partial query on reload.
Keep strict handling specific to this new declaration unless a shared parser change proves necessary.

Complete these verified integration seams in `lib/project/writeFolder.ts`, `folder.ts`, and `apps/app/src/ProjectWorkspace.tsx`:

1. Omit an implicit query only while its definition equals the loaded source-only query. Persist edited queries explicitly.
2. Establish an effective project path when absent, using existing visible/hidden conventions in `projectActions.ts`.
3. Include required source declarations and resolved paths for newly explicit queries, including analysis-local sources.
4. Use that effective path for serialization, dirty tracking, and subsequent writes. Preserve source file ownership and bytes.
5. Await first project creation before dependent analysis writes. Reuse the host saver; do not introduce file transactions.
6. Preserve failed edits for retry and show actual save status. `FolderSaver.flush` currently writes queued files in parallel.
7. Reevaluate notebooks from current text/project/tables through `readNotebookText`, preserving last-valid block text.
8. Include notebook consumers in removal review. Current `allViews` includes analysis views only.

Notebook sheets consume the mapped query without a separate mapping store or fenced declaration.
This feature does not add linked filtering between notebook blocks.

### Docs, examples, and proof

Add `apps/demo/src/docs/pages/category-mappings.mdx`, register it in `docs/catalogue.ts`, and link related field/project/notebook pages.
Add a proposed `/examples/category-mappings` project example through `demos/examples.ts` and `coverage.ts`.
Include raw/applied presets, exact records, revision, removal/undo, and a resettable refresh.
Use existing project example support. The docs live-example host does not yet provide a project recipe editor.
Add a five-record folder fixture under `packages/explorEDA/examples/category-mappings/`, with dashboard and two-sheet notebook instructions.
Provide visible/hidden and implicit/no-project variants in persistence tests.

Use these exact acceptance fixtures. Construct special values in TypeScript, not ordinary JSON:

```ts
const values = [
  "North",
  "north",
  "North ",
  "North-East",
  "North East",
  1,
  "1",
  true,
  "true",
  null,
  undefined,
  "",
  " ",
  "(missing)",
  NaN,
  "NaN",
  Infinity,
  -Infinity,
  -0,
  0,
  "001",
  "ACME",
  "\u0410CME",
  "é",
  "e\u0301",
  "West",
  "W.",
  "East",
];
```

Give rows independent IDs R01–R28. Ten entries map North/north/North-space→North, numeric 1→Numeric one,
true→Enabled, empty text→Empty label, numeric NaN→Invalid measurement, zero→Zero, and West/W.→West.

| Check                | Expected result                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Keep fallback        | 28 rows; 26 source categories; 23 output categories; 11 mapped; 9 changed; 17 unmatched; 19 unchanged       |
| Membership           | North R01/R02/R03; West R26/R27; Zero R19/R20; missing R10/R11                                              |
| Raw values           | R11 stays undefined; its output is null. Original R19 stays negative zero in memory.                        |
| Odd-ID linked filter | 14 visible rows, two visible North rows; review still sees 28 rows and three North members                  |
| Refresh              | Remove R03; make R06 text "1"; add R29 "NORTH" and R30 "North "; reverse source order                       |
| Refreshed result     | 29 rows; 23 output categories; 10 mapped; 8 changed; 19 unmatched; North R01/R02/R30                        |
| Refresh identity     | R06/R07 share text "1"; numeric-1 entry has zero rows; removed R03 never becomes R30                        |
| Other fallback       | 17 Other rows; adding missing→null leaves 15 Other and two missing                                          |
| Null fallback        | 17 missing outputs; no excluded rows                                                                        |
| Revision             | North→Northern keeps output ID; North filter has zero matches, Northern has three; selected R02 remains R02 |
| Source access        | One aggregate group over 40 source rows exposes all 40, including P40                                       |
| Ordinary folder      | North/north/North-space/South/null → five rows, three categories, North 3, South 1, missing 1               |

Keep a few focused tests for evaluator/membership, mounted callback/freshness/removal, and serialization/folder/notebook boundaries.
Extend existing `lib/project/folder.test.ts`, `writeFolder.test.ts`, and app tests rather than creating another test framework.
Test typed targets, simultaneous chains/swaps, duplicate keys, zero-row validation, copied-query isolation, and control-character text round trips.
Test no-settings categorical metadata, explicit conversion overrides, save failure, and undo with an unrelated chart edit.

Browser proof must use 1280, 783, and 390 pixels with real keyboard, pointer, and touch flows.
Use the existing Query panel; narrow layouts need reachable Apply/Cancel, one main scroller, and nested Escape/focus return.
Exercise the demo folder route and actual app save/restart/notebook flow separately.
New browser files must end in `.e2e.ts` and have explicit project discovery in `apps/demo/playwright.config.ts`.
The current project regexes will not discover Pro's proposed `.spec.ts` file.
Capture implemented controls with `pnpm shot`; use `app-shot.mjs` for the app. Derive selectors from observed UI.

Profile 100,000 rows with 10,000 codes repeated ten times. Map the first 100 codes to Grouped.
Expect 1,000 mapped/changed, 99,000 unmatched, and 9,901 output categories. Measure inventory, preview, Apply, search, and DOM size.
This workload sets no product capacity limit. Reuse workers and page rendered lists before adding machinery.

Run targeted tests and types during implementation, docs/coverage checks, then serialized `pnpm check` before the implementation PR.
Add a minor changeset and upload UI screenshots with `gh --attach`. This planning PR needs neither.

## M2 — Reviewed suggestions and field entry point

Outcome: request Trim edges, Ignore letter case, or their combination, then accept explicit entries after review.
Depend on M1. Risk: suggestions can look like identity rules or overwrite approved entries.

Add a proposed `lib/analysis/categoryMappingSuggestions.ts` and extend the same editor.
Use `trim()`, `toLowerCase()`, or their composition on present text only. Do not call lowercasing full case folding.
Nothing is preaccepted. Show exact members/counts, target, conflicts, and row access. Accepting suggestions changes only the draft.
Save explicit entries, never an automatic normalization rule. New spellings after refresh remain unmatched until approved.
Add a field action that opens the same editor/controller; identify the existing shared action owner before changing it.

On a fresh fixture, trim proposes two North rows; lowercase proposes two; combined mode proposes three.
Rejecting or drafting a proposal emits zero callbacks. Apply emits one. Already assigned members require an explicit move.
Keep codes, punctuation variants, Latin/Cyrillic lookalikes, and composed/decomposed é distinct under these modes.
US/us remains a proposal the author can reject.
Update the category mapping docs and runnable example in this milestone. Repeat responsive and keyboard/touch review checks.

## Later choices

Explore fuzzy ranking or separately named Unicode normalization only after M2. Measure useful proposals and review cost.
Any prototype includes its own docs/example and never delays manual mapping.
Defer automatic standalone promotion, shared registries, external lookup maps, formula authoring, and locale settings.
Avoid source rewriting, automatic merging, join-key coercion, global category identity changes, and version coexistence.
