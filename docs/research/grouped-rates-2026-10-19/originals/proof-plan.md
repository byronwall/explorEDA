# Proof plan: one author task that can reject a new rate API

Date: **2026-10-19**. Repository: **https://github.com/byronwall/explorEDA**. Authorized baseline: **9b16d78e3ed0742ed4d5858c1939fec9e758b510**. This is a standalone research instrument, not an implementation plan.

## Decision and entry gate

**Keep grouped reusable rates deferred.** Byron has not used explorEDA enough to name a missing calculation. That statement in `docs/intent/reusable-analysis-metrics/intent-brief.md`, **My read**, is binding. The first local work remains the selection/export/undo/reopen trust journey in `docs/intent/current-analysis-trust/intent-brief.md`, **Next step after confirmation**. No prototype, new public API, or documentation change is approved by this plan.

There is **one conditional rates author task**: answer a real repeated rate question in a pooled card and grouped bar, first with existing controls and a short explanation, then with an upstream result at an explicit grain. Use this plan only after Byron identifies the real decision and at least two real occasions on which it is needed. Two views of an invented fixture, or repeated guided clicks, are not evidence of repeated product need.

The cheapest rejection is at entry: if no real task is named, record **demand unconfirmed; no API** and stop. If a named task emerges, use the synthetic fixtures below to detect incorrect arithmetic while observing whether a simpler route is sufficient. This is one comparison within one author task, not several new proof projects.

Stable recommendation links by meaning: **GR01** demand deferral; **GR02** eligible binary recipe; **GR03** explicit quantity/population; **GR04** upstream grain; **GR05** consumer/lifecycle trust; **GR06** identity semantics; **GR07** bounded prototype admission only after evidence.

## Access receipt and limits

The selected `source-packet(7).txt` is **296,375 bytes**, SHA-256:

```text
88c5bc84d95608248ea1b96ab77e12be57514947db6a2a8ae2529867ec5211f0
```

All 38 embedded entries matched their declared byte sizes and SHA-256 hashes. This verifies receipt integrity, not independent Git-history identity. The supplied baseline and research-branch label were not independently fetched. The packet is selected text, not a runnable checkout. There were no application mutations, product tests, browser sessions, commits, or PR operations. The supplied repository remains React/TypeScript with pnpm 11.9.0.

Missing files include the numeric parser/conversion implementation, expression parser/manager, actual card/bar callers, chart population/crossfilter implementation, demo history, UI exports, Dashboard text compiler/exporter, complete docs/example registrations, and the flights CSVs. Therefore controls, formulas, filtering, and serialization described below are source-grounded candidates or **proposed runtime checks**. Nothing in this plan certifies them as an executed user journey.

## The one author task

**Hypothetical instrument:** an endurance-test author compares leak events per 100 operating hours across rigs, inspects the contributing runs, selects a rig, then exports, undoes, and reopens the analysis. A reliability analyst is the hypothetical role; no real analyst demand is claimed. Byron is the possible future author only if the question matches his own repeated work.

Before using controls, record the following task-specific meaning in plain text:

- **Decision:** which rig/run records deserve further inspection on observed event intensity. This tiny artificial example supports arithmetic verification, not a scientific conclusion that one rig is better.
- **Row grain:** one unique endurance-test run, keyed by `run_id`. Repeated sensor readings would need preparation at run grain first.
- **Numerator:** sum of observed event counts on eligible runs.
- **Denominator:** sum of operating hours on the same eligible runs.
- **Eligibility, explicitly hypothetical:** raw typed numeric event count is finite, nonnegative, and integral; operating hours are typed numeric, finite, and strictly positive. Unknown or invalid values exclude the whole pair. This is not a proposed universal explorEDA parser or policy.
- **Units:** events per 100 operating hours. This quantity is an intensity, not a probability or percentage. Do not apply percent formatting or infer an upper bound of 100.
- **Filter policy:** both numerator and denominator respond to the same chosen source cohort. No filter-removal denominator is requested.
- **Two consumers:** one pooled Metric Card for the cohort; grouped Bar values by rig. They represent the same metric at different group scopes, so the card should not equal the average of the bar heights.
- **Trace evidence:** all source members, eligible analytical units, numerator total, denominator total, included IDs, excluded IDs/reasons, and identity issues where relevant.

If the real author needs different populations, signed exposure, a different quantity, or an unresolved identity policy, stop and revise the task definition. Do not force that task into this hypothetical common-population proof.

## Synthetic inputs: complete and explicit

