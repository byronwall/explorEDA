# explorEDA navigation: a small falsifiable proof plan

Research date: 2026-10-20. Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, [byronwall/explorEDA](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510).

## Decision and purpose

**Evidence access: GO. Feature adoption: NO-GO now.** This plan specifies future discriminating checks; it does not approve a navigation feature. The selected packet provides no observed repeated task that rejects current saved tabs, duplication, query inputs, source/stage openings, and tracing. Filter inheritance and instance policy remain human choices. Start with the already-prioritized local trust journey, then a fair manual-flow comparison. Only investigate one host-authored binding if a real task clears those gates. [Intent], `The intended experience`; [Trust], `Next step after confirmation`.

The fixtures below are newly authored synthetic examples. Their memberships and arithmetic are explicit and independently audited. They are not user demand, imported production data, observed UI results, or an application patch. Each fixture uses **one source only**. The engineering fixture is a semantic comparator, not a second feature proposal.

## 1. What was actually checked

| Evidence/check | Actual status |
| --- | --- |
| Packet integrity | All 33 selected entries match byte counts and SHA-256; first 30 are baseline, last three marked local additions. Packet: 319,470 bytes; SHA-256 `680bb720fc819cd7133efb0dde5a1dfda31e6f35d366336a0e17592b7d18d420`. |
| Baseline corroboration | Exact GitHub commit fetched; all 30 baseline file Git blob IDs match the packet bytes at that ref. |
| Static review | Required intent, types, inputs, evaluation, opening controls, host/history, fixtures/tests, current shop example, and historical queues were read. Test source was inspected; tests were not run. |
| Manual arithmetic | Memberships were derived by applying the stated predicates; nonmissing numeric additions were checked explicitly below. |
| Executed arithmetic | Standalone Python audit: 24 populations × four checks = 96 assertions, plus eight identity/structural checks; **104 passed**. No explorEDA code was imported or executed. |
| Application execution | **Not run:** Vitest, `pnpm check`, build, real query input editing, chart interaction, selected-row export, undo/redo, reload, project import/export, or source refresh. |
| User/browser observation | **Not run:** author sessions, competitor sessions, timings, keyboard/assistive-technology checks, or explorEDA interactions at 1280, 783, or 390 px. |

The arithmetic audit checked exact ordered members, member count, numeric-contributor count, and sum/no-contributor result for every population. Extra checks verified unique record keys in both fixtures, string/number/null identity distinctions, one entity represented by multiple selected records, and different source-trace versus destination-query populations. This verifies the oracle, not the software under test.

## 2. Shared conventions and current-source constraints

- **Record identity and grouping identity differ.** `orderId`/`sampleId` uniquely identify source records; `storeKey`/`runKey` identify the entity to investigate and can repeat. The source's `entityKey` must be the unique record field. A store is not chosen by taking the first order ID. `AnalysisParameter.options` reads a source's entity key, so pointing it at orders would list order IDs, not distinct stores. The manual fixture can use the existing typed text input; a host example can own its semantic picker. [Types], `SourceDefinition`, `AnalysisParameter`; [Inputs], option construction L58–80.
- **All intervals are half-open:** include the lower endpoint, exclude the upper endpoint. A destination query can express this with `gte` and `lt`. This intentionally differs from the existing shop fixture's inclusive `lte dateEnd`; do not reuse it without changing the explicitly authored proof definition. [Types], `AnalysisFilterOperator`; [Shop], `customer-instance` L355–387.
- **Dates are canonical `YYYY-MM-DD` strings in this exact business fixture.** Calendar-date comparison needs no timestamp conversion here. Timestamp zones, inclusive brushes, and date-field transformations need a separate compatibility check before transfer; this plan does not infer them from a label such as September. [Evaluator], `filterFrame` L473–531.
- **Missing measures remain population members.** Only finite numeric measures contribute to the synthetic sum; zero and negative amounts remain numeric. A no-contributor sum is written `undefined`, including an empty set. This agrees with the inspected query-aggregate contract, but actual chart empty-state rendering remains to be observed. [Evaluator], `aggregateFrame` L626–647.
- **Input application is per valid edit.** `QueryParameters.update` emits the whole next draft on each valid edit; it is not a batch Apply form. Manual changes to two valid dates may produce two checkpoints and a legitimate intermediate population. Invalid drafts retain the last valid applied result and are lost on remount. [Inputs] L42–50, L140–143; [Host], `remount`/`changeActive`.
- **Proposal scope:** one known destination, one source, one scalar entity, and only explicitly approved range slots. Destination fixed restrictions and saved local restrictions remain. A host-owned action is the only contingent candidate; no generic context or multi-selection language is required.

