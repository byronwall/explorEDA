# Implementation plan: explicit duplicate-key repair

**Build a named prepared source that keeps whole original records, preserves every original occurrence as evidence, and can be read by ordinary source, lookup, expansion, and notebook paths.** Ship exact-repeat collapse and explicit conflict review as the first complete release. Add deterministic latest/earliest selection next, then composite keys and the repeated-event grain path.

Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` in `byronwall/explorEDA`. This is a proposed implementation plan, based on complete scoped source files and the supplemental files named below. None of the production changes, tests, demo flows, or browser checks in this plan were executed during the research mission. The companion JSON fixtures are exact design expectations; they are not evidence that the feature already runs.

## 1. Delivery boundary

The first release must let an analyst continue from an ambiguous many-to-one relationship to an accepted repaired table, use that table as the relationship target, and open a notebook whose numbers and record traces use the same accepted repair. Persistence, historical evidence, refresh blocking, and worker parity are part of that release. An inspector-only prototype or a query deduplication step is not the milestone’s completion condition.

Keep the existing React/TypeScript library and demo. Use pnpm and shared `@repo/test-config` limits. The source packet and original records remain evidence; Codex owns repository integration, local implementation, tests, commits, and PR work. No reusable-query-output feature, fuzzy service, remote execution, script interpreter, or generic transformation framework is a prerequisite.

Three independently usable releases are planned:

| Release | Analyst capability | Completion boundary |
| --- | --- | --- |
| M1 | Collapse exact repeats, review conflicting keys, select a whole record, and reuse the accepted source | Full relationship → source → notebook workflow, durable originals, round trips, refresh guard, one Apply transaction |
| M2 | Choose latest or earliest using explicit date/number ordering | Same accepted-source contract, honest invalid-value and tie handling, refresh review |
| M3 | Define composite entity grain and preserve legitimate repeated events | Composite source identity and relationship matching work together; no delimiter keys or implicit event deletion |

Do not split M1 into separately advertised “saved repair” and “provenance later” releases. Internal implementation tasks can be merged separately behind a capability gate, but the user-visible feature must preserve originals from its first usable release.

## 2. Contracts to fix before implementation

### 2.1 A single authority for each definition

Add a proposed optional `SourceDefinition.preparation` for this one operation. Its output source remains an ordinary named member of `project.sources`; its input names one physical source. The output’s existing `entityKey` owns the chosen grouping grain. Do not add a second competing `by` or `keyFields` authority to the repair definition.

The proposed preparation holds the operation kind, input source ID, equality/rule version, review or ordered policy, explicit missing-key policy, identity generation, and accepted run ID. The accepted run’s evidence stores manual choices and their complete guarded group multisets. This separates compact executable intent from immutable original records without hiding which accepted decision the definition uses.

M1 accepts only a direct physical input. Reject a prepared input, query input, self-reference, cycle, missing source, and a physical table supplied under a prepared-source ID. This bounds dependency closure without creating a second query engine. A later generic preparation system can deliberately generalize the type.

### 2.2 Three identities, three different meanings

- **Prepared entity identity:** prepared source ID, key-schema identity generation, and an ordered typed key tuple. It survives source reorder and a new whole-row winner for the same entity. A change to key fields/order starts a new identity generation so a saved selection is not reinterpreted.
- **Original occurrence identity:** physical source ID, immutable snapshot ID, and occurrence ordinal. Two identical records still have two occurrences. Resolve this reference only in its named snapshot.
- **Decision guard:** exact schema and presence-sensitive typed multiset of every record in the reviewed group, including multiplicity, plus the selected full-record value class. Hashes can index it, but a hash alone is not equality proof.

Do not persist the baseline’s `source:row:index` fallback as an enduring author choice. An old occurrence must never reopen a different current record merely because it occupies the same position.

### 2.3 Data values, evidence, and execution identity

Every emitted row equals one original whole business record. Its projection may omit only fields positively marked as generated technical fields. Preserve all original values, property presence, and those technical fields in the archived snapshot. Never drop a field because its name happens to be `row_number`, never compare only convenient attributes while calling the result exact, and never coalesce fields from several candidates.

Tag new source-generated row-number fields, for example `generated: "source-row-number"`, in `sourceFromRows`. Legacy unmarked fields remain real fields for equality. If a later UI lets the analyst classify a legacy field as technical, that is an explicit schema decision with a consequence preview; it is not a naming heuristic.

Resolved rows need a prepared logical reference in the existing execution identity path so entity-aware measures partition prepared entities correctly. Original evidence is separate: selected value class, represented identical occurrences, excluded conflicting or invalid-key occurrences, and unresolved groups. Rejected evidence must remain reachable without becoming a numeric contributor. The baseline’s raw ambiguous-lookup evidence behavior stays intact.

For an accepted run, every original input occurrence belongs to exactly one top-level role: represented or explicitly excluded. A draft may additionally have unresolved occurrences. The selected value class has `winnerRefs = representedRefs`: every exact original occurrence in that class belongs to both sets. No physical twin is privileged as the winner. Exact twins have one emitted value class and multiple represented originals.

### 2.4 Ready, candidate, blocked, and historical results

Use an explicit resolved-source availability result. A valid empty repaired table is different from a missing dependency, stale manual decision, unresolved conflict, or missing evidence asset. Dependent queries and notebooks must not convert unavailable input into an ordinary zero-row success or unmatched-only relationship preview.

A reorder-only refresh whose schema and full semantic multiset are unchanged stays ready; historical occurrence references continue to open their old snapshot. Any content change produces a candidate run and requires acceptance before it becomes current. Unaffected manual groups can reuse guarded choices; a changed reviewed group becomes stale. Previously accepted results may be shown as historical, with their actual accepted revision. They are never labeled current while the candidate is blocked.

An accepted content refresh appends a new immutable evidence run. Ordinary evaluation and draft typing do not write history. No automatic pruning ships with this feature. This is a repair evidence archive, not a general source version-control service.

## 3. Public, text, and persistence seams

All shapes and syntax in this section are **proposed APIs**, not accepted by the baseline.

### 3.1 One opt-in project change transaction

Keep `onStateChange` limited to chart/settings changes. Widen the existing project change transaction to carry an optional repair commit and evidence append. Do not send evidence and the definition through separate callbacks.

```ts
// Proposed boundary; final exported names can follow repository conventions.
interface RepairCommit {
  transactionId: string;
  expectedProjectRevision: string;
  expectedSourceRevision: string;
  evidenceAppend: readonly RepairEvidenceAsset[];
  reason: "apply" | "accept-refresh";
}

