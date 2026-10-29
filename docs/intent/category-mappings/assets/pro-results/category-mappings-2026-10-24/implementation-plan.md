# explorEDA category mappings — implementation plan

**Decision:** ship an explicit, row-preserving `map` query step and a complete manual editor in project hosts, including one-source projects. A saved mapping creates a new categorical field, preserves the original values and row identities, and can be inspected, edited, removed, and restored with guarded undo. Byron supplies the demand. M1 includes working persistence, folder use, notebook consumption, documentation, and a runnable example; a type or evaluator alone is not a release.

This plan implements **CM01–CM14** in the accompanying [report.md](report.md). **CM15** is optional exploration; **CM16–CM20** define deferred or avoided scope. The inspected baseline is `95832bd473884aeae23453af0888b4ca5187820d`. Repository paths and symbols below identify actual inspected seams; **new** marks proposed files or modules. Compare those seams with the implementation checkout before editing. PRs #518–#521 supply no assumed types, helpers, or dependencies.

All application tests, screenshots, folder runs, and measurements below are **proposed acceptance work**, not completed evidence. The Design run executed only the independent fixture oracle reproduced in the report. It did not implement or test the application feature.

## 1. Contract to preserve throughout implementation

Use the report's exact `CategoryMapStep`: `kind: "map"`, `id`, `inputStepId`, `inputFieldId`, a fresh unqualified immutable `fieldId`, editable `label`, `purpose: "aliases" | "grouping"`, inline `entries: { sourceKey, target }[]`, and `unmatched: { kind: "keep" } | { kind: "value", value }`.

- **Identity:** persist `sourceKey` as the canonical string returned by existing `categoryKey`, never as a raw scalar or formatted label. Number `1`, text `"1"`, boolean `true`, and text `"true"` differ. Null/undefined share one missing key; −0/+0 share numeric zero. Empty and whitespace text remain categories. Nonfinite numeric keys differ from their text spellings. Do not change global equality.
- **Targets:** string, finite number, boolean, or null; normalize target −0 to zero. Apply the same validator to a constant fallback. Text is exact, including empty text and spaces. Reject undefined/nonfinite targets.
- **Evaluation:** entries read the input-stage field once, simultaneously. `A→B, B→C` yields `[B,C,C]` on `[A,B,C]`; `A↔B` swaps once. Duplicate source keys are errors even with identical targets. Keep means `categoryValue(raw)`, or `raw ?? null`, in the new field only. Constant fallback applies to every unmatched category, including missing.
- **Metadata and provenance:** retain row count, order, keys, source references, contributors, measure contributors, and row unit. Set output origin to `{ stepId }`; never impersonate a source relationship field. Supply a categorical default without coercing typed values or inheriting the input field's conversion settings.
- **Ownership:** drafts are local. One Apply commits one immutable project change through `onProjectChange`; chart settings retain their separate callback. Independent query copies own independent entries. No shared registry, `SavedDataStructure` mapping store, formula authoring, source rewriting, or generic preparation framework is required.

### Exact acceptance anchors

The report's **F01–F09** fixtures are normative. Put the full runtime fixture in a shared **new** TypeScript test fixture so undefined, nonfinite values, and −0 are constructed deliberately; ordinary CSV/JSON cannot represent that complete set faithfully.

| Scenario | Required result |
| --- | --- |
| F01: 28 rows, ten entries, Keep | **26 source categories → 23 output categories; 28 retained rows; 11 mapped; 9 changed; 2 mapped identities; 17 unmatched; 2 missing-category inputs.** Total unchanged is 19. |
| F01 exact membership | North: **R01/R02/R03**; West: **R26/R27**; Zero: **R19/R20**; missing: **R10/R11**. R11's original remains undefined while its output is null. |
| F02: odd-ID linked filter | **14** visible rows, **2** visible North rows; mapping review still uses **28** input rows and **3** North rows. |
| F03: remove R03; R06 becomes text `"1"`; add R29 `"NORTH"`, R30 `"North "`; reverse rows | **29 rows; 10 mapped; 8 changed; 2 mapped identities; 19 unmatched; 23 output categories.** North is R01/R02/R30; text `"1"` is R06/R07. Numeric-1 entry remains with zero current rows. |
| F04: constant `"Other"` fallback | **17 Other** rows; adding explicit missing→null leaves **15 Other + 2 missing**. Null fallback yields **17 missing** outputs. |
| F09: ordinary folder fixture | F01 `"North"`, F02 `"north"`, F03 `"North "`, F04 `"South"`, F05 null. Three North entries plus Keep yield **5 rows, 3 categories, North 3, South 1, missing 1; 3 mapped, 2 changed, 2 unmatched**. |

