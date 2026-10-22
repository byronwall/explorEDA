# R077 — Source evidence, scope audit, and mutation predictions

**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA)  
**Exact source baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`  
**Access/research date:** 2026-10-22, America/Indianapolis  
**Question:** What is the smallest trustworthy contract for row-specific selections after immutable source replacement?

## 1. Evidence labels and execution boundary

This report uses four labels deliberately:

- **EXECUTED — access/artifact check:** an operation actually performed in this research, such as reading an exact-ref file, checking its digest, or validating the frozen ledger's internal consistency.
- **SOURCE FACT:** a property visible in inspected source or test assertions. Reading a test is not running it.
- **PREDICTION — UNEXECUTED:** a behavioral deduction from those facts. It may be sufficiently precise to write a failing test, but it is not a reproduced runtime failure.
- **PROPOSAL / UNRUN CHECK:** a policy, test, example, or implementation candidate for independent verification.

**Product executions in this run: zero.** No pnpm tests, application mount, browser interaction, actual downloaded CSV, worker scheduling experiment, representative-host task, or performance measurement was executed. The source packet is not a runnable checkout. No product code, GitHub state, commit, PR, or deployment was changed.

The research conclusion is to investigate the existing project mapper and explicit snapshot invalidation before considering an additional plain key API. That is a research decision, not implementation acceptance.

## 2. Access preflight and source authentication

### 2.1 Inputs and exact hashes

**EXECUTED.** Both supplied files were read from the user-provided workspace copies, not fetched through a Library reader. The original attachments were not modified.

| Attachment | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-prompt(20261022-070802).md` | 8,730 | `01b4a3c2381edf513742732be9680492b58aa511144d48608cf183fce7671da7` |
| `source-packet(20261022-070802).txt` | 325,105 | `de813c89251f4a5cdf5b8149bb2821c6be494ab968d127725a3deba7d5d03ee6` |

The packet contains **33 labeled sections**: 27 baseline files, two parsed catalogue projections, two historical R043 files, and two local research additions. The complete supplied inventory is in Appendix A.

**EXECUTED.** Read-only repository metadata identified repository `byronwall/explorEDA`, repository ID `933467100`, owner login `byronwall`, public visibility, and default branch name `main`. The exact commit response returned `f4cacdde180e16ad814451a8c064e394535565d6`, titled “Merge pull request #463 from byronwall/codex/research-ideas-100 / Collect 100 research ideas for explorEDA.” [Commit record](https://github.com/byronwall/explorEDA/commit/f4cacdde180e16ad814451a8c064e394535565d6).

Every one of the **27 packet baseline files** was fetched by that explicit SHA and compared with its packet payload using Git's blob digest format. All matched after removing exactly the packet's one separating newline before `END FILE`. This normalization applies only to section verification; attachment SHA-256 values above are hashes of the original bytes. One remote file read briefly disconnected; retry succeeded and matched. There was no source mismatch.

This authenticates the owner/repository/ref relationship and the supplied baseline content. It does not assert a signed-commit verification or that today's mutable `origin/main` still points at this commit. No later branch code was silently substituted.

### 2.2 Preflight disposition

| Required category | Availability | Decision |
| --- | --- | --- |
| Core provider, plain component and initialization | Complete in packet; exact-ref matched | GO |
| Project component, source/output identity, evaluator and worker hook | Complete in packet; exact-ref matched | GO |
| Saved/filter/project types | Complete in packet; exact-ref matched | GO |
| Requested tests and shop fixture | Complete in packet; exact-ref matched | GO for source review; tests unrun |
| Full R077 brief and catalogue context | Full four-paragraph brief, README and selected projections present | GO |
| Runnable application/dependencies/browser | Not supplied as a checkout | Runtime verification remains blocked; does not block source research |

The reading route included `AGENTS.md`, `docs/agent-guide.md`, root README, root `package.json`, and `packages/explorEDA/README.md`. Repository rules require pnpm; the root manifest pins `pnpm@11.9.0`. Those commands are proposed in the proof plan, not reported as executed. The user's research-only instruction governs this run; implementation and PR instructions in repository guidance belong to later integration. [S01][S02]

### 2.3 Ref separation and historical reuse

- The R077 brief's own metadata mentions `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, the earlier catalogue source baseline. The file itself was verified at the requested `f4cacd…` commit. That embedded metadata does not replace this study's baseline.
- `catalogue-selected.json` and `catalogue-review-selected.json` are explicitly labeled **parsed projections**. They are not claimed as literal repository paths. R077 is priority 3; the full brief is present separately.
- Historical `docs/research/entity-grain-2026-10-21/README.md` and `decisions.md` are supplied at **`89e85dead29dd61f1b7b79d359f4bad0c38fab4d`**. They report earlier R043 probes about source-occurrence, typed-value, and copied-null partitions, including differing totals. Those are historical reported results, not R077 executions or baseline replacement tests. Only the lesson that exact identity partitions matter is reused. [H1][H2]
- The local prompt and queue have no baseline ref. The embedded local prompt equals the uploaded prompt after excluding the packet separator newline. The queue's completed-research status for R026/PR465 and R043/PR466 is supplied planning context, not proof of later product fixes at this baseline.
- R008/PR464, R011/PR461, and PR462's Mosaic integration are not re-surveyed. R001 and R051 remain later catalogue candidates.