interface ExplorEdaProjectChange {
  project: AnalysisProject;
  view: AnalysisView;
  repairCommit?: RepairCommit;
}

interface RepairCapability {
  evidence: RepairEvidenceStore;
  commitProtocol: "atomic-evidence-v1";
}

// Existing hosts remain valid without `repair` and retain ordinary editing.
// Repair-capable hosts explicitly accept the evidence persistence contract.
type RepairHost =
  | {
      repair?: undefined;
      onProjectChange: (change: ExplorEdaProjectChange) => void;
    }
  | {
      repair: RepairCapability;
      onProjectChange: (change: ExplorEdaProjectChange) => Promise<void>;
    };
```

The capability opt-in matters: an older host that destructures only `{project, view}` must not silently expose a feature whose evidence it drops. Show repair actions only when the host can commit project definitions and evidence together. A host can still render a loaded prepared result read-only when it supplies its evidence.

One Apply carries a transaction ID, the new/updated source, selected relationship rebind, accepted-run pointer, and evidence append. Capture base project/source revisions from the completed preview. **The host owns the entire commit** through this one callback: validate the expected base; drain already-running project writes and cancel superseded queued definition writes; serialize project-definition edits for the transaction; write immutable evidence; recheck the semantic source stamp and still-locked base immediately before the pointer write; save the desired definition; and publish project/evidence state together. Resolve `Promise<void>` only after durable save and publication. An ordinary `FolderSaver.queue` write cannot overtake this transaction or later overwrite it with a stale project definition. There is no second publish callback.

The library’s acknowledgement handling compares current props with the desired committed spec, or a host-reported matching transaction ID, and checks its availability. It must not compare the post-commit project with the old expected base revision: a successful commit has necessarily changed that base. If React has not yet delivered the host’s published props, remain pending until the matching committed state arrives instead of resubmitting the transaction.

External source content can still change during the final pointer write. In that case the successfully saved pointer is valid historical evidence, but the resolver marks its current result unavailable and the UI shows review needed; it must not announce a freshly current result. Before pointer persistence, a stale source guard prevents the save. A save failure retains the previous accepted state and the editable draft; retry reuses immutable asset IDs and the transaction’s idempotent commit handling. One successful author transaction creates one undo checkpoint. Cancel emits no project callback. Undo restores definitions and relationship targets; it does not delete historical evidence.

### 3.2 Canonical project text

Reuse the source declaration and its existing field children. Add exactly one nested `repair` declaration, mapped to `source.preparation`:

```text
project @duplicate-repair format=2

source @customers key=id path=data/customers.json {
  field id string
  field name string
  field credit number
  field updated date
}

source @orders key=id path=data/orders.json {
  field id string
  field customer string
  field amount number
}

source @customers_repaired "Customers repaired" key=id {
  field id string
  field name string
  field credit number
  field updated date
  repair from=customers mode=review missing=exclude identity=1 run=repair-001 evidence=.exploreda/repairs/repair-001.json
}

relate @order-customer orders.customer -> customers_repaired.id

