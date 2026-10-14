---
title: "Notebook analysis with synchronized definitions — implementation plan"
slug: "notebook-analysis"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Notebook analysis — implementation plan

## Plan at a glance

The risk is write-back, not rendering. M1 proves the notebook format and minimal write-back as plain library functions. The proof is a fixture of the forecast notebook written by an agent, plus `exploreda-dsl check` and `fmt` support for `.eda.md`. If the token splice can't keep edits to fields, chart type, filters, axes, and color minimal, the work stops and fidelity gets revisited before any UI is built.

M2 reads notebooks in the app and reloads on outside edits, with graph controls still read-only. The editor-plus-preview path is then usable without write-back. M3 turns on graph write-back. M4 adds in-app source editing, then the docs and the example.

**Pushback:** existing `.eda` analyses save by regenerating the whole file (`analysisFileText` → `exportAnalysisText`). Notebooks must not take that path. They save by applying text edits to the file as it is, so prose, comments, and order survive. The saver and file watching from local projects are reused as they are.

## Implementation strategy

- **First proof:** `exploreda-dsl check forecast.eda.md` passes, and write-back fixtures yield minimal diffs for the five edit kinds.
- **Primary seam:** `src/lib/notebook`, built from `parseNotebook` (prose and `eda` segments with offsets), `compileNotebook` (one combined compile with an output-to-block map), and `writeBackChart` (settings diff to text edits). The UI and CLI call only these.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/lib/notebook`
- **Local dependencies:** the cleaned forecast CSV in an example project folder, plus fixture notebooks with comments and odd formatting.
- **Live confirmation:** `npx exploreda` on the example project in the browser at 1280, 783, and 390 px.
- **Rollout and rollback:** only `.eda.md` files become notebooks, so `.eda` analyses are untouched. A notebook write-back switch turns graph edits off and leaves text editing intact.

There are no outside providers. The work builds on [local project](../../../packages/explorEDA/README.md#explore-a-folder-of-data)s, which shipped in full: the folder scan (`lib/project/folder.ts`), the app saver (`apps/app/src/saver.ts`), file watching, and the demo's folder access. Nothing blocks any milestone.

## Milestone 1: Notebook text compiles, checks, and writes back minimally

This proves the riskiest piece headlessly. It leaves out every UI change.

- **Change — Forecast example data**
  - Retrieve the forecast CSV and fix its units, timestamps, missing values, and duplicate hours. Add it to an example project folder with expected values for `delta`.
  - Verify a few `delta` values by hand against the source.
- **Change — `parseNotebook` and `compileNotebook` in `src/lib/notebook`**
  - Split the file at ` ```eda ` fences. Gather every block into one compile, so definitions apply file-wide in any order. Map each output back to its block.
  - Report duplicate names and cycles as diagnostics, with lines in file coordinates.
  - Fixtures cover order-free use, definition-only blocks, several outputs in one block, a duplicate name, and an invalid block.
- **Change — `writeBackChart(text, chart, before, after)`**
  - Compare the saved settings for fields, chart type, filters, axes, and color. Map each changed key to its token span using `DslSpan` from `lib/dsl/parse.ts`, and splice the text.
  - When a key has no token yet, or the chart type changes, rewrite only that declaration through the exporter.
  - Fixtures assert the exact output text, including trailing comments, multi-line bodies, and quoted values.
- **Change — CLI**
  - `exploreda-dsl check` and `fmt` accept `.eda.md`. `fmt` changes only the text inside fences.
  - Have an agent write `forecast.eda.md` from `exploreda-dsl reference`, and keep the result as a fixture.

### Desired end state

- `check` reports zero problems for the agent-written forecast notebook and correct line numbers for a broken one.
- Write-back fixtures show only the changed tokens, plus one rewritten declaration for the type change.
- The decision rule from the shape brief has been applied and recorded.

## Milestone 2: Read a notebook in the app and follow outside edits

This delivers the editor-plus-preview surface. Graph controls stay read-only.

- **Change — Project scan** treats `*.eda.md` as notebooks, separate from analyses, and lists them in the workspace. Extend the app's reload filter (`affectsProject` in `apps/app/src/App.tsx`, which matches only `.eda` and data files) and the demo's folder scan to match.
- **Change — `Notebook` view** renders one column: Markdown prose, then each block's outputs at full width. All outputs share one data layer, and clicks and brushes stay local to their chart.
- **Change — Live reload** reuses file watching: an outside save recompiles the notebook. An invalid block keeps its last valid result, dimmed and with its diagnostic.
- Verification: component tests for block mapping and frozen results, and browser checks at three widths.

- **Spike — Rendering path**
  - Decision required: a dedicated column renderer, or the existing grid with one full-width band per output.
  - Evidence to gather: render forecast both ways and check chart controls, sizing, and local selection.
  - Fallback: the grid with full-width bands.
- **Spike — Local selections**
  - Decision required: how chart filter state is kept local per chart in notebook mode.
  - Evidence to gather: where chart filters join the shared filter state today.
  - Fallback: the notebook turns off cross-chart filtering for all charts.

### Desired end state

- Editing `delta` in VS Code updates every dependent chart in the open app.
- Brushing the event window leaves the full series intact.
- `.eda` analyses behave as before.

## Milestone 3: Graph edits write back to the file

- **Change — Notebook saver path:** chart setting changes call `writeBackChart`, and the saver queues the edited text, never an export. The disk still wins on outside edits.
- **Change — Write-back switch**, plus disabled controls on frozen blocks.
- Verification: in a browser session, make the five edit kinds on forecast, then inspect `git diff` and reopen.

### Desired end state

- The first proof from the shape brief passes in the real app.
- Turning write-back off leaves the controls read-only and keeps text editing working.

## Milestone 4: Edit source in the app; docs and example

- **Change — Source toggle per block:** a DSL editor with highlighting from `lib/dsl/highlight.ts`, plus debounced live recompile. Prose is edited as Markdown source.
- **Change — Docs:** a README "Notebooks" section and a docs page, with the forecast notebook as the example project.
- Verification: browser checks at three widths for toggling, editing, and invalid text.

### Desired end state

- All three surfaces work on one file: the app, an outside editor, and the CLI.
- The docs show the file format, write-back coverage, and the local-selection rule.

## Open decisions and spikes

The rendering path and local selections are the two spikes in M2. The Markdown renderer is chosen in M2 by the same rule as any other dependency: small, maintained, and safe for untrusted text.

## Below the cut line

- Write-back for other settings: sizes, labels, and styling details.
- Opt-in shared selections, named intermediate results, and live values in prose.
- Export, sharing, and a published reading mode.
- A `<Notebook>` component for hosts outside projects.