## 3. Business fixture: store orders

### Explicit rows

One row is one order. `orderId` is a unique string key. `storeKey` is deliberately mixed-type to detect coercion; quoted `"7"` is a string and unquoted `7` is a number. `amountUSD` is the signed order amount in US dollars; the negative returned order is intentional. `null` denotes a missing value, not a zero.

| orderId | storeKey | date | channel | status | amountUSD |
| --- | --- | --- | --- | --- | ---: |
| O01 | `"7"` | 2025-09-01 | Web | completed | 100 |
| O02 | `"7"` | 2025-09-15 | Store | completed | 50 |
| O03 | `"7"` | 2025-09-30 | Web | returned | -20 |
| O04 | `"7"` | 2025-10-01 | Web | completed | 200 |
| O05 | `"7"` | 2025-10-15 | Store | completed | 80 |
| O06 | `"7"` | 2025-08-31 | Web | completed | 40 |
| O07 | `7` | 2025-09-10 | Web | completed | 900 |
| O08 | `"8"` | 2025-09-20 | Web | completed | 70 |
| O09 | `null` | 2025-09-20 | Web | completed | 30 |
| O10 | `"7"` | 2025-09-22 | Web | completed | `null` |
| O11 | `"7"` | 2025-09-25 | Web | completed | 0 |
| O12 | `"8"` | 2025-10-05 | Web | completed | 60 |

### Authored setup for the experiment

The example author supplies two saved views and their existing-style query definitions; this does not claim that the current workspace can visually author every parameter schema.

- **Overview:** orders in `[2025-09-01, 2025-10-01)`, with store `"7"` selected. No completed-only query restriction. The navigation comparison's clicked chart has the intentional local restriction `channel = Web`. Its store mark represents multiple orders.
- **Detail query:** one source step over orders, then `storeKey eq storeParam`, `date gte fromDate`, `date lt untilDate`, and literal `status eq completed`. Definitions: `storeParam` required string; `fromDate` and `untilDate` required date. Bindings are per view.
- **Detail's saved period:** `[2025-10-01, 2025-11-01)`. Its chart has intentional `localFilters` for `channel = Store`. Its Rows view has no extra filter/search for the base comparison. Do not silently remove the local restriction.
- **State-adversarial variants:** a saved detail selection containing O04, an edited chart title/settings, and an added literal `date >= 2025-10-01` are tested separately. They are not hidden conditions in the base fixture.

**Population alternatives:** D maps the entity and retains the destination's October period. M maps the entity and explicitly replaces the two designated date-binding slots with September. H experiments expose the consequences of inheriting source filters; they are counterexamples, not additional feature proposals. Replacing a binding slot never authorizes removing an independent literal predicate.

### Expected memberships, counts, and totals

`rows / contributors / sum` keeps missingness distinct from membership. A source order can be a member without contributing a number.

| Case | Exact membership | Rows / numeric contributors / sum USD |
| --- | --- | --- |
| B00 — Store `"7"`, September, before chart-local Web | O01, O02, O03, O10, O11 | 5 / 4 / 130 |
| B01 — Clicked source: B00 with chart-local Web | O01, O03, O10, O11 | 4 / 3 / 80 |
| B02 — D: entity-only; retain saved October and completed | O04, O05 | 2 / 2 / 280 |
| B03 — B02 with destination chart-local Store | O05 | 1 / 1 / 80 |
| B04 — M: entity + September; retain completed | O01, O02, O10, O11 | 4 / 3 / 150 |
| B05 — B04 with destination chart-local Store | O02 | 1 / 1 / 50 |
| B06 — Blind conjunction: source September/Web plus saved October and completed | Empty | 0 / 0 / `undefined` |
| B07 — M plus source Web promoted to destination-wide restriction | O01, O10, O11 | 3 / 2 / 100 |
| B08 — B07 with retained destination Store chart | Empty | 0 / 0 / `undefined` |
| B09 — M plus independent literal date at/after October 1 | Empty | 0 / 0 / `undefined` |
| B10 — Deliberately numeric store parameter `7`, September, completed | O07 | 1 / 1 / 900 |
| B11 — Missing amount only | O10 | 1 / 0 / `undefined` |
| B12 — Valid zero only | O11 | 1 / 1 / 0 |