## 3. Frozen oracle and what was actually checked

**EXECUTED — artifact operation.** Before exploring replacement outcomes, the handwritten oracle `R077-12-v1` was saved with SHA-256:

```text
297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15
```

The complete unchanged JSON is embedded in `proof-plan.md` with extraction instructions. Its 12 records use repeated names, distinct typed keys, and power-of-two measures. They separate logical labels, source keys, and positions. The core mutation cases are M00–M12; F01 and the equal-name predicate control were included at freeze time. F02, A01 and A02 are separately identified supplementary probes discovered during source review. They do not redefine the frozen expectations.

A local Python consistency check verified the frozen bytes, 12 unique logical labels, 12 distinct typed keys, the measure sequence, 13 mutation IDs, the declared cohort membership, and ordinary combined-set intersections. The initial measures sum to 4,095. **This checked the oracle, not explorEDA.** No library function was imported by that check, and no product outcome follows from its arithmetic.

For the matrices below, use these frozen sets:

- C, chart-linked row inclusion: `{L02,L05,L10}`; initial runtime positions `[1,4,9]`.
- T, Rows-local row inclusion: `{L04,L08,L10}`; initial positions `[3,7,9]`.
- W, ownerless workspace row inclusion: `{L01,L10,L12}`; initial positions `[0,9,11]`.
- P, semantic workspace predicate `cohort == "keep"`: `{L01,L02,L04,L06,L08,L10,L12}`.
- Combined Rows/CSV population C ∩ W ∩ P ∩ T: `{L10}`. Global workspace population omits T. With W disabled, C ∩ P is `{L02,L10}`, while Rows adds T and yields `{L10}`.

T is deliberately seeded as a diagnostic `__ID` filter. The inspected table UI's “Filter to value” action creates a cell-value predicate, not an invented persistent record-checkbox feature. This distinction is essential to interpreting both proof and adoption claims. [S12]

## 4. Baseline source audit

### 4.1 Positional IDs, replacement and supplied restore

**SOURCE FACT.** `initializeData` spreads each row and then writes `__ID: index`. It overrides a host's same-named property. IDs are numeric runtime positions, with no source generation embedded. `dataLayerState.test.ts` asserts IDs 0 and 1 for one initialization; its test title does not prove cross-replacement stability. [S03][S16]

**SOURCE FACT.** `DataLayerProvider` compares `data`, `fieldNames`, and `fieldTypes` by reference. Any of those changes makes `dataChanged` true. It calls `setData(nextData, …)` and, when supplied, `restoreFromStructure(nextSavedData)` immediately afterward, even if the saved settings object is unchanged. `setData` rebuilds data/crossfilter/calculations, resets charts or creates defaults, resets Rows settings, clears workspace filters and caches, and increments nonce/filterReset. `restoreFromStructure` reuses current `rawData` and restores saved chart, Rows, and workspace filters. [S04]

**SOURCE FACT.** A savedData-only echo can avoid a rebuild when its fingerprint matches current saved state. That branch runs only when data/field references did not change. The fingerprint ignores `modifiedAt`; it is not a proof that settings belong to the replacement dataset. Prop-driven changes suppress `onStateChange`, while an internal `onSavedDataApplied` is called. The public `ExplorEda` handle exposes `getSettings`, not that internal callback. [S04][S05]

**PREDICTION — UNEXECUTED.** A no-save replacement deliberately loses old selection state. A supplied positional filter can instead be reapplied to the new row at its old position. The frozen reverse control predicts exact wrong memberships, but these have not been observed in a mounted provider. Source replacement must not be conflated with same-data host echo.

### 4.2 Project keys and saved adapters

**SOURCE FACT.** `ExplorEdaProject` assigns positional `__ID` values to evaluation rows, builds current `idsByKey` and `keysById`, decodes input settings, and encodes callback/imperative settings. The already-existing component test obtains encoded settings before reversing tables; it does not keep feeding the initial numeric filter. [S06][S17]

**SOURCE FACT.** `mapIdFilters` transforms only filters with `type === "value"` and `field === "__ID"`. It visits `charts[].filters` and `rowsSettings.filters`. It copies workspace and chart-local filters without visiting them. `unresolvedAnalysisRowKeys` repeats that limited traversal. Saved types explicitly include `workspaceFilters`; chart-local population filtering has a working source consumer. [S07][S08][S10]

**SOURCE FACT.** A numeric value encodes to the evaluation key, or to a sentinel if unknown. Decoding an absent string key prefixes `__unresolved-analysis-row-key__:`. The sentinel stays in the positive inclusion values and does not become an empty array. `applyFilter` uses typed category membership, so a sentinel does not equal a numeric runtime ID. [S07][S11]

**PREDICTION — UNEXECUTED.** Encoded chart and Rows selections survive the clean-key reversal, while a numeric workspace selection remains positional. Sending a manually encoded workspace string is not a workaround: the same omission means it is not decoded into a numeric runtime ID. Direct helper results, mounted state, and export bytes all remain to be verified.

**SOURCE FACT.** `settingsFieldUsage` checks chart/global/local filters, Rows columns/filters, aggregates, and calculations, but omits workspace predicates. The missing-field case must isolate a workspace-only reference; if the same removed field is also a Rows column or chart field, existing checks can catch it. [S13]