Start with R1–R3 to isolate unequal exposure. Add R4–R9 only after the arithmetic is understood. Every value below is synthetic; none is an observed repository dataset value.

| Run / rig | Raw events / hours | Common eligibility and expected reason |
| --- | --- | --- |
| R1 / A | `1 / 10` | Eligible. |
| R2 / A | `1 / 90` | Eligible. |
| R3 / B | `8 / 200` | Eligible. |
| R4 / A | `null / 50` | Ineligible: unknown events. |
| R5 / A | `2 / null` | Ineligible: missing operating hours. |
| R6 / B | `0 / 0` | Ineligible: no positive operating hours. |
| R7 / B | `1 / -5` | Ineligible: negative operating hours. |
| R8 / B | `"bad" / 20` | Ineligible: invalid event input. |
| R9 / B | `0 / 40` | Eligible: measured zero events with positive exposure. |

An upstream companion may add `eligible`, `eligible_events`, `eligible_hours`, and `exclusion_reason` without deleting the raw fields. `eligible_events` and `eligible_hours` are both null on R4–R8. Keep every source member available. This explicit fixture preparation avoids depending on uninspected parser coercions. It is not application implementation.

### Exact core arithmetic: R1–R3

| Scope or operation | Numerator / denominator or inputs | Expected result, events/100 h |
| --- | --- | ---: |
| Rig A | `(1+1) / (10+90)` | `2` |
| Rig B | `8 / 200` | `4` |
| Pooled cohort | `10 / 300` | `10/3 = 3.333333…` |
| Mean of run rates | `(10 + 10/9 + 4) / 3` | `136/27 = 5.037037…` |
| Mean of rig rates | `(2+4) / 2` | `3` |
| Exposure-weighted run mean | `(10*10 + (10/9)*90 + 4*200) / 300` | `10/3` |

Current average behavior on a row-rate column is expected to produce `136/27` for the pooled source rows. That is a correct unweighted mean and the wrong statistic for this hypothetical pooled-exposure decision. No defect is inferred from that result.

### Exact stress populations: R1–R9

| Selected scope | Source members and eligible IDs | Exact totals and rate |
| --- | --- | --- |
| Whole cohort | Members R1–R9, count 9; eligible `{R1,R2,R3,R9}`, count 4 | N=10; D=340 h; rate `50/17 = 2.941176…` events/100 h. |
| Rig A | Members `{R1,R2,R4,R5}`, count 4; eligible `{R1,R2}`, count 2 | N=2; D=100 h; rate `2`. |
| Rig B | Members `{R3,R6,R7,R8,R9}`, count 5; eligible `{R3,R9}`, count 2 | N=8; D=240 h; rate `10/3`. |
| R9 only | One member; eligible `{R9}` | N=0; D=40 h; rate `0`, valid. |
| R6 only | One member; no eligible IDs | No eligible numerator/denominator totals; rate unavailable with zero-exposure reason. |
| Empty selection | No members; no eligible IDs | No totals/rate; distinguish empty from an invalid occupied group. |

The empty/no-eligible SQL aggregates below return null totals, rather than inventing observed zero quantities. This is the explicit oracle for the fixture. Existing application rendering may describe its present state differently; do not silently revise its behavior to pass the oracle.

The eligible zero-event row R9 changes the denominator and pooled rate. Excluding it would incorrectly leave the core `10/3` result. An eligibility flag's **sum** can be 4 even though all nine 0/1 flags are numeric inputs; do not confuse that flag field's numeric contributors with the four contributors of the masked event/hour fields.

### Separate-population negative control

Independently accepting finite numeric event counts yields N=13 from `{R1,R2,R3,R5,R6,R7,R9}`. Independently accepting positive numeric hours yields D=410 from `{R1,R2,R3,R4,R8,R9}`. The quotient is `130/41 ≈ 3.170732` events/100 h. Accepting the negative numeric hours as well yields D=405 and `260/81 ≈ 3.209877`.

Those are different contributor contracts, not alternate roundings. They are independently computed controls, not observed application results. Different numerator and denominator populations may be scientifically legitimate in another task, but this author would have to state why. Current numeric validity is insufficient to decide scientific eligibility.

## Current-controls route and upstream comparator

### Attempt A: current controls plus one explanation

The source supports named group sums/averages and direct card sums/averages. It does not expose a ratio of two aggregate results in these consumers. Evidence: `AggregateSpec` and `summarizeGroup` in `packages/explorEDA/src/lib/aggregates.ts`; `MetricCardSettings` and `planMetricCard` in its definition/plan; Pivot `aggregate`/`generateCell`; provider `getColumnNames`/`getColumnData` and `getAggregateResult`.

