# Selections and live findings through data refresh

## Decision: build a shared, explicit record-selection contract

**Build keyed refresh for plain workspaces, project views, and live notebooks.** Keep selected logical keys as the durable request; derive numeric runtime row IDs and findings from each current dataset. Let a selected record's measures change without changing its identity. Reuse project query identity instead of rebuilding it inside notebooks.

The recommended policy has four consequential parts:

- **Missing members remain requested.** Available unique members continue to participate, with an explicit partial-result label. A missing member may return automatically under the same source-continuity promise.
- **Observed duplicate keys require review.** Exclude every ambiguous occurrence and retain a small review marker. Later uniqueness alone does not release that marker: the remaining row might be a different occurrence. Explicit repair is required.
- **An active empty selection remains a filter.** A nonempty request with no resolvable members makes selection-dependent findings unavailable. It never becomes all rows. An intentionally empty request counts zero.
- **Notebook results stay live.** Preserve local selections through mounted refreshes and the folder app's workspace remounts. An explicit **Keep selection** action writes their definitions into notebook text for reopening; it captures no historical measures or rows.

Ship ordinary linked workspaces first, then source-grain project results and folder round-trips, then notebook keep/reopen and current contributor inspection. Exact expanded child rows can follow as a separate release; grouped-result identity is deferred.

**Access and scope.** The complete 46-file selected source packet was available at commit `5594c95690859e8ce456aa3228fa9265ba686d12`. Additional imports were read at that same commit. This is a Design proposal, not an implementation or a runtime audit. Date: October 29, 2026, America/Indianapolis. The supplied mission overrides the older R077 demand gate. React, TypeScript, pnpm, one deployed version, and local files remain the operating assumptions.

## 1. What the current source establishes

References [R1]–[R14] identify exact-baseline files and symbols; the reading inventory is at the end. Facts in this section come from source. Proposed behavior starts in section 2.

| Current source fact | Consequence for this design |
| --- | --- |
| `initializeData` assigns numeric positions to `__ID`. The provider rebuilds on new data/field declarations. With unchanged supplied settings it calls `carryRowSelections` using the rows that accompanied that save. [R1] | Keep numeric IDs as current-evaluation coordinates. Add logical identity at the input/persistence boundary. |
| `carryRowSelections` compares all non-`__ID` row content. Its unchanged-position fast path returns the original settings; when remapping, an absent or nonunique content match drops the affected filter. [R2] | This is useful legacy behavior, but it cannot express “same order, corrected amount.” Preserve it for unkeyed callers. |
| Different settings supplied with new rows take the explicit restore path. Same-state settings echoes without data replacement are fingerprinted to avoid rebuilding; `onStateChange` is an edit callback. [R1] | Keyed refresh must distinguish current live intent, an echo, and an explicit restore before rebuilding. Do not replay a stale original save after every refresh. |
| `mapRowIdFilters` already covers chart, chart-local, Rows, and workspace owners. Project encode/decode already uses it. [R2, R3] | Reuse and widen this traversal. Missing traversal is not a feature to propose again. |
| Project source keys already distinguish primitive types and use positional fallbacks for missing/duplicate keys. Evaluation also has a parallel `sourceReferences` implementation. Source/filter/calculate/lookup preserve output keys; expansion already encodes parent/child pairs with JSON. [R3, R4] | Factor the existing source-key logic once. Positional fallbacks remain useful for current inspection but cannot promise refresh continuity. |
| `readNotebookText` maps evaluated rows to `row.data`, losing the identity envelope. `ProjectWorkspace` passes those rows to the notebook. [R5] | Carry rows and their project identity frame through this exact route; a notebook cannot recover discarded lineage from visible columns. |
| Notebook compilation depends on data; its provider uses `localSelections`. Write-back intentionally excludes click/brush selections. The folder app saves edited text automatically. [R6, R7] | Separate data reconciliation from authored restoration. Keep local scope, and implement an explicit retained-selection text path. |
| Both manual reload and watched file changes increment `App`'s generation; `key={loaded.generation}` remounts `ProjectWorkspace`. Its surviving notebook memory holds last-valid block text only. [R14] | Preserve current selection definitions, guards, and notebook Undo above this remount; provider-local preservation alone cannot complete folder refresh. |
| `FolderSaver` can overlap writes for a path. `flush()` awaits pending entries, not already-running writes; `write()` catches errors. [R14] | Add per-path ordering and acknowledged checkpoints; an awaited baseline flush does not prove successful persistence. |
| Findings use current eligible rows, the owner's selection, and finding predicates. Numeric exclusions already come from the metric plan. Inspection closes when the finding revision changes. [R8] | Add identity coverage and availability around the existing reducers, and preserve revision-safe inspection. |
| Folder loading can infer a key, including a synthesized `row_number`; saving can preserve the original omission of a key declaration. [R9] | Inferred uniqueness is not temporal continuity. Require an explicit key and continuity declaration before promising durable project refresh. |
| Existing DSL value-filter compilation resolves literals through `String(raw)` and current column values. [R10] | A typed record declaration must bypass that predicate parser. Numeric `101` and string `"101"` cannot be safely represented by repurposing `select.key=`. |

A further source-based inference matters: `decodeAnalysisRowKeys` leaves already-prefixed unresolved strings unchanged, and encoding leaves strings untouched. Persisting that intermediate representation can make absence sticky. The new contract preserves the original key structurally; it does not save a recursively decorated unresolved sentinel. This inference was not reproduced in the application. [R3]

## 2. Alternatives and the chosen boundary

| Alternative | Assessment |
| --- | --- |
| Add only a plain `getRowId(row)` callback | Useful within one mounted host, but a callback is not a portable declaration for JSON, notebook text, or folders. It also leaves project/notebook handoff and missing-member behavior unspecified. |
| Require every host to promote data into a project | Reuses project identity, but makes a single-table embedding adopt sources, queries, and views just to keep A selected after its amount changes. Existing inferred keys still need a continuity decision. |
| **One narrow boundary with two adapters** | **Recommended.** Plain rows use a serializable field-key declaration. Projects supply the existing evaluator's keys plus identity quality and grain. One resolver, owner model, persistence codec, and status vocabulary serve both. |
| Persist row contents or historical finding values | Rejected for this mission. Content changes do not imply a new record, and saved values would add capture/history semantics. |
| Clear the entire owner on any missing member | Simpler, but loses usable partial membership and risks broadening to all rows. Reserve whole-owner blocking for incompatible identity domains. |
| Prune absent members immediately | Rejected. It destroys the request and prevents an absent record returning after save/reopen. |