### 4.3 Typed logical keys and positional fallbacks

**SOURCE FACT.** `sourceRowIdentities` accepts nonnull string/number/boolean keys, counts typed tokens, and assigns unique keys of the form `sourceId:type:value`. Duplicate/missing keys use `sourceId:row:index` and omit `entityKey`. The evaluator constructs the same kind of source-reference shape, with a special keyless-source path that does not emit a missing-key diagnostic per row. [S09][S14]

**SOURCE FACT.** `resolveSourceRow` first checks a source-prefixed row key ending in `:row:<digits>` and resolves that index. Otherwise it strictly compares `entityKey`: zero matches are unresolved, multiple matches ambiguous, exactly one resolves. The duplicate-reference test protects two distinct physical rows within the same snapshot, with amounts 12 and 19; it does not replace their source array. [S09][S18]

**PREDICTION — UNEXECUTED.** An old unique key that becomes duplicate, missing, deleted or another primitive type will no longer match its former output key. The chart/Rows adapter is predicted to retain it as unresolved. An already-positional fallback can be reused for another physical row after replacement. Whether a particular saved output fallback becomes unresolved or retargets depends on the new output keys; do not generalize from a direct source-index resolver to every saved filter.

### 4.4 Query grain and aggregate identity

**SOURCE FACT.** Source query rows use their source-reference row keys. A lookup retains the input row's key and adds a unique related reference when resolvable; an ambiguous lookup does not choose the first related row. Expansion produces an output key from step ID, parent key, and child reference; even unmatched retained parents receive an expansion-specific key. Aggregate output keys use step ID plus serialized typed group values; contributor/source-reference unions remain separate. [S14]

Consequences for the **PROPOSED** contract:

- Preserve a source reference when the same trustworthy source record remains available, even if the query output grain changes.
- Do not silently convert an old one-row output selection into two child outputs. The frozen M09 oracle marks old output selections unresolved and separately preserves the two selected source trace targets.
- A selected aggregate group can remain the same group while its contributors change. Compare both identity and current contributors. Do not require fixed source membership from a semantic group selection, and do not treat equal aggregate values as record identity.
- Require unique current output keys before trusting the adapter's map. Typed unique source keys alone are not sufficient to prove a compound output encoding cannot collide.

R043's historical partition distinctions support these separations. They do not require force-fitting source occurrences and selected values to one identity scheme. [H1][H2]

### 4.5 Host-saved intent, warnings and reappearance

**SOURCE FACT.** Missing keys are prefixed in decoded settings, but `ExplorEdaProject` supplies the Query panel's unresolved count from `shownView.settings`, the host-side object. Already-prefixed sentinels are returned unchanged by decoding, including after their former record reappears. [S06][S07]

**PREDICTION — UNEXECUTED.** With fixed original encoded keys, removal can produce a runtime nonmatch before the host object contains a sentinel, so the warning count can remain zero. If the host later persists `getSettings()` or an edit callback containing that sentinel, the selection becomes sticky-unresolved on reappearance. If the original raw key stays in the host object, it can resolve again. Replacement itself must not be assumed to echo a new sentinel because the provider suppresses that callback.

This is a state-consistency proof requirement, not permission to invent automatic resurrection. The research recommendation is to choose and document a deliberate policy and test warning, membership, saved settings, and reappearance independently.

### 4.6 Traces, saved inspection and worker results

**SOURCE FACT.** `ChartTraceScope` stores the selected target's source revision and closes stale traces when revision changes or resolution fails. `useTraceRevision` derives it from provider nonce and chart live nonce. The main calculation editor also closes on changed data. These are existing invalidation controls. [S15]

**SOURCE FACT.** Project transient trace focus resets when evaluation changes. Saved `view.inspection.rowKey` is different: `QueryStageRows` looks it up in stage rows by key and then resolves contributors/sourceRows against current tables. Changing query through the Query panel clears saved inspection keys. [S06][S19]

**SOURCE FACT.** Direct evaluation is memoized by the whole `tables` object, project, query and bindings. Worker source transfer also compares the tables wrapper. A new inner array placed into an unchanged wrapper is not a reliable update trigger. Worker request IDs reject stale results; a pending same-query request keeps the last successful evaluation and applied bindings visible. [S20]

**PREDICTION — UNEXECUTED.** During that pending interval, `ExplorEdaProject` passes the old displayed evaluation alongside current project/tables to the Query panel. A related-record detail can therefore resolve an old reference against new source values or positions. A deterministic held-worker test must establish whether the real UI shows a coherent old snapshot, coherent new snapshot, or explicit pending/unavailable details. Request-ID protection does not itself settle that question.

The pinned calculated-field badge is a lower-priority, separately bounded risk: its local pinned/open state can survive while a positional table row key is reused and its manager lookup reads new data. Actual mounting/unmounting through reset is unverified. Do not turn that possibility into a claim that all inspectors retarget; chart traces and the main editor have explicit reset guards. [S15][S24]

## 5. Selection ownership and export matrix

Every outcome column below describes source semantics or a proposed observation point, not an executed UI result.