1. Use the unique-run core rows. Show event and hour totals with current controls, plus a source table. Keep numerator and denominator names visible.
2. For contrast, calculate a row rate. Candidate formula text is `100 * ["events"] / ["hours"]`; expression parsing is not run here. The source evaluator is row-scoped. Average that field only when deliberately examining the average run rate.
3. For stress rows, use the explicitly prepared paired fields or a reviewed eligibility guard. Candidate scalar guard is `["eligible"] == 1 ? 100 * ["events"] / ["hours"] : null`; it is proposed syntax for later parser verification, not a validated imported calculation.
4. Ask whether seeing the two totals and doing one division outside the card answers the real task sufficiently. Record the author's actual outcome and repeated rework, not a predicted productivity claim.
5. If the needed quantity is an equal-opportunity count fraction instead, use the flights indicator comparator below. Success with that recipe rejects the new API for that task.

For the exposure task, a current average of raw run rates gives rig A `50/9 ≈ 5.555556` and rig B 4 on core inputs; a prepared **one row per rig** rate gives the correct individual values 2 and 4. These routes have different grains. The comparison must label them honestly.

### Attempt B: upstream preparation with declared output grain

Use an already available author-side preparation path. The comparison does not install an explorEDA driver or require DuckDB in the application. The independently executed oracle below uses Python's standard-library SQLite in memory. The relevant current DuckDB pattern is narrower: aggregate FILTER can state contributors, while GROUP BY establishes result groups. Official source: [DuckDB Aggregate Functions](https://duckdb.org/docs/current/sql/functions/aggregates), accessed **2026-10-19**, sections **Examples**, **Syntax**, and **Handling NULL Values**. This source does not establish acceptability of any author's workflow.

- Prepare **per-rig results** containing member count, eligible count, numerator, denominator, rate, and an associated source-ID/reason ledger. At the core scope this yields A `(2,100,2)` and B `(8,200,4)` for N/D/rate.
- Prepare **one pooled result separately**, recomputing from selected eligible runs or compatible additive group components: core N=10, D=300, rate `10/3`; stress N=10, D=340, rate `50/17`.
- Importing one row per rig allows an existing chart to display each stored rate. A global card's average over those two rows would give core 3; it would give stress `8/3`. Neither is the requested pooled rate. Do not mix an “All rigs” summary row with rig rows in one aggregatable source.
- A singleton pooled input is appropriate only for that declared prepared cohort. Current source does not prove one workspace can route independent per-rig and pooled datasets into those two consumers automatically. Compare separate prepared outputs or retain the division upstream; record this boundary rather than inventing a multi-source feature.
- Filtering prepared rig rows can select rigs, but cannot recover missing run-level detail or recompute arbitrary raw-run filters. Requery from raw runs when the cohort changes. Keep additive N/D and source membership if later compatible regrouping is required.

If this preparation is sufficient for the real repeated task, record **API rejected; preparation accepted**. If preparation prevents required linked raw-record exploration or causes observed unacceptable repeated work, record the specific failure. Failure to establish grain, identity, or eligibility is a task-definition block, not approval to build an engine.

## Current-data comparator: an eligible flight indicator

The selected files `apps/demo/public/daily-viz/projects/flights/exploreda.eda`, `carriers.eda`, and `carriers.guide.md` provide the comparator's structure. They declare flight IDs and lookups, a count/median/mean Pivot, count and mean cards, and a table. The CSVs are absent. Do not reproduce the guide's numerical airline claims as newly verified findings.

This proposed comparator's author is an author of the carriers view. The decision is to compare the share of recorded departures with delay at least 15 minutes, then inspect those flights. Row grain is one unique flight; numerator is qualifying recorded flights; denominator is flights with valid recorded delay; units are a proportion/percentage. The two consumers are a Metric Card and a grouped Bar by airline, each averaging the same eligible numeric indicator. The 15-minute threshold is an explicit example choice, not an imported industry definition.

Complete synthetic inputs:

| Flight IDs / airline | Departure delay | Numeric indicator |
| --- | --- | --- |
| F1 / A | 30 | 1 |
| F2 / A | 0 | 0 |
| F3 / B | 20 | 1 |
| F4, F5, F6, F7, F8, F9, F10 / B | 0 each | 0 each |
| F11 / A | null | Unavailable: unknown delay. |
| F12 / B | `"bad"` | Unavailable: invalid delay. |

