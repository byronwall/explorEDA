# Grouped rates: keep the reusable boundary deferred

Research date: **2026-10-19**. Repository: **byronwall/explorEDA**. Authorized baseline: **9b16d78e3ed0742ed4d5858c1939fec9e758b510**. Evidence is the selected text packet supplied for this task; no application code was changed.

## Decision

**Keep reusable grouped rates deferred.** There is a real arithmetic boundary between an average of row values and a ratio of separately accumulated totals. The inspected controls do not expose one shared ratio-of-totals definition to a Metric Card and grouped Bar. However, the repository explicitly says Byron has not used explorEDA enough to name a missing calculation. That is a binding demand limit, not evidence that a new calculation system is needed. [S02, S03, S04–S08]

- **GO for this bounded research decision.** The authorized packet is readable and covers the current calculation contracts, product intent, persistence boundary, and examples sufficiently to compare alternatives.
- **NO-GO for a prototype now.** No named, repeated author task has failed current controls, a short recipe, and preparation at an explicit grain.
- **NO-GO for a general measure grammar, semantic layer, pipeline graph, server query engine, new database driver, or broad compatibility design.** None is required by the evidence.
- **Preferred next rates proof, conditional:** observe one real author task using current controls and one prepared-result comparator. Stop immediately if the author cannot identify repeated need. The already-owned local trust journey remains the first local work; this is not another scheduled initiative or an implementation milestone plan. [S02, S03, S13]

Stable dispositions used throughout the research set are **GR01** defer on demand; **GR02** explain eligible indicator averages; **GR03** state population and units; **GR04** prefer explicit upstream grain where sufficient; **GR05** verify consumers and lifecycle; **GR06** preserve identity semantics; and **GR07** admit at most one bounded rate only after the demand and simpler-option gates pass. All are recommendations, not repository edits.

## Access, baseline, and evidence classes

The attached `source-packet(7).txt` is **296,375 bytes**. Its SHA-256 receipt is:

```text
88c5bc84d95608248ea1b96ab77e12be57514947db6a2a8ae2529867ec5211f0
```

All **38 embedded entries** were extracted by their declared byte lengths and matched their individual SHA-256 declarations. The attached `pro-prompt(10).md` also matched the packet's local research-prompt content; its SHA-256 is `4c0c77c8b00e32e30f95d0ab0b3a14dccdcb8cb6935a4d9739fd5cbffcafefc8`. These checks establish receipt integrity against supplied declarations. They do **not** independently authenticate the packet against Git history.

The prompt identifies the baseline as origin/main verified on 2026-10-19 and names `codex/grouped-rates-research-2026-10-19` as the local research branch. Those are supplied metadata. This run did not fetch a repository, verify a remote branch, create a branch, run pnpm, make a commit, or open a PR. No newer default-branch behavior was substituted. The root package declares `pnpm@11.9.0`; this remains the existing React/TypeScript library and demo. [S01]

This report distinguishes five classes:

- **Observed repository fact:** read from the authorized source packet at the declared baseline.
- **External fact:** read from current official documentation, with exact URL, access date, and section in E01–E05 below.
- **Inference:** a conclusion from contracts or arithmetic; it is not a demonstrated user problem.
- **Hypothetical task/fixture:** invented solely to make meaning and expected arithmetic falsifiable.
- **Proposal:** future author or application checks, including every browser, save/reopen, export, and undo scenario.

Missing context includes `valueParsing.ts`, category helpers, the expression parser and calculation manager, the chart renderers that supply snapshots, `chartPopulation`, the complete crossfilter implementation, Dashboard text compiler/exporter, demo undo implementation, full docs/example registry, and the flights CSVs. Their imports or guide references are not their implementation. These omissions prevent a claim of complete runtime agreement, exact coercion behavior, or a functioning two-consumer prototype. They do not prevent deferral. [S04–S13]

## Observed current behavior

