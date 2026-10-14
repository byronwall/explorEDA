---
title: "Notebook analysis with synchronized definitions — shape brief"
slug: "notebook-analysis"
phase: shape
status: current
last_updated: "2026-10-13"
---

# Notebook analysis — what we are adding

**Outcome:** An agent or analyst writes a `.eda.md` file in a project. explorEDA reads it as a single-column notebook, and edits made to its graphs come back to the file as minimal diffs.

**Primary flow:** The agent writes `forecast.eda.md`, and `exploreda-dsl check` passes. The person opens the project and reads the notebook, edits a chart in the app (the file changes by one setting), edits a calculation in an editor, and sees the app update.

## Feature scope

````text
Notebook files (.eda.md) in local projects
├── PLANNED ADDITIONS
│   ├── File format
│   │   ├── Markdown prose + ```eda fenced blocks in the dashboard language
│   │   └── Found by the project scan and listed beside .eda analyses
│   ├── Blocks
│   │   ├── Zero or more outputs (charts, tables, metrics), stacked full width
│   │   ├── File-wide, order-free definitions: calc, field aliases, scales
│   │   └── Data from the project's sources and joins
│   ├── Reading view: one column of rendered prose and results
│   ├── Live update: debounced recompile of valid blocks; dependents refresh
│   ├── Graph write-back
│   │   ├── Covers fields, chart type, filters, axes, color
│   │   ├── Token splice for changed settings; comments and spacing kept
│   │   └── Fallback: rewrite only that declaration in canonical form
│   ├── Editing surfaces
│   │   ├── In the app: per-block source toggle, Markdown-source prose, graph controls
│   │   ├── External editor: the app reloads on save (disk wins)
│   │   └── CLI: exploreda-dsl check and fmt accept .eda.md
│   └── Chart-local clicks and brushes
├── EVALUATE BEFORE COMMITTING
│   └── Write-back for other chart settings (sizes, labels, styling details)
└── LATER POSSIBILITIES
    ├── Opt-in shared selections; named intermediate results; values in prose
    ├── Export, sharing, published reading mode
    └── <Notebook> component outside projects
````

## Behavior

| Situation                                                    | Expected result                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| A graph edit changes a setting that is already written       | Only that value's characters change                                                   |
| A graph edit adds a setting or changes the chart type        | That one declaration is rewritten; other lines are untouched                          |
| A block's text becomes invalid                               | Last valid result stays, frozen, with the diagnostic; its graph controls are disabled |
| Two blocks define the same name, or definitions form a cycle | Both blocks show a diagnostic; the rest of the notebook still renders                 |
| A block uses a name defined further down                     | Works; order does not matter                                                          |
| The file changes on disk while the app is open               | The app reloads it; unsaved in-app text loses to the disk, as for `.eda` files        |
| A person brushes the event window                            | Only that chart narrows; the full series above stays intact                           |

## Example

Syntax is a proposal.

````markdown
# Forecast performance

Delta is how far actuals ran from the forecast.

```eda
calc delta = actual - forecast   # signed miss
line @delta x=time y=delta {
  color=#c77a45
}
```

The miss widens after the outage. Zoom into that window:

```eda
line @event x=time y=delta x.min=2024-03-10 x.max=2024-03-14
```
````

If the person recolors `@delta` in the app, only `#c77a45` changes. The comment survives.

## Decisions and boundaries

**Appetite:** One new file kind on the existing project and DSL pipelines. There is no new runtime or store, and no new chart types.

**Key decision:** Write-back is built from the parser's spans, not from the exporter. The app compares a chart's settings before and after an edit and splices only the tokens behind the changed keys. Regenerating whole blocks would have been cheaper, but it breaks the diffable handoff that agents and reviewers depend on. This is the riskiest piece, so it gets proven first, as a library function tested with fixtures before any UI exists.

**Boundary:** Only `.eda.md` files become notebooks, and `.eda` analyses keep working unchanged. Export, publishing, and cross-block selection are out of scope. If write-back misbehaves, turning it off leaves a notebook that is read-only for graph edits but still fully editable as text.

**First proof:** **Try:** An agent writes the forecast notebook into an example project. A person makes five graph edits in the app (field, chart type, filter, axis limit, color) and edits `delta` in an outside editor. **Observe:** The git diff shows only the changed tokens, plus at most one rewritten declaration for the type change. Comments survive. Dependent charts refresh, and reopening the notebook matches what was on screen. **Decide:** If the token splice can't keep these five edits minimal, make declaration rewrite the norm and revisit fidelity with Byron before building more surfaces.

See the [implementation plan](implementation-plan.md) for milestone order.
