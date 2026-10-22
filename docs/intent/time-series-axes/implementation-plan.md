# Proposed implementation sequence

Status: proposed. All new product proofs are unrun. This research PR does not start implementation.
See the original [proof plan](raw/2026-10-18-pro/proof-plan.md) for fixture data and complete rejection conditions.

## Core sequence

| Milestone                            | Work and dependency                                                                                                | Proof before proceeding                                                                                                                          | Docs and example in the same milestone                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0: ownership and presentation proof | Inspect existing state owners; choose old-save policy; compare focused axis, paired axes, and lanes                | Identify units and ruler ownership at 1280, 783, and 390px; one secondary edit survives cancel, commit, undo, trace, and export                  | No public feature; record prototype evidence in this initiative                                                                                                                                           |
| M1a: original values                 | Build lookup from original observation rows, independent of drawing reduction                                      | Exact values and IDs survive width changes; duplicates remain reachable; asynchronous readings name actual times                                 | `line.mdx`: Observation lines and Calendar summaries, Read original values; example `line-original-values`                                                                                                |
| M1b: Calendar references             | Separate slice after source-scope inspection; retain aggregate grain and missingness                               | Boundary weeks stay fixed under linked filters; invalid, absent, and observed zero stay distinct; filtered averages and signed sums can expand Y | `line.mdx`: Missing calendar periods and stable ranges; example `line-calendar-missing-weeks`                                                                                                             |
| M2: arbitrary scale groups           | After M0 and original-value proof; named groups, Own scale, range edits, focused/paired view, explicit Select/Zoom | Secondary edits affect only their owner; focus changes no settings; limits clip without filtering; Notes and save/export retain meaning          | `line.mdx`: Shared and independent scale groups, Focus a scale, Ranges/log/clipping, Select versus zoom, Save and share scale meaning; examples `line-mixed-units-scale-groups`, `line-same-unit-outlier` |

M1a and M1b are independent after source ownership is known. Calendar repairs must not become a hidden prerequisite for arbitrary observation scales.
The feature release can stop at accepted M2. Keep one PR per implemented milestone under repository rules.

## Conditional work

| Milestone                          | Reopen when                                                     | Proof                                                                                                                                                 | Docs and example                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| M3: shared-time lanes              | Focused/paired views do not serve dense value-reading tasks     | Overlay/lane switch preserves groups, ranges, time, row IDs, and Notes; every lane remains reachable and export is complete or labeled partial        | `line.mdx`: Compare in shared-time lanes; example `line-shared-time-lanes`                                                     |
| M4: raw long-form tags and density | A named task needs independently sampled tags in one long table | Preserve 1,195 synthetic records, null, duplicate, spike, and 118-second gap; reduced geometry retains endpoints/extrema without losing source access | `line.mdx`: Raw tags, Irregular samples/duplicates/gaps, Dense data and source fidelity; example `line-irregular-process-tags` |

For every visible milestone, update `apps/demo/src/demos/examples.ts`, `dashboardSettings.ts`, and `coverage.ts`.
Register its docs example in `apps/demo/src/docs/live/examples.ts`. Reuse the same synthetic fixture in tests and demos.
Future package changes require a changeset. These proposed example IDs are not implemented routes.

## Four acceptance fixtures

1. Temperature/pressure/flow: at 12:02, read 189 °C, 3.40 bar, and 980 L/min. Flow max 950 clips one sample.
2. Six sensors: shared extent 19.9–80.0 °C; five-peer extent 19.9–20.6 °C. Keep the 59.6 °C outlier difference visible.
3. Twenty tags: preserve the duplicate pair 183.9/188.9 °C, the 226.1 °C spike, null, and declared gap.
4. Weekly sales: first-week Web/Store sums 300/50. Distinguish absent week, real zero, and invalid measure.

The [original fixture section](raw/2026-10-18-pro/proof-plan.md#4-fixture-and-result-ledger) defines exact inputs and expected records.
Fixture arithmetic does not prove chart behavior.

## Reject a release when

- Focus or a secondary range edit changes the wrong group.
- A value comes only from reduced geometry, an interpolation, or a silent duplicate average.
- Linked filtering or X zoom silently refits observation Y domains.
- A Calendar range drops its source reference or pools distinct facet aggregates.
- Keyboard users cannot reach a series, range, value, or trace.
- Save, Notes, undo, or image export loses scale ownership.

Use a few tests that protect these failure points. Use real pointer and keyboard input at the three required widths.
Run targeted tests and typechecks while working. Run `pnpm check` once before each review PR.
Measure density only after defining a real workload. Treat the raw plan's timing budgets as proposals to test.
Do not add normalization, cross-chart sync, live ingestion, or a renderer replacement to this sequence by default.
