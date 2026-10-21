# Retention observation completeness: decision

**Research date:** October 20, 2026, America/Indianapolis; October 21, 2026 UTC.  
**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA).  
**Source baseline:** [9b16d78e3ed0742ed4d5858c1939fec9e758b510](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510).  
**Assigned integration destination:** codex/retention-observation-research-2026-10-21; no branch was created or changed.

## Decision

**Retain the existing event-snapshot Retention contract. Defer a new observation-end setting, a change to the All denominator, and any observation-coverage engine.** The next useful work is a bounded proof of interpretation and behavior, after the existing local selection/export/undo/reopen trust task. A focused lesson is conditional on a demonstrated misunderstanding that explanation actually resolves. This report makes six recommendations, RO01–RO06; none authorizes product implementation.

The reason is an information boundary. Recorded events establish which qualifying activity appears in the supplied population. They do not establish that collection was continuous, that all late arrivals are present, that every entity had equal follow-up, or that the first recorded entry was its first entry in reality. A later timestamp cannot add those missing facts. Author-supplied coverage can change what a quiet period means, but its scope and provenance must be established before designing a control.

The strongest case for deferral is practical as well as analytical. The delivered chart already has entry and activity controls, UTC calendar periods, future-cell blanks, partial-cell hatching, cohort sizes, source tracing, and entity selection. No observed customer demand, known collection failure, or executed product defect was supplied. Another setting would add a promise that users must author correctly and contributors must preserve through filters, facets, save/restore, traces, and examples. It would still not express an interruption inside the observation interval. [Source: planner, renderer, settings, trace, and supplied mission.][plan]

### GO / NO-GO

| Decision boundary | Disposition |
| --- | --- |
| Read-only research and source contract | **GO.** Owner, repository, commit, essential planner/renderer/provider source, and missing filter/facet dependencies were identified. All 32 packet entries passed byte-count and SHA-256 checks. |
| Independent arithmetic and report integrity | **GO.** These establish fixture calculations and artifact identity only. They do not accept application behavior. |
| Bounded local product proof | **Proposed next work for Codex.** Local trust remains first; the retention proof and author comparison are unrun. |
| Product implementation from this research | **NO-GO now.** No new endpoint, summary policy, cohort rule, chart family, or coverage schema is approved. |
| Small repair after a verified contradiction | **Conditional.** A reproduced failure against an agreed promise can justify a focused correction without inventing demand for observation metadata. |

Evidence labels used below: **S** = inspected source or authenticated supplied material; **E** = retrieved primary documentation; **I** = inference or independently worked arithmetic; **P** = proposal. “Observed” in the planner is a field name with a narrow computational meaning; it is not an assertion of complete collection.

## 1. What current Retention actually promises

### Current contract matrix

All source citations in this report are pinned to the baseline. The functions that implement these rules are more authoritative than future-tense domain plans or broad explanatory comments.