Mapped means an explicit entry matched; Changed means the category key changed, including changes caused by fallback. These are independent selectors, not mutually exclusive totals.

## 2. M1 — Complete manual mapping, saved and inspectable

**User-visible release:** from Query, choose a field, select exact source categories, assign typed targets, review full-stage counts and records, then Apply. Use the new field across linked charts and saved views. Reopen the recipe, revise it, remove it with dependency checks, and undo the last compatible mapping change. Save/reload project JSON and `.eda`, use a one-source folder, and see revisions in notebooks before reloading the page.

**Recommendations:** CM01–CM13. **Dependencies:** baseline project evaluation, existing workers, field metadata, Query/Schema hosts, project callbacks, and folder serialization. **Main risk:** a locally correct map can still lose its definition, show stale notebook rows, or silently invalidate downstream fields. Complete all work packages and acceptance checks before shipping M1. The packages below are ordered internal work, not independently shippable feature milestones.

### M1.1 — Shared validation, evaluator, and categorical output

**Existing paths:** `packages/explorEDA/src/types/AnalysisProject.ts`; `lib/analysis/evaluateProject.ts`; `lib/analysis/projectFile.ts`; `lib/categories.ts`; `components/ExplorEdaProject.tsx`; `lib/schema/schemaGraph.ts`. Paths in this paragraph are relative to `packages/explorEDA/src/` after the first full path.

**New:** `packages/explorEDA/src/lib/analysis/categoryMapping.ts` for the small pure compiler/evaluator and audit summary; `lib/analysis/queryFieldDependencies.ts` if extracting the existing `projectFile.ts::fieldsAt` logic requires a shared module. Keep category matching, validation, and preview calculations authoritative in this helper; do not implement separate preview semantics.

Validate the whole recipe before reading rows: required nonempty IDs/label, purpose enum, entry array/records and required keys/targets, unmatched discriminator, finite targets, canonical source-key shapes, and duplicate keys. Decode and reconstruct keys, requiring `categoryKey(representative) === sourceKey`. Resolve the input against structural fields even for zero rows. Reject absent inputs, reserved/qualified output IDs, and collisions; generate the output ID once and preserve it on label changes.

Add the evaluator branch using the row-preserving calculate-frame pattern: spread the existing row, replace `values` and `data`, retain identity/provenance, and report zero exclusions. Derive output metadata, for example `AnalysisField.categorical?: true` with mixed-domain `type: "unknown"`. Thread the hint through **both** `ExplorEdaProject.fieldTypes`/initial provider initialization and declared/restored field settings, plus stage profiles. Updating `declared` alone fails the no-settings path because `renderedSettings` can be undefined. Preserve explicit view conversions; exact mapping preview precedes those conversions.

Extend shared structural dependency validation for map input, parsed calculation dependencies, filters, aggregate group/measure/entity fields, and relationship inputs. Reuse it for import, candidate edits, and removal. Existing empty-table evaluation in `stepEditing.queryFields` cannot by itself detect every broken downstream field. Add map lineage in `schemaGraph.queryLineage` without source-field origin or a required new glyph.

**Exit evidence:** F01/F03/F04/F05 pass through the real evaluator; empty valid input remains editable; malformed steps fail even on empty input; original rows and provenance stay intact. A downstream aggregate has **23 groups**, one missing group of **2**, and exact source-reference coverage of all **28** records.

### M1.2 — Project JSON and strict project-text persistence

**Existing paths:** `lib/analysis/projectFile.ts`; `components/project/queryEditing.ts`; `lib/dsl/project.ts`; `lib/dsl/parse.ts`; `lib/dsl/paths.ts`; `apps/demo/src/savedViewsHistory.ts`, with library-relative paths as above.

Add `map` to shape/field validation, evaluation dispatch, `stepTitle`, `stepDetail`, and project text's `compileStep`, `stepLines`, and `stepDefaultId`. Preserve maps through project stringify/parse, selected-view closure, query copy, and demo checkpoints. Copy/update nested entries immutably; editing a copied query must not change its original. Retain project/file version 1 under the one-deployed-version assumption.

