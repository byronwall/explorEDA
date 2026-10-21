# Evidence and comparisons: retention observation completeness

**Research date:** October 20, 2026, America/Indianapolis (October 21, 2026 UTC).  
**Repository and baseline:** [byronwall/explorEDA at 9b16d78e3ed0742ed4d5858c1939fec9e758b510](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510).  
**Method:** authenticated selected-source reading, exact-file supplemental retrieval, live primary-document review, and independent arithmetic. No application or vendor interface was executed.

## 1. Finding and evidence standard

The current chart can answer which members of each entry cohort have qualifying **recorded activity in each elapsed UTC calendar period**. It cannot infer uninterrupted collection, a genuinely quiet tail, or an entity's complete prior entry history from the event rows alone. The supported decision is to retain the snapshot contract and investigate a narrow task before changing it. Six recommendations, RO01–RO06, are developed in the [decision report](decision-report.md); the [proof plan](proof-plan.md) supplies exact counterexamples.

Claims have four distinct statuses:

- **Observed source fact (S):** directly read code, comments, tests, docs, authenticated packet metadata, or retrieved repository metadata.
- **External fact (E):** current primary documentation, with a direct URL and retrieval date. This proves a documented contract, not an operated product result.
- **Inference (I):** a conclusion derived from the inputs or independently calculated fixture. It can be strongly established without constituting application acceptance.
- **Proposal (P):** a possible product decision, task, or validation step. No implementation approval is implied.

No popularity, customer-demand, actual-outage, or production-quality claim is supported by this evidence.

## 2. Access preflight and provenance

**GO for this bounded source study.** The packet identifies the owner, repository, and exact baseline, and includes the essential retention implementation. The missing filter dependency and facet call chain were retrieved at the same commit. No decisive source dependency remains missing for the contract analyzed here.

| Evidence item | Check and result |
| --- | --- |
| Selected-source packet | 319,350 bytes; SHA-256 **5534f51a533d8cfeeb0f938396ac3cc7e4bc3f0ed0c19b967879c64cd08b2829**. |
| Entry authentication | All **32/32** declared byte counts and SHA-256 values matched extracted UTF-8 content; file delimiters also matched. |
| Packet categories | **29 baseline files**, **2 local additions**, **1 historical handoff summary**. The categories were preserved. |
| Attached prompt | 10,836 bytes; SHA-256 **1baafa002e31eb6e64ea8cd2ea7f4345da8146a71e1b1f046358c937a41c9ded**. It exactly matches the packet's local prompt addition. |
| Baseline identity | The GitHub commit endpoint returned the supplied commit, canonical repository URL, and its October 19, 2026 UTC commit date. No claim is made that this is a newly checked current main HEAD. |
| Remote baseline cross-check | Planner, Retention definition, DataLayerProvider, and valueParsing were fetched at the pin. All four match the packet bytes and locally reconstructed Git blob IDs. |
| Supplemental baseline source | Seven exact files outside the packet were fetched for the filter and facet path. Local blob IDs match connector-reported IDs. See the inventory below. |
| Historical identity | The packet summary exactly matches README.md in the original analysis-handoff-2026-10-20 folder at **ae2716a2a1f7984ef552f368a0ba9aba93e10f05**. That commit's prior research-queue.md was also read. |
| Execution | The selected text snapshot is **not a runnable checkout**. No repository tests, builds, generators, browser actions, or product scripts were run. |

Packet hashing authenticates consistency against the supplied declarations; it is not a signature from an independent publisher. The four remote baseline comparisons, historical summary comparison, and supplemental blob checks provide additional provenance, without claiming that all 29 baseline files were independently downloaded again.

Direct web fetches of the repository's raw/blob paths returned DisabledError. The authorized GitHub connector succeeded at pinned paths. No missing-file request or NO-GO stop was necessary. No worktree, repository mutation, or unrelated account access was used.

### Reading route and authority

The review covered AGENTS.md, README, agent guide, coding standards, UI defaults, trust/domain/calendar/date intents, current Retention and Funnel docs, planner and component test source, definition/renderer/trace/settings, provider and population helpers, parsing and calendar utilities, registry, synthetic generator, and example catalogue.

The domain intent and implementation plan contain future-tense delivery language. They establish historical design intent; **registerAllCharts** and the current implementations establish delivered status. The calendar and date intents identify adjacent ownership, not approval to redesign Retention. The historical handoff supplies queue/export boundaries, not fresh acceptance evidence. Its links are resolved against its original pinned folder, not the relocated packet path.

## 3. Checked repository facts

### S01. Delivered behavior and defaults