| Contract area | Current source behavior | Real symbol / source |
| --- | --- | --- |
| Input populations | Entry and activity read **ids**. The horizon reads **allIds**. They can contain different event rows. | **RetentionInput**, **planRetention**; [planner][plan], [renderer][render] |
| Entry | Within surviving valid event rows, group by entity, sort by timestamp and row ID, then take the earliest matching entry event. With entry unset, take the first surviving event. Each entity enters one cohort in that plan. | **planRetention**, rows sorting and entry lookup; [planner][plan] |
| Filtered entry | Removing the required entry row can remove the entity. A later surviving entry, or a default first event, can move its cohort. Original unfiltered entry membership is not preserved separately. | **byEntity**, **rows.find**, **entryEvent**; [planner][plan] |
| Denominator | Cohort size counts eligible entered entities, including those with no activity in a particular period. **entryRows** holds one entry row per member. | **RetentionCohort**, **cohort.size**, **entryRows**; [planner][plan] |
| Activity | Only events at or after the selected entry time qualify. Empty activity settings mean any event. Otherwise the event must match an activity value. One entity counts once per elapsed period, at its first qualifying event there. | **activity**, **seen**, **cell.active**, **cell.rows**; [planner][plan] |
| Retention mode | Activity in that particular period. Skipping a period does not prevent a later return. There is no consecutive-return requirement or on-or-after aggregation. | **periodsBetween**, activity loop; [planner][plan] |
| Period zero | It contains the entry time, but can be less than 100% when the entry event and activity events differ. Signup alone does not count as a session. | Activity qualification; [planner][plan], [planner assertions][plan-tests] |
| Calendar | UTC days, Monday-start calendar weeks, and calendar months. Period 1 is the next calendar period, not a fixed duration after each entity's entry. | **periodStart**, **periodEnd**, **periodsBetween**, **addPeriods**; [planner][plan] |
| Date input | **timestampOf** reads finite numeric timestamps, Date values, or centrally parsed text. Offset-free date text is UTC; explicit offsets are normalized. | **timestampOf**, **parseDateText**; [parsing][parsing] |
| Horizon | The maximum readable timestamp in **allIds**, even if its row has no valid entity, no entry event, or no qualifying activity. Returned **lastTime** is this actual timestamp, despite its interface comment describing a period start. | Maximum loop, return value; [planner][plan] |
| “Observed” | A cell is observed if its calendar start is no later than the calendar period containing the horizon. This means the snapshot reaches that period. | **cell.observed**; [planner][plan] |
| Future versus zero | A future cell has observed=false and is not drawn. An observed cell with no qualifying recorded activity is drawn as 0%. Internal numeric zero on a future cell is not a displayed retention value. | **cell.rate**, **cellAt**; [planner][plan], [renderer][render] |
| Partial | A reached cell is partial only when its period ends after midnight immediately following the horizon's UTC date. The horizon is rounded through that whole date. | **cell.partial**, lines 187–191; [planner][plan] |
| Partial presentation | Partial cohort cells already have hatching, accessible-label and hover indications, and a trace explanation. The trace reports the horizon date. | **cellAt**, **RetentionTraceBody**; [renderer][render], [trace][trace] |
| All row | For each elapsed period, sum active counts and whole cohort sizes over all observed cells, including partial cells. Divide the two sums. This is not an unweighted mean of cohort percentages. | **summary**, **RetentionSummaryCell**; [planner][plan] |
| All presentation | All has no partial field, hatching, cell trace, or interactive mark. It includes the whole plan even when only the newest cohort rows fit on screen. A zero eligible denominator is blank. | **cohorts.slice**, summary rendering; [renderer][render] |
| Trace membership | The contributor list shows one representative activity event for each active entity. It does not enumerate every qualifying event or every cohort denominator member. | **cell.rows**; [planner][plan], [trace][trace] |
| Selection | A nonzero cell stores active entity values. Its predicate admits all events for those values, subject to remaining constraints in linked views. Clicking a zero-active cell clears the existing entity selection. | **select**, **retentionSelectionFilter**, **getFilterFunction**; [renderer][render], [definition][definition] |
| Current settings | Entity, time, optional event, entry event, activity events, day/week/month, and displayed period count. The UI allows 1–24 periods and defaults to eight. It has no authored observation endpoint. | **RetentionSettings**, **RetentionSettingsPanel**; [definition][definition], [settings][settings] |

### Filter and facet scope

**S.** The provider was followed through **getLiveItems** to **CrossfilterWrapper.getAllData**, rather than treating helper names as sufficient evidence. In ordinary linked mode, a chart's Crossfilter group omits its own selection dimension while responding to peer and workspace filters. Each chart's local population is then applied. Nonempty facet IDs further restrict its live rows. **useGetAllIds** reads the chart-local population independently of those peer/workspace/facet restrictions. [Provider][provider] · [wrapper][wrapper] · [helpers][helpers] · [population][population]