query @orders-with-customers "Orders with customers" glyph=O {
  source orders
  lookup customer via=order-customer
}
```

This complete declaration example uses the `DR-F01` business-field names (`id`, `customer`, and `updated`); occurrence aliases such as `c1` remain fixture metadata and are not source fields. `format=2` is a proposed explicit text-format discriminator. The new parser must diagnose unsupported versions and prevent runnable fallback; silently ignoring the nested repair would misrepresent the source. Old valid project JSON/text loads through explicit v1 normalization. New project JSON uses a version old validators already reject. Opening v2 text in older builds is unsupported under the mission's one-deployed-version assumption: the baseline reader ignores the project format pair and can still construct a source after diagnosing an unknown repair child, so a new header cannot make that old reader fail closed.

Evidence paths belong in proposed `ProjectTextOptions` evidence mapping, analogous to raw source paths. Prepared sources have no `path=` or database declaration. The immutable sidecar contains the original snapshot, guarded manual decisions, accepted output/evidence ledger, rule/spec signature, and format version. The definition’s accepted run ID and the asset’s run ID/spec must agree.

### 3.3 Save ordering and closure

JSON project export embeds referenced evidence assets and original source tables. Text/folder saving writes immutable evidence before the project text that references it. Extend the folder saver with a fail-fast dependent bundle operation, for example `commitBundle`: if any evidence write fails, do not write its referencing project definition. This operation also owns the project-definition queue barrier: wait for an in-flight definition write, cancel superseded queued definitions, serialize later edits behind the transaction, and prevent ordinary debounced writes from overtaking it. Queue ordering alone is insufficient because the baseline saver catches a failed write and continues the chain.

An evidence write that succeeds followed by a project write that fails leaves harmless unreferenced evidence. Retrying must not generate another run. An existing asset ID with different content is an error. Folder reload validates every referenced asset and preserves missing-asset diagnostics rather than falling back to current raw rows.

`selectAnalysisProjectView` and `projectFileText` need dependency closure through prepared sources. A view that only performs a lookup still needs the raw ancestor, all original occurrences, accepted evidence, and preparation definition. When a raw ancestor was originally declared inside an analysis file, the project writer must promote its declaration into the project dependency closure as needed. Exporting only surviving rows is not a reproducible repair project.

## 4. M1 — exact repeats and explicit whole-record review

### User outcome

From an ambiguous relationship, open “Repair duplicate keys,” confirm the entity key, review exact repeats and conflicts over the full source, select intended records, explicitly handle missing keys, and apply a named prepared source. Retarget the chosen relationship in the same transaction. A source view, dependent analysis, and notebook all use the accepted output and can reach its full original evidence.

The default policy collapses only typed whole-record equivalence classes and leaves conflicting groups unresolved. Missing, blank, or nonfinite key occurrences block acceptance until the analyst explicitly excludes them. Exclusion removes them from the prepared output and preserves their exact records with reasons. No implicit first/last record, synthetic coalescing, or automatic deletion is permitted.

### Files and modules

All library paths below begin `packages/explorEDA/src/`.

- **Model and codecs:** `types/AnalysisProject.ts`; `lib/analysis/projectFile.ts`; proposed `lib/analysis/repairTypes.ts` and `repairEvidence.ts`. Add preparation/availability/evidence types, typed canonical encodings including property presence and nonfinite originals, accepted-run validation, and version migration. Keep runtime caches out of durable definitions.
- **Source resolution:** proposed `lib/analysis/resolveSource.ts`, `duplicateRepair.ts`, and `repairKeys.ts`; `lib/analysis/sources.ts`. Resolve raw and prepared entries with explicit occurrence references. Tag newly synthesized technical row-number fields. Use one key classifier/equality routine in preview and execution.
- **Evaluator:** `lib/analysis/evaluateProject.ts`. Make `sourceFrame`, `lookupFrame`, and `expandedFrame` consume the shared resolved source. Preserve prepared logical references for `aggregateFrame`; keep existing conflicting-entity-measure behavior. Include raw ancestor/spec/evidence revisions in evaluation invalidation.
- **Worker:** `lib/analysis/useAnalysisEvaluation.ts` and `analysisWorkerProtocol.ts`. Carry evidence/revision dependencies and preview intent through typed requests. Use the same resolver in both realms and the existing request-ID stale-result guard. Do not compare realm-local WeakMap revision numbers as durable snapshot identities.
- **Inspector and previews:** `components/project/ProjectSchemaPanel.tsx`, `relationshipEditing.ts`, `ProjectQueryPanel.tsx`, `QueryStageRows.tsx`, `queryEditing.ts`, `sourceRowIdentity.ts`; proposed `DuplicateRepairPanel.tsx` and `repairEditing.ts`. Add the repair action beside an ambiguous relationship and source key details. Route profiles and counts through resolved sources. Validate the proposed impact on every dependent query by field origin, including chained relationships. Show current versus historical evidence using explicit roles.
- **Host integration:** `components/ExplorEdaProject.tsx`; `apps/app/src/ProjectWorkspace.tsx`; `apps/app/src/saver.ts`. Add capability opt-in and single atomic commit; queue immutable assets before the definition with a success barrier. Include notebook dependencies in affected-consumer display.
- **Text/folder:** `lib/dsl/project.ts`, `lib/project/folder.ts`, `lib/project/writeFolder.ts`, `lib/project/analysisText.ts`. Parse/export nested repair definitions, load evidence before dependent evaluation, skip raw loading/inference for prepared sources, and close dependencies on view/folder export.
- **Notebook handoff:** `lib/notebook/readNotebook.ts`, `compileNotebook.ts`, `findings.ts`, `components/notebook/ExplorEdaNotebook.tsx`, `components/notebook/NotebookFindings.tsx`, `components/AnalysisChartContext.tsx`, and the notebook integration in `ProjectWorkspace.tsx`. Keep query evaluation in the existing project evaluator; return/retain evaluation availability and repair provenance instead of discarding everything except `row.data`. Recompute notebook data from live project/evidence state after Apply. Propagate unavailable/pending source status through `useFindingResults` and `evaluateFindings`; block before both live and static finding/count reducers and add a finding unavailable reason rather than let count on an empty substitute return zero. A ready genuinely empty source still yields count 0. Include accepted run identity and availability in finding revisions/cache keys even when numeric values remain equal, so a finding cannot retain obsolete evidence. Frozen notebook block text is not a frozen data snapshot.
- **Public exports and docs:** update the corresponding analysis/library index exports after adding public types. Add a focused documentation page and runnable project fixture as listed below.

Supplemental exact-baseline reading confirms the notebook currently has its `DataLayerProvider` and compiles from passed data, without the project query `AnalysisChartContext`. Add a project evaluation adapter that maps runtime chart row IDs to the accepted `AnalysisResultRow` objects and wraps/provides the query context. A notebook chart mark and finding operand must open the same accepted run’s repair ledger and original snapshot evidence. `NotebookFindings.tsx` currently evaluates findings from the data layer and uses `MetricCardTraceBody` for operand records; extend those boundaries rather than make a separate notebook repair evaluator.

### Inspector behavior

Use the Schema side panel’s existing narrow/wide modes. Keep the source, chosen grain, and scope line visible. Settings use the repository’s compact rows, shared field metadata/picker, semantic border tokens, and accessible tooltips. Preview is local state; no host mutation occurs before Apply.

Show **All N original source records** as the repair scope. Current chart selections and local search can narrow the evidence list only. They cannot reduce the saved repair population. Display separate counts for key groups, exact-repeat groups, conflicting groups, invalid-key occurrences, emitted entities, represented occurrences, excluded occurrences, and unresolved groups. A bounded table says how many records are shown.

A selected group opens candidate records with their original values, changed fields, and exact snapshot/occurrence navigation. Choosing a candidate chooses its whole value class. The consequence section compares input-row relationship counts before/after and lists dependent queries/notebooks. Keep “matched inputs” separate from “usable single matches,” “ambiguous inputs,” and “distinct conflicting target groups.” The baseline `ambiguous` count is a subset of matched inputs, not a distinct-key count.

Validate downstream field origins, not just visible aliases. Retargeting an orders→customers lookup to the prepared source changes projected field origin to `customers_repaired`, even if the alias remains `customer`. A later step following raw `customers.regionId → regions.id` can then lose its `relationshipSide` match. Block **Apply and update relationship** when such a chain remains invalid; offer creation of the prepared source alone with the existing relationship untouched. An explicit user selection can clone/retarget the affected next relationship and update its step in the same atomic transaction. Never silently retarget every relationship from the raw source or treat a matching field label as an origin match.

At 1280px, show a group list beside the candidate table; at 783px and 390px stack these while retaining key context and reachable actions. Tab reaches every action; Space selects a candidate; Enter opens the focused evidence action; Escape closes nested controls before leaving repair mode. Return focus to the source/ambiguity action. Provide button/menu alternatives to dragging. Cancel preserves chart selection, saved layout, project definition, and raw data.

### Exact acceptance tests

Use companion fixture IDs `DR-F01`–`DR-F16`; import them into repository fixtures rather than copying expected numbers into unrelated mocks.

1. **M1-A01 — integrated manual release (`DR-F01`, manual-first-release variant).** Raw customer occurrences `c1..c8` resolve to A10, B25, C35, E50 after exact A collapse, explicit B/C selection, and explicit missing-key exclusion. Represented occurrences are `{c1,c2,c4,c6,c7}`; excluded are `{c3,c5,c8}`. No occurrence disappears and no output record is synthesized.
2. **M1-A02 — relationship consequences (`DR-F01`).** Six order inputs have raw counts matched 4, unmatched 2, ambiguous 4, extra-expanded 4. Accepted prepared target gives 4, 2, 0, 0. Inner/left expansion counts change from 8/10 to 4/6. Lookup retains six order rows and credits `[10,10,25,35,undefined,undefined]`.
3. **M1-A03 — aggregation populations (`DR-F01`, `DR-F12`).** Order amount sum stays 90. Naive looked-up credit sum is 80; entity-aware customer credit is 70; full prepared target credit is 120 because E has no order. Existing x:{10,20}, y:{5} conflict case retains entity count 2 with measured count/sum/average unavailable. Equal x:{10,10} yields 2/2/15/7.5. Repair evidence never becomes extra measure input.
4. **M1-A04 — complete equality (`DR-F02`, `DR-F14`, schema case in `DR-F10`).** Equal chosen attributes with a different email remain a conflict. Selecting the newer email row emits precisely that original value class and excludes the other. Preserve typed values, absent versus present undefined, and signed-zero evidence according to the fixture codec. Discover own data-field keys before exact comparison; an undeclared `hiddenRole` difference blocks for schema reconciliation and then appears as a real conflict. Differing user fields cannot be silently ignored merely because declared metadata omitted them.
5. **M1-A05 — technical fields (`DR-F15`).** Positively marked generated row numbers do not prevent exact business-record collapse and are omitted only from prepared projection. Raw archived records retain them. A real user column named `row_number` remains an equality field; legacy unmarked values are not assumed generated.
6. **M1-A06 — key typing and eligibility (`DR-F04`, `DR-F06`).** Eleven specified valid typed keys form eleven distinct groups and match only equal typed inputs. Invalid keys are eight separate original occurrences, not one null entity. Default block publishes no usable target; explicit exclusion yields zero outputs for the invalid-only case, preserving all eight originals. Valid 0 and false remain usable and distinct.
7. **M1-A07 — exact trace membership.** Read prepared source directly, use it as lookup target, and expand it; each route opens the same accepted-run records and roles. Duplicate physical positions backed by the same JS row object must retain distinct occurrence coordinates. Old snapshot references never resolve against the current array by position.
8. **M1-A08 — alternate target field (`DR-F11`).** Two repaired entities with the same email still give matched 1, unmatched 0, ambiguous 1, extra-expanded 1 when linked by email. Their valid entity key does not excuse an ambiguous alternate-field lookup; no arbitrary winner appears.
9. **M1-A09 — refresh (`DR-F09`).** Reverse the raw input: output entity keys, values, semantic memberships, counts, and ready state are unchanged. Add/change/remove a record: show candidate/blocked current status until acceptance. A changed manual group, including a new exact twin, invalidates its guard; unchanged groups retain decisions for review. The prior accepted snapshot is still navigable in full.
10. **M1-A10 — unavailable is not empty (`DR-F10`).** Missing physical source/table/field/evidence, invalid run/spec reference, prohibited chain, and cycle block only dependent repair consumers. They do not become unmatched-only previews or successful empty notebooks. A legitimately empty accepted source remains distinguishable and valid.
11. **M1-A11 — round trips (`DR-F13`).** JSON v2, project text plus evidence sidecars, folder reload, and single-view export restore definitions, accepted-run identity, every original record/value/role, output keys, relationship counts, and notebook target. Include lossless special scalars and reserved-tag collision data. Unknown versions are rejected/diagnosed; v1 raw projects still load.
12. **M1-A12 — atomic host behavior (`DR-F16`).** One Apply emits one capability-authorized project/evidence transaction; Cancel emits none. A refresh after preview or before pointer save invalidates the expected source guard. A refresh during the final pointer write leaves a valid historical saved run with unavailable current status and review needed. The host resolves only after persistence and joint state publication; the library recognizes the desired committed state/transaction rather than incorrectly requiring the old base revision. A stale queued ordinary project write cannot overtake or overwrite the commit, and concurrent definition edits serialize or fail the base guard. Undo restores prior relationship/source definitions in one checkpoint; redo restores accepted repair. A sidecar write failure prevents pointer text persistence and leaves the previous accepted state active; retry uses identical asset IDs with idempotent transaction handling. Raw CSV/JSON source content is unchanged.
13. **M1-A13 — worker and notebook parity.** Direct and worker evaluation return the same output values, memberships, diagnostics, readiness, and stable logical identities. A late preview/evaluation response cannot overwrite a newer request. Switch to an already-open notebook immediately after Apply: it shows repaired results, not the initial folder’s stale row array. Blocked refresh prevents both live and static count reducers from reporting 0; a ready genuinely empty source reports 0. Accept a new run whose finding value is unchanged: the finding revision and trace evidence still move to the new accepted run. Historical results carry their accepted revision.
14. **M1-A14 — keyboard/scope (`DR-F16`).** Select only old B in a chart, then open repair: full-source review still sees both B candidates. Changing filters changes neither saved policy nor output. At all three required widths, complete selection, source navigation, Apply/Cancel, focus return, and nested Escape without pointer input; preview creates no chart or layout change.
15. **M1-A15 — chained origins (`DR-F10`, `DR-F16`).** An orders→customers→regions query is checked after the proposed first relationship retarget. Keeping the alias `customer` does not make the old raw-customer origin valid. With the second relationship/step unchanged, Apply-and-update is blocked and emits no partial transaction; creating the prepared source alone leaves the existing chain untouched. With an explicitly selected compatible cloned/retargeted second relationship and step, all query origins validate and the entire change applies in one transaction/checkpoint.

### Docs and runnable example delivered in M1

Add `apps/demo/src/docs/pages/duplicate-key-repair.mdx` with sections **Choose the intended grain**, **Exact repeats and conflicting records**, **Review and Apply**, **Original records and refresh**, and **Use the result in a relationship and notebook**. Extend `project-folders.mdx` under **Project text** and **What’s in a project folder** with nested repair syntax, evidence sidecars, and save failure behavior. Add the embedding/capability contract to the package integration docs.

Deliver `apps/demo/public/examples/duplicate-repair/` (proposed location) containing the eight-customer/six-order source files, project text, accepted evidence, a before/after analysis, and a notebook reading the repaired query. Register a matching interactive demo in the demo catalogue/coverage system. Its visible findings must recompute 90, 80, 70, and 120 with correctly named populations; traces show represented and excluded originals. Include a resettable conflicted starting state and a scripted manual-review path. A README alone is not the runnable example.

**Main risk:** a visually correct survivor table hides evidence loss, stale notebook data, or a changed entity-count partition. The acceptance oracle is the combination of exact values, occurrence-role sets, and ready/current status—not row count alone.

**Release gate:** all M1 acceptance tests, affected type checks, docs/coverage tests, and real pointer/keyboard verification at 1280/783/390px pass. Run the repository’s broad check once before the integration PR, with a user-facing minor changeset. Do not raise individual test timeouts to pass this gate.

## 5. M2 — deterministic latest and earliest selection

### User outcome and scope

Add an ordered policy to the existing repair editor. The analyst explicitly chooses one or more ordering fields, number/date/text interpretation, direction, and remaining-tie behavior. “Latest” and “earliest” are labels for an authored date-order rule. A numeric sequence can also be ordered without pretending it is calendar time. There is no arrival-order fallback.

Compare valid order tuples lexicographically. A unique extremal full-record class wins; exact twins at the extremum are represented together. If distinct records tie after every authored order component, the group remains unresolved until a guarded manual choice or additional explicit tie-breaker. Missing/invalid ordering values in a duplicate group block it by default; a deliberate candidate exclusion can resolve the group and must be recorded. A singleton does not need a comparison and remains eligible under the narrow policy.

The shared `valueParsing.ts` functions determine numeric/date eligibility. Numeric text can order numerically while raw whole-record equality remains typed. Offset-equivalent date strings compare at the same instant but remain different original records. Do not call `Date.parse`, `new Date(text)`, or `Number(value)` on raw row data.

Date interpretation accepts strings under a saved parsing preset, with ISO as the default; numeric epoch values require a future explicit unit interpretation and are deferred. Text interpretation accepts nonblank strings only and compares their unchanged contents lexicographically by UTF-16 code units, as JavaScript `<` and `>` do. It never uses a locale comparator or string coercion. Null, undefined, absent, blank, and non-string values are ineligible. Text `"10"` precedes `"2"`; numeric interpretation gives the opposite order. Save the interpretation and direction for every order component, including secondary tie-breakers.

### Files and execution changes

Extend the proposed `repairTypes.ts`, `duplicateRepair.ts`, `repairKeys.ts`, and evidence validator with order specifications and reasons. Use `lib/valueParsing.ts` unchanged unless an independently justified parsing capability is required; new parsing semantics belong there and must have exact tests. Extend `DuplicateRepairPanel.tsx`, `repairEditing.ts`, and grouped evidence columns to show interpreted order values and raw values together. Extend nested repair parsing/export in `lib/dsl/project.ts` with ordered child declarations. JSON, folder, worker, and notebook paths continue through the M1 resolver and transaction.

For example, a proposed ordered definition is:

```text
repair from=customers mode=ordered missing=exclude identity=1 run=repair-002 evidence=.exploreda/repairs/repair-002.json {
  order updated type=date direction=desc
}
```

The order list is explicit and ordered; each `order` line maps one typed component. Remaining conflicting ties require review. Do not invent an implicit secondary order from customer ID, source row number, file order, or a full-row hash.

### Exact acceptance tests

- **M2-A01 (`DR-F01`, latest variants):** B20/B25 selects B25 by date; C30/C35 share the top instant and remain unresolved until C35 is chosen. Final values, memberships, relationship counts, and 90/80/70/120 aggregates equal M1’s accepted manual result, but exclusion reasons correctly distinguish ordered B rejection from manual C rejection.
- **M2-A02 (`DR-F07`):** A January/10 and February/20 yields February/20 for latest and January/10 for earliest, independent of input permutation. Two exact top twins yield one output with both represented. Offset-equivalent top instants with different values remain a tie. An explicit additional ordering component resolves only when it actually distinguishes a unique full-record class.
- **M2-A03 (`DR-F08`):** numeric text `"2"` sorts below `"10"`; number 2 and text `"2"` tie numerically while remaining distinct raw records. Hex-like text, booleans, blanks, NaN, infinity, and invalid dates do not become winners. A duplicate group containing an invalid ranking value blocks by default, and explicit exclusion preserves the invalid raw original and its reason. A singleton with an absent ordering value follows the stated singleton policy.
- **M2-A04 (`DR-F09`):** adding B28 at a later date creates a candidate with naive looked-up credit 83, entity-aware credit 73, and target credit 123, while order sum remains 90. It is not current until accepted. Acceptance appends evidence, retains B’s logical output identity, and makes all prior B records available as historical evidence. A changed manual C group still requires re-review even when B resolves automatically.
- **M2-A05:** ordered definitions round-trip in JSON/text/folders and worker results, including order-list order and directions. Reordering the definition’s order components changes its spec signature and invalidates prior acceptance. Cancel an ordering edit without callbacks; one accepted policy change yields one project/evidence checkpoint.

### Docs, example, risk, and gate

Extend the same documentation page with **Choose latest or earliest**, **Invalid dates and numbers**, **Ties and explicit tie-breakers**, and **Review a refreshed result**. Extend the runnable project with date-ordered B, tied C, offset-equivalent instants, and an invalid-order candidate. The notebook names the accepted ordering policy and still opens original witnesses.

**Main risk:** the UI says latest while execution uses text order, coercion, invalid-value filtering, or physical input order. Expected winners, ties, exclusions, and parsed/raw order values must be checked independently.

**Release gate:** M2 tests and unchanged M1 contracts pass; the ordered demo is covered by docs checks and keyboard/browser verification. No second implementation of ordered repair is permitted in UI, worker, or notebook code.

## 6. M3 — composite keys and legitimate repeated events

### User outcome and model

Let the analyst declare a composite key when one field does not identify the intended entity. Update source identity, relationship endpoints, explicit lookup input overrides, previews, serializers, traces, and field-origin validation together. Do not ship composite grouping while relationships can only join a partial scalar key.

Generalize the existing property to `entityKey: string | readonly [string, ...string[]]`; normalize scalar declarations to one-element arrays internally. Use exclusive endpoint variants `{sourceId, fieldId}` or `{sourceId, fieldIds}` and equivalent `inputFieldId`/`inputFieldIds` overrides. Reject both forms at once, empty lists, repeated fields, unknown fields, incompatible arity, and mixed incomplete definitions. Ordered field IDs form part of the identity schema.

Encode tuples as ordered typed components, never delimiter concatenation. Each key atom must meet the same eligibility rules; an invalid component makes that occurrence ineligible. Changing declared grain without collapsing records is a first-class route: keep valid repeated events keyed by event ID or `(customer,eventId)` and use expansion when there are several events per customer. Altering cardinality does not magically make a lookup single-valued.

Scalar parameter pickers are a bounded limitation: the baseline parameter model binds one scalar entity key. Until a dedicated tuple-parameter/filter contract is implemented, reject or disable a parameter option that pretends to pick a composite source as a scalar. This does not block composite source queries, relationships, expansion, or notebooks. Do not silently bind only the first component.

### Files and canonical representation

Extend `AnalysisProject.ts`, `repairKeys.ts`, `resolveSource.ts`, `evaluateProject.ts`, `sourceRowIdentity.ts`, `relationshipEditing.ts`, `queryEditing.ts`, `projectFile.ts`, and `lib/dsl/project.ts`. Update source/entity labeling, relationship key pickers, metadata, and evidence headings in the Schema/Query panels. Preserve existing scalar syntax on export for one-field keys. Update parameter-option validation to enforce the explicit limitation.

A proposed composite text form keeps both endpoints unambiguous:

```text
source @customers_repaired key=tenantId,customerId {
  field tenantId string
  field customerId string
  repair from=customers mode=review missing=block identity=2 run=repair-003 evidence=.exploreda/repairs/repair-003.json
}

