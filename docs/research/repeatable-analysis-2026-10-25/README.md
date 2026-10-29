# Build parameterized local investigation notebooks

Choose reusable local investigations as the primary complete workflow. Build one query-bound notebook with saved typed inputs and current record inspection.
The local app owns saving and return. The package stays storage-neutral.
This is a product recommendation for Byron, not a measured claim of superiority over competing tools.

Research selection score: **19/20**. Mode: Strategy.
[Implementation plan](../../intent/repeatable-analysis-workflows/implementation-plan.md) · [Run record](run.md) · [Pro conversation](https://chatgpt.com/c/6add5995-4c74-83e9-ab90-723ecb543e89).
All recommendations remain proposals. No feature shipped in this review.

## What the review found

Current queries already support typed parameters and saved view bindings.
`readNotebookText` instead evaluates with `{}` and keeps only `row.data`.
`ProjectWorkspace` renders notebook rows from folder loading. It does not connect notebook inputs to current evaluation and lineage.
That missing connection supplies a useful first capability without another query engine or any open feature PR.

Sheets share rows and definitions. Selections stay chart-local; write-back omits transient `select.*`.
Last-valid block text is recompiled against current rows. It is not a saved historical result.
`FolderSaver.flush()` catches errors and does not confirm already-running writes. Copy/navigation needs a narrow save acknowledgment.
The current compiler lacks a declared-field input, so a valid empty query needs a schema path to retain authored charts.

Local review checked these claims in notebook reading/compilation/write-back, project bindings/validation/evaluation,
chart context/stage inspection, app lifecycle/saver/actions, and browser-test configuration.
Origin/main remains `95832bd473884aeae23453af0888b4ca5187820d`.

## Alternatives and strategic judgment

Existing tools already offer repeatable analysis:

| Alternative, checked in primary sources                                                                                                                                                   | Consequence for explorEDA                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Observable Notebooks 2.0](https://observablehq.github.io/notebook-kit/) offers readable local files, a desktop editor, and static-site tooling; it remains labeled a technology preview. | Local files alone are not an advantage. Supply the supported visual-editing and record-inspection workflow. |
| [Quarto parameters](https://quarto.org/docs/computations/parameters.html) support rerunning analyses for locations, periods, and assumptions.                                             | Keep programmable Python/R and multi-format publishing upstream when those tools fit better.                |
| [JMP workflow packages](https://www.jmp.com/support/help/en/19.2/jmp/example-of-capturing-a-jmp-workflow.shtml) can include preparation, analyses, and associated data.                   | Repeatability and native handoff are established capabilities, not novelty claims.                          |
| [Orange reports](https://orange3.readthedocs.io/projects/orange-visual-programming/en/latest/report/index.html) can restore a section's workflow from native `.report` files.             | Distinguish editable analysis from captured historical evidence; design the latter separately.              |

Pro also compared Power Query and Mosaic. Its judgment favors the local investigation journey over publishing or embedding as the organizing goal.
Embedding remains a package strength. Public narrative delivery remains a separate direction.
Comparative usability, speed, accessibility, capacity, and effort were not measured.

## Local dispositions

Build means scope in a plan, not approval to ship. IDs follow Pro's report.

| ID   | Disposition | Local decision and reason                                                                                                 |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| RA01 | Build       | Parameterized notebooks connect existing queries, prose, charts, exact current records, and saved return.                 |
| RA02 | Build       | Keep the separate live-finding proposal in PR #507; it can compose later without blocking this notebook.                  |
| RA03 | Explore     | Historical evidence needs an explicit capture and recipient contract; native copying is sufficient for the first handoff. |
| RA04 | Explore     | Explicit overview/detail mapping and later paired cases need population and destination-instance choices.                 |
| RA05 | Explore     | One reusable rate/result may help two consumers; settle grain and contributor populations before broad reuse.             |
| RA06 | Build       | Let the local app complete the workflow while hosts retain storage and route ownership.                                   |
| RA07 | Build       | Keep applied scope, rows, schema, and source inspection from one completed evaluation.                                    |
| RA08 | Build       | Demonstrate copying a complete relative-data project and reopening with the same application version.                     |
| RA09 | Defer       | Weighting, histograms, rolling windows, and regression remain independent specialist plans.                               |
| RA10 | Defer       | Lag/difference and join-key preparation are not needed for this first workflow.                                           |
| RA11 | Avoid       | A registry, semantic layer, result graph, or execution rewrite adds no necessary first capability.                        |
| RA12 | Avoid       | Implicit inheritance, different sheet populations, and persistent runtime row positions would obscure scope.              |
| RA13 | Defer       | A hosted reader or publishing product would widen the first boundary.                                                     |
| RA14 | Avoid       | Outside-demand and commercial-infrastructure gates do not apply; Byron supplies demand.                                   |
| RA15 | Build       | First milestone remains independent of all eight supplied open feature plans.                                             |
| RA16 | Avoid       | Static prose, last-valid text, settings JSON, and chart PNGs do not establish reusable historical evidence.               |

## Local adjustments and evidence

Keep the save acknowledgment limited to files a create/copy reload would discard; choose its exact API during implementation.
Do not build a history service or generic persistence protocol.
Register the browser test in an explicit project regex as well as using `.e2e.ts`.
Keep numeric conversion out of the example so null and nonnumeric inputs remain distinguishable.
Current source references and measure ledgers have different meanings; no universal provenance promise is added.

Both complete reports were read. Archive safety, exact two-file inventory, CRC, and UTF-8 checks pass.
Originals stay under ignored `tmp/`; the conversation is their durable reference. No follow-up was needed.
Baseline notebook/sheets/folder tests pass 29 tests; docs checks pass 73 tests, with existing React act warnings.
Independent fixture arithmetic confirms initial count 6/mean 200, updated count 7/mean 260, search count 1/mean 1000, and empty cases.
These checks do not accept the unbuilt controls, persistence, source-update flow, or browser behavior.

## Choices left open

Later capture format, reader interaction, paired-case navigation, and measured capacity remain open.
The first scope is chosen: one query, literal notebook inputs, current-data evaluation, local chart interaction, and native handoff.
Each milestone includes its docs and runnable example. No further Pro response is needed to start implementation planning.
This Strategy ranking does not assign the automation's next research topic.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/repeatable-analysis-workflows/assets/pro-results/repeatable-analysis-2026-10-25/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