| Boundary | What the selected source establishes | Consequence for rates |
| --- | --- | --- |
| Shared basic reductions | `AggregateSpec` names one group field, optional measure/entity fields, and count/sum/average. `summarizeGroup` retains source contributors and exclusions. [S04] | Reusable single-field summaries exist. Two independent measures and an eligibility contract are not present in this spec. |
| Pooled summaries | `poolAggregateRows` reconstructs source inputs from contributors and calls `summarizeGroup` again. [S04] | Existing pooling already avoids mean-of-group-means and reconsiders entity conflicts across pooled groups. It does not create exposure weighting for a row-rate field. |
| Calculated fields | `calculationFunctions.sum/avg/count` operate on arguments within one row. `Calculator` reads row variables, supports conditional guards, and rejects division by zero and nonfinite results. [S05] | `sum(events)/sum(hours)` in that scalar language would still concern the current row's arguments. It is not a dataset aggregate formula. Type metadata mentioning groups is not grouped execution. |
| Metric Card | `planMetricCard` calls the basic reducer directly using measure and optional entity fields. Its comparison is current-versus-baseline count/sum share, or average difference. [S06] | The card does not consume a named aggregate ID in the selected contract or accept arbitrary numerator and denominator reducers. Its displayed comparison is not an arbitrary business rate. |
| Bar and normalized series | Named grouped summaries are supplied to the bar plan. Percent series divide each current series value by the sum for its category. Stacked/percent average is rejected; negative percent inputs are rejected. [S07] | Normalization is category composition. It can express a conditional count proportion only when the series exhaust the intended eligible category population. |
| Pivot | Each value setting supplies one field and one reducer. `generateCell` and total construction reduce underlying rows; the settings contract includes richer statistical reductions. [S08] | Median or unique count support does not establish division between two grouped totals or reuse of a Pivot expression elsewhere. |
| Composition | `calcRows` chooses composition/repeat population and respect/ignore-filter scope; `evaluateCalc` includes its own reductions and ordered changes. [S09] | This is a separate scoped calculation contract, not proof that cards and bars share arbitrary measures. |
| Persistence and fields | `SavedDataStructure` saves formulas as text and named aggregates once; Bar settings reference IDs. The provider validates fields/references and exposes raw or calculated columns. [S10] | Aggregate results are not exposed by these field getters as ordinary calculated input columns. Settings serialization is an integration obligation for any future definition. |

Three counts must stay separate. `AggregateResult.sourceRowCount` is the source-row count. `AggregateResultRow.rowCount` is the number of reduction units: ordinary rows, or accepted nonconflicting ID units when `entityField` is used. Numeric contributors are the units actually included in a sum/average. Every source member can remain in `contributors` even when excluded. With a conflicting entity, some other contributors may be marked included while the **whole aggregate value is unavailable**; those flags do not authorize publishing a partial valid rate. [S04]

Count includes accepted units regardless of a missing measure. Sum/average return `undefined` with no numeric inputs; zero remains numeric. The authored aggregate tests contain examples for membership, invalid values, zero, and identity behavior, but those tests were **read, not run**. Pivot `count(field)` counts its supplied values rather than promising SQL's nonnull `count(field)` semantics. Pivot `countUnique` uses its own value set; it is not the shared `entityField` contract. [S04, S08]

Filter agreement needs a later runtime check. `getAggregateResult(id, sourceIds)` uses explicit IDs when supplied, otherwise global filtered IDs. `useGetLiveIds` reads chart-specific live membership and optional facet IDs. `useGetAllIds(settings)` applies chart `localFilters`, so “all” need not mean all imported rows. The Bar documentation itself warns that named summaries can have a different scope from category counts. Missing callers prevent a stronger end-to-end conclusion. Compare actual ID sets before comparing numbers. [S07, S10, S11]

## 1. Product boundary: compare the four alternatives

| Alternative | Useful boundary and cost | Disposition and falsifier |
| --- | --- | --- |
| **Defer reusable rates** | Preserve current reductions and first-pass workflows. No public API, settings migration, or new maintenance surface. A real future author might still have to divide two totals elsewhere. | **Preferred now, GR01.** Revisit only when a named repeated decision depends on a rate that simpler options fail to support acceptably. |
| **Docs/example recipe** | Show numeric 0/1 indicators over an explicit eligible set, basic totals, and correct chart normalization. Small explanation/example cost; scope and missingness still require verification. | **First simpler option, GR02.** If the author succeeds with the recipe and accepts its workflow, reject a new API. Do not promise all rates are indicator averages. |
| **Upstream SQL or prepared rows** | Author the numerator, denominator, eligibility, grouping, and sufficient totals before explorEDA receives data. Keep raw inputs and a membership ledger. Preparation/requery and two output grains can cost effort. | **Preferred fallback for a fixed analytical scope, GR04.** Reject an in-app rate API if this satisfies the real workflow. Fails the proof if required raw-row filters or regrouping cannot preserve meaning without unacceptable repeated preparation. |
| **One bounded shared rate** | Potentially reuse one explicit ratio of additive totals in two consumers and expose both contributor sets. Requires choices for identity, eligibility, filters, traces, validation, persistence, export, and history. | **Not earned, GR07.** Only consider after repeated real use, simpler-option failure, and explicit numerator/denominator/population policy. No syntax or milestone is selected here. |