The common boundary has only three jobs: describe the identity domain, map a requested key to current rows safely, and report why a member cannot participate. It is not a source catalog, provenance service, or general identity registry.

### 2.1 Who promises continuity

The host or source author declares that a key denotes the same logical record across refreshes. The promise includes **no reuse of a key for a different logical record**. Matching filenames, array references, row order, equal measures, or a unique-looking column do not establish that promise.

For a plain host, propose:

```tsx
const rowIdentity = {
  kind: "fields" as const,
  sourceId: "orders-production-v1",
  keyFields: ["tenantId", "orderId"],
};

<ExplorEda
  data={orders}
  rowIdentity={rowIdentity}
  savedData={initialSettings}
  onStateChange={(settings) => {
    enqueueSettingsSave(settings);
    pushUndoStep(settings);
  }}
  onRefreshCheckpoint={(settings) => {
    // A newly discovered ambiguity must survive reopening.
    // This is persistence, not an analyst's undo step.
    return enqueueSettingsSave(settings);
  }}
/>;
```

These are **proposed APIs**, not available baseline props. `enqueueSettingsSave` denotes the host's shared ordered save queue; its returned promise acknowledges persistence. Compare declaration values, not object reference identity. Continue requiring a new array when data changes.

For projects, reuse `SourceDefinition.entityKey`; add an explicit `continuityId`. A namespace is structurally `["project", project.id, source.id, continuityId]`. Omission leaves current project behavior available but makes the durable-refresh promise unavailable. A source inferred by `sourceFromRows` must never receive continuity automatically. A folder declaration with `continuity=` but no explicit `key=` is invalid.

Changing the dataset's meaning while retaining the project source ID requires a new continuity ID. Changing query filters, lookup measures, display settings, or non-key calculations does not. The library cannot detect a replacement the host falsely labels as continuous; that limit is explicit, not solved by storing old values.

### 2.2 Typed and compound keys

- Accept exact nonblank strings, finite numbers, and booleans. Preserve `0` and `false`; do not use truthiness to test presence.
- Treat `null`, `undefined`, blank-only text, nonfinite numbers, objects, and arrays used as scalar components as invalid. Normalize negative zero to zero.
- Preserve every nonblank string exactly: no trimming, lowercasing, or string-to-number conversion. A date key is an explicitly supplied string, not a parsed Date object.
- A compound key is an ordered tuple of valid components. Every component is required. Encode structural tuples with type tags and JSON, never delimiter concatenation.
- Numeric `101`, string `"101"`, numeric `0`, string `"0"`, and boolean `false` are distinct keys.
- Read keys before display/measure conversions. A field type override changes analytical interpretation; it does not change the raw identity. Changing a row's raw key from number to string produces an absent old key and a new unselected key.
- Changing the declared fields, their order, or the identity normalization contract changes the domain. Do not infer a migration because some printed values match.

Use a narrow exact-value helper alongside `valueParsing.ts`, consistent with the repository's raw-value rules. It validates without coercing. Widen project `entityKey` to a scalar field or a nonempty tuple of distinct, nonempty field names; normalize a scalar to one component internally. Widen `AnalysisSourceReference.entityKey` consistently and resolve tuples by typed component values. Preserve compatible scalar output tokens and add structural compound tokens through the existing source-key constructor. Scalar source-key parameter pickers must reject unsupported compound identity or use an explicitly selected scalar field. This is source identity, not an extension of relationship join predicates.

The shared source helper should serve the evaluator, source inspection, and plain-row adapter. Preserve existing project output-key generation where it is already sound. The provider treats adapter keys as opaque strings; plain tuple encoding and project `AnalysisResultRow.key` both pass through the same resolution boundary. It never reconstructs project identity from displayed query columns.

### 2.3 Record membership and field predicates remain different

An exact selection requests particular logical keys. A category, range, text, date, or specification predicate reevaluates current values and can admit new rows. Neither silently converts into the other.

A useful proof uses the existing finding fixture: r01/r06/r07/r10 are the four active East records. After r01 becomes 100 and r10 converts to numeric 5, their exact selected sum is 255 and mean is 63.75. Add another active East record with score 1000: the exact selection remains four records and 255; the East predicate selects five records and totals 1255, mean 251. [R8]

Keep the existing ordering: current source/query result → workspace and chart-local eligibility → owner selection → finding predicates → numeric inclusion. Other chart selections remain linked in an ordinary workspace and local in a notebook. A notebook finding with no chart still reads all source rows; `population=eligible` still bypasses that chart's selection. [R8]

## 3. Resolution, incomplete results, and deliberate repair

Build identity quality over the full supplied source before workspace/chart predicates. For projects, carry duplicate-key diagnostics through query filtering; filtering one duplicate out must not make an unsafe source key appear trustworthy. Resolve state in this order: incompatible domain, current/saved review guard, current duplicate, missing, unique match. An incompatible domain blocks even an intentionally empty saved request; a deliberate new empty request under the current domain counts zero.

| Member or owner state | Required behavior |
| --- | --- |
| One compatible match, no review marker | Include exactly that current row. Its current values drive findings. |
| No match in the current result | Retain the requested key; include no row. Say “Not in current result,” unless actual source deletion was established. |
| More than one physical match | Include none of them. Mark the selected key `requiresReview: "duplicate-key"`. Count identical duplicate rows too. |
| Previously duplicated key now has one match | Keep it excluded and show “One match now; review required.” Uniqueness is insufficient evidence of continuity. |
| Source, key declaration, or grain mismatch | Block the whole exact owner; retain its request; project it to an active empty filter. |
| Nonempty request, zero identity-resolved members | Selection-dependent finding unavailable, with a reason and requested keys accessible. Do not display a definitive count of zero for the intended cohort. |
| Explicit request with zero members | Active empty selection: count 0; numeric summaries use the existing “no rows” behavior. |
| No exact filter | Clear: every otherwise eligible record participates. |
| Initially missing/duplicate key in a proposed durable selection | Reject that exact-selection edit atomically, preserve the prior selection, and explain which rows lack unique keys. Inspection and field predicates remain available. Do not silently retain just a subset. |

