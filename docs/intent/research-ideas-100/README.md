# 100 research ideas for explorEDA

This collection contains 100 ideas from ChatGPT Pro. Each brief has four paragraphs, source references, alternatives, and a first experiment.
The briefs contain 32,964 words. Each has 299–361 words, excluding metadata and references.

These are research candidates. They do not approve implementation or establish product defects.

## Read the collection

- [Full catalogue](catalogue.md): all 100 ideas in priority order.
- [Topic index](ideas.json): stable IDs, questions, evidence, experiments, and rejection signals.
- [Local review](review.json): a decision and reason for every idea.
- [Source ledger](sources.md): repository coverage, related intent, external sources, and limits from Pro.
- [Validation](validation.json): checks run during collection.
- [Original archive](raw/exploreda-100-research-ideas.zip): all 104 original files, including Pro's full overview.
- [Collection record](raw/collection.json): archive and companion hashes.
- [Run record](run.md): submission, collection, checks, and PR status.

The collection covers 18 categories. It includes 41 robustness studies, 34 follow-ups, 15 new directions, and 10 simplification studies.
Priority measures the value of a research decision. It does not measure defect severity or set an implementation order.

## First 15 candidates

| Priority | Idea                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | [R026 — Reconcile missing, blank, invalid, and converted-value counts](ideas/R026-missing-state-accounting.md)                                |
| 2        | [R043 — Reconcile entity-aware aggregation across preparation paths](ideas/R043-entity-grain-parity.md)                                       |
| 3        | [R077 — Selection identity when source rows are replaced](ideas/R077-selection-identity-when-source-rows-are-replaced.md)                     |
| 4        | [R001 — Regression reliability after changing units and coordinate offsets](ideas/R001-regression-conditioning.md)                            |
| 5        | [R051 — Make filter ownership and self-exclusion understandable](ideas/R051-filter-ownership.md)                                              |
| 6        | [R086 — Recoverable autosave after mixed file outcomes](ideas/R086-recoverable-autosave-after-mixed-file-outcomes.md)                         |
| 7        | [R031 — Explain ambiguous date conversions before applying them](ideas/R031-date-ambiguity-preview.md)                                        |
| 8        | [R011 — Retention maturity grounded in an observation cutoff](ideas/R011-retention-observation-cutoff.md)                                     |
| 9        | [R073 — Challenge example conclusions with deliberate counterexamples](ideas/R073-example-claim-challenges.md)                                |
| 10       | [R064 — Explain frozen notebook results and dependent definitions](ideas/R064-notebook-frozen-results.md)                                     |
| 11       | [R078 — Independent workspace ownership for dialogs and exports](ideas/R078-independent-workspace-ownership-for-dialogs-and-exports.md)       |
| 12       | [R059 — Keep focus and Escape predictable across nested editors](ideas/R059-nested-focus-ownership.md)                                        |
| 13       | [R088 — Bind cached database snapshots to their source definition](ideas/R088-bind-cached-database-snapshots-to-their-source-definition.md)   |
| 14       | [R056 — Compare contributor sets when two views disagree](ideas/R056-contributor-set-comparison.md)                                           |
| 15       | [R100 — Published-package behavior in small real consumer projects](ideas/R100-published-package-behavior-in-small-real-consumer-projects.md) |

## Use this list in a future research task

The existing six-hour task is unchanged. This PR only supplies its possible topic source.

After approval, a task can read `ideas.json` and `review.json`. Select an `investigate` item by priority and current evidence.
Check recent research, active Pro runs, open PRs, and the current implementation before starting it.
Treat `defer` items as conditional topics. R021 needs a reference graphic. R075 needs a large-edit use case. R098 needs a reproduced failure.

Use the selected brief as source material for a new repository-grounded prompt. Include its question, alternatives, first experiment, and rejection signal.
Record the selected ID in that research run. A completed study should link back to the ID and state its result.
Do not use an empty dependency list as implementation approval. It means the first research study can start independently.

## Review and limits

All 100 briefs were read during local review. The ranking is retained as a proposal.
The review keeps 97 ideas for investigation and defers three until their stated conditions occur.
No idea is adopted as an implementation plan. No application code or recurring task was changed.

The source baseline is `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.
All 183 evidence paths and 605 literal references exist at that commit and match this checkout.
Local source checks also examined entity reduction, retention maturity, notebook recovery, save state, export ownership, and snapshot identity.
These checks support the questions. They do not prove a runtime fault.

Four external references received local checks: NIST regression data, W3C modal focus rules, Arrow's format, and DuckDB decimal arithmetic.
The remaining external references retain Pro's source review. A later study must verify claims that affect its decision.
Pro did not review omitted historical research archives. Check those records before spending another research cycle on a related topic.

The original files remain in the ZIP. `pro-manifest.json` describes that ZIP's payload, including its original README.
The local README and catalogue replace that overview for repository use. `validation.json` records the local results.
Product experiments remain unrun. The final repository check result is recorded in the run record and PR.

## Research follow-ups

[R026 value accounting](../../research/missing-state-accounting-2026-10-21/README.md) now has a synthesis and four local probes.
Three bounded repairs remain proposed. R043 is the next eligible broad study. The original catalogue ranking remains unchanged.