B10 is a typed-key counterfactual for evaluator verification. The proposed string-typed candidate must **refuse** numeric `7`; it does not switch parameter type or coerce the value. B09's empty set is the arithmetic result; the conservative candidate refuses automatic transfer when it detects that known contradiction. Neither statement claims existing UI behavior.

### Manual derivation

- B00: `100 + 50 - 20 + 0 = 130`; O10 adds a member but no number.
- B01: `100 - 20 + 0 = 80`.
- B02/B03: October gives `200 + 80 = 280`; Store-only contributes `80`.
- B04/B05: completed September gives `100 + 50 + 0 = 150`; Store-only contributes `50`.
- B07: retaining Web after explicit date mapping gives `100 + 0 = 100`; adding Store to the same records has no members.
- September and October do not overlap under the declared endpoints. O04 lies exactly at September's excluded upper bound and October's included lower bound. O06 is before September.

These additions were manually derived, then checked by the separate Python oracle. No software test execution is inferred from them.

**The central discriminator:** source trace B01 includes returned O03 but excludes Store order O02. Entity detail B04 excludes O03 but includes O02. One selected aggregate mark can identify store `"7"` while representing several rows; opening that entity's detail is not exact selected-row transport.

## 4. Engineering comparator: a bench run's energy increments

One source contains samples from independent electrical branches A and B. Each row is an energy increment in joules for a five-second interval starting at `elapsed_s`; intervals do not overlap within a branch. These are additive increments from distinct branches, not redundant sensors measuring the same system and not instantaneous power samples. Every reported sum covers the available numeric increments; it does not impute the missing energy or claim a complete physical total. Range membership uses interval start time as explicitly defined by this task; it does not clip or prorate intervals.

`sampleId` is the unique record key. `runKey` is the repeated run identity. The comparison keeps units/basis explicit without proposing a units framework.

| sampleId | runKey | elapsed_s | sensor | phase | energy_J |
| --- | --- | ---: | --- | --- | ---: |
| S01 | `"R1"` | 0 | A | warmup | 2 |
| S02 | `"R1"` | 10 | A | steady | 4 |
| S03 | `"R1"` | 20 | B | steady | 6 |
| S04 | `"R1"` | 30 | A | steady | 8 |
| S05 | `"R1"` | 40 | B | steady | 10 |
| S06 | `"R1"` | 20 | A | steady | `null` |
| S07 | `"R1"` | 25 | A | steady | 0 |
| S08 | `"R2"` | 20 | A | steady | 100 |
| S09 | `null` | 20 | A | steady | 50 |
| S10 | `"R1"` | 50 | A | cooldown | 12 |

The source's selected run is R1 and interval `[10,30)` seconds; the clicked chart is local to A. The saved destination keeps literal `phase = steady`, saved bindings for interval `[30,50)`, and a B-only local chart. Required number parameters `fromSecond` and `untilSecond` feed `gte`/`lt` predicates; the entity parameter is a string.