Inline ownership also resolves whole-query removal: removing that query removes its mapping recipes, with no registry cleanup. Keep view/notebook dependency decisions explicit; do not add a new whole-query deletion surface for M1. The existing `components/schema/schemaEditing.ts::SchemaProjectEditing` contract already supplies the confirmed-edit callback and known views for shared schema editing.

Implement this small nested syntax:

```text
map @map-category category_group "Category group" on=records.value purpose=aliases otherwise=keep {
  entry source="North" target="North"
  entry source="north" target="North"
  entry source="North " target="North"
  entry source=missing target=null
}
```

Header `from=stepId` selects a nonprevious input. Entry sources accept quoted JSON strings, finite JSON numbers, booleans, `NaN`, `Infinity`, `-Infinity`, or canonical `missing`. Targets accept only quoted strings, finite JSON numbers, booleans, or null. Compile directly to canonical keys. Export every string quoted; `otherwise="keep"` is a text fallback distinct from `otherwise=keep`.

Use a mapping-specific strict scalar parser over raw pair tokens. Existing `project.ts::scalar` is too permissive for numeric spellings, and generic `parse.ts` unquoting does not preserve every JSON control escape. Parse quoted tokens with `JSON.parse`; reject bare arbitrary text, radix/ambiguous leading-zero numbers, missing entry members, duplicates, and nonfinite fallback. An invalid map must fail its query, not be skipped into a plausible partial/source-only result.

**Exit evidence:** F07 round trips the recipe and reevaluated result, including empty text, leading-zero codes, typed collisions, special-number source keys, missing, quotes, backslashes, commas, equals, braces, and control escapes. Source −0 may reload as +0 through the existing JSON codec; assert unchanged category membership, not unsupported bit-exact archival. Source files remain untouched.

### M1.3 — Shared editor, exact inspection, freshness, and guarded undo

**Existing paths:** `components/project/ProjectQueryPanel.tsx`, `QueryFlow.tsx`, `QueryStageRows.tsx`, `stepEditing.ts`, `queryEditing.ts`, `settingsCompatibility.ts`; `components/schema/SchemaStepEditors.tsx`; `components/ExplorEdaProject.tsx`; `lib/analysis/useAnalysisEvaluation.ts`.

**New:** `components/project/CategoryMappingEditor.tsx`, `useCategoryMappingEditor.ts`, and a small exact-value cell helper if useful. These names describe proposed modules, not baseline capabilities. Query and schema editing share this controller and validation; `QueryRelationshipBuilder` is relationship-specific and should not acquire a second recipe owner.

Provide Input, Output label, Purpose, fallback, searchable paged Values, typed Target, Values/Rows tabs, Apply, and Cancel. Build an exact category inventory over the entire input stage before chart filters. Keep selected keys across search/pages. **Select shown selects only the currently displayed page**, displaying its count. No automatic acceptance or hidden selection of unseen pages. Invalid drafts retain their values and leave committed charts unchanged. Read-only hosts expose inspection without edit commits.

Rows review independently selects All/Mapped/Unmatched, All results/Changed/Unchanged, and Missing input; show original/derived exact values, reason, row key, and source access. Render every string quoted with whitespace detail, explicit scalar types, and separate raw null/undefined readings. Count target membership including passthrough values matching the target. Add a mapping-specific focus caption and profiles that describe the inspected scope to `QueryStageRows`; its current generic missing renderer is insufficient.

Make every source record reachable: the nested source table's current first-25 limit needs paging/reveal-more, not merely a notice. Keep direct carried source references distinct from broader `relatedRecords()` children and ambiguous contributors. Show result-row count and distinct-source-record count separately when expansion/aggregation changes their relationship.

Reuse existing workers. Retain the applied project, tables, query ID, and binding inputs with the completed evaluation in local hook state. Compare requested/applied inputs before preview or source inspection; status alone has a pre-effect stale window. Capture matching inputs, input-step ID, and draft signature with each preview. Recheck on Apply. Source/project changes preserve draft text but hide stale counts, disable Apply/inspection, and require Refresh preview. No new worker protocol or durable revision system is needed.