**Why duplicate review must persist.** Suppose numeric key 101 initially identifies A. A duplicate arrives; then the original A changes to string key "101", leaving only the other numeric-101 row. A memoryless unique-match resolver would select that other row. Saving one review marker avoids that known hazard without saving historical rows.

Pure absence is different. If C disappears without an observed ambiguity and later returns uniquely under the same continuity promise, C resumes automatically. If C was marked for duplicate review before disappearing, its return remains blocked.

### 3.1 What findings show

Report three different counts: requested members, current selected records, and valid numeric contributors. Resolution coverage is calculated before eligibility/finding predicates; those predicates can legitimately reduce the current selected population further.

- When some, but not all, requested members resolve, calculate on the current eligible resolved subset and label every dependent result **partial**. Example: “15 · 1 of 2 requested records present.”
- When identity resolves but all resolved records are excluded by eligibility, count 0 is legitimate. Show the selection coverage and eligibility explanation; do not relabel this as a missing-identity failure.
- When records resolve but measures fail conversion, keep the selected-record count. The existing reducer excludes invalid measures and explains them; this is not missing identity.
- When no requested identity resolves, or the basis is incompatible, add a finding-boundary unavailable reason such as `selection-unavailable`. Do not change the reducer to synthesize values.
- Shares and differences inherit operand coverage. Compute an allowed comparison using current operands, label it partial if either operand is partial, and propagate unavailability if either operand is unavailable. Keep existing containment and zero-denominator rules.
- A chart-independent finding is unaffected by a chart's unresolved selection. An eligible-population finding ignores that chart's selection status but still honors any record filter in its eligibility scope.

Coverage belongs to each contributing owner. Workspace {A,C} intersecting chart {C,D} does not have one meaningful combined requested-member denominator: show each owner's requested/resolved/missing coverage, then the final intersection's selected-record and numeric-contributor counts. Do not add or union owner denominators. An unavailable workspace or chart-local exact owner propagates unavailability through eligibility; it must not masquerade as an ordinary predicate yielding zero rows.

Keep existing numeric `FindingResult.ids` as current-revision positions. Associate them with current logical keys for inspection; never reuse them across data revisions. Missing members appear in the coverage list, not as fabricated contributor rows with last-known values.

### 3.2 Minimal visible controls

Use the current filter/status surface and a compact nonmodal popover, following UI defaults [R12]. Show complete selections quietly; surface unresolved coverage beside the owning chart and its dependent findings.

The popover lists typed keys, current status, and current candidate counts. Actions are:

- **Forget member** or **Forget missing members**: remove those requests deliberately.
- **Use current match**: release duplicate review for this owner only after the user sees the one current candidate and the adapter confirms uniqueness in the full identity-defining source. With several source candidates, repair the source/key first, even if the query shows only one.
- **Replace member**: explicitly choose a different current unique key, including a new typed key after a source correction.
- **Clear selection**: remove this owner's record filter.
- **Keep selection** in notebooks: write the current request into text. A kept owner shows a compact kept indicator.

Do not add an Inspect button to chart marks. Existing Alt-click/Alt-Enter and the records/trace routes remain the way into current records. An unresolved identity explains the product decision (“This key occurs twice”), without exposing internal sentinels or implementation caveats.

## 4. The smallest complete data path

### 4.1 Canonical saved state and runtime projection

Add a saved-only `SavedRecordFilter` variant. It lives exactly where the current owner's `__ID` value filter lives, so owner/scope remains explicit. Persist an identity basis, requested adapter keys, and any duplicate-review markers. Do not persist resolved positions, current measures, findings, revision strings, or candidate row snapshots.

Proposed JSON for a plain one-field source:

```json
{
  "type": "records",
  "field": "__ID",
  "basis": {
    "source": ["plain", "orders-production-v1"],
    "grain": ["record"],
    "keyFields": ["key"]
  },
  "members": [
    { "key": "[[\"number\",101]]" },
    { "key": "[[\"number\",303]]", "requiresReview": "duplicate-key" }
  ]
}
```

The key string is opaque to the provider. The plain adapter generates canonical tagged-tuple tokens; the project adapter uses the evaluator's existing output-key tokens. Source/grain metadata is structural, not a delimiter-joined name. A project source-grain basis includes project ID, source ID, explicit continuity ID, and the key declaration. Expanded grain additionally includes the expansion path and both sides' identity domains.

Keep the current runtime `Filter` and numeric `__ID` execution model. Introduce `SavedFilter = Filter | SavedRecordFilter`, distributed saved-chart filter types, and separate saved/runtime Rows types where needed. `SavedChartSettings` currently aliases runtime chart types, so this separation is real work. [R13]

Inside one provider, keep canonical intents indexed by the four existing owner forms: chart selection, chart-local filter, Rows, and workspace. That small provider-local map is authoritative for record membership. Reconciliation produces ordinary runtime `ValueFilter { field: "__ID", values: number[] }` objects; serialization substitutes the canonical filter back into the same owner. Runtime projections cannot overwrite intent.

Widen the existing owner traversal rather than adding another traversal. For a normal chart-setting edit, preserve the owner's canonical intent. For an exact-selection edit, capture it through an explicit operation: replace, add, remove, toggle, clear, or repair. Add/toggle retains unresolved requested members; replace deliberately replaces the full request. Inferring these semantics only from a projected numeric ID array would lose missing members.