| Case | Exact membership | Rows / numeric contributors / sum J |
| --- | --- | --- |
| E00 — R1, `[10,30)`, before chart-local A | S02, S03, S06, S07 | 4 / 3 / 10 |
| E01 — Clicked source: E00 with chart-local A | S02, S06, S07 | 3 / 2 / 4 |
| E02 — D: R1, saved `[30,50)`, fixed steady | S04, S05 | 2 / 2 / 18 |
| E03 — E02 with destination chart-local B | S05 | 1 / 1 / 10 |
| E04 — M: R1, explicit `[10,30)`, fixed steady | S02, S03, S06, S07 | 4 / 3 / 10 |
| E05 — E04 with destination chart-local B | S03 | 1 / 1 / 6 |
| E06 — M plus inherited source A as a query restriction | S02, S06, S07 | 3 / 2 / 4 |
| E07 — E06 with retained destination chart-local B | Empty | 0 / 0 / `undefined` |
| E08 — Conjunction of `[10,30)` with saved `[30,50)` | Empty | 0 / 0 / `undefined` |
| E09 — Missing energy only | S06 | 1 / 0 / `undefined` |
| E10 — Valid zero only | S07 | 1 / 1 / 0 |

Manual derivation: source A gives `4 + 0 = 4 J`; the saved destination gives `8 + 10 = 18 J`; mapped context gives `4 + 6 + 0 = 10 J`; its B-only chart gives `6 J`. S04 at 30 belongs to the saved interval but not the selected interval; S10 at 50 is excluded. S01 is warmup, S08 is another run, S09 lacks an entity identity, and S06 is missing energy. These results were also checked by the standalone oracle.

Mapping seconds to a destination field in milliseconds is unsafe merely because both parameters are numeric. A field, unit, phase, or interval-basis mismatch must fail the mapping contract unless an explicitly authored conversion is reviewed. No conversion or general quantity system is included in this candidate.

## 5. Compare current controls first

### P0: local trust, before navigation

Use the business fixture with **the same scope** on bar, card, and Rows. Begin without the navigation-specific Web/Store local restrictions. Select string store `"7"` in September and verify B00: exact IDs O01/O02/O03/O10/O11, five members, four numeric contributors, 130 USD. Inspect the missing and negative inputs; export selected rows and compare their IDs and values. Undo, redo, and reopen the saved analysis. Stop at the first disagreement and report a bounded defect, rather than proceeding to a connection.

Do not assert that intentional chart-local restrictions should produce identical totals. After this shared-scope proof passes, introduce B01/B05 and explicitly explain why they differ. The trust intent calls for membership and numeric contributors as separate assertions. [Trust].

### P1: current manual flow under a fair lesson

The lesson should demonstrate the existing jobs before asking whether they are insufficient:

1. Keep the overview open. Select the entity, inspect its applied period, and use trace/Query to inspect contributors. Explain that an ordinary mark click selects while trace interaction inspects; do not add an Inspect button. [Standards], `UI`; [ChartContext]; [Project], `chartContext`.
2. Choose the saved detail tab. Duplicate it if the investigator wants to retain its current analysis. Duplication already exists and preserves settings, bindings, inspection, and selected row keys. [Host], `createView` L597–631.
3. In Query Inputs, choose/type the entity. Run D with the saved dates, then M by manually editing the two dates. Explain any last-valid-input status. A sequence of valid edits can legitimately show an intermediate applied period; record it, without pretending the control has a batch Apply action. [Inputs], `update`; [Panel] L181–192.
4. Check query membership and the chart-local total separately: B02/B03 for D, B04/B05 for M. Ask the investigator to state the population before inspecting the expected result table.
5. Return by selecting the preserved overview tab. Check its committed settings and selection. Exercise Undo separately to understand the actual host history, not as a substitute for return. [Host], `changeActive`, `moveHistory`.
6. Try the current adjacent alternatives only when they answer the actual task: open stage to inspect an intermediate query; copy query for independent query edits; open source for the whole source; trace for selected contributors. None is automatically equivalent to a saved entity investigation. [Panel], `openStage`/`openCopy`; [Editing], `sourceView`; [StageRows], `RelatedRecords`.

Record task wording, actual user role, repetitions, intended population, errors/recovery, elapsed effort if measured, and the user's accepted effort/error target. **No author session has occurred.** If the manual flow is acceptable, stop at docs/example work and defer navigation. If the desired job is exact contributors rather than recomputed entity detail, use tracing/current inspection first and do not relabel a mismatching entity connection as a solution.

### P2: only then compare one host-authored binding