The concrete remaining **capability limitation** is displaying an arbitrary ratio of two independently accumulated measures consistently at both grouped and pooled scopes through the inspected current controls. The **user failure** is unconfirmed. Two views on a synthetic dashboard do not turn that limitation into demand. Existing row indicators can already solve one important class of count proportions. Prepared output can solve some fixed-scope ratios. [S02–S08]

## 2. Meaning: denominator choices determine the question

Let `M` be a group's selected source members, `E` its declared eligible analytical units, `n_i` a numerator contribution, and `d_i` a denominator contribution. The formulas below are mathematical definitions and deductions, not observed product demand.

| Calculation | Definition and intended weighting | When it agrees with a pooled rate |
| --- | --- | --- |
| Count proportion | `count(successful eligible units) / count(eligible units)` | Each denominator unit is one opportunity and each numerator unit is its qualifying subset. |
| Ratio of totals | `sum(n_i over E) / sum(d_i over E)` | This is the pooled definition when numerator and denominator contributions are additive at that grain. |
| Unweighted mean of row ratios | `mean(n_i / d_i over E)` | Each row has equal influence. Equal denominators are a sufficient condition for equality with the ratio of totals, not a necessary one. |
| Weighted mean | `sum(w_i * r_i) / sum(w_i)` | With `r_i = n_i/d_i`, identical eligible units, and positive `d_i`, choosing `w_i = d_i` recovers the ratio of totals. Other weights answer another question. |
| Share of category total | `series value / sum(series values in the category)` | It equals a conditional count proportion only when series form a mutually exclusive, exhaustive partition of the intended eligible population and use compatible counts. |

A **general count ratio** need not be a proportion or be bounded by one. For example, a hypothetical defects-per-inspected-part ratio can exceed one because a part can have multiple defects. The binary-indicator recipe applies only when the numerator counts a qualifying subset of the denominator units. Multiple defects per part require additive defect counts or an explicitly different outcome such as “part with any defect.”

For positive denominators, the difference between a ratio of totals and an unweighted row-ratio mean depends on association between row denominators and row ratios. Equality can happen accidentally even with unequal denominators. One agreeing example therefore does not establish a safe general recipe.

### When a binary mean is exactly a rate

Assign **1** to a qualifying eligible unit, **0** to a known nonqualifying eligible unit, and a separately identified missing result to an ineligible or unknown unit. If each eligible opportunity appears once, the average of the numeric 0/1 values is exactly the count proportion. The current shared average can supply that arithmetic to a card and grouped summary, provided their ID populations and identity settings agree. A percentage format changes representation only. [S04–S07; mathematical identity]

It fails the intended meaning when a row stands for unequal numbers of opportunities, unequal exposure, duplicated entities, unknown outcomes silently mapped to zero, or a population different from the requested denominator. A Boolean alone is not a guaranteed numeric indicator: the selected scalar numeric helper does not accept Booleans. Use deliberate numeric 0/1 values, and verify expression parsing and error propagation later. [S05]

### Populations and exceptional values

| Condition | Meaning that must be explicit | Disposition in this research |
| --- | --- | --- |
| Common eligibility | The same set contributes to both totals, such as runs with valid event count and positive measured exposure. | Adopted only for the synthetic exposure fixture below; no application default is chosen. |
| Separate eligibility | Numerator and denominator can come from different records or eligibility predicates. This can be legitimate for independently observed events and exposure or different cohorts. | Keep each set and its scientific relationship explicit. A common-mask future proof would not cover this task automatically; preparation remains the comparator. |
| Missing/invalid input | An unknown numerator is not evidence of zero events. Invalid exposure cannot silently become zero exposure. | Preserve raw membership and exclusion reasons. State which side, or both sides, excludes each record. |
| Zero numerator, positive denominator | A measured absence of events during measured exposure. | Valid zero in the fixture; retain its denominator contribution. |
| Zero denominator | `0/0` is undefined; a positive numerator over zero exposure is also unavailable for this fixture. | Distinguish no exposure from a measured zero rate. Never fill with zero merely to make a chart render. |
| Negative denominator | Division can be arithmetically defined, but elapsed exposure is not negative in this hypothetical task. Signed balances could require another meaning. | Reject it for this fixture only. Units alone cannot justify the domain rule. |
| Empty group versus no eligible members | No selected members differs from members whose inputs cannot support the calculation. | Both lack a rate here, with distinct membership/exclusion evidence. Do not invent a new rendering policy for the existing app. |
| Negative or fractional numerator | May be valid for a signed net quantity, but not for the fixture's event count. | The fixture requires a finite nonnegative integer event count; another author must choose their own quantity rules. |
| Nonfinite input/result | `NaN` or infinity is not a finite measured contribution; finite inputs can also overflow a sum. | The scalar evaluator guards nonfinite results. No explicit accumulated-result finite guard is visible in `aggregateValues`; this is a static risk, not an observed defect. [S04, S05] |
| Filters | A filter can change numerator, denominator, or only a share's numerator, depending on the question. | Use the same selected cohort on both sides for the exposure fixture. Filter-removing shares require an explicit different contract. |
| Entity deduplication | One observation/identity can have several source rows. An ID may appear in multiple groups. | Preserve existing once-per and conflict behavior. Never replace entity validation with distinct numeric values or deduplication of already-computed rates. |