A resolver result includes current positions, missing keys, ambiguous/review keys, basis compatibility, and the next canonical safety markers. The input frame explicitly carries `ambiguousKeys: portableToken → candidateCount`, separate from aligned output/runtime keys. Project duplicates currently fall back to positional keys: without this original-token channel the old selected key would look missing and never acquire its necessary guard. The adapter also supplies/decodes typed display labels for absent opaque keys. Source-wide ambiguity reaches the frame even when the query returns only one duplicate. No source or query failure should masquerade as a successfully refreshed empty dataset.

### 4.2 Refresh, echoes, and restore ordering

For keyed input:

1. Read the **current** canonical settings before replacing rows.
2. Classify incoming settings: unchanged restore prop; equivalent echo; genuinely different restore; or explicit reset.
3. Build the new rows, converted columns, identity frame, runtime projections, and coverage from one input/evaluation.
4. Commit them together. Increment the existing current-data revision so findings and records refresh coherently.
5. If reconciliation added a persistent review marker, or restoration supplied text/settings lacking a guard already held in this session, emit `onRefreshCheckpoint(settings)` once with the merged canonical state. Do not emit `onStateChange` for it.

An unchanged `savedData` prop, including undefined before and after a refresh, preserves the latest mounted keyed selection. A change from supplied settings to undefined remains an explicit reset. A genuinely different supplied save restores its canonical request against the new rows. An equal canonical host echo must not reset live edits or turn runtime IDs back into keys using an old row array.

Fingerprint canonical settings, excluding existing volatile metadata; do not include resolved positions or status counts. Sort/deduplicate key tokens consistently so equivalent membership does not create endless echoes. Current duplicate-review guards take precedence over a stale host echo lacking the guard.

The checkpoint callback returns `void | Promise<void>`: synchronous persistence must complete before return; asynchronous persistence returns its promise. A missing handler makes `getSettings()` the manual-save route, without a durability claim. Keep pending/failed checkpoint status until acknowledgment. Route edit and checkpoint writes through one ordered/coalescing queue per persisted file or host settings destination; an old full-state safety write cannot overwrite a newer selection edit. The folder saver needs an actual change: serialize its own in-flight writes per path, make `flush()` wait for pending and running work, and report failures without a later unrelated save falsely clearing them. This orders the app's own writes; it cannot undo an already-issued write racing an external file edit. Full external-writer conflict protection remains a file-adapter limit. [R14]

Without `rowIdentity`, retain baseline restore/content-matching behavior for legacy filters. A new saved record filter without its required current identity frame is visibly blocked; it must not fall through to legacy positional execution or clear/all. For old positional saves entering keyed mode, require deliberate adoption from a known current snapshot or a full bundle containing its original rows; a positions-only save cannot establish which historic record position 5 meant. Existing legacy project tokens also require a verified source/grain binding before adoption. Do not guess, and do not create a general migration/version-coexistence framework.

### 4.3 Project query identity and grain

Use the existing evaluator and key code. Factor its `sourceReferences` and `sourceRowIdentities` into one source-identity implementation with typed validation and key-quality metadata. Build a small adapter from an `AnalysisEvaluation` to the common frame. Do not select source parents by scanning query values or `contributors`.

| Query output | Initial support and behavior |
| --- | --- |
| Source rows; filters; calculations | Durable after explicit source continuity. Query filtering can make a key absent from the result without deleting it. |
| Cardinality-preserving lookup | Durable for the identity-defining input row. An ambiguous looked-up measure does not invalidate an otherwise unique parent identity. |
| Expand | Prior parent selection blocks on the new grain. Release 4 may retain an explicitly selected exact parent/child output pair; never promote a parent selection to all children. |
| Aggregate/group output | Durable record retention unavailable. Group predicates continue to reevaluate; a group is not an exact source-record cohort. |
| Missing/duplicate/generated source key | No portable record promise. Keep current inspection diagnostics and offer explicit declaration/repair. |
| Query loading/error | Keep the last successful rows with their own identity and updating/error status. Do not reconcile against a failed/partial result. |

Grain compatibility follows identity-defining structure, not just query ID, displayed columns, or a hash of every calculation. Changing a measure formula does not invalidate identity; changing to expanded/grouped output does. The baseline keeps the previous result while pending and drops stale responses, but thrown/worker errors produce `emptyEvaluation`. Retaining a previous result on error is an additional proposed change: label it “Previous result; refresh failed.” Reject identity-fatal ready results such as `missing-source` too; they must not look like successful deletion of every selected record. Current valid rows, identities, findings, and inspection always belong to one completed result. [R4]

For unsupported new durable selections, disable **Keep selection** and explain the unsupported grain. Existing session-only analysis may continue, but the new refresh path must never promote its positional fallback into a portable key. On result replacement, a snapshot-specific exact selection retains an empty runtime filter with an expired/unavailable status and “Select again for this result.” Selection-dependent findings remain unavailable until reselection or clear. Do not serialize expiry as an intentionally empty `members: []` request or show a definitive count0. An existing retained owner entering an unsupported grain remains visibly blocked; it is not silently cleared.

### 4.4 Text declarations, notebook compilation, and files

Use existing `eda` fences; there is no YAML-frontmatter dependency. The following is proposed authoring syntax for a plain notebook:

```text
eda identity.source=orders-production-v1 identity.fields=key

scatter @picked x=key y=value
selection chart=@picked source=orders-production-v1 fields=key grain=record {
  key 101
  key 303
}
finding @selected_count count chart=@picked
finding @selected_sum sum value chart=@picked
finding @selected_mean average value chart=@picked
```

The finding declarations use the existing syntax; `identity.*` and `selection` are the new declarations. Keep the existing finding compiler and reducers.

Each `key` child is an ordered typed tuple. For example, `key "EU",101` and `key "EU","101"` differ. A member needing review writes `key 101 review=duplicate-key`. An empty selection block is active-empty; removing the block clears it.

For projects, export the existing output key as `query-key "orders:number:101"` and persist the complete binding on the selection declaration: `project=`, `source=`, `continuity=`, `fields=`, and `grain=`. The plain `source=` is a namespace; the project form uses a source ID plus continuity. Later expanded bindings can use a structured, quoted JSON grain descriptor. Always retain the **saved** basis on compile; recomputing it from a newly edited query would silently rebind the selection.