relate @order-customer orders -> customers_repaired from-fields=tenantId,customerId to-fields=tenantId,customerId

query @order-details glyph=O {
  source orders
  lookup customer via=order-customer on=orders.tenantId,orders.customerId
}
```

The endpoint list position defines component correspondence. `compileProjectText` must parse this explicitly and preserve quoted field names; no string splitting heuristic can substitute for the parser’s token list. The earlier scalar `orders.customerId -> customers_repaired.customerId` form remains accepted. A two-field `on=` maps to `inputFieldIds`, and every projected origin must match its corresponding endpoint.

### Exact acceptance tests

- **M3-A01 (`DR-F05`):** `(a|b,c)`, `(a,b|c)`, `(number 1,x)`, `(string "1",x)`, and `(x,number 1)` are five distinct tuples, five outputs, five exact corresponding matches, and no ambiguity. Swapping field order changes identity schema and requires new acceptance; it does not reuse saved selections under a different meaning.
- **M3-A02 (`DR-F03`):** two events E1/E2 for customer A remain two output observations with total amount 20 and singleton represented sets. Customer-to-events expansion yields two rows; matched 1, unmatched 0, ambiguous 1, extra-expanded 1 accurately describes the partial customer-key relation. The event-grain path never suggests that one event must be deleted to make that relation unique.
- **M3-A03 (`DR-F06`, `DR-F10`):** any missing/blank/nonfinite key component follows the invalid-key policy and retains exact evidence; empty/duplicate key lists and mismatched relationship arity fail validation. Missing source/field does not produce a valid unmatched-only result. One-key legacy definitions retain previous behavior.
- **M3-A04 (`DR-F11`):** a prepared source unique by composite entity key can still be ambiguous on an intentionally partial endpoint; the lookup remains unavailable and expansion remains explicit. Uniqueness is checked on the actual target key used by the relationship.
- **M3-A05 (`DR-F13`, `DR-F16`):** composite keys, relationship lists, lookup overrides, typed scalar atoms, identity generation, and evidence survive JSON/text/folder and selected-view round trips. Key schema changes invalidate old selected entity keys rather than attach them to new groups. One Apply/Undo checkpoint and zero-mutation Cancel still hold.
- **M3-A06:** prepared composite entities aggregate once per logical source reference after expansion; original occurrence evidence remains complete. Unsupported composite parameter options produce an actionable validation problem without coercing a tuple to the first field or an accidental display string.

### Docs, example, risk, and gate

Extend the repair docs with **A key can have several fields**, **Repeated events are legitimate records**, **Match every key component**, and the scalar parameter-picker limitation. Extend `project-folders.mdx` with scalar/composite syntax side by side. Deliver a tenant/customer demo with the collision pairs from `DR-F05` and a customer-events notebook retaining both events from `DR-F03`; changing the chosen grain must show its effect on identity, relationship cardinality, and totals.

**Main risk:** local grouping appears correct while an unchanged scalar relationship, parameter picker, or text exporter discards key components. Composite support passes only when the complete source→relationship→query→notebook path agrees.

**Release gate:** all scalar M1/M2 contracts remain valid, all M3 cases pass, docs round-trip examples compile, and pointer/keyboard checks at the required widths complete the composite workflow.

## 7. Verification run sheet for the implementer

The proposed new test files below become runnable after implementation. They are acceptance targets, not claims that these files exist at the baseline. Keep all commands together and inherit shared time limits.

```bash
# Targeted M1 semantics, evidence, persistence, worker, and UI contracts.
pnpm --filter exploreda exec vitest run \
  src/test/lib/analysis/duplicateRepair.test.ts \
  src/test/lib/analysis/duplicateRepairPersistence.test.ts \
  src/test/lib/analysis/duplicateRepairWorker.test.ts \
  src/test/lib/notebook/duplicateRepair.test.ts \
  src/components/project/__tests__/DuplicateRepairPanel.test.tsx