If an actual repeated task rejects P1, use one host-owned action and one fixed destination. The host already knows the semantic entity/range values, or must prove the chosen mark's mapping before proceeding. It may compose `toolbarEnd` and call its own opening function with a prepared view. `onOpenView` is a library-to-host callback; it is not a generic imperative navigation API. The packet does not establish that internal `bindingProblem` is a public import. [Project], `ExplorEdaProjectProps`; [Bindings].

Validate the whole proposed map and known destination contract before one state mutation. For the bounded M proof, only the explicitly mapped binding slots change; the completed restriction and Store-only chart remain. Source committed state and existing destination state remain recoverable through the selected instance policy and existing host history. A successful action creates the same population as manual M. A refusal creates no tab, binding change, or checkpoint.

Do not claim the host-owned picker removes manual entity entry unless the actual host already has that context. If its interaction cost is indistinguishable from Query Inputs, that is evidence to reject the feature. No user connection editor is part of P2.

## 6. Adversarial cases and bounded outcomes

The outcomes here are **proposed acceptance criteria**, except where a cited current implementation is explicitly described.

| Case | Required proof outcome | What it distinguishes |
| --- | --- | --- |
| One aggregate, many records, same typed store | B01 can identify one store if every relevant contributing record agrees. Do not require exactly one source row. | Entity cardinality versus row cardinality. |
| Multiple marks, same store | Permit only if the particular mark/context proof resolves one identical typed value and approved context; otherwise refuse. | Multiple marks need not imply multiple entities. |
| Multiple distinct stores or mixed `"7"`/`7` | Refuse atomically; no first value, list joining, key aggregation, or coercion. | A scalar binding is not a set predicate. |
| Null/undefined/empty required entity | Specific refusal; source/destination unchanged. Do not turn it into all entities. | Missingness versus explicit zero/false-like values. |
| Entity no longer exists in current source | Refuse stale context. If entity exists but a legitimate chosen period has no orders, classify that as a valid empty result instead. | Stale identity versus no observations in a period. |
| Reversed endpoints | Refuse before opening, even if a caller bypasses UI validation. | Host transaction versus ordinary input UI. |
| Equal exclusive endpoints | Explicitly classify the empty interval. For the conservative trial, refuse an empty-range transfer pending H04; do not claim `bindingProblem` already rejects it. | Existing validator only rejects lower greater than upper. |
| Timestamp versus date-only or incompatible brush endpoints | Refuse until source field, timezone/basis and endpoint convention are known; do not guess September from a label. | Semantic compatibility versus display similarity. |
| Mapped September versus saved October binding slots | Replace only approved slots together: B04/B05. | Explicit mapping versus destination-only D. |
| Mapped September versus literal October restriction | Arithmetic B09 is empty. Conservative candidate refuses automatic transfer and names the retained restriction. | A saved parameter value versus an independent query restriction. |
| Source Web versus destination chart Store | M keeps Store locally and does not implicitly inherit Web: B05 = 50. H counterexample B08 is empty. | Query population versus chart-local scope. |
| Saved O04 selection while rebinding to September | Keep saved state intact; prove resolution or refuse automatic rebinding. No silent clearing of keys, filters, or local restrictions. | Complete analysis saving versus an unselected template reset. |
| Destination was edited | Do not silently replace/reinitialize it. Exercise the reviewed reuse/new-instance choice; duplication is the current fallback. | Preserving work versus treating every destination as disposable. |
| Source invalid draft or pending evaluation | Do not derive context from an uncommitted/newer request while presenting previous results. Conservative trial waits/refuses; current applied labels remain honest. | Applied context versus draft/request context. |
| Missing field, unsupported query, source mismatch, duplicate required record keys | Refuse the known contract; no fallback to `__ID` or first contributor. | Bounded preflight versus generic inference. |
| Source rows reordered | Unique record IDs still identify the intended records; recomputed membership remains the declared population. Positional fallback fails this test. | Durable record identity versus row position. |
| Source rows changed with new array | Revalidate current fields/keys/entity; explain recomputation. No historical data snapshot or version coexistence is implied. | History of analysis choices versus history of source data. |
| Missing measure versus zero versus empty | B11/E09 no-contributor sum; B12/E10 numeric zero; B06/E08 zero members with no sum. Observe actual rendering separately. | Numeric contributors versus membership. |
| Seconds versus milliseconds, or different run phase | Refuse unapproved conversion or scope replacement. | Type equality alone is insufficient meaning. |