Other owners use explicit `owner=workspace`, `owner=rows`, or `owner=chart-local chart=@picked`; plain `chart=@picked` means the chart's own selection. Allow one exact record filter per owner, consistent with the current `__ID` field semantics.

The parser must preserve primitive types and tuple boundaries independently of rows currently available. A quoted comma in a field name is one field: source `key="tenant,code",orderId` is not the same declaration as three fields. The current project parser joins items into a scalar string, so compound source keys need a deliberate parser/exporter change. [R10, R13]

Malformed or conflicting retained-selection declarations produce located diagnostics and block the affected retained owner. Preserve its last valid guarded definition when available; never skip the invalid declaration and thereby broaden to all rows.

Notebook integration must:

- Extend `NotebookReadResult` with the project identity frame, and pass it through `ProjectWorkspace` and `ExplorEdaNotebook`.
- Recompile current fields/calculations/findings when data changes while preserving current canonical selections for unchanged named owners.
- Distinguish a data-only recompile, a write-back echo, and an external authored selection change.
- Give a kept selection a stable authored chart ID. Keeping an unnamed chart assigns a stable `@name` in the same text edit.
- Write only the relevant selection declaration, preserving prose, comments, other blocks, and field predicates.
- Carry the same frame into headless `evaluateNotebookFindings`; its static current-ID column must be synthesized for projected record filters rather than read from a missing raw `__ID` field. Resolve canonical selections first and return any next safety checkpoint for the caller to reuse/persist on subsequent evaluations. This does not add provider calculation/conversion execution to the source-field-only headless helper; use raw numeric headless fixtures and mounted tests for conversions.
- Reevaluate `eda query=` changes against the new query before publishing its rows and keys. Do not keep using a prior notebook result's rows.

**Folder-session handoff.** `App` must hold a bounded selection session above its generation-keyed workspace: current requests, guard sets, authored-owner fingerprints, and notebook definition/text Undo. Scope it to the open folder/files identity and file plus verified named view/owner; store no rows or measures. Hydrate before the first findings render and prevent initialization callbacks from replacing the session with compiled defaults. Data-only reloads retain current state. External edits to an owner's authored selection restore that owner, while prose/title-only edits do not discard local membership. Removed owners evict their intent. Source/grain changes retain the old intent as blocked. Current project view IDs use `path#index`; after view reordering, reuse session state only through verified named-owner mapping. Otherwise do not attach an ambiguous overlay: load unrelated authored chart settings, but block affected exact selections with “Selection owner changed; reselect.” Missing owner mapping must not erase a possibly unsaved review guard. [R5, R14]

**Persistence choice.** Unkept notebook selections survive data refresh and internal folder reload while the same app session remains open; a fresh browser/app session restores only kept text. Keep writes the current request once. Further user edits to a kept owner write one text edit; clear removes the block. This preserves existing click-persistence expectations while adding an explicit saved workflow.

Ordinary reorder/value/missing-return refreshes do not rewrite notebook text. **A newly observed duplicate is the necessary exception:** a kept member's review marker is checkpointed to text and autosaved without an Undo step. Otherwise save/reopen could lose the known ambiguity. An unkept selection keeps the guard in session; Keep later writes it. If text is frozen/invalid or saving fails, retain the guard in memory and show that its review state is unsaved. Never claim durable protection until the host saves it.

Folder loading/saving must round-trip explicit key/continuity declarations and canonical filters in both project and analysis-local sources. Preserve `declaredSources` for unrelated inferred declarations. Use current local files and the amended saver; no sidecar history store is required. A failed checkpoint retains its guard in the App-level session across another workspace remount. [R5, R7, R9, R14]

### 4.5 Undo after a refresh

Selection replace/toggle/brush, Keep, forget, clear, and explicit repair each create **one** Undo step. Inspection, refresh, resolved-position changes, and safety checkpoints create none. Use the existing held-edit mechanism for a continuous gesture. [R1]

Undo restores prior definitions against **current data**. If A was 10 when selected and is now 15, Undoing a later selection edit restores A with value 15. It never restores a historical sum or deleted source row.

Duplicate review is current safety state. Keep a bounded provider-local guard set keyed by **owner + identity basis + requested key** during this workspace session. Restoring older settings unions current guards with saved markers; ordinary selection edits and text removal of `review=` cannot release them. Serialize guards for requested members. Explicit repair clears that owner's guard; Undoing repair reinstates it. Replaying an old unchecked save is not repair. Choose the smallest precise Redo rule: **redoing a repair requires fresh Use current match review**; ordinary snapshot Redo does not release a guard. This avoids pretending to recognize a changed physical candidate without historical evidence.

The folder notebook host currently has no notebook Undo integration in `ProjectWorkspace`. Wire bounded definition/text history there but own it above the generation remount in `App`, storing no datasets. Plain hosts keep owning their existing settings history. Before saving text after Undo or external restore, reserialize the merged guarded definition; otherwise old text would remove the persisted hold despite safe in-memory evaluation. A host receiving `onRefreshCheckpoint` updates persistence/current checkpoint without pushing history; restoration also applies the provider's guard merge. [R7, R14]

## 5. Exact refresh matrix

These are the **chosen policy's expected outcomes**, not application test results. A handwritten independent reference model checked the main sequence and arithmetic.

### 5.1 A/B/C proof, including the dangerous sequential duplicate case

Use logical labels A/B/C and raw keys `101`/`202`/`303`, respectively. This makes the later key-type change precise. Initial values are 10/20/30. Request exactly numeric keys **101 and 303**, meaning **A and C**. No additional eligibility/finding predicates apply. D has key 404 and value 100.

