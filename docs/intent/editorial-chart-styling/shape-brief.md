---
title: "Durable editorial chart styling — shape brief"
slug: "editorial-chart-styling"
phase: shape
status: current
last_updated: "2026-10-06"
---

# Durable editorial chart styling — what we are adding

**Outcome:** A user picks a workspace theme and every chart restyles to match. Under an editorial theme, charts carry a wrapping headline, a subtitle, and a source note. A chart can keep its own text sizes or palette, and one list shows every such exception.

**Primary flow:** Open the Theme tab → choose Newsprint → charts restyle live → add a subtitle and source note → enlarge one title → see it under Overrides → switch to Report → only the override stays → save and reopen.

## Feature scope

```text
Workspace themes
├── PLANNED ADDITIONS
│   ├── Theme picker — new Theme tab in workspace settings, beside Colors
│   │   ├── Compact — default; today's look, also for older saves
│   │   ├── Newsprint — serif headline, warm paper, hairline rules
│   │   ├── Report — sans, generous space, restrained accent
│   │   └── live switch, one undo step, saved with the analysis
│   ├── What a theme sets
│   │   ├── text roles: headline, subtitle, axis title, tick, note
│   │   │   └── each with a font stack, size, weight, and color
│   │   ├── surfaces and rules: panel, gridlines, plot frame
│   │   └── default categorical palette and numerical ramp, light and dark
│   ├── Host defaults — design-system tokens fill unset values
│   │   └── a host may point a font role at its own webfont
│   ├── One chart header, styled by the theme (every family)
│   │   ├── title — wraps to 2 lines, then clamps with a hint
│   │   ├── subtitle — new authored text
│   │   ├── actions and drag grip float over the title's top-right
│   │   ├── status (filter clear, search, local filters) stays shown
│   │   └── source note — new authored text below the plot
│   ├── Themed axis text — bar, row, scatter, line, box, histogram, ECDF
│   │   └── axis spacing uses theme sizes, so labels claim room
│   ├── Chart overrides
│   │   ├── title and subtitle size and weight; axis text sizes
│   │   ├── named palette, stored as a reference
│   │   └── reset per property or per chart; analysis untouched
│   ├── Overrides list — under the picker in the Theme tab
│   │   └── chart → property → value vs. theme → reset; click focuses
│   └── Color reach, so a theme switch misses nothing
│       ├── line series use the shared categorical palettes
│       ├── region map and scatter density use theme ramps
│       ├── categorical scales store palette + slot, not hex
│       └── reorder categories in the scale editor
├── NEXT COVERAGE PASS — tracked in the plan's coverage list
│   └── tables, metric card, markdown, map, calendar, heatmap,
│       3D scatter, Sankey, parallel coordinates, color legend
└── LATER POSSIBILITIES
    └── theme editor or import, annotations, host theme lock
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Switch theme | Linked properties restyle at once. Overrides keep their values. One undo step reverts the switch. |
| Open an analysis saved before themes | It renders in Compact with no reflow and nothing to migrate. |
| Title longer than two lines | Ellipsis plus a clip marker whose tooltip suggests widening the chart or shortening the title. The accessible name keeps the full title. |
| Subtitle or note too long | Subtitle clamps at two lines, the note at one, with the same marker. *(Proposed default.)* |
| Larger or serif axis text | Margins grow to fit measured text; labels never overlap. |
| Theme switch on a categorical scale | Each category keeps its slot; only the slot's color changes. A hand-picked hex counts as an override and is listed. |
| Dark mode | Themes and palette-reference overrides resolve their dark steps. |
| Pointer over the header | Actions fade in over the title's top-right corner on a solid backing, without reflow. On touch they stay shown and reserve the corner. |
| Chart has active filters or a search | Status marks sit on the subtitle line and never hide on hover. The pointer readout takes the same line's right end. |
| Reset a chart to theme | Style overrides clear. Fields, filters, scales, and layout stay. |

## Examples

One header, two themes. Hovered (actions shown) *(proportions illustrative)*:

```text
Compact                            Newsprint
┌ Yield by reactor   ⧉ ⚙ ✕ ┐       ┌ Yield rose fastest ⧉ ⚙ ✕ ┐
│ Batch yield, 2024–26   ⊘ │       │ in the second half…  ◦   │
│   plot                   │       │ Batch yield, 2024–26   ⊘ │
└──────────────────────────┘       │   plot                   │
                                   │ Source: plant QA log     │
                                   └──────────────────────────┘
```

At rest, actions hide and the title takes the full width. `⊘` is the always-visible filter status.

## Decisions and boundaries

**Appetite:** One theme contract, three themes, the headline in shared chrome, themed axes on seven families, and the four color-reach fixes. It does not include a theme editor.

**Key decision — one header, restyled:** There is one chart header, never a toolbar strip plus a headline. The theme sets its type, spacing, and rules. Actions and the drag grip already hide until hover on pointer devices, taking no room. They now float over the title's top-right corner rather than sitting in a row. Filter status and the pointer readout move to the subtitle line. Compact changes only when a chart has a subtitle.

**Key decision — measure, don't assume:** Chart height currently subtracts fixed header allowances. The measured headline and note heights, along with font-aware axis text widths, replace those constants, following the existing facet-bar measurement. Without this, larger type overlaps marks.

**Key decision — Compact is the rollback:** Compact must reproduce the current workspace at wide, intermediate, and narrow widths before an editorial theme ships. Switching to Compact always restores today's rendering.

**Boundary:** The work ships no font files, CSS editor, or per-chart surface and spacing overrides. New saved fields are optional, so older saves stay valid. Static output belongs to [analysis export](../analysis-export/intent-brief.md). In-place title editing belongs to [in-place editing](../in-place-chart-editing/intent-brief.md), and it writes the same settings.

**First proof:** **Try:** The Theme tab with Compact and Newsprint, the restyled header with a subtitle, note, active filter, and hover actions, and themed axes on the scatter chart (Canvas and SVG) and the bar chart (SVG). Add one listed title-size override. **Observe:** At three tile widths, the title clamps at two lines with the marker. No text overlaps marks. Compact matches current screenshots, and Newsprint ↔ Compact keeps the override. Save and reopen restore it, and row counts don't change. **Decide:** If measurement and parity hold on both families, add Report and extend to the other five axis families. If Compact drifts from today, fix the token mapping before any editorial work continues.

**Open choices:** (1) Approve the Newsprint and Report visuals after a side-by-side study on a real engineering dataset. (2) Decide whether a host can lock the theme or hide the picker.

See the [intent brief](intent-brief.md).