Existing related diagnostics provide useful seeds but not a finished navigation validator: [Bindings], `bindingProblem`; [Evaluator], `filterFrame`, `sourceReferences`; [RowKeys], unresolved-key functions; [EvaluationHook], pending/applied-binding state.

## 7. Instance, history, return, and persistence proof

H03 must be recorded before claiming a chosen lifecycle. Test the single conditional candidate with the selected option; compare the other options on paper and by current duplication where possible. Do not implement multiple navigation systems to explore the choice.

| Scenario | Assertions required in a future runnable proof |
| --- | --- |
| New instance option, A then B | Two tab IDs; each shows its effective entity/context; A's committed state survives B's opening. Verify same-query shared definitions deliberately; do not claim full isolation. |
| Reuse option, A then B | Exact target identified; old edits/selections preserved or a deliberate user decision recorded; one accepted mutation through current history owner. No new dirty flag inferred from browser save status. |
| Existing duplication | Confirm cloned settings and retained query/bindings/inspection/selections; editing bindings does not silently reset the analysis. The query definition is still shared through `queryId`; use existing Copy query when independent query editing is intended. |
| Return | Selecting the overview restores its committed settings/selection and does not create an undo checkpoint. Test source tab deletion; do not silently resurrect it. Local invalid drafts have no current preservation guarantee. |
| Undo accepted opening | Existing host removes/restores state according to its checkpoint path. Confirm active-tab fallback separately; do not assert that it returns to the opening source. |
| Redo | Confirm the tab and bindings return, while active-tab selection follows the host's current rule. Do not rewrite old history or add a second navigation undo stack. |
| Refusal | Exact before/after state and checkpoint count equal. No partial bindings, tab, or misleading destination label. |
| Local reload | Verify committed binding values, settings, keys, tabs and active ID. Check history/path/cursor separately from source/table storage. No persistence promise for component drafts. |
| Full project export/import | Verify current definitions, tables, views, active ID, and resulting memberships/totals. Import begins a new history; do not expect the original timeline or return provenance. |
| Source refresh plus history restore | A checkpoint restores definitions/tabs, not a source-table snapshot. Verify current-data recomputation and invalid identity refusal without introducing version coexistence. |

Current evidence: [Host], `openProjectView` L890–913, `changeActive` L582–595, `capture` L768–809, `moveHistory` L928–959, `projectFile` L223–236; [Session], `HistoryEntry`, `projectSession`; [History], `pushCheckpoint` and `SHARED_KEYS`.

The supplied workspace integration test is a starting regression surface, not coverage of this table. Its binding-themed test checks query IDs/tab counts/project retention and baseline order/item totals; it does not mutate a customer/date mapping or exercise overview return. [WorkspaceTest] L106–193.

## 8. Smallest milestones, including docs and examples

All paths newly proposed below are **destinations for later work**, not existing inspected pages or files. The current agent guide identifies MDX pages, a catalogue, live examples, and coverage registration; exact edits must be checked in the runnable checkout. The repository requires docs and demo examples in the same milestone as any user-visible feature. [Agents]; [Guide], docs-site map.