| Transition | Resolved records | Selected count; sum; mean and status |
| --- | --- | --- |
| Initial A10, B20, C30 | A,C | 2; 40; 20. Complete. |
| Reorder to C,D,A,B; A becomes 15 | A,C | 2; 45; 22.5. D stays unselected. |
| Remove C | A | 1; 15; 15. Partial; C remains requested. |
| Return C30 | A,C | 2; 45; 22.5. Complete, including after reopening while C was missing. |
| Add another row with numeric key 101 and value 999 | C | 1; 30; 30. Partial; numeric101 marked for review; neither occurrence included. |
| Original A changes key to string "101"; other numeric101 row remains | C | 1; 30; 30. The now-unique numeric101 row remains blocked. String101 is unselected. |
| Remove the other row and repair original A's raw key to numeric101 | C | 1; 30; 30 until explicit review. The stored hold survives uniqueness. |
| Inspect and choose Use current match for the unique original A15 | A,C | 2; 45; 22.5. One repair Undo step. |
| Branch from the unique, unheld state: A changes to string "101" | C | 1; 30; 30. Numeric101 missing; the newly typed key is unselected. |
| Branch: both requested keys absent | None | Runtime selection empty; count/sum/mean findings unavailable, not a cleared selection. |
| Deliberately replace request with an empty list | None | Count 0; sum/mean “no rows.” Filter remains active. |
| Clear exact selection on C30,D100,A15,B20 | All four | 4; 165; 41.25, subject to any other filters. |

After any refresh, if the analyst replaces the request with B only, the next refresh must use B, not A/C from the initial save. Adding B instead retains A/C, including absent members. Same-state host echoes change neither request.

### 5.2 Typed ledger and additional cases

Reuse `selectionIdentityFixture.ts` rather than an unrelated synthetic ledger. Its logical IDs and powers-of-two measures distinguish wrong-record matches. [R11] Each owner's membership is checked independently before testing intersections.

| Case and explicit request | Expected current outcome |
| --- | --- |
| Original W and chart-local request L01,L10,L12 | Count 3; sum 2561; mean 2561/3. |
| Reverse, set those measures to 3,600,2100, add unselected unique L13=8192 | Same logical members; count 3; sum 2703; mean 901. |
| Remove L10 from that refresh | L01,L12; 2 present, 1 missing; sum 2103; mean 1051.5. Return L10=600 restores 2703/901. |
| After refresh deliberately replace W with L02,L06,L07; then values become 5,35,65 | Exactly string101, false, numeric0; count 3; sum 105; mean 35. Numeric101 and string0 stay excluded. |
| Make L10's measure invalid, with all three requested keys still unique | Selected count 3; numeric contributors 2 (L01,L12); sum 2103; mean 1051.5. Identity coverage complete. |
| Original ledger: L01 numeric101 changes to string101, colliding with L02 | W retains L10,L12: count 2, sum 2560, mean 1280. Chart C's string101 member becomes ambiguous: only L05,L10 remain, sum 528, mean 264. |
| Select L06,L07,L08, then remove L07 | false and string0 remain: count 2, sum 160, mean 80. Numeric0 alone is missing. |
| Key null/undefined/blank or an equal-row duplicate at initial selection | New durable exact-selection edit rejected; prior owner unchanged. No positional or content fallback. |
| Two equal full rows after a previously unique selection | Both excluded for that key; review marker persisted. Content equality does not make them one physical match. |
| Compound tuples ["a:b","c"] and ["a","b:c"]; quoted comma in one field name | Distinct keys/declarations; no delimiter collision. Changing tuple field order makes the saved basis incompatible. |
| Same rows and keys under another source continuity ID | Exact owner blocked and selection findings unavailable. Compatible field predicates reevaluate against the new source. |
| A raw measure "bad" changes to "5" under numeric conversion | Membership unchanged; current numeric inclusion changes. Do not change raw key extraction. |
| Same raw key, changed key-field display/type override | Raw typed membership unchanged. A genuine raw-type change is the separate replacement case above. |

For a parent A with children a1=4 and a2=6, changing a parent-grain query to expansion makes the old parent selection unavailable. It must not produce count 2 or child sum 10. In the later exact-pair milestone, explicitly selecting (A,a1) gives count 1/sum 4; changing a1 to7 and adding a3=9 gives count1/sum7. Missing a1 gives unavailable; a1's unique return gives7 unless that key has a review hold. The existing delimiter-containing expansion-key test remains a regression test. [R11]

## 6. What transfers from strong existing tools

The comparison is deliberately small. These are primary-source observations, retrieved October 29, 2026; the missing/ambiguity/grain policy above is a design choice.

| Tool | Verified behavior | Transfer and limit |
| --- | --- | --- |
| **AG Grid** | Supplying stable row IDs preserves selection across replacement when the row exists in both datasets. Its ID callback must return a stable, unique string. [E1, E2] | Adopt the stable-identity/value-update separation. The cited guarantee does not establish dormant selection after deletion or a duplicate-review policy. Do not copy untyped string coercion or introduce transaction machinery. |
| **TanStack Table** | Selected state can contain IDs absent from supplied data; the selected row model resolves only available rows. Custom row IDs replace index defaults. Parent-to-child selection is automatic by default and configurable. [E3] | Adopt requested keys versus current resolved rows. Do not import its default child fan-out or another state-management system. Its pagination example does not prove that an absent row was deleted. |
| **Perspective** | A Table can use one index column for updates/removals. Replacement preserves derived Views/callbacks and uses the existing schema. Views remain live over data changes. [E4–E6] | Keep definitions and current computation separate. Indexed update semantics do not specify duplicate handling for a complete analytical snapshot or durable selection policy. Its engine/streaming lifecycle is unnecessary here. |

No product provides explorEDA's entire contract. AG Grid motivates the host key declaration; TanStack is the closest conceptual model for retained intent; Perspective supports live definitions over refreshed data. Explicit source/grain binding and duplicate review address this mission's analytical requirements.

## 7. Recommendations and dispositions