Commit through `ExplorEdaProject.onProjectChange({ project, view })`. Expose one guarded Undo mapping change token containing the previous/expected step and affected query-edge patch. Apply its inverse to the **current** project, preserve unrelated edits, revalidate structural/view dependencies for undoing add/remove, and invalidate on a conflicting step, incompatible query change, or external reload. Do not restore an old whole-project snapshot. Demo `captureProject`/`pushCheckpoint` retains its broader history; the folder host has no inspected generic undo stack.

Preserve typed filters, stable row selections, layouts, and saved scales. Editing North→Northern leaves a North filter with **0** matches and Northern with **3**; R02 remains selected. Never retarget filters or choose an alias color automatically. Removal blocks named downstream step dependencies even at zero rows. For view-only consumers, name known affected views/notebooks, require the existing explicit removal choice, and retain their unavailable settings. Pass known consumers into Query removal, not only schema inspection.

**Responsive acceptance:** at **1280 px**, use the existing widened Query panel with compact controls and remaining chart context; at **783 px**, a bounded single-column overlay; at **390 px**, a temporary full-width sheet with one main scroller and reachable fixed Apply/Cancel. Limit horizontal scrolling to tabs/record tables. Preserve 28/32-pixel control styling and accessible touch targets. Keyboard search, Space selection, target entry, Apply, nested Escape, and focus return must work; touch opens exact values/source records without hover or modifiers. No permanent inspector or per-mark Inspect buttons.

### M1.4 — Folder ownership, save ordering, and current notebooks

**Existing paths:** `apps/app/src/ProjectWorkspace.tsx`, `App.tsx`, `projectActions.ts`, `saver.ts`; `packages/explorEDA/src/lib/project/folder.ts`, `writeFolder.ts`; `lib/notebook/readNotebook.ts`, `compileNotebook.ts`, `sheets.ts`.

Implement the three concrete persistence fixes together:

1. `projectFileText` may omit an implicit query only while it equals its originally loaded source-only definition. Persist an edited implicit query explicitly; a map must survive first save.
2. When `folder.projectPath` is absent, establish an effective canonical visible/hidden project path using existing conventions. Include required source declarations and correctly resolved paths, even for sources originally declared in analysis files. Compilation reads project references before those local declarations. Keep the effective path authoritative for dirty tracking, `fileText`, and later writes; do not move data files.
3. Await the prerequisite project-definition write before dependent analysis writes on first creation. Reuse the host serializer/saver; the editor never writes files. Ordinary edits generally update project text only. Current delayed/parallel saves are not a multi-file transaction: expose Saving/Failed truthfully, retain unsaved edits for retry, and do not announce Saved from local state alone.

Evaluate the selected notebook from its **current** text, project, and tables using `readNotebookText`, preserving last-valid block behavior. Do not keep feeding the folder-load `notebook.result.rows` after dashboard query edits. Both sheets consume the same mapped query; existing notebook selections remain chart-local. Include compiled notebook query/settings usage in dependency impact, since current `allViews` lists analysis views only. External reload/remount invalidates pending mapping preview and undo.

**Exit evidence:** F09 survives save/restart from an implicit query and an analysis-local source with no initial project text, in visible/hidden layouts. Original values remain exact. Dashboard North→Northern edits appear in both notebook sheets before page reload. A controlled prerequisite-write failure retains an explicit unsaved state and does not leave a dependent analysis advertised as saved.

### M1.5 — Documentation and runnable examples ship with the feature

**New:** `apps/demo/src/demos/categoryMappings.ts`, registered in existing `apps/demo/src/demos/examples.ts` as **`/examples/category-mappings`**. Use its existing project/tables/query-presets/views support for the complete F01 runtime fixture, original/mapped charts, and a second saved view. Provide a raw-start preset and an applied example, with manual North selection, inspection, revision, removal/undo, and reset instructions. A proposed demo-only refresh action implements F03 through the table state owned by `SavedViewsWorkspace.tsx`; it must preserve project/history callbacks rather than mutating fixture arrays. Register required coverage in `demos/coverage.ts` and associated tests.