| Scope or control | Entry/activity rows | Horizon rows |
| --- | --- | --- |
| Retention's own interactive selection | Does not narrow its own group | Unchanged |
| Peer selection in default linked mode | Restricts event rows | Unchanged |
| Workspace filter | Restricts event rows | Unchanged |
| Retention chart-local filter | Restricts event rows | Restricts event rows |
| Nonempty facet membership | Restricts event rows to that panel | Shared chart-local horizon |
| “Counts as active” setting | Changes activity qualification after entry lookup | Unchanged |

With **localSelections=true**, chart selections no longer narrow other charts; workspace filters still do. A chart's local population is not itself broadcast as a linked filter. Faceting is by rows: if an entity's facet value changes across its events, a panel can lose its entry event. An empty facet-ID array is treated as unrestricted by the helper, but the inspected normal facet paths do not establish an empty-facet rendering defect. [Wrapper][wrapper] · [facet container][facets]

### Four meanings that must remain distinct

| Situation | What can be concluded |
| --- | --- |
| No qualifying recorded activity | The current filtered event subset has no qualifying event for those cohort members in that period. A displayed zero states this recorded-event fact. |
| An unfinished period at the analysis cutoff | Some of the intended calendar interval lies after the cutoff. Current hatching is only a date-rounded approximation relative to the event maximum, not wall-clock maturity or a coverage certificate. |
| A period beyond the recorded snapshot horizon | The chart leaves it blank. It cannot determine whether the interval was quietly observed, not yet observed, omitted from the extract, or affected by failed collection. |
| A known interruption in observation | This requires an external fact identifying the affected interval and scope. Current Retention has no representation for that fact. A later event does not repair it, and absence during it is not established inactivity. |

**I.** A complete quiet tail and a missing-collection tail can have identical recorded rows. Any deterministic event-only chart receives the same input in both worlds and therefore must return the same output. Different claims about true activity require additional evidence. The [proof plan](proof-plan.md) makes this counterexample concrete without alleging an actual outage.

## 2. Ranked findings

1. **The missing fact is coverage, not a missing warning.** **S/I.** The horizon uses timestamps without a collection contract. Existing hatching and trace are already delivered. Treating maximum time as an automatic completeness signal would create information the input does not contain. [Planner][plan] · [trace][trace]

2. **The exact partial rule deserves a bounded contract check.** **S/I.** Daily cells never become partial under the current formula. Weekly and monthly cells stop being partial as soon as a horizon timestamp falls on their final UTC date, even early that day. The docs' broad statement that the ending period is hatched has exceptions in source. This establishes a source/prose discrepancy; it does not establish an executed rendering defect or decide whether day precision is intentional. [Planner][plan] · [current docs][docs]

3. **All can combine complete and partial calendar cells without a summary cue.** **S/I.** This is the implemented “reached cohorts” contract. In the proof fixture, its Week 1 is 2/3; excluding partial cells makes it 1/2 and changes which cohorts contribute. A denominator policy is an analytical change, not merely a visual clarification. [Planner][plan] · [renderer][render] · [proof](proof-plan.md)

4. **Current controls resolve an important false equivalence.** **S.** Entry=signup and activity=session retain signup rows for cohort formation. A peer filter that keeps only sessions removes those entry rows before the planner runs. These are different questions. A lesson may help an actual reader make this distinction; changing cohort semantics is not a prerequisite. [Helpers][helpers] · [planner][plan] · [settings][settings]

5. **Competitor choices are useful alternatives, not demand evidence.** **E/I.** Amplitude and Mixpanel document incomplete-bin exclusion from overall summaries. Their period and entry contracts differ from explorEDA. This supports an isolated summary-policy comparison, not a catalogue of modes or a claim that the present choice is defective. [Amplitude][amplitude-totals] · [Mixpanel][mixpanel]

6. **The current demo and domain roadmap must be read correctly.** **S.** Funnel, Retention, and Timeline register today. The product-event generator and product-retention example are synthetic teaching material. Old future-tense plans do not justify rebuilding these views; a generator endpoint is not consumed as chart observation metadata. [Registry][registry] · [generator][generator] · [examples][examples]