- Member IDs: F1–F12, count 12. Eligible IDs: F1–F10, count 10. Numerator IDs: F1 and F3.
- Card at full eligible cohort: `2/10 = 20%`. Bar A: `1/2 = 50%`; Bar B: `1/8 = 12.5%`. Averaging the two bar values gives `31.25%`, which is not the pooled proportion.
- Treating unavailable indicators as zero gives `2/12 = 16⅔%`, a different question.
- A member-count card showing A/all gives `3/12 = 25%`; with eligibility applied to both counts, `2/10 = 20%`. Neither is A's delay proportion of 50%.
- A 100% series bar can show the qualifying share only when both 0 and 1 form an exhaustive partition of the intended eligible population. Filtering the source to 1 first makes the share 100% of that altered source.

A candidate guarded formula is `["dep_delay"] == null ? null : (["dep_delay"] >= 15 ? 1 : 0)`. The selected evaluator's numeric comparisons can reject invalid text; error-to-missing propagation and parser syntax still need the omitted modules and runtime check. The simpler audited route is to supply the explicit indicator values above. An absent delay must not be labeled canceled, on time, or zero without data that supports that interpretation.

This is a **correctness and recipe comparator within the one author task**, not a second demand proof. It is a subset proportion, unlike a general count ratio such as hypothetical defects per inspected part, which can exceed one. If the author's actual question has equal opportunity weights, a binary outcome per opportunity, and the recipe succeeds, stop before considering a new rate API.

## Identity checks: preserve the existing contract

The core fixtures have unique IDs. The following are optional negative controls within the same task if entity semantics matter to the real source; they are **proposed application checks**, with mathematical expected values. `summarizeGroup` compares measure values with `Object.is`, excludes null/undefined IDs, and makes the whole result unavailable on conflict. `poolAggregateRows` reevaluates identity over pooled contributors. Source: `packages/explorEDA/src/lib/aggregates.ts`, those symbols and `ONCE_PER_HELP`.

| Variant | Source inputs | Expected contract or question |
| --- | --- | --- |
| Repeated entity | D1 `(e1,1,10)`, D2 `(e1,1,10)`, D3 `(e2,0,20)` as ID/events/hours | Three source members, two entity units. Separate once-per sums yield N=1,D=30; the arithmetic quotient is `10/3` events/100 h. Without dedup, quotient is 5. |
| Missing ID | Add D4 `(null,5,50)` | Four members remain inspectable; missing-ID record excluded under current entity semantics. Accepted N/D remain 1/30. Do not silently choose a new ID. |
| Numerator conflict | Change D2 events to 2 | Event sum for that entity scope is unavailable under current conflict behavior; a valid hours sum cannot make the rate available. |
| Denominator conflict | Restore events to 1, change D2 hours to 20 | Hours sum is unavailable. Do not choose the first record. |
| Equal ratio, conflicting components | D1 `(e1,1,10)`, D2 `(e1,2,20)` | Equal row ratios do not establish valid contribution pairs. New two-field policy remains unchosen; no rate prototype is admitted through this shortcut. |
| Entity across groups | D1/e1 and D3/e2 in A; D2/e1 in B | Group results may each contain e1; pooled current once-per components should deduplicate e1 again, not sum group entity counts. Confirm source members and contributors separately. |

Also probe typed ID distinctions and a measure such as numeric `30` versus text `"30"` only if those inputs are present in the real task. The reducer compares raw supplied measure values before numeric reduction; omitted conversion/category helpers prevent predicting every upstream type transformation. These cases do not authorize broad identity redesign.

## Proposed application observation: exact sequence and stop gates

Everything in this section is **proposed, not run**. A packet cannot exercise the app. On a later authorized exact-baseline checkout, use existing fixtures and tooling; do not install an alternate framework or silently substitute newer behavior.