`summarizeGroup` treats `null`/`undefined` IDs as missing at its own boundary. It compares an entity's measure values with `Object.is` before numeric reduction. Consequently, numeric `30` and text `"30"` can conflict if they reach that boundary unchanged. Conflicting values make the whole result unavailable; missing IDs are excluded, with reasons. `poolAggregateRows` repeats identity checks over the pooled population, including an entity shared by different groups. Exact upstream coercion still depends on omitted parsing/conversion code. [S04]

A future two-field rate cannot infer entity agreement from equal row ratios. Pairs `(1,10)` and `(2,20)` have the same ratio but disagree on both additive contributions. Defining whether to combine, reject, or select a record would be a new product/domain policy. This research does not make that choice. The first hypothetical exposure fixture instead has one unique record per run.

## 3. Two-consumer hypotheses and independently recomputable examples

### A. Hypothetical engineering exposure task

| Dimension | Explicit hypothesis |
| --- | --- |
| Author and decision | A hypothetical reliability analyst, represented by Byron only if he later recognizes a real task, compares rig event intensity to decide which runs deserve inspection. No real analyst request is claimed. |
| Row grain | One unique endurance-test run, with stable `run_id`; repeated sensor observations are not interchangeable with runs. |
| Numerator | Total observed leak events on eligible runs. |
| Denominator | Total operating hours on those same eligible runs. |
| Units | Events per 100 operating hours. This is event intensity, not a percentage or probability; there is no intrinsic ceiling of 100. |
| Two consumers | A pooled Metric Card for the selected cohort, and a grouped Bar by rig. Both must expose source membership and the two totals. |

**Synthetic core inputs, not repository measurements:**

| Run / rig | Events | Operating hours |
| --- | ---: | ---: |
| R1 / A | 1 | 10 |
| R2 / A | 1 | 90 |
| R3 / B | 8 | 200 |

All three are eligible under the stated common-population rule.

- Rig A: `100 * (1 + 1) / (10 + 90) = 2` events/100 h.
- Rig B: `100 * 8 / 200 = 4` events/100 h.
- Pooled: `100 * 10 / 300 = 10/3 ≈ 3.333333` events/100 h.
- Unweighted mean of run rates: `(10 + 10/9 + 4) / 3 = 136/27 ≈ 5.037037` events/100 h.
- Unweighted mean of rig rates: `(2 + 4) / 2 = 3` events/100 h.
- Exposure-weighted run mean: `(10*10 + (10/9)*90 + 4*200) / 300 = 10/3` events/100 h.

The existing average reducer would correctly compute the unweighted mean of a row-rate field. That result would answer a different question from pooled exposure intensity; it is not a defect in averaging. Nor can averaging a prepared row per rig produce the pooled result here. Treating events and hours as two normalized series would divide events by events plus hours; that combines incompatible quantities and cannot represent this exposure rate.

**Eligibility stress inputs, added to the same three rows:**

| Run / rig | Events / hours | Explicit fixture treatment |
| --- | --- | --- |
| R4 / A | `null / 50` | Exclude from both totals: unknown event count. |
| R5 / A | `2 / null` | Exclude from both: missing exposure. |
| R6 / B | `0 / 0` | Exclude from both: no positive exposure. |
| R7 / B | `1 / -5` | Exclude from both: negative exposure is invalid for this task. |
| R8 / B | `"bad" / 20` | Exclude from both: invalid event input. |
| R9 / B | `0 / 40` | Include in both: observed zero events over positive exposure. |