## 3. Alternatives and costs

The following scores are local judgments about the specified task: interpreting a snapshot correctly while preserving contributor inspection. They are not empirical user ratings or a popularity measure. Scores run from 1 (poor or costly) to 5 (strong or inexpensive). Four separate dimensions are shown; no weighted total disguises the unresolved task.

| Alternative | Interpretation / low author effort | Contributor inspection / low maintenance cost |
| --- | --- | --- |
| **A. Retain behavior with an explicit contract** | **3 / 5.** Honest snapshot meaning; cannot classify unknown coverage. | **4 / 5.** Keeps entity selection and activity traces; denominator enumeration remains limited. |
| **B. Current controls plus one focused lesson** | **4 / 4.** Could explain scope, zeros, and summary eligibility if readers need it. | **4 / 4.** Reuses current inspection; docs and example must track behavior together. |
| **C. Upstream authored cohort/observation table** | **4 / 2.** Can state task-specific coverage and denominators when facts exist; preparation is substantial. | **2 / 3.** An aggregate table weakens event lineage unless contributors are preserved separately. |
| **D. One explicit chart observation end** | **4 / 3** for a verified common boundary; **1** for interior gaps or unequal coverage. | **4 / 2.** Could preserve native traces, but adds validation, scope, persistence, and semantic maintenance. |

**P.** Choose A now. B is the first comparison for a demonstrated explanation problem. C and D are competing responses to a demonstrated need for authored coverage, rather than a mandatory sequence of hurdles. One clear, consequential, reproducible failure can earn a small comparison; this research does not impose an invented count of users or repeated failures.

**C's real boundary:** a prepared cohort-period table is a candidate for existing table/heatmap inspection, not an input that current Retention already accepts. Do not feed aggregate counts to an event planner, manufacture zero events, or assume an aggregate row preserves active-entity selection. If the task requires inspecting individual contributors, preserve the relevant entity and entry/activity references and assess that cost explicitly. Merely moving work upstream does not make the whole workflow simpler.

**D's real boundary:** a scalar end can express one boundary only after its meaning and population are agreed. It cannot attest to uninterrupted coverage by itself, represent an interior interruption, restore missing entry history, or express a different end for each entity. Keeping the existing event maximum as the default may be a plausible compatibility policy, but it is not selected for implementation here.

**Separate alternative: exclude partial cells from All.** This needs its own evidence and decision under RO06. Keeping the cohort cells visible while changing summary eligibility is a bounded candidate; it must expose the remaining denominator and blank when none qualify. Using current partial=false as “complete collection” would still be wrong, and current day rounding makes it an imperfect calendar-maturity predicate as well.

## 4. Six stable recommendations

### RO01 — Retain the explicit snapshot contract

- **Affected task:** reading cohort activity from a supplied event log.
- **Evidence:** S — planner, renderer, existing docs and controls; I — identical-row coverage counterexample. [Planner][plan]
- **Disposition and alternatives:** retain now; compare A with B only when an explanation problem is observed. Do not add a completeness guarantee.
- **Benefit:** preserves a small, inspectable event model without making the author certify unknown facts.
- **Cost:** low implementation cost; continued need to describe scope precisely. The source/prose day-rounding discrepancy remains a specific item for review, not an excuse to rewrite semantics.
- **Confidence:** high about source behavior and non-identifiability; moderate about whether present explanations suffice for real readers.
- **Falsification:** a named, consequential task fails under verified current behavior, or behavior contradicts an agreed documented promise. Identify the exact wrong decision, not merely a preference for a competitor control.

### RO02 — Execute the smallest proof after local trust