| ID | Disposition | Recommendation and reason |
| --- | --- | --- |
| SR01 | **Build** | Shared narrow identity boundary with plain/source and project adapters; one resolver and owner model. |
| SR02 | **Build** | Explicit source continuity plus typed/compound declarations; inferred uniqueness never implies temporal identity. |
| SR03 | **Build** | Canonical saved record filters, runtime numeric projections, and unchanged predicate semantics. |
| SR04 | **Build** | Retain missing keys and expose partial coverage; pure missing members may return. |
| SR05 | **Build** | Persist duplicate-review holds; unique-after-duplicate requires explicit repair to prevent known silent replacement. |
| SR06 | **Build** | Distinguish clear, active-empty, partial, unavailable, and incompatible states at both owner and finding surfaces. |
| SR07 | **Build** | Refresh from current intent, classify echoes/restores, and publish one coherent rows/identity/findings revision. |
| SR08 | **Build** | Separate refresh checkpoints from edit callbacks/history; merge safety guards on Undo/restore. |
| SR09 | **Build** | Reuse/factor project source identity and expose source-grain query portability, including explicit compound source keys. |
| SR10 | **Build** | Carry query identities into notebooks; Keep selection and typed text round-trips; preserve local scope. |
| SR11 | **Build** | Current contributor inspection, numeric-exclusion counts, and partial/unavailable propagation to comparisons. |
| SR12 | **Build** | Same-milestone JSON/text/folder persistence, docs, runnable examples, and exact user-action tests. |
| SR13 | **Build, after core** | Explicit exact expanded output-pair retention, with both key domains and grain bound. Never implicit parent fan-out. |
| SR14 | **Explore** | Measure real workloads after the synchronous resolver ships; optimize only an observed bottleneck. |
| SR15 | **Defer** | Aggregate/group identity, mixed portable/nonportable exact selections, and automatic key migrations require separate semantics. |
| SR16 | **Avoid** | Whole-row identity, first/last duplicate wins, missing-key pruning, sentinel persistence, implicit rebinds, historical capture, remote services, and a universal registry. |

## 8. Main risks and implementation judgment

- **The host continuity promise is necessary and unverifiable.** An unobserved key reuse cannot be detected without stronger upstream identity. Surface the declaration and make unrelated replacement explicit.
- **Duplicate safety adds one exceptional persistence path.** This cost is justified by the sequential impostor case. A status-only warning that is lost on reopen is insufficient.
- **Runtime/saved type separation reaches more than validation.** Saved chart/Rows aliases and all serialization boundaries must be updated together. Keep runtime filters familiar.
- **Notebook recompilation can look like an authored restore.** Stable named owners and explicit input classification are required; a row-key prop alone is incomplete.
- **Inferred row numbers look deceptively valid.** Require explicit source key/continuity before offering retained selections; preserve current inferred analysis without making that promise.
- **Partial figures can be misread.** Put coverage beside the number and retain inspection. Do not hide incomplete-cohort status solely in a tooltip.
- **Query grain is semantic.** Do not equate identical visible columns or a stable query ID with stable record meaning.
- **Performance is unmeasured.** Start with one synchronous index and linear resolution over current rows and selected members. No runtime speed claims, benchmarks, worker expansion, or incremental event system are justified by this research.

## 9. Access, evidence, and open questions

**Checks actually performed:** all 46 packet file blocks were checked for matching boundaries and complete declared byte counts (the packet adds one separator newline per block); their complete contents were reviewed across the source analysis. Additional exact-commit imports and current official external documentation were inspected. A handwritten Python reference model exercised the A/C sequence with duplicate review, typed-key distinctions, compound delimiter separation, and arithmetic. It did not import or execute repository code.

**Not performed:** pnpm install/build/check, repository tests, browser interaction, file-watcher integration, performance measurement, code changes, commits, or pushes. Every application test and milestone outcome in the companion plan is proposed.

**No decisive source input is missing.** Supplemental reads confirmed the outer app's generation remount, the saver acknowledgment gap, and the existing app Vitest script. The plan therefore targets the actual watched/manual reload and save route. Those integration outcomes remain proposed tests, not observed runtime results.

**Open questions for integration, with defaults already chosen:** final public names (`rowIdentity`, `onRefreshCheckpoint`); the exact compact wording for partial results; and the appropriate existing host-history abstraction for notebook Undo. Use the proposed names, visible coverage, and a small local history if no reusable abstraction fits. None requires an outside-demand or usability gate before milestone one.

### Repository evidence map

All URLs below are pinned to the source baseline. Line references refer to the original files, not the concatenated packet.

- **R1:** [DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/providers/DataLayerProvider.tsx), `getSavedStateFingerprint` (242–267), save/restore (1298–1490), provider reconciliation/subscription (1587–1715); [dataLayerState.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/providers/lib/dataLayerState.ts), `initializeData`.
- **R2:** [carryRowSelections.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/providers/lib/carryRowSelections.ts), complete helper; [rowIdFilters.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/rowIdFilters.ts), both traversal functions.
- **R3:** [sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/sourceRowIdentity.ts), `sourceRowIdentities`, `resolveSourceRow`; [analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/analysisRowKeys.ts), encode/decode; [ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/ExplorEdaProject.tsx), evaluated data/maps (144–159), reported/rendered settings (224–280).
- **R4:** [evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/evaluateProject.ts), `sourceReferences`, `sourceFrame`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `filterFrame`, `aggregateFrame`; [useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts), worker result ordering; [AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/types/AnalysisProject.ts), source, result, and evaluation types.
- **R5:** [readNotebook.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/readNotebook.ts), `NotebookReadResult`, `readNotebookText`; [ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/ProjectWorkspace.tsx), notebook rendering and text save (526–544).
- **R6:** [ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx), `useNotebookResult` (202–228), saved settings/echo handling (303–327), local provider (346–358); [compileNotebook.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/compileNotebook.ts), declaration combination and owner IDs.
- **R7:** [writeBack.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/writeBack.ts), `skippedKey`, `textPart`, `writeBackSettings`; ProjectWorkspace in R5 for automatic saving and current absence of notebook history.
- **R8:** [findings.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/findings.ts), `FindingContext`, `evaluateFinding`, `compareFindings`, `evaluateNotebookFindings`; [NotebookFindings.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/notebook/NotebookFindings.tsx), current-data context and revision guard; [findings.test.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/findings.test.ts), FIXTURE and exact counts.
- **R9:** [folder.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/folder.ts), `inferSource`, `declaredSources`; [writeFolder.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/writeFolder.ts), `declaredSource`; [sources.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/sources.ts), `sourceFromRows`.
- **R10:** [dsl/parse.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/parse.ts), quoted value items and children; [dsl/compile.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/compile.ts), ignored eda header and `buildFilter` (2039–2054); [dsl/export.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/export.ts), `filterPairs`; [analysisText.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/analysisText.ts), analysis read/export.
- **R11:** [selectionIdentityFixture.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/test/lib/analysis/selectionIdentityFixture.ts); [selectionIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts); [savedSelectionRestore.test.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/test/providers/savedSelectionRestore.test.tsx); [projectIdentity.test.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/test/providers/projectIdentity.test.tsx).
- **R12:** [AGENTS.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/AGENTS.md), [DIRECTION.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/research/DIRECTION.md), [ui-defaults.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/ui-defaults.md), and [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/CODING_STANDARDS.md).
- **R13:** [SavedDataTypes.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/types/SavedDataTypes.ts), saved/runtime chart and Rows coupling; [dsl/project.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/project.ts), `sourceLines`, `single`, `compileSource`; [saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/utils/saveDataUtils.ts), `isFilter`, `validateSavedData`.
- **R14:** [App.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/App.tsx), `reload`, watcher reload chain, generation-keyed `ProjectWorkspace`, and `notebookMemory`; [saver.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/saver.ts), `FolderSaver.queue`, `flush`, `write`, and `cancel`; [app package.json](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/package.json), existing `vitest run` test script.