The nine members have four eligible contributors: **R1, R2, R3, R9**. Rig A has members `{R1,R2,R4,R5}`, contributors `{R1,R2}`, numerator 2, denominator 100, rate 2. Rig B has members `{R3,R6,R7,R8,R9}`, contributors `{R3,R9}`, numerator 8, denominator 240, rate `10/3`. The whole cohort has numerator 10, denominator 340, rate `50/17 ≈ 2.941176` events/100 h. R9 alone is a valid zero. R6 alone has one member and no eligible exposure; an empty selection has no members. Both lack a rate, for different reasons.

For contrast, separately summing valid nonnegative event counts gives 13, and separately summing positive numeric exposure gives 410: `100*13/410 = 130/41 ≈ 3.170732`. If negative numeric exposure were also accepted, the denominator would be 405 and the rate `260/81 ≈ 3.209877`. These are independent arithmetic comparisons, **not observed explorEDA outputs**. They combine different sets and cannot be substituted for the common-population definition silently.

**Current-controls assessment:** the author can inspect and summarize events and hours separately, and compute row rates. No selected Metric Card, Bar, or Pivot setting divides the two reduced totals. A prepared one-row-per-rig table can show the per-rig rates, with average or sum valid only while one row represents each rig. Its global card average would be 3 on the core fixture, not `10/3`. Prepare a distinct pooled result or keep two total cards and the division upstream. Do not append a pooled “All rigs” row to per-rig data and then aggregate both grains. Prepared summaries lose arbitrary raw-run filter detail unless sufficient inputs and a recomputation route are retained. This is a boundary comparison, not evidence of unacceptable author effort. [S06–S10; inference]

### B. Existing flights example as a current-data comparator

The selected project declares flights keyed by `flight_id`, plus airline/weather lookups. Its carriers dashboard contains a count/median/mean Pivot, count and mean Metric Cards, filters, and a source table. It does **not** contain a requested reusable delay rate. Its guide's quantitative airline narrative cannot be independently recomputed because the CSVs are absent. The declarations establish the intended comparator structure, not actual join cardinality or demand. [S12]

| Dimension | Proposed comparator, not a new observed requirement |
| --- | --- |
| Author and decision | A hypothetical author of the existing carriers view compares the fraction of recorded departures with delay at least 15 minutes, then inspects the matching flights. |
| Row grain | One flight, conditional on validating unique `flight_id` and lookup cardinality in the actual data. |
| Numerator | Number of eligible flights with recorded numeric departure delay `>= 15`. This threshold is a fixture convention, not a sourced industry definition. |
| Denominator | Flights with recorded finite numeric departure delay in the selected population. Missing delay does not establish cancellation or zero delay. |
| Units and consumers | A proportion/percentage; Metric Card average of a numeric indicator and a grouped Bar average of the same indicator by airline. The existing Pivot can help inspect count/mean values. |

**Synthetic flight fixture:** F1/A has delay 30; F2/A delay 0; F3/B delay 20; F4–F10/B each delay 0; F11/A delay `null`; F12/B delay `"bad"`. These values are not taken from the absent flights dataset.

- Members: 12. Eligible numeric delays: F1–F10, count 10. Qualifying numerator: `{F1,F3}`, count 2.
- Airline A: `1/2 = 50%`; airline B: `1/8 = 12.5%`; pooled: `2/10 = 20%`.
- Mean of airline rates: `(50% + 12.5%)/2 = 31.25%`, which is not the pooled fraction.
- Numeric indicator values are 1 for F1/F3, 0 for other known delays, and unavailable for F11/F12. Averaging them gives exactly 20%. Encoding both unknowns as zero changes the result to `2/12 = 16⅔%` and changes the question.
- A count card comparing A's members with all members would show `3/12 = 25%` under those supplied populations. On the eligible cohort it would show `2/10 = 20%`. Neither is A's conditional delay fraction of 50%.

A 100% bar split by the numeric indicator can show the delayed share **only after eligibility removes unknown/invalid records and both indicator categories remain in the denominator**. If a filter retains only qualifying rows, the share becomes 100% of that altered population. A share label cannot repair the changed denominator. Exact UI/filter behavior remains proposed for verification. [S06, S07, S11]

This comparator is a plausible explanation recipe with existing controls. It is evidence against treating every rate as a reason for a new API. It also demonstrates why both `count(delay)` and a percentage format need explanatory copy.

## 4. Practical patterns from current official products

The comparison uses three relevant authoring patterns and five current primary pages, all accessed **2026-10-19**. No external product was operated. Product facts are deliberately narrow; implications are this research's inferences.

