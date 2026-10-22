# R051: keep filter behavior; test explanations before adding UI

Retain the current interface and filtering rules. The source and three local probes support different row sets for different consumers.
No participant study ran. The proposed tooltip and lesson have no measured benefit.

R051 was catalogue priority5 and the highest unfinished study.
R026/PR465, R043/PR466, R077/PR484 and R001/PR492 already have complete research.
This study reuses their constraints and navigation PR458. It does not repeat Mosaic integration PR462.

## What the evidence supports

A chart omits its own selection when it reads peer context. Another owner's filter on the same field still applies.
A local chart restriction controls drawing. It does not automatically narrow the linked category predicate.
Numeric contributors and searched table rows can differ from linked membership.
Clear all removes linked filters and searches; it retains the chart's local restriction.
Notebook chart selections stay local; workspace filters still apply.

The twelve-row fixture makes these differences exact:

| State                                    | Linked members | A context  | Metric sum | Table result | Rows result |
| ---------------------------------------- | -------------- | ---------- | ---------- | ------------ | ----------- |
| T1: A West                               | 6              | 7 Web rows | 280        | 6            | 6           |
| T2: add Tech, workspace West, searches   | 3              | 2          | 200        | 2            | 1           |
| T3: workspace East conflicts with A West | 0              | 1          | No rows    | 0            | 0           |
| T4: clear A only                         | 2              | 1          | 300        | 1            | 0           |
| T5: clear all                            | 12             | 7 Web rows | 980        | 12           | 12          |

The [literal oracle](evidence/oracle.json) contains exact source IDs. The local probe checks those IDs, not only these counts.
It replays declared states. Its mounted provider check separately runs clear-all and compares explicit and default aggregate inputs.
This does not prove pointer actions, rendering, trace access, history or exports.

## A narrow documentation proposal

The standard named aggregate bar passes peer/local IDs explicitly to the provider.
The provider defaults to globally filtered IDs only when the caller omits an ID set.
The current rendering page describes named grouped summaries too broadly. Its bar page has a related warning to review.
At T2, contextual category sums are 80 and 200; the global fallback returns only the selected Tech sum 200.
The mounted provider check passes. The actual bar consumer call is confirmed by source inspection.
No bar rendering or hook integration check ran.

Queue a small correction with a runnable example. Pair `rendering.mdx` and `filters.mdx` with one proposed `FilterOwnershipExample`.
Review `bar.mdx` for the same claim. Retain Lorenz and shop examples.
Use native JSON values and existing MDX registration. The component and user-facing copy remain proposed.

## Explanation choices

The current controls already include owner help, local restrictions, selected/context counts and trace notes.
A fair comparison must keep all of them available.
Test the current explanation against a tooltip plus one worked South-region example first.
Keep exact IDs and owner explanations as the five-task scoring basis. Require at least four correct tasks per real participant.
Only first exposure counts as primary evidence. Four volunteers can reject poor wording; they cannot establish general benefit.
Defer a new trace sentence and a persistent comparison control. Retain the current UI when results are inconclusive.

[Seven local decisions](decisions.md), [evidence review](evidence.md), and [local proof limits](evidence/local-results.md) explain the boundaries.
[Original decision](originals/decision.md), [source report](originals/evidence.md), [study kit](originals/proof-plan.md), and
[integration proposal](originals/integration-plan.md) retain Pro's complete work.

## Continuation

R086 is next, then R031. Keep the catalogue as the discovery source.
R008 is complete in PR464; R011 reuses PR461. Larger application changes remain proposals.
[Queue](research-queue.md) and [run record](run.md) hold current status.
Browser, actual clear-one, full mounted consumer flow, exports/history/restore and human comprehension remain unrun.