**New:** `apps/demo/src/docs/pages/category-mappings.mdx`, registered in `docs/catalogue.ts`; cross-link relevant sections of `fields.mdx`, `calculated-fields.mdx`, `project-folders.mdx`, and `notebooks.mdx`. Explain aliases versus analytical grouping, exact typed identity, missing/blank distinctions, full-stage scope, fallbacks, refresh, consumer effects, undo boundaries, and independent query copies. Link the runnable project example. `docs/live/examples.ts` currently hosts simple data/SavedDataStructure examples; do not assume it can run a project map without extra host work.

**New proposed folder fixture:** `apps/demo/public/category-mappings-project/`, containing F09 `records.json`, a project/analysis example, a two-sheet notebook, and launch instructions. Generate or copy its no-project/implicit variants in persistence tests. Distinguish this ordinary-scalar example from F01's runtime special values. Update inaccurate folder undo wording to the implemented bounded action, without promising generic session history.

### M1 evidence and release checks

Keep evidence types separate; share fixtures rather than duplicating implementations in tests.

| Evidence | Focused proposed files and decisive assertions |
| --- | --- |
| **Evaluator** | **New** `src/test/lib/analysis/categoryMapping.test.ts` plus the existing evaluator/selection tests: F01/F03/F04 counts and IDs, unchanged provenance/raw values, typed targets, fallback, simultaneous chains/cycles, full empty-input validation, 23 downstream groups, no source mutation. |
| **Mounted UI** | **New** `src/test/components/project/CategoryMappingEditor.test.tsx`; extend existing `src/test/lib/analysis/useAnalysisEvaluation.test.tsx`: typing/preview/Cancel **0** project calls; Apply **1**; Undo **1 additional**. Assert no-settings categorical defaults, preserved explicit conversion, F05 blocked removal, F06 filters/selection, stale pre-effect/pending guards, and unrelated-layout preservation. |
| **Persistence/host** | **New** `src/test/lib/analysis/categoryMappingPersistence.test.ts` and `src/test/lib/project/categoryMappingFolder.test.ts`; host test beside `ProjectWorkspace` using its configured harness. Assert F07 plus F09 implicit/no-path saves, notebook freshness, save failure, copy isolation, and actual demo history. |
| **Browser** | **New** `apps/demo/e2e/category-mappings.spec.ts`; actual demo and folder flows at 1280/783/390. Exercise keyboard/touch, long values, search/page selection, >25 reachable source records, conflicting draft, pending refresh, saved-view effects, notebook switching, and restart. Record screenshots and observed values. |
| **Performance** | F08: **100,000 rows**, **10,000** text codes repeated ten times; first 100 codes→Grouped. Expect **1,000 mapped/changed, 99,000 unmatched, 9,901 output categories**. Measure inventory, preview, Apply, search, rendered DOM size, and exact-record access; record machine/browser/timings. This is a profiling workload, not a capacity cutoff or preclaimed latency. |

Paths beginning `src/` in this table are inside `packages/explorEDA`. The host harness location is an implementation-checkout detail to verify, not evidence that a new app testing setup is already present. Do not add a parallel test framework solely for this feature. Browser evidence must exercise the actual folder host even if its focused component harness needs adaptation.

## 3. M2 — Reviewed deterministic suggestions and field shortcut

**User-visible release:** from the same editor, request **Trim edges**, **Ignore letter case**, or **Trim + ignore case** candidates; review exact members/counts, choose a target, and accept selected proposals into the draft. Add a field-menu action opening the same controller with its input field chosen. **Recommendations:** CM14 and continued CM05/CM13. **Dependency:** shipped M1. **Main risk:** a normalization convenience being mistaken for authoritative equality or silently overwriting an approved entry.

**New:** `packages/explorEDA/src/lib/analysis/categoryMappingSuggestions.ts`. Extend `CategoryMappingEditor.tsx` and the existing shared field-action owner identified from the implementation checkout; keep one controller and callback path. Use `trim()`, `toLowerCase()`, or their composition on present string categories only. No numeric parsing, punctuation removal, accent stripping, normalization, locale setting, or full case-folding claim. Candidate generation reads the complete inventory; rendering stays paged.

Nothing is preaccepted. Each proposal shows exact members, full-input counts, target, and row access. Accept/reject and member selection affect only the draft. Already assigned members require an explicit move; proposals cannot replace approved entries silently. Apply saves ordinary explicit entries, with no normalization expression, fuzzy score, or remembered algorithm needed for evaluation.