- **Affected task:** accepting that linked counts, selected records, history, and retention scope agree.
- **Evidence:** S — current-analysis-trust intent and inspected tests; I — the eight-row fixture and its variants. [Trust intent][trust] · [proof](proof-plan.md)
- **Disposition and alternatives:** propose local trust first, then targeted planner/provider/rendering/browser checks. Another survey is not a substitute.
- **Benefit:** separates arithmetic, intentional semantics, presentation ambiguity, and a real runtime discrepancy.
- **Cost:** small, bounded engineering validation; browser/author time is additional. Do not broaden into an exhaustive certification matrix.
- **Confidence:** high that the fixture discriminates the named rules; no confidence claim about unexecuted product acceptance.
- **Falsification:** actual behavior differs from the predicted rows or flags. Stop, record the smallest mismatch, and reconcile source or test assumptions before proposing a repair.

### RO03 — Earn one lesson and runnable example together

- **Affected task:** distinguishing entry rows, active entities, source events, zeros, partial periods, and the All denominator.
- **Evidence:** S — current docs, controls and trace already cover much of this; I — session-only filtering and identical-row worlds expose specific possible misunderstandings. [Docs][docs] · [settings][settings] · [trace][trace]
- **Disposition and alternatives:** conditional; do nothing if current explanation succeeds. If a short lesson resolves an observed consequential error, propose “Read the observation window” in retention.mdx and one runnable retentionObservation.ts example in the same milestone.
- **Benefit:** improves interpretation without adding data that the author does not have.
- **Cost:** low-to-moderate documentation and demo maintenance; a second explanation can drift from the planner.
- **Confidence:** moderate about explanatory potential; low about need because no reader failure was supplied.
- **Falsification:** current controls already yield the correct decision, or the proposed lesson does not resolve the error. A need for absent coverage facts is not solved by longer copy.

### RO04 — Compare a scoped upstream table when coverage is genuinely available

- **Affected task:** reporting retention under author-known observation scope or nonuniform coverage.
- **Evidence:** I — event rows do not identify quiet-versus-missing intervals; S — native Retention expects an event log, not prepared cohort totals. [Planner][plan]
- **Disposition and alternatives:** keep a task-specific upstream table as a candidate against D. Do not make it an obligatory detour before considering a small chart input.
- **Benefit:** allows explicit numerator, cohort denominator, coverage status, and exclusions where an author can supply them.
- **Cost:** potentially high author effort and weaker lineage; inspection must account for prepared rows and underlying entities separately.
- **Confidence:** high that authoritative extra facts are necessary; moderate that upstream preparation is best for any particular task.
- **Falsification:** preparation or contributor inspection is more burdensome than a well-scoped single input, or the proposed table cannot support the actual downstream task. Do not assign missing members a new denominator silently.

### RO05 — Defer a single observation end until its scope and meaning are proved

- **Affected task:** representing a known common end that differs materially from the maximum event timestamp.
- **Evidence:** S — no input exists; I — the unrelated late event and quiet-tail cases discriminate the possible benefit. [Definition][definition] · [proof](proof-plan.md)
- **Disposition and alternatives:** NO-GO now. A named task with trustworthy common coverage can earn a comparison between an endpoint and a scoped upstream representation. Global, per-cohort, and per-entity coverage are not interchangeable.
- **Benefit if earned:** could show a genuinely known silent tail or constrain an inappropriate horizon while preserving native event inspection.
- **Cost:** moderate-to-high relative to one control: boundary parsing, conflicting events, filters/facets, saved settings, trace wording, defaults, docs, and example behavior must agree.
- **Confidence:** high about the present evidence gap; conditional about value.
- **Falsification:** no authoritative boundary exists; it varies by cohort/entity; the task depends on interior gaps; or the smaller explanation/preparation option suffices. Those outcomes reject this scalar design rather than automatically expanding it into a platform.

### RO06 — Evaluate partial exclusion from All as its own analytical choice