| Surface / owner | Source contract and identity representation | What the proof must observe |
| --- | --- | --- |
| Point/chart linked selection C | Chart `filters`; scatter's filter consumer reads each field, including runtime `__ID`. Other charts/workspace intersect linked dimensions. | Exact current selected logical records, saved encoded keys in project mode, peers' filtered IDs. Own-chart live rows can exclude its own selection dimension. |
| Chart-local population filter | `localFilters` is a restriction on that chart's population, not an ownerless linked selection. It can legally read `__ID`. | Identity parity without changing locality. Ordinary UI creation is unestablished; seed a legal settings fixture. |
| Rows T | `rowsSettings.filters` and search apply after global filtered IDs are obtained. They do not update global crossfilter. | Table/CSV membership with T, and global membership without T. Seed the row-specific test filter explicitly. |
| Workspace W | `workspaceFilters`; separate linked dimensions, one predicate per field, no chart owner. | Encoded/decoded membership for legal `value/__ID`, and independent schema validation. No chart self-exclusion should discard W. |
| Workspace semantic P | Value rule on `cohort` (`records.cohort` in project results). | Exact re-evaluated membership, including appended matches. Do not assert persistent-record semantics. |
| Chart trace / main calculation editor | Revision-sensitive ephemeral inspection; closes on replacement according to source guards. | Actual close/reset behavior and no stale targets after commit of the replacement. |
| Saved query inspection / related source reference | Stage output key, then sourceRows/contributors resolved against supplied tables. | Separate output and source targets; orphan, ambiguity and pending-state behavior. |
| Rows CSV | Global IDs → Rows local filtering/search/sort → toolbar CSV of filtered rows/visible fields. | Download/Blob bytes parsed into exact logical labels and order, with a typed-key companion column where needed. |
| Workspace Full analysis JSON | `saveAnalysisToStructure` includes all provider `rawData` plus settings. | Deliberately contains the provider's full input, regardless of selection. In project mode that input is the evaluated query result, not every underlying source table. |
| Native project JSON | `stringifyAnalysisProject` serializes supplied project/tables/views. `selectAnalysisProjectView` prunes dependency tables, not selected rows inside retained tables. | Whole retained source tables and saved views, separately from selected-output CSV. Do not call this a selected-row export. |
| PNG | `exportChartPng` captures a rendered chart. | Visual artifact only; cannot establish exact record membership on its own. |

Sources: ownership and crossfilter [S08][S10]; real table/filter/export route [S12]; provider full analysis and project data boundary [S04][S06]; native project codec [S23]; trace and worker [S15][S19][S20].

The actual Rows CSV chain is `RowsView` → `DataTable.getFilteredRows` → `DataTableToolbar.handleExport` → `toTableCsv`. The last helper emits every row it receives, using selected visible columns; it does not deduplicate equal-looking values or apply another identity rule. CSV stringification can erase primitive type distinctions, so export assertions need an explicit logical-label or typed-key companion column. [S12]

A DataTable chart has an additional relevant boundary: its linked-filter definition ignores a filter on a field not among visible table columns, whereas its local `getFilteredRows` applies the settings filters to display/export. Use scatter C and Rows T for the main ownership proof; do not assume an invisible `__ID` filter in a DataTable chart globally narrows everything. [S12]

## 6. Host-input and replacement matrix

**All behavior predictions below are UNEXECUTED.** “Preserve” means logical membership only when the stated prerequisites hold; it does not claim a browser pass.

| Input pattern | Baseline branch / predicted result | Interpretation |
| --- | --- | --- |
| Same data, field metadata and saved refs | No replacement effect from those inputs | Unchanged-reference control. |
| Plain fresh array, no savedData | Broad reset; old row and semantic filters gone | Deliberate current reset, not silent retarget. |
| Plain fresh array, unchanged supplied savedData | Reset, then restore numeric filters onto new positional IDs | Strong restore-path retarget hypothesis. |
| Plain fresh array plus echoed settings | Same reset/restore branch | Same-data echo optimization does not protect changed data. |
| Same plain data, matching-fingerprint savedData echo | Skip full restore | Existing test source protects this narrower case. |
| Same plain data, different savedData | Full restore against current rows | Deliberate restore; data provenance is the host's responsibility. |
| Supplied savedData removed | Reset with current raw rows | Separate reset trigger even without array replacement. |
| Fresh fieldNames/fieldTypes refs, same data | Counts as dataChanged; reset/optional restore | Include equal-content metadata controls; schema changes are not the only trigger. |
| Project without settings/preset retained | New evaluation supplies new data, no saved selection to restore | Project existence alone does not retain local edits. |
| Project with unchanged initial numeric settings | Numeric IDs are not decoded into logical keys | Positional legacy/fixed-restore case; do not claim automatic preservation. |
| Project with encoded chart/Rows settings | Current output keys decode to current positions; missing keys become sentinels | Working unique-key control, subject to scope and output-key uniqueness. |
| Project workspace/local-filter snapshot | Adapter omits those paths | Numeric values stay positional; manually encoded strings are not decoded there. |
| Project source key disappears/reappears | Fixed original key and persisted sentinel take different decode branches | Explicit warning/reappearance policy required. |
| Changed schema | Some chart/Rows uses detected; workspace-only field use omitted | Isolate the owner to avoid a false positive from another detected use. |
| In-place rows or same mutated tables wrapper | Dependencies may not re-evaluate/send sources | Outside immutable-input contract; no conformance result. |