| Milestone and bounded work | Docs section and example in that same milestone | Exit / stopping rule |
| --- | --- | --- |
| M0 — Verify current local trust; repair only a demonstrated disagreement | Proposed `apps/demo/src/docs/pages/analysis-trust.mdx`, “Check the selected population”; proposed `apps/demo/src/demos/analyses/analysisTrust.ts`, B00 shared-scope example. Any visible repair ships its explanation/example together. | Bar/card/selected-row export agree on IDs and contributors; undo/redo/reopen preserve expected state. Stop at first failure. No navigation implementation. |
| M1 — Explain current controls and observe one real task | Proposed `apps/demo/src/docs/pages/task-navigation.mdx`, “Use saved views and Query Inputs” and “Choose the detail population”; proposed `apps/demo/src/demos/analyses/taskNavigation.ts`, manual D/M versions of the business fixture, plus an engineering comparison section using the rows above. | Record the actual population intent and acceptable effort. If current controls pass, retain docs/example and defer a feature. This setup alone is not user demand. |
| M2 — Conditional, one host-authored binding only after M1 rejection and reviewed H01–H04 | Same proposed docs page, “Mapped inputs and retained restrictions” and “Return without undoing”; same proposed business example adds the single explicit host action, visible effective context, refusal cases, and current manual route. | Match manual oracle; pass invalid/multiple/conflict/edited-state/lifecycle checks; show practical benefit against the agreed task target. Otherwise remove/defer the candidate. No new public API or saved connection editor by default. |

Update `docs/intent/parameterized-task-navigation/intent-brief.md` and its initiative map only after review to distinguish accepted facts, remaining choices, and any conditional milestone. Preserve the later time horizon and history ownership. Keep local trust evidence with `docs/intent/current-analysis-trust/`. Do not assert these updates have happened.

If M2 reveals that a new public mark-selection surface is indispensable, stop and request the narrow missing source/contract evidence. Do not silently expand M2. User-authored saved connection work remains TN06/H05, requiring a repeated configuration task that the host example cannot serve; no milestone is committed for it here.

## 9. Future run sheet and browser checks — not executed

Run only in a real, appropriately prepared checkout. Verify the source pin and dependency/runtime requirements using repository guidance first. These existing regression commands do not, by themselves, implement or prove the new cases above.

```bash
# Confirm the inspected baseline in the intended isolated checkout.
git rev-parse HEAD

# Existing parameter and evaluator regression suites.
pnpm --filter exploreda exec vitest run src/test/lib/analysis/parameterBindings.test.ts src/test/lib/analysis/evaluateProject.test.ts

# Existing workspace regression suite; add meaningful fixture assertions only in later authorized work.
pnpm --filter demo exec vitest run src/SavedViewsWorkspace.integration.test.tsx

# Repository gate, once, when appropriate for the later change/review.
pnpm check
```

For any later visible change, interact at **1280, 783, and 390 CSS pixels**. Verify keyboard access to the action/inputs/tabs, visible effective population and refusal reason, pending/invalid-input announcements, retained context during return, and readable overflow. Record real interactions and viewport sizes. Screenshots alone would not prove membership or history behavior; this research captured none. Do not call these scenarios observations.

## 10. Human choices and acceptance record

H01 remains destination-only versus explicit mapping versus asking; a compatible inherited subset remains reviewable outside the minimal candidate. H02 remains range field, basis, endpoints, and transfer choice. H03 remains reuse/new instance/user choice. H04 remains saved-selection/conflict/valid-empty presentation. H05 remains whether an actual workspace-authoring task requires saved user-defined connections.

Before a candidate can be called GO, record: the real repeated task and failed acceptable manual alternative; selected population/lifecycle choices; exact source and target contract; bounded refusal cases; full fixture memberships and contributor totals; application/browser results; paired docs/example; and a comparison against the agreed effort/error target. Failed demand or acceptable current controls means **defer**, even if every synthetic test passes.

Codex owns later collection, independent validation, integration, and the review PR. This package supplies research and explicit proof expectations; none of that later work is claimed complete.

[Agents]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md
[Guide]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md
[Standards]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/CODING_STANDARDS.md
[Intent]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/parameterized-task-navigation/intent-brief.md
[Trust]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[Types]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[Inputs]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryParameters.tsx
[Bindings]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/parameterBindings.ts
[Evaluator]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[EvaluationHook]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[Shop]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts
[Project]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ExplorEdaProject.tsx
[ChartContext]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/AnalysisChartContext.tsx
[Panel]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
[Editing]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/queryEditing.ts
[StageRows]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryStageRows.tsx
[RowKeys]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/analysisRowKeys.ts
[Host]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx
[Session]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts
[History]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts
[WorkspaceTest]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.integration.test.tsx