- **Affected task:** comparing elapsed-period summaries across cohorts.
- **Evidence:** S — current summary includes partial cells and lacks a partial cue; E — incomplete-bin exclusion is documented elsewhere; I — the fixture changes 2/3 to 1/2 under exclusion. [Planner][plan] · [renderer][render] · [Amplitude][amplitude-totals] · [Mixpanel][mixpanel]
- **Disposition and alternatives:** retain reached-cohort pooling now. Compare clearer disclosure with completed-period-only pooling only if the summary causes a consequential error.
- **Benefit if earned:** could make exposure eligibility clearer for the named comparison.
- **Cost:** moderate semantic maintenance: cohort eligibility, zero eligible denominator, summary inspection, old expectations, and date precision all need agreement.
- **Confidence:** high in current arithmetic; moderate in the value of either alternative.
- **Falsification:** readers correctly understand the existing pool, exclusion answers the wrong question, or an undifferentiated “complete” label implies coverage the data does not establish.

## 5. Unresolved product choices before any endpoint implementation

These are decision gates, not a proposed universal schema.

- **Meaning:** is the value a chosen analysis cutoff, an assertion of observation through an instant, or an export-processing marker? One must not be presented as another.
- **Scope:** does it apply to the entire chart population, each cohort, or each entity? Can every displayed facet inherit it truthfully? A common-end experiment requires evidence of common scope; heterogeneous coverage remains upstream or out of scope.
- **Interval and history:** what preceding interval is known to be observed, and what is known about earlier entry history? An end alone cannot rule out an interior gap or left-truncated entry.
- **Precision:** an exact UTC instant or a whole date; inclusive or exclusive; how a final-day timestamp behaves. Reusing the current day-rounded flag would be a deliberate choice, not a neutral implementation detail.
- **Conflicts:** what happens when the authored end precedes recorded events? Reject the conflicting assertion, truncate the analysis, or classify those rows separately? Do not silently discard them.
- **Filtering:** which controls alter population and entry, which only alter activity, and which leave the authored assertion valid? A peer event filter must not silently become fixed original-entry cohorting.
- **Summary:** reached versus completed-period cohorts, and how excluded cohort counts and denominator are inspected.
- **Lifecycle:** whether and how the assertion survives saved views, restore, and changed source data; who is responsible for updating an authored fact.

The minimum new evidence is a named decision, a small reproducible event extract, the author's relevant coverage statement and its basis, and an observed error using the existing chart. For a common end, that statement must identify population, event types, UTC interval/boundary convention, any interruptions, and applicability to all displayed cohorts/facets. The [proof plan](proof-plan.md) specifies the discriminator without pretending these facts are already available.

## 6. Handoff and limits

**Completed here:** packet authentication; read-only source inspection with pinned supplementary dependencies; four remote baseline byte/blob cross-checks; current primary-document retrieval; independent fixture arithmetic; four report originals and archive/manifest integrity verification.

**Not executed here:** explorEDA, its generator, Vitest, typechecks, pnpm check, pnpm check:pr, browser/keyboard flows, author tasks, export/undo/restore, or competitor interfaces. Existing test source and other PRs' validation reports are not this run's test results.

Codex owns independent collection and integrity checks, reconciliation against its checkout, validation, and an open review PR. This research creates no repository mutation, merge, deployment, paid service, or product implementation. PR454 retains time-series axes; PR451/452 and PR455–460 retain their completed survey scopes. The [revised queue](research-queue.md) keeps local trust first and delivered domain views delivered.

Companions: [evidence and comparisons](evidence-and-comparisons.md) · [proof plan](proof-plan.md) · [research queue](research-queue.md).

[plan]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.ts
[render]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.tsx
[trace]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx
[definition]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/definition.ts
[settings]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionSettingsPanel.tsx
[parsing]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts
[provider]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx
[wrapper]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[helpers]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx
[population]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts
[facets]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx
[plan-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts
[docs]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/retention.mdx
[registry]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/charts/registerAllCharts.ts
[generator]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/data-samples/product_events.ts
[examples]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/examples.ts
[trust]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[amplitude-totals]: https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-calculation
[mixpanel]: https://docs.mixpanel.com/docs/reports/retention
