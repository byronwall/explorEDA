---
target: main landing and workspace IA
total_score: 66
max_score: 100
na_heuristics: 
p0_count: 1
p1_count: 4
timestamp: 2026-09-16T02-52-06Z
slug: packages-exploreda-src-components-plotmanager-tsx
---
# explorEDA main UI critique

Method: dual-agent (A: `/root/main_ui_assessment_a` · B: `/root/main_ui_assessment_b`)

Target: main landing and workspace at `http://127.0.0.1:5175/explorEDA/`
Mode: Operate

## Overall assessment

The shell fails its primary chart-first task. Most examples open with two large tables, while charts require further discovery. The strongest system behavior is visible filter state. The weakest behavior is the combination of table-first hierarchy, hidden horizontal overflow, repeated chart chrome, and mobile settings that leave the viewport.

## Heuristic score

| Heuristic | Score | Evidence |
|---|---:|---|
| Visibility of system status | 8/10 | Row scope, filter chips, and clear-all update together. |
| Match to real-world intent | 8/10 | Example titles use analytical questions. |
| User control and freedom | 7/10 | Return and filter recovery are clear; restore is unclear. |
| Consistency and standards | 7/10 | Controls repeat consistently but consume too much space. |
| Error prevention | 6/10 | Blank charts can be created before fields are selected. |
| Recognition over recall | 7/10 | Examples aid recognition; technical field names remain unexplained. |
| Flexibility and efficiency | 8/10 | Creation, filtering, settings, calculations, and export are available. |
| Aesthetic and minimalist design | 6/10 | Tables, chrome, borders, and controls compete with the analysis. |
| Error recovery | 6/10 | Recovery exists but is not central or always clear. |
| Help and documentation | 3/10 | Scales, missing values, and advanced controls lack contextual help. |
| **Total** | **66/100** | |

## Data-visualization verdict

Verdict: fail. The default workspace does not provide a chart, wide tables hide essential content, and mobile settings are clipped outside the viewport.

Critical gates:

- Purpose: fail for the default workspace because it opens with tables only.
- Truth: needs work because units and missing-value treatment are not visible.
- Meaning: needs work because technical field names require interpretation.
- State: pass because row counts and filters remain visible.
- Readability: fail on mobile because table columns and the settings dialog are clipped.

## Evidence

- The landing page presents 11 equal-weight example cards in one flat catalog.
- The mobile example catalog is about 2,900 pixels tall.
- The default Palmer workspace opens with Summary Table and Data Table. No chart is visible.
- The Data Table measures 1,248 pixels of content inside a 777-pixel desktop viewport.
- The mobile Data Table measures 1,107 pixels of content inside a 312-pixel viewport.
- The mobile settings dialog opened from x=-91 and lost its left edge.
- A newly created row chart appeared below the fold near y=807 without a focus or scroll transition.
- The default Palmer workspace exposes 56 tabbable controls.
- Lorenz shows the best pattern: an analytical question, visible brush state, 159 of 1,000 rows, removable filters, and an explanatory note.

## Priority issues

### P0: The default workspace is table-first

Opening ordinary data shows field summaries and raw rows instead of a useful chart. This conflicts with the product promise and makes Add chart a required discovery step.

### P1: Mobile settings leave the viewport

The chart settings dialog is unusable at 390 pixels because it is wider than the viewport and positioned offscreen.

### P1: Tables hide columns without a clear affordance

Desktop and mobile tables depend on unmarked horizontal scrolling. The identity field is not preserved during horizontal movement.

### P1: The landing page is a flat decision wall

Eleven fixed-height cards, import, and feature coverage compete with no grouping by user intent.

### P1: Chart creation has weak completion feedback

New charts can appear below the fold. The source action changes state, but the result is not brought into view or announced clearly.

### P2: Persistent controls outrank the data

Grid Settings, Color Scales, restore, repeated panel controls, and large table chrome remain visible when they are not part of the current task.

## Remove, hide, and keep

Remove from the primary path:

- Feature coverage beside the example heading.
- Empty controls that have no current effect.
- Fixed example card heights.

Hide until requested:

- The full example catalog.
- Summary and raw rows.
- Restore until it has a meaningful snapshot.
- Grid Settings, Color Scales, and advanced workspace actions.
- Duplicate, delete, export, and other secondary panel actions.

Keep prominent:

- Import data.
- A small featured-example set.
- Question-led example titles.
- The primary chart canvas.
- Current row scope, filter chips, and clear-all.
- Add chart and chart-specific settings.

## Target information architecture

Landing:

1. One primary import action.
2. Three featured examples organized by analytical task.
3. Show all examples disclosure.
4. Feature coverage in a secondary Learn section.

Workspace:

1. Dataset or example question and Back to examples.
2. Charts, Rows, and Calculations modes.
3. Add chart and one View options menu.
4. Persistent scope strip with row count and filters.
5. Primary chart canvas.
6. Field summary collapsed or inside Rows.

## Required implementation order

1. Make the workspace chart-first and move tables into a Rows mode.
2. Repair mobile dialogs and table overflow.
3. Distill the landing page to featured examples plus Show all.
4. Add visible completion feedback when a chart is created.
5. Reduce repeated and global chrome after the primary flow works.

## Detector and verification limits

The Impeccable detector reported one false positive on the circular loading spinner in `LandingPage.tsx`. Browser overlay injection was unavailable, so both assessments used screenshots, DOM geometry, focus order, and interaction evidence. A concurrent edit caused a temporary Vite reload failure after the main browser pass; final verification must use a clean compiled build.