### External primary sources

- **E1:** AG Grid, [Updating Row Data](https://www.ag-grid.com/javascript-data-grid/data-update-row-data/), stable IDs and selection across replacement.
- **E2:** AG Grid, [Row IDs](https://www.ag-grid.com/react-data-grid/row-ids/), stable unique string ID callback.
- **E3:** TanStack Table, [React Row Selection Guide](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection), selected state, current row model, and sub-row behavior.
- **E4:** Perspective, [Index and Limit](https://perspective-dev.github.io/guide/explanation/table/options.html), indexed tables.
- **E5:** Perspective, [Table API](https://perspective-dev.github.io/node/classes/dist_wasm_perspective-js.d.ts.Table.html), `replace`, `update`, and schema lifetime.
- **E6:** Perspective, [Live Views](https://perspective-dev.github.io/guide/explanation/view.html), derived view recomputation.

### Complete packet reading inventory

All paths in the following groups were read completely. Paths under `src/` are relative to `packages/explorEDA/`.

- **Rules/product (9):** `AGENTS.md`; root `README.md`; `CODING_STANDARDS.md`; `docs/agent-guide.md`; `docs/ui-defaults.md`; `docs/research/DIRECTION.md`; root `package.json`; `packages/explorEDA/package.json`; `packages/explorEDA/README.md`.
- **Refresh/save (7):** `src/providers/DataLayerProvider.tsx`; `src/providers/lib/carryRowSelections.ts`; `src/providers/lib/dataLayerState.ts`; `src/lib/rowIdFilters.ts`; `src/types/SavedDataStructure.ts`; `src/types/FilterTypes.ts`; `src/utils/saveDataUtils.ts`.
- **Project identity (7):** `src/types/AnalysisProject.ts`; `src/components/ExplorEdaProject.tsx`; `src/components/project/analysisRowKeys.ts`; `src/components/project/sourceRowIdentity.ts`; `src/components/project/settingsCompatibility.ts`; `src/lib/analysis/evaluateProject.ts`; `src/lib/analysis/useAnalysisEvaluation.ts`.
- **Notebook/folder (9):** `src/lib/notebook/findings.ts`; `src/lib/notebook/compileNotebook.ts`; `src/lib/notebook/readNotebook.ts`; `src/lib/notebook/writeBack.ts`; `src/components/notebook/ExplorEdaNotebook.tsx`; `src/components/notebook/NotebookFindings.tsx`; `apps/app/src/ProjectWorkspace.tsx`; `src/lib/project/folder.ts`; `src/lib/project/writeFolder.ts`.
- **Tests (7):** `src/test/providers/savedSelectionRestore.test.tsx`; `src/test/providers/projectIdentity.test.tsx`; `src/test/lib/analysis/selectionIdentity.test.ts`; `src/test/lib/analysis/selectionIdentityFixture.ts`; `src/test/lib/analysis/sourceRowIdentity.test.ts`; `src/lib/notebook/findings.test.ts`; `src/components/notebook/ExplorEdaNotebook.test.tsx`.
- **Runnable docs/example (4):** `apps/demo/src/docs/pages/developers.mdx`; `project-folders.mdx` and `notebooks.mdx` in that same directory; `apps/demo/src/docs/live/NotebookFindingsExample.tsx`.
- **Historical context (3):** `docs/research/selection-identity-2026-10-22/README.md`; its `decisions.md`; `docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md`.

**Supplemental exact-baseline reads (18; 17 complete, one targeted):** `src/hooks/CrossfilterWrapper.ts`, `src/hooks/applyFilter.ts`, `src/components/ExplorEda.tsx`, `src/lib/dsl/parse.ts`, `src/lib/dsl/export.ts`, `src/lib/dsl/project.ts`, `src/lib/project/analysisText.ts`, `src/lib/analysis/sources.ts`, `src/lib/notebook/parseNotebook.ts`, `src/components/charts/MetricCard/MetricCardTraceBody.tsx`, `src/components/charts/MetricCard/metricCardPlan.ts`, `src/types/SavedDataTypes.ts`, `src/analysis.ts`, `src/lib/analysis/projectFile.ts`, `apps/app/src/App.tsx`, `apps/app/src/saver.ts`, and `apps/app/package.json` were read completely. The large `src/lib/dsl/compile.ts` was inspected at the relevant declaration/filter/final-settings symbols, not claimed as a complete read. The supplemental [projectFile.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/projectFile.ts) validator currently requires a scalar entity key; the compound milestone must update it.

The requested build sequence, exact acceptance tests, documentation sections, and runnable examples are in **implementation-plan.md**.