Sources: [S04][S06][S07][S13][S20]. The package's plain restore guidance and project host example intentionally have different state-management patterns. Host echo is an adversarial compatibility case, not a newly recommended plain integration pattern. [S02]

## 7. Frozen mutation matrix

The full ledger, per-owner sets, physical target positions, and protocol live in `proof-plan.md`. This matrix connects that frozen oracle to source-derived hypotheses. Each mutation starts from the baseline ledger unless explicitly designated a separate control.

| Case and oracle requirement | Predicted chart/Rows key path | Predicted boundary or counterexample |
| --- | --- | --- |
| **M00 unchanged refs:** C/T/W and P unchanged | Current encoded selections remain meaningful | No replacement; cannot prove cross-snapshot identity. |
| **M01 fresh identical rows/order:** keyed C/T/W preserved | Chart/Rows map back to identical indices | Positional W accidentally agrees. Plain conservative invalidation is proposed policy; current supplied restore can keep the same apparent membership. |
| **M02 reverse:** C/T/W logical sets unchanged | C positions `[10,7,2]`; T `[8,4,2]` | Unmapped W `[0,9,11]` becomes `{L12,L03,L01}`. Plain fixed numeric C/T also retarget. |
| **M03 append L13:** C/T/W unchanged; P adds L13 | Existing encoded keys unchanged | Original positions also stay unchanged, so append alone is a weak retarget detector. |
| **M04 delete selected L10:** preserve other selected records; L10 unresolved | C `{L02,L05}`; T `{L04,L08}` plus sentinel intent | W's raw 9 now denotes L11; raw 11 is absent. No-match retained inclusion must not be removed. |
| **M05 delete unselected L03:** all selected logical records preserved | C/T keys remap to their shifted positions | Raw W becomes `{L01,L11}`. Deleting an unselected earlier record exposes positional drift. |
| **M06 duplicate key 303 on L09/L10:** old L10 identity unresolved | Old `records:number:303` disappears; both current occurrences use fallback positions | Raw W still happens to include L10. Correct-looking physical membership does not establish key trust. P is unchanged and still includes L10 by value. |
| **M07 missing L10.key:** old L10 identity unresolved | Old key missing; current occurrence has `records:row:9` | Do not recover identity from name, amount, or current position. |
| **M08 number 303 → string "303":** old L10 identity unresolved | Typed output key changes | Same rendered digits do not preserve key type/identity. This differs from a provider field-setting conversion. |
| **M09 one record → two children:** prior output selections unresolved; source trace identities preserved | Expansion-specific keys differ from old source-output keys | P intentionally matches 14 outputs. Raw workspace IDs now select child positions; old output membership must not fan out silently. |
| **M10 clean stable string keys before selection, then reverse:** all C/T/W preserved | Chart/Rows preserve with trustworthy string keys | Workspace omission remains; cleaner keys cannot repair an unvisited scope. |
| **M11 cohort removed from schema and rows:** P invalid, not match-all; other keyed row sets retained as intent | Chart/Rows identity keys need not change | Workspace-only field use can bypass the existing compatibility scan. Whether runtime displays an adequate invalid state is unrun. |
| **M12 reverse in place:** unsupported input | No supported re-evaluation claim | Exclude from pass/fail conformance counts; observe only as a limitation demonstration. |

For M09's deterministic parent-first, child-a-then-b output order, old raw workspace indices `[0,9,11]` would denote `{L01/a,L05/b,L06/b}`. This is a source/ordering deduction, not an executed evaluation. The normative output restriction remains unresolved; unique source references for L02 and L10 are a separate preservation assertion.

### Exact reverse counterexample, without relying on totals

| Owner | Intended logical set / checksum | Predicted stale positional set / checksum |
| --- | --- | --- |
| C | `{L02,L05,L10}` / 530 | `{L11,L08,L03}` / 1,156 |
| T | `{L04,L08,L10}` / 648 | `{L09,L05,L03}` / 276 |
| W | `{L01,L10,L12}` / 2,561 | `{L12,L03,L01}` / 2,053 |

Chart and Rows project key conversion are predicted to avoid their stale sets when encoded settings are supplied; workspace conversion is omitted. Run each owner separately. Combining all restrictions can yield an empty intersection and hide which owner lost which record. Checksums are included only to make wrong selection visible during a demo, never as the acceptance oracle.

### Frozen fallback control and supplemental probes

**F01, frozen:** make only L09/L10 duplicate numeric 303 before selecting the physical L10 occurrence, then reverse. Its old fallback token is `records:row:9`. In the reversed output, fallback keys are at indices 2/3, so the saved output key can become unresolved rather than retarget. But direct `resolveSourceRow` of the old positional reference reads current index 9, which is L03. These two paths must be observed separately. [S07][S09][S14]

**F02, supplemental after freeze:** with the same duplicate setup, swap only L09 and L10. The output fallback token at index 9 still exists and now denotes L09. This isolates token reuse with unequal measures 256 versus 512. It is an unexecuted retarget prediction, not a revision of F01.