**registerAllCharts** registers Funnel, Retention, and Timeline at lines 53–55. Retention's definition supplies an eight-period weekly default, entity/time selection, optional entry and activity events, and a value-based entity selection. **RetentionSettingsPanel** permits 1–24 displayed periods and clears the previous selection when its domain settings change. The chart is delivered; an observation-end input is absent from the inspected retention interface and settings. [Registry][registry] · [definition][definition] · [settings][settings]

The example catalogue already has **product-retention**, using the same synthetic event log as Funnel. The generator declares 2,000 fictional visitors, a fixed seed, a January–June 2025 generation interval, return-session sampling, and anonymous rows. Its END constant limits generated events; it is not passed to **planRetention**. The catalogue's row-count label was read, not independently regenerated or accepted. These sources establish an example, not demand or collection reliability. [Examples][examples] · [generator][generator]

### S02. Entry, activity, and denominator are distinct

**planRetention**, lines 140–175, builds entities from **ids**, rejects missing entity/readable-time inputs, sorts each entity's surviving rows, and chooses the first matching entry. Lines 199–216 increment cohort size once, store one entry row, skip events before entry, and count an entity once per activity period. Therefore:

- The entry search is within the current live event subset. “First” does not guarantee first-ever history.
- Explicit activity qualification preserves entry rows; peer event filtering can remove them.
- A separate activity event means period zero need not be 100%.
- A skipped activity period can be followed by a return.
- **cell.rows** is one representative qualifying event per active entity, whereas **entryRows** represents cohort membership.

These are observed implementation facts, not proposals to replace filtered-entry semantics. [Planner][plan]

### S03. Horizon scope is broader than activity scope

**Retention.tsx**, lines 65–66 and 94–104, passes **liveIds** and **allIds** separately. **useGetAllIds** restricts the store's data IDs only to the chart's local population. **useGetLiveIds** filters positive Crossfilter group counts and intersects nonempty facet IDs. [Renderer][render] · [helpers][helpers]

The trace follows **DataLayerProvider.getLiveItems** (lines 1176–1182) and **CrossfilterWrapper.getAllData** (lines 195–204), with one dimension/group per chart, local population filtering after grouping, and workspace dimensions. The inspected wrapper tests assert peer/local scope, workspace narrowing, and own-dimension exclusion in the workspace case. Source and the standard dimension-group structure support the ordinary linked-mode contract; no new execution of that behavior is claimed. **localSelections** suppresses chart-selection propagation while retaining workspace filters. [Provider][provider] · [wrapper][wrapper] · [wrapper tests][wrapper-tests]

FacetContainer constructs facet members from chart-local all IDs. The normal wrap/grid render paths pass those member IDs with the unchanged chart settings; Retention only applies the facet IDs to its live inputs. Facets therefore share the chart-local horizon. A changing facet value can separately change which entry rows survive. Empty facet combinations and the helper's empty-array convention were not promoted into an unsupported defect claim. [Facet container][facets] · [facet wrap][facet-wrap] · [facet grid][facet-grid]

### S04. Calendar rules and exact flags

Retention defines its own **periodStart**, **periodEnd**, **periodsBetween**, and **addPeriods**. They use UTC, Monday-start weeks, and calendar months. **dailyRollup.utcPeriod** is adjacent source; Retention does not call it and does not inherit its optional Sunday week start. **timestampOf** is the central parser actually imported by the planner. [Planner][plan] · [rollup][rollup] · [parsing][parsing]

The exact computational contract is:

~~~text
H = maximum readable timestamp among allIds
L = start of the UTC day/week/month containing H
D = midnight immediately after the UTC date containing H

observed(cell) = cell.period_start <= L
partial(cell) = observed(cell) AND cell.period_end > D

rate(cohort, period) = recorded_active_entities / cohort_size
                      only when the cell is observed
~~~

**I, direct consequence:** observed daily cells cannot be partial. A weekly/monthly cell is nonpartial if H lies anywhere on its last UTC date. This is a day-resolution contract, not proof that the rest of the last day was recorded. **S:** the docs' blanket statement that the ending period is hatched and the planner's broad comment do not name these exceptions. This is a source/prose discrepancy; the appropriate resolution could be precise copy or deliberately different semantics. It is not an executed rendering bug. [Planner, lines 178–191][plan] · [docs][docs]

### S05. Future, zero, partial, and All presentation

Future cells have observed=false and are omitted by **cellAt**. Reached cells with no recorded activity show zero. Partial cohort cells already have a hatch, label/hover indications, and a **RetentionTraceBody** explanation. Do not propose these as missing functionality. [Renderer][render] · [trace][trace]