| Pattern and inspected fact | Relevance to this decision | Boundary not imported |
| --- | --- | --- |
| **JMP scientific summaries:** grouped Summary tables support explicit weight/frequency roles and link selected summary rows to source rows by default. N, missing count, and weight total are distinct statistics. [E01, E02] | An inspectable summary table is a useful alternative boundary. A mean already implies a contributor/weight denominator. | No claim that these pages establish a universal shared metric, all filter semantics, or one policy for negative weights. |
| **Power BI/DAX measures:** CALCULATE changes filter context; the official channel-share example removes the channel filter only in the denominator. DIVIDE returns blank on zero by default or a specified constant. [E03, E04] | Separate denominator populations and zero handling can be explicit authoring decisions. | The example is a share. Its context machinery and default are not requirements for this personal project. |
| **DuckDB preparation:** GROUP BY determines output groups; FILTER can restrict individual aggregates; count of rows differs from count of nonnull values. Sum/average ignore nulls; empty sums are null; weighted averages skip null weights. [E05] | Upstream output can carry additive totals, contributor counts, and declared grain. It is a comparator without adding a database driver to explorEDA. | DISTINCT values are not entity agreement. The inspected page does not choose this task's zero/negative-weight policy or make a prepared summary responsive to arbitrary later raw-row filters. |

The common lesson is to preserve the author’s quantity and population choices. The alternatives do not establish willingness to use, repeated need, performance targets, or a requirement to reproduce enterprise semantics.

## 5. Smallest proof and documentation obligation

**One conditional author task:** after the local trust journey, ask Byron to name a real decision and two occasions on which the same rate is needed. If no task appears, record “demand unconfirmed” and stop. If one appears, observe him answer it in two current views with a brief indicator/totals explanation and then an upstream prepared comparator. Use the synthetic fixtures above as arithmetic controls, not as the demand test. No public API is built for this observation.

Reject a new API if current controls plus the explanation are sufficient, if a prepared result at an accepted fixed grain is sufficient, if two views actually require different metrics/populations, or if the author does not expect to repeat the work. A runtime disagreement in source IDs, export, history, or restoration belongs to the existing trust initiative as a bounded repair before scope expansion.

Only a repeated real task that still fails the simpler routes can justify considering **one** shared ratio of totals. Its numerator, denominator, eligibility, identity, units, filter policy, and unavailable outcomes must already be explicit. A task requiring independent cohorts or unresolved two-field identity policy does not automatically fit a common-population proof.

All application checks remain **proposed**: exact values and contributor IDs before/after a cohort filter; valid zero and no-eligible/empty cases; missing and conflicting IDs; save/reopen of readable formulas, aggregate references, filters, and raw-data bundle; selection export and reimport at a declared grain; chart export with visible units/scope; undo/redo without changed arithmetic; and real controls at **1280, 783, and 390 CSS pixels**. The narrower checks assess access, overflow, and truthful labels; they do not alter README's declared desktop integration support. [S01, S10–S13]

If a user-visible explanatory or rate change is later selected, its exact owning destinations should include:

- `apps/demo/src/docs/pages/calculated-fields.mdx`, **In charts and tables**: within-row functions, eligible 0/1 values, and missing outcomes.
- `apps/demo/src/docs/pages/metric-card.mdx`, **How it reads**: numeric contributors, baseline comparison, and units.
- `apps/demo/src/docs/pages/bar.mdx`, **Selection and row scope** and **Series**: current category denominator and eligible indicator recipe.
- `apps/demo/src/docs/pages/pivot.mdx`, **How it reads**: row count versus valid-value count and totals recomputation; no formula-composition claim.
- Existing example destinations `apps/demo/public/daily-viz/projects/flights/carriers.eda` and `carriers.guide.md` for a verified indicator comparator. A science example would be an explicitly new conditional fixture beside the demo examples, with registration in `apps/demo/src/demos/examples.ts`, `coverage.ts`, and docs `live/examples.ts` after those omitted registries are inspected. No such file or example was changed now. [S01, S11, S12]

## Uncertainties and what could change the decision

- **Demand:** absent. Smallest unblock is a named repeated author task, not a wider competitive survey.
- **Scientific quantity:** unknown for real use. Exposure intensity, yield fraction, batch-average yield, and weighted estimates are different decisions; units alone do not identify them.
- **Population delivery:** source contracts and docs reveal distinctions, but missing renderers/crossfilter/population code prevent full integration verification. Smallest technical unblock is those exact files at this baseline or a runnable checkout of it for the already-defined local proof.
- **Prepared workflow acceptability:** unobserved. SQL correctness does not establish that fixed-grain preparation is sufficient or too burdensome.
- **Identity:** raw field equality and cross-group dedup are observed. A numerator/denominator pair policy is unchosen and must not be guessed.
- **Lifecycle and docs:** serializer source is present; undo, Dashboard text, and UI export paths are incomplete. Their success is unclaimed.
- **Historical context:** supplied reports record PR451 preparation, PR452 freshness, PR455 missingness, and PR456 relationships as completed research cycles, and PR454 as time-series-axis owner. Their proofs remain proposed unless independently run; this run did not check merge state. [S13]