**A01, supplemental after freeze:** a legal unique string key `"tag:row:9"` produces `records:string:tag:row:9`. The resolver's trailing positional pattern is checked before typed entity equality, so it can take index 9 rather than that keyed row. The smallest proof is a direct source-reference test followed by a real related-record inspection. A strict positional grammar or equivalent bounded discriminator repair is only a candidate. [S09]

**A02, supplemental after freeze:** expansion concatenates row keys without escaping delimiters. With expansion step `e`, parent source `records`, and child source `children`, these distinct key pairs produce the same predicted output token:

- Pair A: parent string `x`; child string `y:children:string:z`.
- Pair B: parent string `x:children:string:y`; child string `z`.
- Shared token: `e:records:string:x:children:string:y:children:string:z`.

Source facts are the concatenation and `new Map(row.key → index)` construction. The collision and last-entry consequence are **unexecuted source deductions**. Add a unique-output-key assertion, not a general new identity platform. Any changed persisted encoding would need compatibility review. [S06][S14]

## 8. Where existing tests stop

All entries in this table are **test source inspected; not run in this research**.

| Existing path / assertion location | Coverage expressed by the source | R077 gap |
| --- | --- | --- |
| `test/providers/projectIdentity.test.tsx:39–107` | One chart selection encoded through getSettings; reorder preserves amount 30 and logical order key; selected-row deletion shows no rows | No workspace/Rows/local-owner matrix, complete record/export ledger, invalid-key transition, pending source details or reappearance policy. |
| Same file `109–156` | Declared field name retained when formatting is saved | Not selection replacement coverage. |
| `test/lib/analysis/sourceRowIdentity.test.ts:9–34` | Two duplicate occurrences remain distinct and resolve within the same rows | No replacement durability or suffix parsing case. |
| `test/providers/dataLayerState.test.ts:8–16` | One initialization assigns positional IDs and an empty column | No immutable replacement. |
| `test/providers/DataLayerProvider.test.tsx:650–665,745–764` | Saved-state precedence and data replacement | No handwritten exact logical-member oracle. |
| Same file `818–847,884–930` | No edit callback on prop changes; same-data host echo avoids rebuild | No changed-source echoed-selection identity. |
| Same file `979–1067,1069–1130` | Independent Rows settings, analysis save/restore, mount/clear behavior | No Rows `__ID` reorder or actual CSV download. |
| Same file `1224–1320` | Workspace semantic filters save, restore, count, narrow Rows and clear after a field setting changes type | No ownerless `__ID` encode/decode replacement or workspace-only missing-schema field. |
| `test/lib/analysis/evaluateProject.test.ts:12–208,265–393` | Grain/totals/revisions, duplicate and missing keys, unlike typed relationship keys, project-file dependencies | No cross-surface R077 lifecycle or compound output-key adversary. |
| `test/lib/analysis/useAnalysisEvaluation.test.tsx:63–83` | Direct evaluation and stale binding-result rejection | Sources held fixed; no pending related-record snapshot consistency. |
| `components/project/ProjectQueryPanel.test.tsx:48–89` | Query wording, focused output rows and related records | Fixed data; no saved inspection replacement. |

Paths in this table are relative to `packages/explorEDA/src/`. [S16][S17][S18][S21]

## 9. Primary comparisons that inform the decision

These are current official sources accessed **2026-10-22**. The comparator set is deliberately limited to two tools. No customer demand or performance claim is inferred.