1. **Establish scope.** Start with no facets or chart-local restrictions for the principal comparison. Record source IDs, field types, `run_id` uniqueness, raw values, numerator/denominator meaning, and expected values. Inspect caller-supplied IDs before treating numbers as comparable.
2. **Read the core values.** Verify the current component summaries against A N=2,D=100; B N=8,D=200; pooled N=10,D=300. Identify row-average and prepared-grain values honestly. If a proposed view cannot express the pooled quotient, record that limitation; no feature is added during the observation.
3. **Inspect contributors.** With stress inputs, confirm all nine members remain available and the masked N/D columns have `{R1,R2,R3,R9}` as contributors. Confirm R9's zero numerator is included. Do not use `rowCount` alone as numeric-contributor count.
4. **Filter one cohort.** Apply a workspace-level `rig=A` filter. Expected members `{R1,R2,R4,R5}`, contributors `{R1,R2}`, N=2,D=100, quotient 2. Compare the card's cohort to the corresponding A bar mark. A chart may retain context marks by its own-selection policy; extra contextual marks are not automatically a disagreement. Verify the selected mark's actual IDs. Clear the filter and restore the all-nine oracle.
5. **Check a deliberate scope difference.** If local filters or facets are part of the real task, inspect live/all IDs and labels under that setting. `useGetAllIds` may preserve local filters; named aggregates default to global filtered IDs. Do not expect equality from different cohorts. An empty facet must not silently be treated as a valid zero-rate group. Stop at the first unexplained population mismatch.
6. **Check occupied-invalid, empty, and zero.** Select R6 alone, an empty cohort, and R9 alone. Expected mathematical states are unavailable-with-one-member, unavailable-with-no-members, and valid zero over 40 h respectively. Raw invalid rows remain inspectable.
7. **Export the selection with grain.** Under `rig=A`, a matching-source-row export should contain R1,R2,R4,R5, including unavailable inputs. A separately requested contributor export would contain only R1,R2 and must identify that restriction. Recompute N=2,D=100 from the source export under the same eligibility rule. Do not label a four-row source export as a two-row contributor export. Prepared-result exports must carry grain, cohort, N/D, units, eligibility, and source-ID/reason ledger; source links for imported summaries are not assumed to be automatic.
8. **Save and reopen.** Save settings, then separately test the full analysis-with-rows route. Reopen the same raw data and verify formulas as text, named aggregate references, entity settings, relevant field conversions, workspace filters, and member/contributor sets. For the full bundle, use the supplied `SavedAnalysisStructure` route; settings-only output does not contain raw rows. Preserve null versus invalid strings and any deliberately introduced special values supported by the bundle. Compare semantic state, not volatile `modifiedAt` timestamps.
9. **Undo and redo.** Undo the cohort filter or one committed formula edit and verify the previous ID set and totals, then redo. Confirm one continuous committed edit is one history step where existing hold behavior promises that; canceled drafts should not change persisted results. Demo history is not in the packet, so this remains a direct observation gate.
10. **Export the visible chart and textual configuration.** Where the existing workflow offers them, verify chart image values/units/scope against the screen and reimport exported Dashboard text with the same settings/meaning. Do not claim image-export or DSL round-trip coverage from `saveDataUtils.ts`; those are different paths. If these outputs are not part of the author task, record not exercised rather than broadening the mission.
11. **Repeat necessary interactions at the three required widths.** Use the compact checks below, stop at the first material access or meaning failure, and record proposed checks still unrun. No benchmark or latency promise is inferred.

| CSS width | Necessary observation | Evidence to retain later |
| --- | --- | --- |
| **1280** | Author the recipe, inspect both totals/IDs, filter, export, undo/redo, and reopen. | Actual actions, values, membership IDs, and any failure. |
| **783** | Open/close settings and trace surfaces, operate the filter, and reach save/export with keyboard and pointer. Read units, denominator, unavailable reasons, and menu contents without clipping. | State confirmation and a screenshot only if a later visible change requires it. |
| **390** | Reach the same essential information and dismiss controls; scroll where needed without losing labels or actionable controls. Distinguish zero, no rows, and invalid inputs. | Actual reachability/overflow observations; no implied expansion of desktop support. |

`AGENTS.md` and `docs/agent-guide.md` require these widths and identify `pnpm shot`, export proof tooling, and demo history ownership. README still describes desktop integration at 1024 CSS pixels or wider. Narrow-width checks do not by themselves change that supported-use statement.

### Final rejection/admission record

Record the author, real decision, prior repeated occasions, source grain, exact metric contract, two consumers, actual actions, corrections, and which option succeeded. Use these gates in order:

- **No named repeated task:** keep deferred; end the rates proof.
- **Current controls plus recipe sufficient:** reject a new rate API; propose only the explanation/example that actually helped.
- **Upstream result sufficient at accepted grain and filter scope:** reject a new API; retain the author's preparation contract.
- **Unclear numerator, denominator, identity, or population:** no prototype; obtain that missing domain choice without designing a grammar.
- **Current consumer/history/export disagreement:** route the specific reproducible failure to current-analysis-trust before expanding scope.
- **Real repeated task still fails acceptable simpler options, and meaning is explicit:** consider only one bounded ratio-of-totals experiment for the two demonstrated consumers. Preserve both totals and contributor sets, no stacking of rates, and an explicit unavailable outcome. Public syntax, representation, and implementation milestones remain unchosen.