Deferral would change only with real repeated need, explicit meaning, failure of acceptable simpler routes, and enough exact-source/runtime evidence to preserve the trust contract. Confidence is **high in deferral under the stated evidence**, **high in the arithmetic distinctions**, and **limited for unexecuted UI integration**.

## Checks actually run and artifact contract

- Read and classified the 38 supplied entries; checked every embedded size/hash and the whole-packet receipt.
- Read current official E01–E05 pages and relevant sections. Earlier candidates and historical recommendations were treated as context, not current product behavior.
- Executed **47 independent synthetic arithmetic/population and upstream-SQL assertions**, using Python fractions and Python's standard-library SQLite **3.53.1** in memory. They cover the core/stress exposure values, flight indicator values, reviewed eligibility flags, duplicate-pair arithmetic, and SQL population/total results for all/A/B/zero/no-eligible/empty selections. No explorEDA module was imported or executed. This is not a DuckDB execution or a product test result.
- Validated the final four UTF-8 Markdown files, their manifest hashes/byte sizes, and exact ZIP member-byte equality during packaging. The independently recomputable fixture and run sheet are included in the standalone proof report.
- **Not run:** pnpm, application tests, TypeScript checks, browser/author sessions, app save/reopen, UI export, undo/redo, responsiveness, benchmarks, or PR operations. No repository mutations or product approval occurred.

The delivery consists of `grouped-rates-decision.md`, `recommendations.md`, `proof-plan.md`, and `research-queue.md`; `grouped-rates-research.zip` contains those exact four files plus `manifest.json`, which is also supplied standalone. The manifest records each Markdown file's byte size and SHA-256, the input receipt, and the source-entry ledger. The manifest does not hash itself; an archive hash is recorded outside the archive to avoid a circular definition.

## Repository source ledger

All paths below were read from the authorized packet. They are locators within baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, not claims of a live GitHub fetch. The separately supplied manifest retains all 38 per-file receipt hashes; this ledger names every accessed path and the relevant symbols or sections.