| Primary source | Narrow documented contract | Applicability limit |
| --- | --- | --- |
| [TanStack Table — current React Row Selection guide](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection), “Useful Row Ids” and selected-row model sections | Selection uses row IDs; default IDs derive from row indices; custom unique IDs are configurable. Retained selection state can contain IDs absent from the currently supplied data, while the selected row model can only materialize available rows. | Supports separating intent from current resolution. The absent-data example concerns manual pagination; it is not proof of explorEDA deletion, duplicate, trace, output-grain, or export behavior. |
| [AG Grid — Updating Row Data](https://www.ag-grid.com/react-data-grid/data-update-row-data/) | Its example resets selection across row-data changes without provided IDs, and maintains shared-row selection with `getRowId`. | Supports explicit reset and keyed preservation as coherent alternatives. It does not establish explorEDA's implementation or fallback policy. |
| [AG Grid — Row IDs](https://www.ag-grid.com/react-data-grid/row-ids/) | The supplied ID function must return a stable unique string for each row. | Supports trustworthy-key preconditions; do not transplant its string-only API or performance claims into this project without need. |

The TanStack page was served as the current v9 guide and the AG Grid update page displayed version 36.2.0 when read. No dependency upgrade or library recommendation follows. The engineering inference is limited: a narrow host surface for keys still requires explicit semantics for unresolved intent and available records. Existing project capability should be evaluated before duplicating that contract in a second API.

## 10. Research result and evidence limits

The source audit gives a specific testable reason to prefer a small existing-mapper investigation over a new plain key API. It also rejects three overbroad hypotheses: not every plain replacement retargets, not every saved project scope is mapped, and mapped missing keys are not simply dropped into match-all. Existing reset, unique-key chart preservation, table locality, semantic predicate reevaluation, and transient trace closure remain positive or negative controls as appropriate.

Recommended dispositions are SI01–SI08 in `decision.md`: adopt the identity contract and proof gate; conditionally use project keys; investigate plain restore invalidation, mapping/diagnostic scope, fallback/source-reference safety and pending lifecycle consistency; defer the new plain-key API and reject platform expansion. **Eight recommendations.**

A runtime result must be added as a new observed record, with command/environment, expected/actual logical IDs, source references, predicates, trace state and exported bytes. It must not overwrite these predictions or revise the frozen oracle to fit the implementation. Current external docs, earlier research, and arithmetic do not supply browser, author, performance, or adoption evidence.

## Appendix A — Complete supplied packet inventory

All B entries were independently matched to exact GitHub blob SHAs at `f4cacdde180e16ad814451a8c064e394535565d6`. Catalogue projections and local/historical entries retain their supplied labels. The packet line points at the section header; source references elsewhere use within-file line numbers.

| # | Packet path | Kind / packet header line |
| --- | --- | --- |
| 01 | `AGENTS.md` | B — exact-ref matched; line 5 |
| 02 | `docs/agent-guide.md` | B — exact-ref matched; line 48 |
| 03 | `README.md` | B — exact-ref matched; line 202 |
| 04 | `package.json` | B — exact-ref matched; line 428 |
| 05 | `packages/explorEDA/README.md` | B — exact-ref matched; line 465 |
| 06 | `packages/explorEDA/src/providers/lib/dataLayerState.ts` | B — exact-ref matched; line 1074 |
| 07 | `packages/explorEDA/src/providers/DataLayerProvider.tsx` | B — exact-ref matched; line 1111 |
| 08 | `packages/explorEDA/src/components/ExplorEdaProject.tsx` | B — exact-ref matched; line 2849 |
| 09 | `packages/explorEDA/src/components/ExplorEda.tsx` | B — exact-ref matched; line 3342 |
| 10 | `packages/explorEDA/src/components/project/sourceRowIdentity.ts` | B — exact-ref matched; line 3671 |
| 11 | `packages/explorEDA/src/components/project/analysisRowKeys.ts` | B — exact-ref matched; line 3756 |
| 12 | `packages/explorEDA/src/lib/analysis/evaluateProject.ts` | B — exact-ref matched; line 3824 |
| 13 | `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts` | B — exact-ref matched; line 4755 |
| 14 | `packages/explorEDA/src/types/AnalysisProject.ts` | B — exact-ref matched; line 4949 |
| 15 | `packages/explorEDA/src/types/SavedDataStructure.ts` | B — exact-ref matched; line 5173 |
| 16 | `packages/explorEDA/src/types/FilterTypes.ts` | B — exact-ref matched; line 5240 |
| 17 | `packages/explorEDA/src/test/providers/projectIdentity.test.tsx` | B — exact-ref matched; line 5298 |
| 18 | `packages/explorEDA/src/test/providers/DataLayerProvider.test.tsx` | B — exact-ref matched; line 5458 |
| 19 | `packages/explorEDA/src/test/providers/dataLayerState.test.ts` | B — exact-ref matched; line 6785 |
| 20 | `packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts` | B — exact-ref matched; line 6815 |
| 21 | `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` | B — exact-ref matched; line 6855 |
| 22 | `packages/explorEDA/src/test/fixtures/shopProject.ts` | B — exact-ref matched; line 7253 |
| 23 | `packages/explorEDA/src/components/charts/useGetLiveData.tsx` | B — exact-ref matched; line 7740 |
| 24 | `docs/intent/current-analysis-trust/intent-brief.md` | B — exact-ref matched; line 7824 |
| 25 | `docs/intent/renderer-independent-replay/intent-brief.md` | B — exact-ref matched; line 7877 |
| 26 | `docs/intent/research-ideas-100/README.md` | B — exact-ref matched; line 7930 |
| 27 | `docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md` | B — exact-ref matched; line 8005 |
| 28 | `catalogue-selected.json` | P — derived catalogue data; line 8037 |
| 29 | `catalogue-review-selected.json` | P — derived catalogue data; line 8382 |
| 30 | `docs/research/entity-grain-2026-10-21/README.md` | H — historical 89e85dead…; line 8429 |
| 31 | `docs/research/entity-grain-2026-10-21/decisions.md` | H — historical 89e85dead…; line 8461 |
| 32 | `docs/research/selection-identity-2026-10-22/pro-prompt.md` | L — no commit ref; line 8491 |
| 33 | `docs/research/selection-identity-2026-10-22/research-queue.md` | L — no commit ref; line 8606 |

## Appendix B — Source reference register

All S references are exact-baseline source reads. Additional trace/export/promotion/docs files were fetched by the same explicit ref, never by mutable default branch. This register gives precise current paths and symbols; it does not claim those extra files were in the uploaded packet.

- **[S01]** [AGENTS.md](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md), lines 3–17 and 27–40; [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/agent-guide.md), commands, tests and docs/example rules; [package.json](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/package.json), `scripts.check` and `packageManager`.
- **[S02]** [Root README](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/README.md#L126-L137); [package README](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md), embedding 73–105 and 165–170; related tables 482–506; project host 510–544; promotion 570–589.
- **[S03]** [providers/lib/dataLayerState.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L21), `initializeData`.
- **[S04]** [providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx): fingerprint 243–267; `setData` 682–749; field-setting filter cleanup 814–852; `updateRowsSettings` 1297–1300; save/restore 1304–1478; prop/effect lifecycle 1586–1684.
- **[S05]** [components/ExplorEda.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEda.tsx): public props/handle 86–133; `getSettings` and chart PNG 187–196.
- **[S06]** [components/ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEdaProject.tsx): evaluation maps 144–159; reported/decoded settings 225–280; Query panel inputs 328–335; trace context 348–367; pending/render boundary 382–407.
- **[S07]** [components/project/analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L4-L63): `mapIdFilters`, `encodeAnalysisRowKeys`, `decodeAnalysisRowKeys`, `unresolvedAnalysisRowKeys`.
- **[S08]** [types/SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/SavedDataStructure.ts#L24-L62); [types/FilterTypes.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/FilterTypes.ts#L1-L35); [types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts#L136-L174).
- **[S09]** [components/project/sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/sourceRowIdentity.ts#L12-L80): typed token generation 12–51; resolver 55–69; matchingSourceRows 72–80.
- **[S10]** [hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts): self-exclusion 33–36 and 84–89; workspace dimensions 134–151; filtered IDs and local populations 170–210. [components/charts/useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/useGetLiveData.tsx#L43-L57); [lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/chartPopulation.ts#L19-L31); [ScatterPlot/definition.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts#L93-L102).
- **[S11]** [hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/applyFilter.ts#L10-L17), `applyFilter`; [lib/categories.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/categories.ts), typed category membership.
- **[S12]** [components/RowsView.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/RowsView.tsx#L20-L51); [DataTable.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx#L123-L158); [filteredRows.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts#L10-L46); [DataTableToolbar.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx), `handleExport` 35–58 and `toTableCsv` 169–177; [DataTableContextMenu.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx#L42-L70); [DataTable/definition.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/definition.ts#L64-L68).
- **[S13]** [components/project/settingsCompatibility.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/settingsCompatibility.ts): chart uses 37–69, `settingsFieldUsage` 76–130, `incompatibleSettingsFields` 138–155.
- **[S14]** [lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts): source keys/refs 44–155; lookup 275–310; expand 326–420; group identity 552–568 and 661–668; identity-sensitive measure partition 594–606; revision 708–719 and 912.
- **[S15]** [ChartTraceScope.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx): selection revision 61–65, stale close 108–118, `useTraceRevision` 170–175; [CalculationEditor.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculationEditor.tsx#L63-L88).
- **[S16]** [test/providers/dataLayerState.test.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/dataLayerState.test.ts#L8-L16); [test/providers/DataLayerProvider.test.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/DataLayerProvider.test.tsx), exact assertion ranges in section 8.
- **[S17]** [test/providers/projectIdentity.test.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/projectIdentity.test.tsx#L39-L107); [test/fixtures/shopProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/fixtures/shopProject.ts), `createShopFixture`.
- **[S18]** [test/lib/analysis/sourceRowIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts#L9-L34); [test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts), exact ranges in section 8.
- **[S19]** [components/project/ProjectQueryPanel.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx): query reset 67–73; focus selection 92–102; unresolved message 168–177; stage selection 252–268. [QueryStageRows.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryStageRows.tsx): stage key lookup 98–101; related records 191–295. [AnalysisChartContext.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/AnalysisChartContext.tsx#L14-L21); [traceRows.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/traceRows.ts#L7-L31).
- **[S20]** [lib/analysis/useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts): direct dependencies 59–74; request identity and source transfer 108–167; pending applied state 177–188.
- **[S21]** [test/lib/analysis/useAnalysisEvaluation.test.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx#L63-L83); [components/project/ProjectQueryPanel.test.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/ProjectQueryPanel.test.tsx#L48-L89).
- **[S22]** [lib/analysis/sources.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/sources.ts): unique key inference 52–59; `sourceFromRows` 89–119; `singleTableProject` 203–260. Promotion can infer/generate identity and inherits the existing adapter; no temporal trust is proved by construction.
- **[S23]** [lib/analysis/projectFile.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/projectFile.ts): project file shape 9–21; `selectAnalysisProjectView` 94–147; `stringifyAnalysisProject` 151–163; parser 167–177. Exact fetched Git blob: `586ed338f487c6204ec6266bf09279d803a26c41`.
- **[S24]** [DataTableBody.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableBody.tsx#L89-L119); [CalculatedFieldBadge.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculatedFieldBadge.tsx#L36-L49); [PlotManager.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/PlotManager.tsx#L565-L568), full-analysis action.
- **[H1]** Historical only: [R043 README at `89e85dead…`](https://github.com/byronwall/explorEDA/blob/89e85dead29dd61f1b7b79d359f4bad0c38fab4d/docs/research/entity-grain-2026-10-21/README.md), supplied source lines 3–19.
- **[H2]** Historical only: [R043 decisions at `89e85dead…`](https://github.com/byronwall/explorEDA/blob/89e85dead29dd61f1b7b79d359f4bad0c38fab4d/docs/research/entity-grain-2026-10-21/decisions.md), EG01 and EG06.

Verified docs/example destinations and their current infrastructure limits are detailed with exact-ref links in `integration-plan.md`. The four reports are the complete substantive deliverable; no source snapshot, later branch implementation, or unrun output is represented as an executed product artifact.