## Conditional docs and demo destinations

No repository docs or examples were edited in this research. If a later user-visible change is earned, docs and the runnable example belong to the same selected work, as required by `AGENTS.md`.

| Existing destination | Proposed explanatory section or change |
| --- | --- |
| `docs/intent/reusable-analysis-metrics/intent-brief.md` | Keep the seed/demand-unconfirmed disposition; clarify the recipe/preparation rejection gates under **Expansion trigger** and **Next step after confirmation**. |
| `apps/demo/src/docs/pages/calculated-fields.mdx` | **In charts and tables**: row scope, numeric 0/1 eligibility, unknown outcomes, and guarded division. |
| `apps/demo/src/docs/pages/metric-card.mdx` | **How it reads**: source members versus numeric contributors, baseline share/delta, and explicit units. |
| `apps/demo/src/docs/pages/bar.mdx` | **Selection and row scope** and **Series**: named-summary scope warning; category-share denominator; conditional indicator recipe. |
| `apps/demo/src/docs/pages/pivot.mdx` | **How it reads**: count semantics, independent field reductions, and totals recomputation. Do not describe Pivot as composing arbitrary measures. |
| `apps/demo/public/daily-viz/projects/flights/carriers.eda` and `carriers.guide.md` | Candidate existing-data indicator comparator, only after the missing CSV, join grain, and current example behavior are checked. No unsupported airline-rate finding. |

A later science fixture could be registered through `apps/demo/src/demos/examples.ts`, its `coverage.ts`, and `apps/demo/src/docs/live/examples.ts`, with page/catalogue coverage inspected first. These paths come from the selected agent guide; their implementation is absent. A proposed example label such as “Events and operating hours” is not an existing registered example or a new milestone commitment.

## Verification status

**Executed in this research:** packet receipt/per-entry byte and SHA-256 checks; selected-source inspection; current official primary-source inspection; **47 independent synthetic arithmetic/population/SQL assertions** using Python fractions and in-memory SQLite **3.53.1**. The assertions check reviewed eligibility, core and stress rates, flight memberships/proportions, duplicate-pair arithmetic, and SQL outputs under all/A/B/zero/no-eligible/empty scopes. They do not execute the application reducer, expression parser, UI, or a DuckDB engine.

**Proposed, not executed:** the named author task; every application check above; current-control formula entry; entity reducer probes; actual flight-data validation; filtering/faceting; save/reopen; selection, chart, and Dashboard text exports; undo/redo; and all three widths. No product tests or performance measurements ran. Final artifact encoding, manifest bytes/hashes, and ZIP equality were checked during packaging, separately from these 47 fixture assertions.

## Self-contained arithmetic and SQL run sheet

The following reproduces the 47-check independent audit. It imports no explorEDA code, makes no network calls, installs no driver, and uses an in-memory database. Its printed SQLite version may differ on another machine. The fixture's eligibility policy is deliberately coded and checked rather than borrowed from the omitted application parser. This script is an arithmetic oracle, not a replacement implementation of entity or chart behavior.