# Existing behavior that the repair must preserve.
pnpm --filter exploreda exec vitest run \
  src/test/lib/analysis/evaluateProject.test.ts \
  src/test/lib/analysis/entityGrain.test.ts \
  src/test/lib/analysis/sourceRowIdentity.test.ts
pnpm --filter exploreda check-types

# Demo catalogue and project text examples; add the repair example to coverage.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts \
  src/dashboardText.test.ts
pnpm --filter demo docs:check

# Build library types before checking demo code that imports new public types.
pnpm --filter exploreda build
pnpm --filter demo exec tsc

# Verify the documented runnable flow with the repository's browser test tooling.
pnpm --filter demo build
pnpm --filter demo docs:verify

# One broad check before the integration PR, from one worktree at a time.
pnpm check
```

Add focused app saver/ProjectWorkspace tests alongside the actual existing app test conventions once inspected. The required assertions are M1-A12/M1-A13; guessing a test-runner command for an unread package script is unnecessary. Capture the feature at 1280, 783, and 390px using the repository’s prescribed screenshot tooling. For the standalone folder app use `scripts/app-shot.mjs`, since its change stream prevents ordinary network-idle waiting.

## 8. Checked integration evidence and remaining implementation choices

The scoped packet establishes the six-step query union; raw source/lookup/expand reads; existing ambiguity and entity-measure safeguards; source inference; schema/query inspector patterns; project JSON/text/folder reading; worker sequencing; and notebook chart compilation. Complete supplemental exact-baseline reads closed the missing write/notebook seams:

- `packages/explorEDA/src/lib/notebook/readNotebook.ts`, `namedQuery` and `readNotebookText`: selects a project query and currently keeps only evaluated row data.
- `packages/explorEDA/src/lib/project/writeFolder.ts`, `projectFileText` and `analysisFileText`: preserves inferred declarations and implicit queries, but needs derived ancestor/evidence closure.
- `apps/app/src/saver.ts`, `FolderSaver.queue`, `flush`, and `write`: serializes writes and retains failed text, but needs the dependent evidence-success barrier.
- `apps/app/src/ProjectWorkspace.tsx`, `onProjectChange` and notebook render: updates live project state but currently supplies notebook rows from the initial folder result.
- `packages/explorEDA/src/components/AnalysisChartContext.tsx`, `components/notebook/ExplorEdaNotebook.tsx`, `components/notebook/NotebookFindings.tsx`, and `lib/notebook/findings.ts`: notebook data/trace and finding evaluation need an explicit project-availability adapter; an unavailable repaired source cannot be represented as an empty input whose count is zero.

These facts justify the named changes; the new resolver, evidence archive, capability gate, version-2 format, canonical repair syntax, and milestone tests are proposed.

Implementation can choose internal module names and a compact evidence serialization layout while preserving the contracts. The principal unresolved product decisions are presentation details—default repaired-source naming, the group-list sort order, and whether a legacy technical-field classification control ships immediately. They do not block M1. Composite parameter binding, field-by-field coalescing, fuzzy merging, automatic evidence deletion, and arbitrary query-output reuse remain separate work.