**summary**, lines 226–235, includes every observed cohort cell and its entire cohort denominator, including partial cells. Its rate is the pooled numerator divided by the pooled denominator. **RetentionSummaryCell** has no partial field. All's renderer is noninteractive and has no corresponding hatch or trace; it uses all plan cohorts even when display space hides older cohort rows. [Planner][plan] · [renderer][render]

**I:** the proof's All Week 1 is 2/3 when partial cohorts contribute and 1/2 when they do not. That change answers a different summary question. “Nonpartial under the current flag,” “fully elapsed by an exact instant,” and “completely collected” are three separate predicates.

### S06. Contributor inspection and linked selection

The trace shows the cohort count, recorded active count, rate, rule, and representative activity rows; it does not enumerate the entire denominator membership. A selected cell stores active entity values, so its own predicate admits all their events. Other peer/workspace filters and the receiving chart's population still constrain the linked result. A zero-active cell clears the current entity selection. This preserves the distinction among source events, active entities, entry rows, and denominator members. [Definition][definition] · [renderer][render] · [trace][trace]

### S07. Tests read, not run

The selected planner tests contain expectations for weekly entry and activity, duplicate activity, skip/return behavior, future/partial flags at a midweek horizon, pooling, missing entry, default entry, month crossing, and Monday weeks. The component tests assert labels, entity-linked selection in an otherwise unfiltered fixture, trace text, and saved-data/dashboard-text round trips. None was run here. [Planner tests][plan-tests] · [component tests][render-tests]

The two selected retention test files do not cover the new proof's last-day rounding, daily intraday cutoff, collection-history counterfactuals, facet horizon scope, session-only entry removal, or a summary partial cue. This is a statement about those files, not an exhaustive assertion that the repository contains no such test anywhere.

## 4. Current primary-source comparisons

**All URLs in this section were retrieved live on October 20, 2026, America/Indianapolis / October 21, 2026 UTC.** Official documentation was opened and checked; current public pages are mutable. Product operation and account configuration were not tested.

### E01. Amplitude — time, mode, and overall eligibility are explicit decisions