| ID | Exact selected paths | Relevant evidence |
| --- | --- | --- |
| S01 | `AGENTS.md`; `docs/agent-guide.md`; `README.md`; `package.json` | Working rules; docs/demo obligation; browser widths; history/export paths; React/TypeScript and pnpm boundary. |
| S02 | `docs/intent/reusable-analysis-metrics/intent-brief.md`; `docs/intent/reusable-analysis-metrics/references/pro-candidates.json` | My read; Boundaries; Expansion trigger; demand unconfirmed; historical candidate warnings. |
| S03 | `docs/intent/reusable-analysis-outputs/intent-brief.md`; `docs/intent/current-analysis-trust/intent-brief.md`; `docs/intent/comparison-opportunities/resources/product-feedback-2026-10-06.md` | Actual reuse task gate; first local trust proof; scientific direction and unknown additional measure demand. |
| S04 | `packages/explorEDA/src/lib/aggregates.ts`; `packages/explorEDA/src/lib/aggregates.test.ts` | `AggregateSpec`, `aggregateValues`, `summarizeGroup`, `calculateGroupedAggregate`, `poolAggregateRows`; authored tests. |
| S05 | `packages/explorEDA/src/lib/calculations/types.ts`; `packages/explorEDA/src/lib/calculations/functions/registry.ts`; `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` | `CalculationContext`, `calculationFunctions`, `numericValue`, `Calculator.evaluate/value/evaluateValue`. |
| S06 | `packages/explorEDA/src/components/charts/MetricCard/definition.ts`; `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`; `packages/explorEDA/src/components/charts/MetricCard/MetricCard.test.tsx` | `MetricCardSettings`, `planMetricCard`, share/delta branches; authored tests. |
| S07 | `packages/explorEDA/src/components/charts/BarChart/definition.ts`; `packages/explorEDA/src/components/charts/BarChart/barPlan.ts`; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts`; `packages/explorEDA/src/components/charts/BarChart/barPlan.test.ts` | `BarChartSettings`, `BarSnapshot`, named aggregate input, percent denominator, nonadditive restrictions; authored tests. |
| S08 | `packages/explorEDA/src/components/charts/PivotTable/definition.ts`; `packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts` | Value-field reducer settings, `aggregate`, `generateCell`, `countUnique`, totals. |
| S09 | `packages/explorEDA/src/components/charts/Composition/calculations.ts` | `calcRows`, `evaluateCalc`, `describeCalc`, population/filter scope. |
| S10 | `packages/explorEDA/src/types/SavedDataStructure.ts`; `packages/explorEDA/src/utils/saveDataUtils.ts`; `packages/explorEDA/src/providers/DataLayerProvider.tsx`; `packages/explorEDA/src/components/charts/useGetLiveData.tsx` | Saved settings/analysis types; `isAggregateSpec`, `validateSavedData`, serialization; `validateAggregateState`, aggregate CRUD/getters, column getters, save/restore, state callbacks; live/all ID hooks. |
| S11 | `apps/demo/src/docs/pages/calculated-fields.mdx`; `apps/demo/src/docs/pages/metric-card.mdx`; `apps/demo/src/docs/pages/bar.mdx`; `apps/demo/src/docs/pages/pivot.mdx` | Existing explanatory sections and live-example IDs; explicit named-summary scope warning. |
| S12 | `apps/demo/public/daily-viz/projects/flights/exploreda.eda`; `apps/demo/public/daily-viz/projects/flights/carriers.eda`; `apps/demo/public/daily-viz/projects/flights/carriers.guide.md` | Source/key/lookup declarations; carriers Pivot/cards/table; guide narrative, not recomputed data. |
| S13 | `tmp/pro-grouped-rates-2026-10-19/previous-research-summary.md`; `docs/research/grouped-rates-2026-10-19/pro-prompt.md`; `docs/research/grouped-rates-2026-10-19/research-queue.md` | Historical relationship summary, local mission and continuing queue. Local research additions are not implementation evidence. |

## Current primary-source register

- **E01 — JMP 19.2, Create a Summary Table.** URL: [https://www.jmp.com/support/help/en/19.2/jmp/create-a-summary-table-2.shtml](https://www.jmp.com/support/help/en/19.2/jmp/create-a-summary-table-2.shtml). Accessed **2026-10-19**; page publication date 2026-01-13. Relevant sections: introduction, `Summary`/`Group` example, `Weight`/`Freq` overrides, source-table link. Supports only the grouped-summary/role/link facts used above.
- **E02 — JMP 19.2, Explanation of Summary Statistics.** URL: [https://www.jmp.com/support/help/en/19.2/jmp/explanation-of-summary-statistics.shtml](https://www.jmp.com/support/help/en/19.2/jmp/explanation-of-summary-statistics.shtml). Accessed **2026-10-19**; page publication date 2026-01-13. Relevant sections: **N**, **Mean**, **N Missing**, **Sum Wgt**, **% of Total**. Mean uses the weighted sum when a weight role is assigned; without weights, Sum Wgt is the nonmissing count. This does not select a scientific weighting policy.
- **E03 — Microsoft Learn, CALCULATE (DAX).** URL: [https://learn.microsoft.com/en-us/dax/calculate-function-dax](https://learn.microsoft.com/en-us/dax/calculate-function-dax). Accessed **2026-10-19**; displayed update 2026-08-04. Relevant sections: **Filter modifier functions**, **Remarks**, **Examples: Revenue % Total Channel**. Ordinary filters can replace existing filters on the same columns unless preservation is requested; the inspected example explicitly changes denominator context.
- **E04 — Microsoft Learn, DIVIDE (DAX).** URL: [https://learn.microsoft.com/en-us/dax/divide-function-dax](https://learn.microsoft.com/en-us/dax/divide-function-dax). Accessed **2026-10-19**; displayed update 2024-04-25. Relevant sections: **Parameters**, **Remarks**, zero-denominator examples. The current inspected page specifies blank by default and a constant alternate result. No domain-specific negative-denominator inference is drawn.
- **E05 — DuckDB, Aggregate Functions.** URL: [https://duckdb.org/docs/current/sql/functions/aggregates](https://duckdb.org/docs/current/sql/functions/aggregates). Accessed **2026-10-19**; current-page header **1.5**. Relevant sections: **Examples**, **Syntax**, **DISTINCT Clause**, **Handling NULL Values**, `count`, `avg`, `sum`, `weighted_avg`. Product behavior is limited to these inspected aggregate semantics; the SQL audit used SQLite independently.

No decisive external claim rests solely on recollection. Optional sources scouted during research were not used to expand the comparison or the product recommendation.
