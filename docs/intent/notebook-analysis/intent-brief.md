---
title: "Notebook analysis with synchronized definitions"
slug: "notebook-analysis"
phase: plan
status: current
last_updated: "2026-10-13"
---

# Notebook analysis with synchronized definitions

## My read

Make an analysis readable as a notebook: explanatory text, calculation blocks, and graphics interleaved in one reading column. Each block spans that column. The experience should feel closer to Observable than to a dashboard grid.

A notebook is its own file, `name.eda.md`: Markdown prose with fenced `eda` blocks written in the dashboard language. It lives in a [local project](../../../packages/explorEDA/README.md#explore-a-folder-of-data), beside that project's `.eda` analyses, and reads the project's sources and joins.

Text and graphs are two ways to edit the same analysis. Editing a block's text updates its results live. Editing a graph through explorEDA's controls writes the smallest matching change back into the block, keeping comments and formatting intact.

The first users carry equal weight. An agent drafts a notebook and hands it to a person. An analyst also works in a notebook for themselves. Publishing for outside readers comes later.

## What matters most

- Explanation sits beside the calculation and result it describes.
- Graph edits land in the file as minimal, reviewable diffs.
- The file is plain, diffable text that agents and people can both write.
- The notebook reuses the language, charts, and project data of the rest of explorEDA.

## The intended experience

An agent writes `forecast.eda.md` into a project. It explains the forecast question, defines `delta = actual - forecast`, plots the signed difference, and zooms into an event window. `exploreda-dsl check` reports no problems. The analyst opens the project in the app and reads the notebook top to bottom. They recolor the delta chart through its controls, and the file changes by one setting. They then fix a calculation in their text editor. The app reloads, and every chart that uses `delta` updates. Brushing the event window affects only that chart.

## Boundaries

### Must be true

- Definitions (calculations, field aliases, scales) are shared across the whole file, in any order.
- A block can hold definitions only, or several outputs stacked full width.
- Results update automatically whenever a block's text is valid.
- Write-back changes only the affected tokens. If an edit has no token-level form, only that one declaration is rewritten.
- While a block's text is invalid, its last valid result stays visible but frozen, beside the diagnostic.
- Clicks and brushes filter only their own chart.
- People can edit in the app or in an outside text editor, and agents can check notebooks from the command line.

### Must be avoided

- Rewriting text the person did not touch.
- Two competing versions of a block, one in the graph and one in the text.
- A general programming runtime, arbitrary JavaScript, or remote kernels.
- Replacing dashboards or the `.eda` analysis format.

## What seems settled

- File format `.eda.md`. `.edamd` is the fallback if tooling fights the double extension.
- Built on local CLI projects: project scan, file watching, autosave, and the rule that the disk wins on outside edits.
- Forecast performance is the first end-to-end reproduction, including an agent-authored draft.
- Export, sharing, and publishing are out of the first release.
- First graph write-back covers fields, chart type, filters, axes, and color.
- Prose is edited as Markdown source in the app.

## Possibilities, not decisions

- Opt-in shared selections between blocks, needed for Date Patterns-style work.
- Named intermediate results ([reusable analysis outputs](../reusable-analysis-outputs/intent-brief.md)) and live values in prose ([data-bound narrative](../data-bound-narrative/intent-brief.md)).
- A `<Notebook>` component for host apps outside projects.

## Current reality that matters

- [Dashboard text](../../../packages/explorEDA/README.md#dashboard-text) compiles and exports full dashboards. Its parser records a line and column for every item, and comments start with `#`, so token-level splicing is feasible. The exporter regenerates canonical text and would not preserve edits on its own.
- Local projects shipped (`npx exploreda`, PRs through #376). They treat every `.eda` file as an analysis, autosave, and reload on outside edits. `.eda.md` files are ignored today, so there is no collision.
- The [research synthesis](research-synthesis.md) explains why forecast performance comes first. Its CSV has to be retrieved and cleaned before expected results are fixed.

## Next step after confirmation

Follow the [implementation plan](implementation-plan.md), which starts with write-back fixtures.