- [How time works](https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-time): default day windows are rolling 24 hours, with hourly rounding; rolling weeks/months are seven/30 days. Calendar mode uses project timezone, configurable week start, and calendar months. Starts on multiple calendar dates may place a user in multiple entry-date cohorts.
- [Calculation](https://amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-calculation): Return On measures a specific interval; Return On or After includes later returns.
- [FAQ](https://amplitude.com/docs/analytics/charts/retention-analysis/faq): unfinished cells are marked and omitted from the overall calculation until eligible.

**I:** a completed-period summary is a legitimate comparison arm, but the time and entry contracts must be aligned before comparing numbers. Clear definitions are more transferable than the full option list. The checked time page contains confusing example dates; its explicit interval definitions, not that example, support this summary.

### E02. Mixpanel — incomplete buckets are distinct from the average

[Retention documentation](https://docs.mixpanel.com/docs/reports/retention) defines default entry-relative rolling windows and optional calendar periods. Day 1 is 24–48 hours in the former. Default On or After differs from exact-period On; repeated starting events can place a person in several buckets. Unfinished buckets are marked; Average Retention uses completed buckets.

**Limit:** the FAQ describes weighting but gives an internally inconsistent worked example. Its calculation is not used as a pooled-ratio oracle. The exclusion statement is clear; numeric equivalence to explorEDA is not established. **I:** test eligibility separately, rather than importing a competitor's average or mode defaults.

### E03. PostHog — entry and denominator choices need their own names

[Retention documentation](https://posthog.com/docs/product-analytics/retention) distinguishes first occurrence inside the insight range, first ever, and recurring entry. It offers hour/day/week/month periods, defaults to On, and offers On or After. Initial-cohort versus previous-period denominators and weighted versus simple means are separate options. In-progress periods have a tooltip.

**Limit:** the checked article does not establish exact timezone/week-start/rolling alignment or whether incomplete cells enter the means. Its generic one-cohort guidance cannot safely be extended over recurring entry. **I:** do not invent parity for these unspecified contracts or assume its period-zero explanation applies to explorEDA's distinct signup/session rules.

### E04. GA4 — “rolling” can mean consecutive return

[Cohort exploration](https://support.google.com/analytics/answer/9670133?hl=en) uses property-timezone days, Sunday–Saturday weeks, and calendar months. Standard counts return activity in the particular period. Rolling requires return in that and every previous period. Cumulative counts qualifying return through that period. Inclusion criteria and device-based identity also differ from this event-entity chart.

**Limit:** the checked article does not specify incomplete-bin presentation or summary exclusion. **I:** its rolling mode is a consecutive-return question, not an alternative name for entry-relative time windows. A shared label does not imply a shared estimand.

### E05. GA4 BigQuery export — source processing has a separate completeness contract

[BigQuery Export](https://support.google.com/analytics/answer/9358801?hl=en) describes streaming as best effort, without a completeness service-level objective, and permits gaps. The separate 360 Daily/Fresh Daily completeness signal concerns processed export-day flow, including later arrivals; it is not strictly original event-time completeness. Daily tables can receive later updates.

**I:** a recent event and a completed export are different facts; neither alone proves complete original instrumentation. This product-specific mechanism explains why authoritative coverage belongs to a source contract. It provides no reason to add a generic watermark service to explorEDA. No streaming failure is alleged for the supplied data.

### E06. NIST — censoring and survival have a different target quantity

[Censoring](https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm) describes known observation/run times with exact failures, survivals through an end, or known failure intervals. [Kaplan–Meier](https://www.itl.nist.gov/div898/handbook/apr/section2/apr215.htm) estimates a time-to-failure distribution using failure times and changing risk sets; censored units leave those sets after their observed time.

**I:** an inactive retention period can be followed by activity. The fixed cohort denominator and period-specific activity fraction are therefore a different estimand from survival to a terminal event. A collection interruption is missing observation, not automatically valid right censoring. An endpoint setting would not turn inactivity into failure or justify a survival model.

### Comparison conclusion

The reviewed products support distinguishing period alignment, entry scope, retention mode, unfinished-bin handling, and summary eligibility. They do not establish which additional option explorEDA users need. Unknown product details remain unknown; a missing statement in one page is not evidence that a feature is absent.

The useful transfer is methodological: state the counted entity, entry rule, activity rule, calendar interval, and denominator; show what observation facts are and are not supplied. Keep the existing chart family and preserve contributor inspection.

## 5. What event rows alone cannot decide

### I01. Non-identifiability

Let R be the recorded event set. World Q records all qualifying events through a known end and then has a quiet tail. World M loses collection during that same tail, with unknown underlying behavior. If the observed rows R are identical, every deterministic calculation using only R is identical. No automatic threshold on event density, maximum time, or a nearby entity's activity can identify the true world without additional assumptions or evidence.

This is why a 0% cell currently means no qualifying activity **recorded in the relevant input**, not proven absence of behavior. It also explains why a future blank does not prove the real period is still in the future: the chart uses a snapshot maximum, not the current clock.

### I02. Several unavailable decisions remain separate

| Desired conclusion | Missing evidence |
| --- | --- |
| A quiet interval was completely observed | Coverage of the relevant event types and population for the whole interval, including the treatment of delayed arrivals. |
| A maximum applies to every cohort or facet | A common coverage scope. Activity from one entity is insufficient. |
| This is an entity's initial entry | Earlier event history or an authoritative entry fact. A filtered extract cannot recover removed history. |
| A known interruption can be excluded safely | Its interval, scope, and an explicit analytical policy. Removing denominator members changes the question. |
| A summary should omit partial cohorts | The user's comparison task and chosen exposure-eligibility rule; this is a product/method decision. |
| A source processing marker proves observed behavior | The marker's actual contract, event-time scope, and relationship to original collection. |

### P01. A concrete upstream representation to compare, if earned

A task-specific authored table could use cohort, elapsed period, recorded active count, cohort size, coverage status, and supporting source references. These are possible columns for one proof, not a universal schema or proposed library interface.

| Same cohort-period | Recorded fraction | Honest result under the authored premise |
| --- | --- | --- |
| Jan 6 cohort, week 3, quiet-complete card | 0 recorded active / 2 cohort members | A complete 0% for that task's declared population and events. |
| Same rows and cohort, known interruption card | 0 recorded active / 2 cohort members | Full-period activity unknown; preserve the recorded count but do not present a complete retention estimate. |
| Same rows, no coverage card | 0 recorded active / 2 cohort members | Coverage unknown; no automatic zero imputation. |

The current native Retention input cannot consume that aggregate table as if it were an event log. Existing tabular/heatmap presentation is an option to assess, with upstream calculation and explicit contributor references. Keeping only aggregate rows can lose the native cell-to-entity-to-events path; preserving detailed membership increases authoring cost. Thus upstream preparation is a candidate, not an assumed low-cost winner.

### P02. A single end remains insufficient for several tasks

An explicit shared end could distinguish a genuinely known quiet tail from the current event horizon. It cannot, by itself, rule out a gap before that end, assign a different follow-up end to each entity, or recover missing initial-entry events. A chosen analysis cutoff also differs from an assertion of complete observation through that cutoff.

Before a scalar input is even compared, obtain the named task, applicable population/event types, relevant coverage start/history, end instant and convention, provenance, and interruption/late-arrival policy. If coverage varies by cohort or entity, do not silently use the maximum, minimum, or a changing denominator. Per-entity engines, automatic inference, and broad ingestion remain outside this mission.

## 6. Deferral and current controls

**S/I.** Entry and activity settings already express “signup cohorts returning with sessions.” A peer session-only filter asks a different event-subset question. A chart-local source/segment filter can prevent an unrelated population from setting the horizon when a trustworthy field identifies it. Faceting alone cannot do that. Shortening the displayed period count can avoid interpreting a tail but does not establish its coverage. A date population filter can also remove entry history, so it is not a neutral observation-end substitute.

**P.** Compare the four alternatives on interpretation, author effort, contributor inspection, and maintenance, using the same task and inputs. The decision report's scores are explicit local judgments, not measured outcomes. One consequential failure may be enough to earn a comparison; requiring every alternative to fail sequentially would make deferral unnecessarily hard to falsify.

Even a lesson remains conditional. Existing docs and trace may suffice; additional prose adds discovery and maintenance costs. Explanation can make unknown coverage legible, but cannot manufacture it. If a reader correctly understands the present contract, the appropriate result is no new lesson or control.

## 7. Queue and execution boundaries

The local trust intent remains the first executed proof: compare one selected category across a bar, card, and exported rows, then undo, redo, and reopen. This research did not run that task. [Trust intent][trust]

GitHub metadata retrieved this session reports PR451, PR452, PR454, and PR455–460 as **open and unmerged**. Their descriptions identify preparation, freshness, time-series axes, missingness, relationships, rates, navigation, units, and handoff respectively. “Completed surveys” means research work exists; it does not mean those PRs are merged or their proposed product changes delivered. Their reported validation is not inherited as this run's acceptance.

- [PR451: preparation](https://github.com/byronwall/explorEDA/pull/451) and [PR452: freshness](https://github.com/byronwall/explorEDA/pull/452): apply existing task gates; no new ingestion or shared transaction project.
- [PR454: time-series axes](https://github.com/byronwall/explorEDA/pull/454): retain its ownership; this mission does not re-open axes or rolling summaries.
- [PR455](https://github.com/byronwall/explorEDA/pull/455), [PR456](https://github.com/byronwall/explorEDA/pull/456), [PR457](https://github.com/byronwall/explorEDA/pull/457), [PR458](https://github.com/byronwall/explorEDA/pull/458), [PR459](https://github.com/byronwall/explorEDA/pull/459), and [PR460](https://github.com/byronwall/explorEDA/pull/460): preserve the completed survey boundaries and require named-task evidence before expansion.

The historical [handoff summary][historical] and [prior queue][historical-queue] were read at their own full commit pin. The prior queue's proposal to research a new event-log chart family is superseded by the delivered registry. Export semantics summarized there remain historical context rather than freshly executed export proof.

**Performed:** byte/hash checks, source reading, remote provenance comparisons, primary-document retrieval, and 16 independent arithmetic anchors. **Unrun:** application/tests/types/builds, generator, browser/keyboard, saved-state/export/history flows, performance, author comprehension, and vendor interfaces. Artifact integrity checks concern the reports and archive only.

## 8. Authenticated packet inventory

Each entry below matched its declared UTF-8 byte count and SHA-256. Baseline links use the exact baseline. Local additions are identified as supplied research inputs, not baseline files. The historical entry is linked to its verified original path.

- **P01 — baseline:** [AGENTS.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md)
  - UTF-8 bytes: **4,033**. SHA-256: `802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33`. **MATCH**.

- **P02 — baseline:** [README.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/README.md)
  - UTF-8 bytes: **10,263**. SHA-256: `1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28`. **MATCH**.

- **P03 — baseline:** [package.json](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/package.json)
  - UTF-8 bytes: **1,258**. SHA-256: `f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3`. **MATCH**.

- **P04 — baseline:** [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/CODING_STANDARDS.md)
  - UTF-8 bytes: **2,213**. SHA-256: `b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5`. **MATCH**.

- **P05 — baseline:** [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md)
  - UTF-8 bytes: **19,779**. SHA-256: `0992949f205d1ae72a8249c69bccb33f1eb70763b14a526a6384a7a91f9c9f00`. **MATCH**.

- **P06 — baseline:** [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/ui-defaults.md)
  - UTF-8 bytes: **19,093**. SHA-256: `93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a`. **MATCH**.

- **P07 — baseline:** [docs/intent/current-analysis-trust/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md)
  - UTF-8 bytes: **3,006**. SHA-256: `d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7`. **MATCH**.

- **P08 — baseline:** [docs/intent/domain-analysis-views/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/domain-analysis-views/intent-brief.md)
  - UTF-8 bytes: **3,708**. SHA-256: `317163b261edbfcddb4899842d9b4b390f577945ee038200ad79298f6ec88912`. **MATCH**.

- **P09 — baseline:** [docs/intent/domain-analysis-views/implementation-plan.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/domain-analysis-views/implementation-plan.md)
  - UTF-8 bytes: **6,912**. SHA-256: `74d86987ff2dd61851a9351e26b0ec095afd21d7a7b73620db569848406efba9`. **MATCH**.

- **P10 — baseline:** [docs/intent/domain-analysis-views/initiative-map.json](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/domain-analysis-views/initiative-map.json)
  - UTF-8 bytes: **27,375**. SHA-256: `f3e970697de079ebe65430392256ec15df3b2ab64c618121df97242eeab4a272`. **MATCH**.

- **P11 — baseline:** [docs/intent/calendar-period-analysis/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/calendar-period-analysis/intent-brief.md)
  - UTF-8 bytes: **3,041**. SHA-256: `34ada8c694eff0bbc940736552daa3027c06a6cda9d09944d679b97944a5fee1`. **MATCH**.

- **P12 — baseline:** [docs/intent/date-time-handling/intent-brief.md](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/date-time-handling/intent-brief.md)
  - UTF-8 bytes: **2,350**. SHA-256: `9dca96b99e5f1e8397f5811d2ab63193aba8295c429791822d3c4aa6b380c956`. **MATCH**.

- **P13 — baseline:** [apps/demo/src/docs/pages/retention.mdx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/retention.mdx)
  - UTF-8 bytes: **1,995**. SHA-256: `66a72d3fe297bcd4b989296260ea559a3ce3244a7841452e27f4169f7261dc7e`. **MATCH**.

- **P14 — baseline:** [apps/demo/src/docs/pages/funnel.mdx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/funnel.mdx)
  - UTF-8 bytes: **1,930**. SHA-256: `b071240cea1d301bc4ff1977a2c075675aaab50c23410a7a30844a13f2025786`. **MATCH**.

- **P15 — baseline:** [apps/data-samples/product_events.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/data-samples/product_events.ts)
  - UTF-8 bytes: **5,490**. SHA-256: `f7fb0fdec4f7970ac8a61c425de7844666f5659d2179ac594bfe31df61732bf4`. **MATCH**.

- **P16 — baseline:** [packages/explorEDA/src/components/charts/Retention/retentionPlan.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.ts)
  - UTF-8 bytes: **8,311**. SHA-256: `2cefa6a9cdb2a739fb7ed42e536cd6f06bcf5f228c4b3ad2a98f621d4e8bb7c4`. **MATCH**.

- **P17 — baseline:** [packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts)
  - UTF-8 bytes: **3,957**. SHA-256: `71c62181f366cac6f95327c4aebf1648a69e5b06f81efba1502b259740e8e831`. **MATCH**.

- **P18 — baseline:** [packages/explorEDA/src/components/charts/Retention/definition.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/definition.ts)
  - UTF-8 bytes: **2,440**. SHA-256: `a3b97d3a83c017e639f6114e53c3cee751c7a62fc152a2baacc81631a80ad0b4`. **MATCH**.

- **P19 — baseline:** [packages/explorEDA/src/components/charts/Retention/Retention.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.tsx)
  - UTF-8 bytes: **17,881**. SHA-256: `1f29a537217da6d060ea1dafd7832f62126f42feb7d2664afa6f47468eb7d7bb`. **MATCH**.

- **P20 — baseline:** [packages/explorEDA/src/components/charts/Retention/Retention.test.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.test.tsx)
  - UTF-8 bytes: **5,319**. SHA-256: `502592c06e590382953802ae209fc8c49e07e950aa9f4503a854912baa4dcf8b`. **MATCH**.

- **P21 — baseline:** [packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx)
  - UTF-8 bytes: **3,458**. SHA-256: `b64f8a64882787c186b92e929b3045621d891097051acb8a33293c62005e833d`. **MATCH**.

- **P22 — baseline:** [packages/explorEDA/src/components/charts/Retention/RetentionSettingsPanel.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionSettingsPanel.tsx)
  - UTF-8 bytes: **7,226**. SHA-256: `fff0a5193a15a4d16b07872ca2b315adc2834e4c48b18625913a3fd5b031052a`. **MATCH**.

- **P23 — baseline:** [packages/explorEDA/src/components/charts/useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx)
  - UTF-8 bytes: **2,222**. SHA-256: `6222156b36ba1d8accc05fd01888543a5bd4dc07b0673db01f74e27570a04478`. **MATCH**.

- **P24 — baseline:** [packages/explorEDA/src/lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts)
  - UTF-8 bytes: **1,425**. SHA-256: `3108817ced390197b9b90708d5ee76386c992470716d9326adbc12ce1d0bab86`. **MATCH**.

- **P25 — baseline:** [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts)
  - UTF-8 bytes: **10,226**. SHA-256: `18793ed3c9f09e3ac6c184fd658ad68b88f564c5c2d800bac7108188afd845d6`. **MATCH**.

- **P26 — baseline:** [packages/explorEDA/src/lib/dailyRollup.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dailyRollup.ts)
  - UTF-8 bytes: **5,589**. SHA-256: `89b04b18a22e617d7be09987aa5212523f2e1f8887f3f25471eaa2c53ffdd7c2`. **MATCH**.

- **P27 — baseline:** [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx)
  - UTF-8 bytes: **55,689**. SHA-256: `c0ab7260c912fb628d393e7cbae1c752e44db4a20e347d9ec07f755b3ae7771d`. **MATCH**.

- **P28 — baseline:** [packages/explorEDA/src/charts/registerAllCharts.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/charts/registerAllCharts.ts)
  - UTF-8 bytes: **3,384**. SHA-256: `fba92bb3564cde0e66c325e1fd0d9614da9a6a66d09fafa3ac1eca26eabd00f4`. **MATCH**.

- **P29 — baseline:** [apps/demo/src/demos/examples.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/examples.ts)
  - UTF-8 bytes: **56,494**. SHA-256: `b67518e290d939f719babdb5dc2723649701f8b60e4601f9a1d041b2aa8dfb93`. **MATCH**.

- **P30 — local addition:** docs/research/retention-observation-2026-10-21/pro-prompt.md
  - UTF-8 bytes: **10,836**. SHA-256: `1baafa002e31eb6e64ea8cd2ea7f4345da8146a71e1b1f046358c937a41c9ded`. **MATCH**.

- **P31 — local addition:** docs/research/retention-observation-2026-10-21/research-queue.md
  - UTF-8 bytes: **2,789**. SHA-256: `e242933dd6988ef51a111b138aebc2a873740284cb189ed873a20fa48e20e57b`. **MATCH**.

- **P32 — historical ae2716a2:** docs/research/retention-observation-2026-10-21/prior-handoff-summary.md; [verified original README](https://github.com/byronwall/explorEDA/blob/ae2716a2a1f7984ef552f368a0ba9aba93e10f05/docs/research/analysis-handoff-2026-10-20/README.md)
  - UTF-8 bytes: **2,670**. SHA-256: `cf822c778b74636d4f9393a630065e2ba045c2199c21da62a87ce36ee375336f`. **MATCH**.

## 9. Supplemental provenance and remote cross-checks

- [packages/explorEDA/src/components/PlotChartPanel.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/PlotChartPanel.tsx)
  - **42,150 bytes**; SHA-256 `0491886b1d275957947eab1ba38edf9cdedf5c44b599d6d99306d5833a937f3e`.
  - Git blob SHA-1 `2200120bc971c2d9435bc1b7c475c6249a38ef15`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/components/charts/ChartRenderer.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/ChartRenderer.tsx)
  - **1,941 bytes**; SHA-256 `1a4955f172d078e340f737122846af5bdc4590a3e9cda43946ac4f91e1583f77`.
  - Git blob SHA-1 `3f3c2c030700b63f49b2adf23fb45c2936abfae7`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx)
  - **14,524 bytes**; SHA-256 `f71b07a7cf2fa19b3fad0cc6970c7c54cb9390b7c44a1107238c6772249bfe05`.
  - Git blob SHA-1 `88c509cf73c4074aba528f304dbf48553f3a60df`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/components/charts/FacetRelated/FacetGridLayout.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetGridLayout.tsx)
  - **10,153 bytes**; SHA-256 `30f3606f7de1a10d264197c5cd049d7923782e7742de3b79a4a77a3f4ec4652d`.
  - Git blob SHA-1 `dfdd2675d6293ec8eb2b8fdee3ff13b641e7db25`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/components/charts/FacetRelated/FacetWrapLayout.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetWrapLayout.tsx)
  - **4,626 bytes**; SHA-256 `16db6c073d5fcf4c08cfdc2f41f5fe54eb451d59b17022a97b0a644eda93cc14`.
  - Git blob SHA-1 `dcd6414778c9ee40224205933e970efefda96cc4`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts)
  - **8,386 bytes**; SHA-256 `a193e9ec416216098d5406a024f4799733ed106867ee57a311a4a57afd49b109`.
  - Git blob SHA-1 `b64489e4b7c0513a39370ac2f9a5358fdf597086`; reconstructed identity **MATCH**.

- [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts)
  - **6,855 bytes**; SHA-256 `444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483`.
  - Git blob SHA-1 `8560522bd2712fcd371f5472322fc27df3d100e3`; reconstructed identity **MATCH**.

### Four remote comparisons of packet baseline files

These are cross-checks of existing packet entries, not four additional source files. All byte content and reconstructed Git blob identities matched.

- **packages/explorEDA/src/components/charts/Retention/retentionPlan.ts** — Git blob `5bb820fccb32b918efef60afd1c9077818b6aeca`; **8,311 bytes**, exact remote/local match.

- **packages/explorEDA/src/components/charts/Retention/definition.ts** — Git blob `dc31efb88571f2080121a6f58b956e275fd04417`; **2,440 bytes**, exact remote/local match.

- **packages/explorEDA/src/providers/DataLayerProvider.tsx** — Git blob `c161093db9df4aa480bf3a20fc33c53bf6245f65`; **55,689 bytes**, exact remote/local match.

- **packages/explorEDA/src/lib/valueParsing.ts** — Git blob `12d14afc1f035b78103d504cc974cd4cbb0ac1cb`; **10,226 bytes**, exact remote/local match.

### Historical source outside the baseline

The original README exactly matches packet P32. The prior queue was an additional historical read; neither is relabeled as baseline source.

- [docs/research/analysis-handoff-2026-10-20/README.md](https://github.com/byronwall/explorEDA/blob/ae2716a2a1f7984ef552f368a0ba9aba93e10f05/docs/research/analysis-handoff-2026-10-20/README.md) — **2,670 bytes**, SHA-256 `cf822c778b74636d4f9393a630065e2ba045c2199c21da62a87ce36ee375336f`, Git blob `b29c5fa8208ea0de2073c4609e8d9b0db8e7adbc`.

- [docs/research/analysis-handoff-2026-10-20/research-queue.md](https://github.com/byronwall/explorEDA/blob/ae2716a2a1f7984ef552f368a0ba9aba93e10f05/docs/research/analysis-handoff-2026-10-20/research-queue.md) — **3,945 bytes**, SHA-256 `599f2b999b946bc376531957c509ca53e12ae02c22313d022a35aae5b8f4067f`, Git blob `13bdb689011f79b395ba93412513f3ddb634cbd0`.

## 10. Research handoff

The report archive contains exactly four Markdown originals and manifest.json. No source checkout, executable program, helper script, or symlink is included. The manifest records each report's byte length and SHA-256; the final response publishes independent archive and manifest hashes.

Codex must independently collect, authenticate, reconcile against its checkout, validate, and open the review PR. A source prediction, a competitor contract, and a mathematical check each answer a different question. None is a substitute for application or author acceptance, and none by itself authorizes product implementation.

[plan]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.ts
[render]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.tsx
[trace]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx
[definition]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/definition.ts
[settings]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/RetentionSettingsPanel.tsx
[helpers]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx
[population]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts
[provider]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx
[wrapper]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[wrapper-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts
[facets]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx
[facet-wrap]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetWrapLayout.tsx
[facet-grid]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/FacetRelated/FacetGridLayout.tsx
[parsing]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts
[rollup]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dailyRollup.ts
[docs]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/retention.mdx
[plan-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts
[render-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Retention/Retention.test.tsx
[registry]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/charts/registerAllCharts.ts
[examples]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/examples.ts
[generator]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/data-samples/product_events.ts
[trust]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[historical]: https://github.com/byronwall/explorEDA/blob/ae2716a2a1f7984ef552f368a0ba9aba93e10f05/docs/research/analysis-handoff-2026-10-20/README.md
[historical-queue]: https://github.com/byronwall/explorEDA/blob/ae2716a2a1f7984ef552f368a0ba9aba93e10f05/docs/research/analysis-handoff-2026-10-20/research-queue.md