```bash
# Recompute the synthetic arithmetic and upstream SQL comparison.
python3 - <<'PY'
"""Independent synthetic arithmetic and upstream SQL audit; does not import explorEDA."""
from fractions import Fraction as F
import json
import math
import sqlite3

checks = []

def check(name, actual, expected):
    assert actual == expected, (name, actual, expected)
    checks.append({"name": name, "actual": str(actual), "expected": str(expected), "passed": True})

# Each row is one synthetic run. The flag is an authored, fixture-specific policy.
runs = [
    ("R1", "A", 1, 10, 1),
    ("R2", "A", 1, 90, 1),
    ("R3", "B", 8, 200, 1),
    ("R4", "A", None, 50, 0),
    ("R5", "A", 2, None, 0),
    ("R6", "B", 0, 0, 0),
    ("R7", "B", 1, -5, 0),
    ("R8", "B", "bad", 20, 0),
    ("R9", "B", 0, 40, 1),
]

def eligible(n, d):
    if type(n) not in (int, float) or type(d) not in (int, float):
        return False
    return math.isfinite(n) and math.isfinite(d) and n >= 0 and int(n) == n and d > 0

for ident, _, n, d, flag in runs:
    check("authored eligibility " + ident, eligible(n, d), bool(flag))

def totals(rows):
    accepted = [r for r in rows if r[4]]
    if not accepted:
        return len(rows), [], None, None, None
    n = sum(r[2] for r in accepted)
    d = sum(r[3] for r in accepted)
    return len(rows), [r[0] for r in accepted], n, d, F(100 * n, d)

base = runs[:3]
check("base rig A", totals(base[:2]), (2, ["R1", "R2"], 2, 100, F(2)))
check("base rig B", totals(base[2:]), (1, ["R3"], 8, 200, F(4)))
check("base pooled", totals(base), (3, ["R1", "R2", "R3"], 10, 300, F(10, 3)))
check("base mean of run rates", sum(F(100*r[2], r[3]) for r in base)/3, F(136, 27))
check("base mean of rig rates", (F(2)+F(4))/2, F(3))
check("weighted run mean", sum(F(100*r[2], r[3])*r[3] for r in base)/300, F(10, 3))
check("stress all", totals(runs), (9, ["R1", "R2", "R3", "R9"], 10, 340, F(50, 17)))
check("stress rig A", totals([r for r in runs if r[1] == "A"]), (4, ["R1", "R2"], 2, 100, F(2)))
check("stress rig B", totals([r for r in runs if r[1] == "B"]), (5, ["R3", "R9"], 8, 240, F(10, 3)))
check("zero numerator", totals(runs[8:]), (1, ["R9"], 0, 40, F(0)))
check("zero exposure only", totals(runs[5:6]), (1, [], None, None, None))
check("empty selection", totals([]), (0, [], None, None, None))
separate_n = sum(r[2] for r in runs if type(r[2]) in (int, float) and math.isfinite(r[2]))
positive_d = sum(r[3] for r in runs if type(r[3]) in (int, float) and math.isfinite(r[3]) and r[3] > 0)
numeric_d = sum(r[3] for r in runs if type(r[3]) in (int, float) and math.isfinite(r[3]))
check("separate positive-field populations", F(100*separate_n, positive_d), F(130, 41))
check("separate numeric-field populations", F(100*separate_n, numeric_d), F(260, 81))

# Current-data comparator: all rows below are synthetic, not the missing flights CSV.
flights = [("F1","A",30),("F2","A",0),("F3","B",20)]
flights += [("F"+str(i),"B",0) for i in range(4,11)]
flights += [("F11","A",None),("F12","B","bad")]
known = [r for r in flights if type(r[2]) in (int,float) and math.isfinite(r[2])]
late = [r for r in known if r[2] >= 15]
check("flights all members", len(flights), 12)
check("flights eligible IDs", [r[0] for r in known], ["F"+str(i) for i in range(1,11)])
check("flights late IDs", [r[0] for r in late], ["F1","F3"])
check("flights pooled proportion", F(len(late),len(known)), F(1,5))
airline_rates = {group: F(sum(r[1] == group for r in late), sum(r[1] == group for r in known)) for group in ("A", "B")}
check("flights A proportion", airline_rates["A"], F(1,2))
check("flights B proportion", airline_rates["B"], F(1,8))
check("flights mean airline proportion", sum(airline_rates.values())/2, F(5,16))
check("flights unknown-as-zero alternative", F(len(late),len(flights)), F(1,6))
check("flights A row share", F(sum(r[1] == "A" for r in flights),len(flights)), F(1,4))
check("flights A known row share", F(sum(r[1] == "A" for r in known),len(known)), F(1,5))

# Numeric oracle for identity cases; this does not execute the application's reducer.
pairs = [("e1",1,10), ("e1",1,10), ("e2",0,20)]
unique_pairs = list({p[0]:p for p in pairs}.values())
check("deduplicated exposure pair", F(100*sum(p[1] for p in unique_pairs),sum(p[2] for p in unique_pairs)), F(10,3))
check("naive repeated pair", F(100*sum(p[1] for p in pairs),sum(p[2] for p in pairs)), F(5))

# Portable FILTER query against explicitly reviewed eligible flags. No driver installation.
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE prepared(run_id TEXT, rig TEXT, events, hours, eligible INTEGER)")
db.executemany("INSERT INTO prepared VALUES (?, ?, ?, ?, ?)", runs)
sql = """
SELECT count(*) AS source_members,
       count(*) FILTER (WHERE eligible = 1) AS eligible_members,
       sum(events) FILTER (WHERE eligible = 1) AS numerator,
       sum(hours) FILTER (WHERE eligible = 1) AS denominator,
       100.0 * sum(events) FILTER (WHERE eligible = 1)
         / nullif(sum(hours) FILTER (WHERE eligible = 1), 0) AS events_per_100h
FROM prepared
"""
sql_cases = [("all", "", runs), ("A", " WHERE rig='A'", [r for r in runs if r[1]=='A']),
             ("B", " WHERE rig='B'", [r for r in runs if r[1]=='B']),
             ("zero numerator", " WHERE run_id='R9'", runs[8:]),
             ("zero exposure", " WHERE run_id='R6'", runs[5:6]),
             ("empty", " WHERE 0", [])]
for name, where, rows in sql_cases:
    members, ids, n, d, rate = totals(rows)
    actual = db.execute(sql + where).fetchone()
    check("SQL " + name + " populations and totals", actual[:4], (members, len(ids), n, d))
    if rate is None:
        check("SQL " + name + " undefined", actual[4], None)
    else:
        check("SQL " + name + " rate", math.isclose(actual[4], float(rate), rel_tol=1e-12, abs_tol=1e-12), True)
report = {"kind":"independent synthetic fixture audit", "application_code_executed":False,
          "sqlite_version":sqlite3.sqlite_version, "checks_passed":len(checks), "checks":checks}
print(json.dumps({"checks_passed":len(checks), "sqlite_version":sqlite3.sqlite_version,
                  "application_code_executed":False, "base_pooled":"10/3", "stress_pooled":"50/17"}))
PY
```

