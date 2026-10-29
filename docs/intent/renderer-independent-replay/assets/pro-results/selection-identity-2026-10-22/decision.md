# R077 — Decision on selection identity after source replacement

**Research date:** 2026-10-22, America/Indianapolis  
**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA)  
**Reviewed baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`  
**Mode:** research only; no product implementation, commit, pull request, deployment, pnpm execution, or browser experiment.

## 1. Core decision

**Recommend a two-part contract: positional row selections belong to one source snapshot; trustworthy project keys may preserve record identity across immutable replacement at a compatible output grain. Investigate the existing project filter mapper before adding a plain-workspace key API.**

For plain `ExplorEda`, retain the existing no-save reset and explicitly define what happens when a host restores settings containing positional row IDs against replacement data. The recommended policy is deliberate, observable invalidation of those row-specific restrictions and transient references. A host may deliberately reapply schema-valid value predicates. An unchanged saved settings object is not proof that its numeric row IDs still denote the same records.

For `ExplorEdaProject`, retain the working path that converts runtime IDs to evaluation row keys and back. Require stable source identity, trustworthy unique typed keys, unique output row keys, and a compatible meaning for an output row. Retain missing or ambiguous selection intent as explicitly unresolved, with no substituted record and no silent conversion of an all-unresolved inclusion into an unrestricted population. Existing chart and Rows mappings already preserve important cases; those cases must remain controls.

The smallest concrete repair candidate is **ownership-scope parity in the existing adapter**. `mapIdFilters` and `unresolvedAnalysisRowKeys` traverse `charts[].filters` and `rowsSettings.filters`, but omit `workspaceFilters` and `charts[].localFilters`. Workspace filters are an explicit saved-state scope. A local chart filter on `__ID` is also type-legal and has a consumer, although a normal UI path creating it was not established. This is a verified source omission and an **unexecuted behavioral hypothesis**, not an observed user failure. [B1][B2][B3]

### GO / NO-GO

| Scope | Decision | Reason |
| --- | --- | --- |
| This bounded research mission | **GO; completed as source research** | Repository owner and exact commit were authenticated; all essential source categories and the full R077 brief are available. All 27 baseline packet sections match exact GitHub blobs. |
| Independent local proof and a narrowly justified repair | **GO to investigate** | Exact membership tests can decide the mapper, invalidation, and reference-lifecycle questions without a new public API. Implementation is still proposed. |
| Claiming the recommended contract already holds everywhere | **NO-GO** | No product runtime was executed; saved restore, omitted scopes, fallback occurrences, and pending inspection require verification. |
| Adding a plain `getRowId`-style API now | **NO-GO now; defer** | Existing project keys and explicit invalidation have not been shown insufficient for a useful host task. A new prop would require consistent saved-filter, trace, and export semantics. |
| Universal identity, source-versioning, or replay infrastructure | **Reject for R077** | Neither the mission nor the evidence requires a platform change. |

The missing input for runtime verification is a **complete checkout at the exact baseline with its locked pnpm dependencies and configured test/browser environment**. No essential source input is missing for the research decision. The supplied packet remains a selected text snapshot; supplementary exact-ref reads did not turn it into a runnable checkout.

## 2. Recommended contract, with explicit boundaries

The following is a **proposed acceptance contract**, not a description of newly shipped behavior.

### 2.1 Identity has four different meanings

- **Logical source record:** the record represented by a stable source ID and a trustworthy typed entity key. Numeric `101` and string `"101"` are different keys. A repeated display name is not an identity.
- **Physical occurrence:** one row at an index in one immutable snapshot. Two rows with equal names, equal values, or duplicate entity keys remain two observations. A positional fallback distinguishes them within that snapshot; it does not establish continuity into the next snapshot.
- **Predicate:** a rule such as `cohort == "keep"` or `name == "Mira"`. Its membership is intentionally recomputed. An appended matching record can join it without having been an earlier selected record.
- **Query output row:** a source record, an expanded parent–child occurrence, or an aggregate group, depending on the query. A stable group key does not imply a fixed contributor cohort. Expanding one source record into two output rows does not authorize duplicating an earlier output-row selection onto both children. [B4][B5]

The frozen oracle records all four meanings independently. Its distinctive measures are secondary checksums; exact logical labels, physical positions, predicates, and source references decide correctness.

### 2.2 Plain workspaces: a positional selection is snapshot-scoped

`initializeData` overwrites `__ID` with the current index. Supplying an `__ID` property in host data is not an existing stable-key escape hatch. The provider treats a new `data`, `fieldNames`, or `fieldTypes` reference as a reset trigger. Without supplied saved settings, it clears filters and other workspace state. With saved settings, it then restores them against the new rows. [B6][B7]

Recommended behavior at that boundary:

1. Treat row-specific `__ID` membership as valid only for the snapshot in which it was selected or explicitly restored with matching rows.
2. On replacement, invalidate positional membership across every relevant owner before it can silently target a new occupant. This includes the supplied-restore path, not just the existing no-save reset.
3. Make the reset inspectable through current settings and an appropriate host or UI explanation. Do not pretend the current edit callback already emits a reset event: prop-driven reset/restore suppresses `onStateChange`.
4. Preserve or reapply semantic predicates only through a deliberate, schema-valid restore policy. The baseline no-save reset currently clears them too; selective retention is not claimed as an existing feature.
5. Keep in-place mutation outside the supported input contract. A fresh-but-identical array is conservatively a replacement under this proposal. Apparent agreement at unchanged positions is not evidence of persistent identity.

An explicit reset can remove a restriction and expose more rows. That is acceptable only as a recognizable reset of user intent. It must not be confused with retaining an inclusion selection whose every target is unresolved; the latter must continue to match no records until the user clears or changes it.

`savedData` is documented as an initial/replacement restore input, not a controlled value. Same-data host echoes are tolerated by a fingerprint optimization, but source replacement takes a different branch and still resets/restores. The proof must exercise both cases. [B7][B8]

### 2.3 Projects: preserve keys only when their meaning is trustworthy

Project preservation requires more than rendering the project component:

- Persist the **encoded** settings returned by project `getSettings()` or its state-change adapter. Keeping an unchanged initial numeric filter is still positional. The existing reorder/removal test explicitly saves the encoded snapshot before rerendering.
- Keep the source ID, key type, and key semantics stable. A key must remain unique in the relevant source. Missing keys, duplicates, disappearance, and primitive-type changes must not resolve to an equal-looking row.
- Replace the affected table array **and the enclosing `tables` object**. The hook depends on the wrapper identity and the worker sends tables when that wrapper changes.
- Require the current output key to be unique at its query grain. Preserve source identity separately from output identity. A step that expands or changes a group's definition can invalidate the former output selection even when source records remain available.
- Treat fallback occurrence keys as snapshot-scoped. Within-snapshot duplicate-row inspection is valuable and must continue to work; cross-snapshot fallback preservation is a separate claim that is not supported by that test. [B1][B4][B5][B9][B10]

`singleTableProject` is a useful existing route, not a guarantee of trustworthy keys. Its `sourceFromRows` helper may choose an ID-like or unique text field or generate `row_number`. Uniqueness in one snapshot does not establish temporal stability. Re-running positional numbering over a reordered source does not preserve record identity. The test-only ledger labels must not accidentally become the helper's inferred production key. [B11]

Only explicit `value` filters on `__ID` are converted by the current adapter. An internal-ID range or text predicate cannot be promoted to stable record membership by mapping its endpoints. Such settings need snapshot invalidation or an explicitly narrower support boundary; a new interpretation is not proposed here. Non-ID value/range/text/date predicates keep their existing semantics. [B1]

### 2.4 Retained intent and current resolution must agree across surfaces

The current decoder retains a nonmatching sentinel for a missing string key. It does not remove that target from the values array. This is a useful fail-closed mechanism and must be preserved. Two additional behaviors need an explicit decision:

- The unresolved warning counts `shownView.settings`, while new sentinels are produced in decoded runtime settings. A fixed formerly valid host key can therefore become unresolved before the warning's input contains a sentinel. This is a source-derived, unexecuted warning-consistency hypothesis.
- Once a sentinel is persisted back to the host, the decoder does not retry it. A fixed original key can resolve again on reappearance, while a persisted sentinel remains unresolved. Choose and document one intended reappearance policy before changing it; the frozen first-replacement oracle is not evidence for automatic recovery. [B1][B2]

Transient chart traces already close when their revision changes, and the main calculation editor closes when its data changes. Preserve those reset controls. Saved query inspection and related-record resolution use different state channels and need separate tests. While a worker keeps a prior evaluation visible, related-record resolution receives current tables; verify one coherent source snapshot or an explicit pending/unavailable presentation. Stale worker response rejection alone does not prove that detail panel's consistency. [B9][B12]

## 3. Why this is the smallest useful direction

| Alternative | Correctness and host burden | Decision / rejection gate |
| --- | --- | --- |
| Keep current behavior with precise documentation | Lowest product change. Existing no-save reset, keyed chart preservation, and semantic predicates are useful. Documentation can accurately limit positional restore. | Adopt factual documentation now; do not close R077 as explanation-only until the exact controls and supported restore paths agree. Reject that closure if a supported path silently changes the selected record. |
| Explicit invalidation | No host key management. Makes uncertain positional membership clear at the cost of losing continuity. Must cover restore and dependent references consistently. | Preferred plain-input policy. A host-only reset recipe may suffice for a bounded workflow; product invalidation remains a candidate if the supported embedding path cannot enforce it reliably. |
| Existing project keys / project promotion | Reuses a real adapter, provenance, and tested chart behavior. Hosts must supply or preserve trustworthy keys and retain encoded settings. | Preferred persistence route after bounded scope/reference checks. Reject an unconditional promotion promise if keys are inferred unreliably, regenerated, duplicated, or at the wrong output grain. |
| Optional plain stable-key input | A small-looking host prop could avoid project setup, but key semantics must reach every saved owner, restore, trace, and exported population. Hosts still need trustworthy keys. | Defer. Reopen only after one useful host task needs continuity, has reliable keys, and shows that project setup or explicit reset is materially inadequate. |

**Strongest simplification alternative:** explicitly reset every row-specific selection on every source replacement, including project workspaces, while retaining only deliberately restored semantic predicates. This avoids having to preserve uncertain occurrence identity and needs no new key API. Its cost is discarding useful unique-key project behavior already expressed in a regression test. Prefer the narrower existing-mapper investigation while that working case can be preserved; choose reset for any unsupported identity class rather than inventing continuity. [B10]

Two official comparator contracts are sufficient. TanStack Table distinguishes index-based IDs, custom row IDs, and retained selection IDs from currently materialized rows. AG Grid documents replacement reset without IDs and preservation for shared rows with supplied IDs, while requiring stable unique IDs. These support the reasonableness of reset-or-keyed-preservation as alternatives. They do not establish explorEDA behavior, host demand, implementation cost, or performance. Accessed 2026-10-22; applicability is limited to each tool's documented table model. [E1][E2][E3]

## 4. Evidence that changes the decision

### Executed evidence in this research

- Read both supplied files and computed their byte counts and SHA-256 hashes.
- Parsed the packet into 33 labeled sections: 27 baseline source files, two catalogue projections, two historical R043 records, and two local research additions.
- Authenticated `byronwall/explorEDA` and the exact commit through read-only GitHub responses. Compared all 27 baseline files against exact-ref Git blob IDs; each matches after excluding the packet's single separator newline.
- Froze the handwritten 12-row oracle before outcome tracing and retained its hash: `297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15`.
- Inspected baseline code and test source, supplementary exact-ref consumers, and current official comparator documentation.

These are access, source, and research-artifact checks. They are not product experiments. The final bundle's validation and report digests are recorded in `manifest.json`.

### Most decision-relevant unexecuted prediction

The frozen chart selection C denotes `{L02,L05,L10}`; the Rows selection T denotes `{L04,L08,L10}`; the workspace selection W denotes `{L01,L10,L12}`. After reversing the 12 source rows:

- Encoded project C is predicted to decode to runtime positions `[10,7,2]`, preserving its logical records.
- Encoded project T is predicted to decode to `[8,4,2]`, preserving its logical records.
- Unconverted workspace positions `[0,9,11]` are predicted to denote `{L12,L03,L01}`, losing L10 and selecting L03.

This deduction isolates a scope difference under identical key quality and mutation. It is stronger guidance for a small regression test than a general claim that all replacement is broken. Actual component membership, warnings, trace targets, callbacks, and CSV bytes remain unexecuted. [B1][B2][B6]

### Rejected hypotheses and controls

- **Rejected from source:** every plain replacement silently retargets selections. The no-save branch deliberately resets; that is a negative control.
- **Rejected from source:** project key conversion necessarily covers every saved filter scope. The explicit traversal does not.
- **Rejected from source:** missing mapped keys are dropped and make the workspace match everything. The decoder retains a nonmatching sentinel.
- **Rejected as a proof method:** equal names, counts, or aggregate totals establish identical records. The oracle uses typed keys, occurrence labels, and exact contributor membership; R043's historical partitions reinforce that distinction without proving replacement correctness.
- **Preserve as controls:** unchanged references, fresh identical order, append, trustworthy clean keys, the existing chart reorder/removal case, same-data host echo, semantic value predicates, table-local scope, chart self-exclusion, and chart-trace invalidation.

## 5. Eight recommendations

Adopt means accept a research constraint or direction. It does not mean a product change was implemented or approved.

| ID | Disposition | Recommendation |
| --- | --- | --- |
| **SI01** | **Adopt** | Define record identity, physical occurrence, value predicates, and query output grain separately. Require preserved selections to keep the same record meaning; otherwise report unresolved intent or an explicit reset. |
| **SI02** | **Adopt policy; investigate** | Make plain positional selections snapshot-scoped, including supplied saved restore. Preserve no-save reset and same-data echo controls; choose the smallest observable invalidation mechanism without asserting a new callback already exists. |
| **SI03** | **Adopt conditionally** | Prefer the existing project route for persistence when source/output keys are trustworthy, unique, typed, and stable. Require encoded saved settings; verify promotion's actual key choice. |
| **SI04** | **Investigate first** | Reproduce and, only if confirmed, repair the existing row-key traversal across workspace and legal chart-local filters, together with unresolved/schema-scope reporting. Preserve ownership and existing chart/Rows behavior. |
| **SI05** | **Investigate** | Bound fallback occurrences to a snapshot and verify source-reference/key parsing and output-key uniqueness. Preserve same-snapshot duplicate observations; test supplemental adversarial keys without rewriting the frozen oracle. |
| **SI06** | **Investigate** | Align retained settings, unresolved status, query inspection, and pending-worker source details. Preserve working chart-trace/editor invalidation; explicitly choose sentinel reappearance behavior. |
| **SI07** | **Adopt proof gate** | Run the frozen exact-membership proof and one representative host task. Pair any visible repair with one concise lesson and a runnable replacement fixture in the verified documentation/test destinations. |
| **SI08** | **Defer / reject scope expansion** | Defer a new plain stable-key API until smaller routes fail a useful keyed host task. Reject universal identity, versioning, replay, and repeated market/Mosaic surveys under R077. |

## 6. Remaining uncertainty and stopping rules

The source audit establishes the implementation branches and omissions; it does not establish a shipped defect, frequency, severity, user confusion, customer demand, speed, or the size of an eventual patch.

The highest-value remaining checks are exact workspace mapping, encoded versus unchanged numeric restore, partial/all-unresolved restrictions, fallback occurrence replacement, pending query detail consistency, and real Rows export membership. A browser or author result must include observed settings, logical IDs, source references, and artifact bytes; arithmetic alone cannot satisfy it.

Stop with documentation/current behavior if the controls and supported exact-membership paths agree and the remaining gap is explanatory. Stop with explicit invalidation if key trust cannot be established. Stop a proposed new API if invalidation or existing project setup covers the useful task more simply. A narrow reproduced fault supports a narrow repair and compatibility review, not a universal identity system.

R026/PR465 and R043/PR466 are treated as completed research in the supplied queue, not as replacement proofs or later code at this baseline. R008/PR464, R011/PR461, and PR462's Mosaic integration are not re-surveyed. R001 and R051 remain subsequent catalogue candidates. Independent verification, integration, one full `pnpm check`, and an open review PR remain Codex responsibilities in the follow-up environment.

## Source references

All B references use the exact reviewed baseline. Source-test references describe assertions read, not tests executed.

- **[B1]** [`analysisRowKeys.ts`, `mapIdFilters`, encode/decode and unresolved traversal, lines 4–63](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L4-L63).
- **[B2]** [`ExplorEdaProject.tsx`, evaluation maps/reporting/restore/Query props, lines 144–159, 225–280, 328–335, 397–407](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEdaProject.tsx#L144-L407).
- **[B3]** [`SavedDataStructure.ts`, lines 38–42](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/SavedDataStructure.ts#L38-L42); [`chartPopulation.ts`, local filters, lines 19–31](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/chartPopulation.ts#L19-L31); [`settingsCompatibility.ts`, field-use traversal, lines 76–130](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/settingsCompatibility.ts#L76-L130).
- **[B4]** [`sourceRowIdentity.ts`, `sourceRowIdentities` and `resolveSourceRow`, lines 12–69](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/sourceRowIdentity.ts#L12-L69).
- **[B5]** [`evaluateProject.ts`, source, expansion, aggregation and revision identities](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts): source 45–155; expansion 326–420; aggregate 552–568 and 661–668; revision 708–719 and 912.
- **[B6]** [`dataLayerState.ts`, `initializeData`, lines 7–21](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L21).
- **[B7]** [`DataLayerProvider.tsx`, reset and prop application](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx): `setData` 682–749; restore 1339–1478; replacement/echo/callback effects 1606–1684.
- **[B8]** [`packages/explorEDA/README.md`, embedding callbacks/restore/immutability](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md#L73-L170); project host example 510–544.
- **[B9]** [`useAnalysisEvaluation.ts`, request lifecycle and pending result, lines 59–188](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts#L59-L188).
- **[B10]** [`projectIdentity.test.tsx`, chart-key reorder/removal control, lines 39–107](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/projectIdentity.test.tsx#L39-L107); [`sourceRowIdentity.test.ts`, within-snapshot duplicate occurrences, lines 9–34](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts#L9-L34).
- **[B11]** [`lib/analysis/sources.ts`, `sourceFromRows` 89–119 and `singleTableProject` 203–260](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/sources.ts#L89-L260).
- **[B12]** [`ChartTraceScope.tsx`, stale trace guard 108–118 and revision 170–175](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx#L108-L175); [`CalculationEditor.tsx`, data-change close, lines 85–88](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculationEditor.tsx#L85-L88); [`QueryStageRows.tsx`, selected row and related records, lines 98–101 and 191–295](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryStageRows.tsx#L98-L295).
- **[E1]** [TanStack Table, current React Row Selection guide](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection), accessed 2026-10-22. Only the row-ID and materialized-membership distinction is used.
- **[E2]** [AG Grid, Updating Row Data](https://www.ag-grid.com/react-data-grid/data-update-row-data/), accessed 2026-10-22. Only documented selection behavior under row replacement is used.
- **[E3]** [AG Grid, Row IDs](https://www.ag-grid.com/react-data-grid/row-ids/), accessed 2026-10-22. Only the stable/unique ID precondition is used.

The companion `evidence.md` supplies the full source inventory and scope/mutation audit; `proof-plan.md` supplies the frozen ledger and unrun executable proposal; `integration-plan.md` supplies candidate dispositions and review gates. **Eight recommendations; no larger implementation approved.**