**Acceptance:** on a fresh F01 draft, Trim edges proposes North plus North-space (**2 rows**); Ignore case proposes North plus north (**2**); combined mode proposes all three (**3**, with **2 changed** when targeting North). Rejecting a proposal yields **0** project callbacks. Accepting it still yields **0** until Apply, which yields **1**. The refresh's `"NORTH"` remains unmatched unless explicitly accepted. Added `"US"`/`"us"` are reviewable and rejectable; numeric 1/text `"1"`/`"001"`, North-East/North East, Latin/Cyrillic ACME, and composed/decomposed é remain distinct under these modes. Selection of a page must never accept unseen candidates.

Add focused proposal tests to **new** `src/test/lib/analysis/categoryMappingSuggestions.test.ts`; extend the mounted/browser tests for review, conflicts, shortcut scope, keyboard and touch. Update the category-mappings docs with exact algorithm semantics and domain-sensitive examples. Extend `/examples/category-mappings` with resettable suggestion review and refresh rejection scenarios in the same milestone. Capture the new review state at all three widths and rerun relevant docs/coverage gates.

## 4. M3 — Optional candidate-ranking experiment

**Disposition: Explore, CM15; not an M1/M2 shipment gate.** After M2, a bounded prototype may compare a named edit-distance method or separately named Unicode-normalization proposal against manual/deterministic review. It must reuse exact member review and save only accepted explicit entries. No automatic merges, identity decisions, joins, source correction, or shared registry follows from this experiment.

Use a **new**, clearly experimental demo module and documentation section only if the prototype proceeds; wire both into the demo/catalogue together. Keep normal authoring independent of it. Evaluate adversarial near matches from F01, rejected US/us pairs, and a realistic large inventory. Record missed useful proposals, false candidate pairs, review actions, and latency; do not invent participant findings. The main risk is review workload exceeding useful assistance. Use those observations to decide whether to retain the prototype; an unsuccessful experiment ends without delaying M1/M2. No algorithm or numeric quality threshold is selected by this Design.

## 5. Implementation run sheet and handoff

Use the repository's pnpm/Node setup and inspect the changed code against `CODING_STANDARDS.md`. Run targeted tests while working, then the broad gate **once, serialized**, before the implementation PR. Do not execute concurrent package builds from several worktrees. The repository agent guide supplies these commands; test paths above are proposed additions:

```sh
pnpm --filter exploreda exec vitest run src/test/lib/analysis/categoryMapping.test.ts src/test/lib/analysis/categoryMappingPersistence.test.ts
pnpm --filter exploreda exec vitest run src/test/components/project/CategoryMappingEditor.test.tsx src/test/lib/analysis/useAnalysisEvaluation.test.tsx src/test/lib/project/categoryMappingFolder.test.ts
pnpm --filter exploreda check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm dev:agent
pnpm shot /examples/category-mappings --name category-mappings --click 'role=button[name="Map categories"]'
```

The screenshot helper generates 1280/783/390 images under `tmp/`. Use the actual accessible action name if the reviewed UI changes it. Screenshots complement browser assertions; they do not prove callbacks, record identity, or persistence.

```sh
EXPLOREDA_FOLDER="$PWD/apps/demo/public/category-mappings-project" pnpm --filter app dev
node scripts/app-shot.mjs "<printed link>" --name category-mappings-folder --wait '<ready selector>'
pnpm --filter demo build
pnpm --filter demo docs:verify
pnpm changeset:add minor "Map categories into reusable project fields with exact review and saved recipes."
pnpm check
```

Use the actual ready element for the folder screenshot; the folder change stream makes ordinary network-idle capture unsuitable. If demo type-checking is run separately after new public types, build `exploreda` first because demo type resolution uses its distribution. Use the repository's existing pinned browser/test configuration and shared timeouts. Keep screenshots out of the commit, attach them to the implementation PR, and include the required changeset for the shipped library capability.

**Ready for review:** provide the complete M1 or M2 user flow, exact fixture results, focused test outcomes, responsive/browser evidence, folder restart/notebook evidence, profiling observations, docs/example links, and any measured limitations. Do not label unexecuted checks passed. No unresolved product choice blocks M1: remaining decisions concern small implementation plumbing, page size, responsive spacing, and measured tuning. Do not turn deferred standalone promotion, shared registries, formulas, fuzzy methods, or neighboring research proposals into prerequisites.