## Exact selected evidence for the proposed checks

- `AGENTS.md`; `docs/agent-guide.md`, **Where things live**, **Commands**, **Browser checks and screenshots**; `README.md`, **Before you integrate**; `package.json`: stack, versioned tools, docs/example requirement, width and lifecycle ownership.
- `docs/intent/reusable-analysis-metrics/intent-brief.md`, **My read**, **Expansion trigger**; `docs/intent/reusable-analysis-outputs/intent-brief.md`; `docs/intent/current-analysis-trust/intent-brief.md`: demand gate, explicit output grain, first local proof.
- `packages/explorEDA/src/lib/aggregates.ts`, `AggregateSpec`, `summarizeGroup`, `poolAggregateRows`; its authored `aggregates.test.ts`: member/unit/contributor distinction and identity semantics. Tests were read only.
- `packages/explorEDA/src/lib/calculations/types.ts`; `functions/registry.ts`, `numericValue` and `calculationFunctions`; `engine/Calculator.ts`, `evaluate` and `evaluateValue`: row scope and guarded arithmetic. The latter two paths are within that same `calculations` directory.
- `packages/explorEDA/src/components/charts/MetricCard/definition.ts` and `metricCardPlan.ts`, `MetricCardSettings`/`planMetricCard`; `MetricCard.test.tsx` read only. Current reducers and baseline share/delta are not arbitrary two-total rate definitions.
- `packages/explorEDA/src/components/charts/BarChart/definition.ts`, `barPlan.ts`, `seriesBarPlan.ts`, and authored `barPlan.test.ts`: supplied aggregate results, category normalization, and nonadditive restrictions.
- `packages/explorEDA/src/components/charts/PivotTable/definition.ts` and `utils/calculations.ts`, `aggregate`/`generateCell`/totals; `packages/explorEDA/src/components/charts/Composition/calculations.ts`, `calcRows`/`evaluateCalc`: other contracts do not supply shared formula composition to the proposed consumers.
- `packages/explorEDA/src/types/SavedDataStructure.ts`; `packages/explorEDA/src/utils/saveDataUtils.ts`, `isAggregateSpec`, `validateSavedData`, `stringifySavedAnalysis`, `parseSavedAnalysis`; `packages/explorEDA/src/providers/DataLayerProvider.tsx`, `validateAggregateState`, aggregate/column getters, save/restore methods, and subscription callback: settings/full-data boundary and validation.
- `packages/explorEDA/src/components/charts/useGetLiveData.tsx`, `useGetLiveIds`/`useGetAllIds`; `apps/demo/src/docs/pages/bar.mdx`, **Selection and row scope**: explicit caution that populations can differ.
- The four selected docs pages, flights files, and historical research queue/summary identify destinations and ownership. Historical results do not establish a passed current browser proof or merged PR.

The complete deliverable set is four standalone Markdown reports plus `manifest.json`, with matching copies inside `grouped-rates-research.zip`. This plan is independently readable; other reports are not required to interpret its fixtures or rejection gates.
