---
title: "Durable editorial chart styling — implementation plan"
slug: "editorial-chart-styling"
phase: plan
status: draft
last_updated: "2026-10-06"
---

# Durable editorial chart styling — implementation plan

## Plan at a glance

Prove the riskiest product claim first. One chart header has to look right in Compact and in Newsprint without crowding the plot. Milestone 1 delivers that on the scatter and bar charts: a Theme tab with two themes, a restyled header with a subtitle and source note, and a saved theme. Milestone 2 adds themed axis text and overrides on the same two charts, which completes the shaped first proof. Report and the five remaining axis families wait for that gate. Color reach comes after typography because it touches saved color scales across every chart and needs its own conversion proof. Host integration and the coverage handoff come last.

Material pushback:

- **CSS is the source of truth.** Themes are CSS custom properties on the workspace root, keyed by `data-eda-theme`. A host overrides them the same way it overrides `--primary` today. JavaScript reads back computed values for measurement and Canvas color. There is no second token store in TypeScript to keep in sync.
- **Measure text instead of estimating it.** `axisPlan` estimates width as 0.6 × font size, which breaks under serif stacks. The header height is hard-coded as `58 - headerExtra` in `PlotChartPanel`. Both become measured values before any editorial theme ships.
- **No new saved field is required.** Each new field is optional, an absent theme means Compact, and older saves open unchanged. Chart defaults already leave `tickFontSize` and `labelFontSize` unset, so any explicit value in a save is a real user override.

Each milestone ships as its own PR with a changeset and leaves the package releasable. Compact remains the default and the rollback at every step.

## Implementation strategy

- **First proof:** Compact and Newsprint on the scatter and bar charts. The proof needs one restyled header, a subtitle, a note, an active filter, and hover actions.
- **Primary seams:**
  - Theme tokens as CSS variables on `.eda-workspace[data-eda-theme]`.
  - A pure `listStyleOverrides(state)` function.
  - A pure header height budget function.
  - A font-aware `measureText` behind `axisPlan`.
  - A palette reference plus slot for categorical scales.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run <files>`, `pnpm --filter exploreda check-types`, and `pnpm --filter demo dev` checked in the in-app browser at wide, intermediate, and narrow widths. The demo runs the library from source, so no build is needed.
- **Local dependencies:** Browser text metrics and Canvas are the only hard dependencies, and both are real in the first proof. jsdom cannot measure layout, so geometry rules live in pure functions with unit tests. The browser confirms the rendered result.
- **Failure injection:**
  - Long titles, subtitles, and notes.
  - Narrow tiles.
  - Facets.
  - Toggling `.dark` on `<html>` from the browser console.
  - A host webfont that loads late, simulated with a delayed `@font-face`.
- **Rollout and rollback:** Choosing Compact restores today's rendering. Older saves have no `theme` and open as Compact. Each milestone's PR can be reverted alone.

## Milestone 1: Pick Newsprint and see one restyled header

This is the fastest meaningful proof of the decision the shape depends on. It deliberately excludes axis typography, overrides, Report, and color.

- **Change — Theme state and persistence**
  - Add optional `theme?: { id: "compact" | "newsprint" }` to `SavedDataStructure`. Load and save it in `DataLayerProvider` and `dataLayerState`. When it is absent, the workspace is Compact.
  - Add optional `subtitle?: string` and `note?: string` to `BaseChartSettings`.
  - Verify: round-trip tests in `saveDataUtils.test.ts` and `DataLayerProvider.test.tsx`. A save made before themes opens as Compact.
- **Change — Theme tokens**
  - Define role tokens in `index.css` on `.eda-workspace`:
    - `--eda-font-headline`, `--eda-font-body`, `--eda-font-numeric`;
    - headline and subtitle size, weight, and color;
    - note, panel surface, and rule tokens.
  - Compact's values reproduce today's look exactly. Newsprint overrides them under `[data-eda-theme="newsprint"]`, with `.dark` variants.
  - The workspace root sets `data-eda-theme`.
  - Verify: Compact parity, described below.
- **Change — Theme tab with picker**
  - Add a Theme tab to `WorkspaceSettingsDrawer` beside Colors, with an `ActionTooltip` on each option.
  - Selecting a theme updates state through the normal settings path, so the demo's history records one undo step. The picker is disabled in read-only workspaces.
  - Read [UI defaults](../../ui-defaults.md) before building the controls.
  - Verify: component test for selection and the disabled state. In the browser, undo restores the previous theme.
- **Change — One header in `PlotChartPanel`**
  - Restructure `.eda-panel-header` into a title block with:
    - the title, styled by the theme with a two-line `line-clamp`;
    - a subtitle line that also holds persistent status (filter clear, table search, local filters) and the pointer readout.
  - Actions and the drag grip become an absolutely positioned overlay in the top-right corner. They use the existing hover and focus reveal and get a solid backing. On coarse pointers they stay visible and the title reserves that corner.
  - Add the note below the chart content.
  - Add a clip marker, using `ActionTooltip`, when the title, subtitle, or note overflows. The full title stays in the accessible name and the tracing title.
  - Fold the `.eda-panel-expanded` title CSS into the theme tokens.
  - Add subtitle and note inputs beside the title in `LabelsSettingsTab`.
  - Verify: `PlotChartPanel.test.tsx` covers the subtitle and note rendering, the full accessible name, an always-visible status, and the clip marker when overflow is reported.
- **Change — Measured header and note height**
  - Replace `panelHeight - 58 - headerExtra` with measured header and note heights. Use the ResizeObserver pattern from the facet bar.
  - Extract a pure `planPanelBody({ panelHeight, headerHeight, noteHeight, stripHeight, legendHeight })` with a minimum plot height.
  - Verify: unit tests for the budget, including a clamped two-line title and an empty note.
- **Change — Compact parity guard**
  - Before the header change, capture demo screenshots under `tmp/` at the three widths for a scatter, a bar, a faceted chart, and a table chart. Recapture after the change and compare them side by side.
  - Verify: the only differences appear on charts that have a subtitle.

### Desired end state

- A user opens the Theme tab, chooses Newsprint, and sees scatter and bar headers restyle live. Undo reverts the switch.
- Every family renders through the same header. Compact matches the baseline screenshots.
- Titles clamp at two lines with a marker. Filter status never hides. Nothing overlaps the plot at any of the three widths.
- The theme, subtitle, and note survive save and reopen. Row counts and filters don't change.

## Milestone 2: Themed axis text and findable overrides on scatter and bar

This milestone completes the shaped first proof. It isolates the measurement risk and the override model on two families with different renderers.

- **Spike — Font-aware text width**
  - Decision required: use Canvas `measureText` with the computed font, or keep a heuristic with a per-stack width factor.
  - Evidence to gather:
    - label overlap at three widths under Newsprint;
    - planning time on a 10,000-row scatter with many ticks;
    - behavior after the `document.fonts.ready` re-measure.
  - Fallback: a width factor per font role, read from a CSS variable, with a cached measurement for each label string.
- **Change — Theme-driven axis typography**
  - `BaseChart`, `barPlan`, and `scatterPlan` read the tick and axis-title size from the theme when `AxisSettings.tickFontSize` or `labelFontSize` is unset. An explicit value stays an override.
  - `AxisLayer` takes the font family, weight, and color from role tokens.
  - Pass the measured widths into `axisPlan` and re-plan after `document.fonts.ready`.
  - Verify: `Axis.test.tsx` and new `axisPlan` cases with a wide-glyph measurer. Labels grow the margins instead of overlapping.
- **Change — Chart style overrides**
  - Add optional `style?: { titleSize?, titleWeight?, subtitleSize?, subtitleWeight? }` to `BaseChartSettings`.
  - Write overrides as inline CSS variables on that panel.
  - Show "Reset to theme" for each property in the chart settings. Reset clears style keys only.
  - Verify: unit tests show that reset leaves fields, filters, scales, and layout unchanged.
- **Change — Overrides list**
  - A pure `listStyleOverrides(state)` returns the chart, property, value, and theme value. Explicit axis font sizes count as overrides.
  - Render the list under the picker, grouped by chart, with a reset on each row. Clicking a row focuses the chart through `chartFocus`.
  - Verify: unit tests for the list, plus a component test for reset and focus.

### Desired end state

- Newsprint axis text appears on scatter (Canvas and SVG) and bar (SVG) with no overlap at three widths. The Spike decision is recorded in the map.
- An enlarged title is listed under Overrides, survives Newsprint → Compact → Newsprint, and resets cleanly.
- **Gate:** if parity, measurement, and overrides hold, start Milestone 3. If Compact drifts or labels collide, fix the tokens or the measurement first.

## Milestone 3: Report theme and the remaining axis families

The contract has passed the gate. Now prove that it carries a second editorial look and generalizes.

- **Change — Report theme**
  - Add the sans Report stack, spacing, and restrained accent tokens with `.dark` variants. Register Report in the picker.
  - Hold a side-by-side visual study with Byron on a demo engineering dataset before finalizing the Newsprint and Report tokens.
- **Change — Extend axis typography to row, line, box, histogram, and ECDF**
  - Route each family's axis plan through the themed sizes and the measurer.
  - Verify: existing family tests pass, and each family is checked in the browser under all three themes in light and dark.
- **Change — Coverage list**
  - Keep the coverage table below current, and record each family's status in the map.

### Desired end state

- Three themes are in the picker. Seven families have full typography, and every family shares the header.
- Switching themes in light and dark misses no text in the covered families.

## Milestone 4: Color reach

Typography is stable at this point. This milestone isolates the saved-color conversion risk.

- **Change — Categorical scales store palette and slot**
  - Extend `CategoricalColorScale` with `slots?: [category, slotIndex][]` next to the existing `paletteId`. Resolve the hex for the current theme and light or dark mode at render time.
  - A hand-picked hex stays a literal value and appears in the overrides list.
  - Convert legacy scales on load only when every color matches its palette slot. Any other scale stays literal, so visible colors never change.
  - Verify:
    - conversion tests in `colorScaleMath.test.ts`;
    - a theme switch preserves the category-to-slot assignment;
    - dark mode resolves the dark steps.
- **Change — Theme default palette and ramp**
  - Themes name a default categorical palette and ramp as CSS variables. Charts with no scale use them.
  - Canvas consumers resolve colors through the CSS-to-hex helper from `ThreeDScatterChart`, moved to `lib/`. They re-render on the existing `useThemeKey` hook, extended to watch `data-eda-theme`.
- **Change — Line chart, region map, and density**
  - `LineChart.tsx` drops `COLOR_PALETTES` for the shared categorical palettes.
  - `regionMapPlan` and `densityPlan` use the theme ramp instead of the fixed d3 Blues and RdBu ramps.
- **Change — Reorder categories**
  - Add drag and keyboard reordering of slots to `ColorScaleEditor`.
  - Verify: `ColorScaleEditor.test.tsx`.

### Desired end state

- A theme switch recolors every chart, Canvas included, while keeping each category's slot.
- Older saves look identical after loading.

## Milestone 5: Host integration and handoff

- **Change — Host tokens and fonts**
  - Document the role variables in the package README. A host can point `--eda-font-headline` at its own webfont.
  - Add a demo example that applies host tokens.
  - Verify: the late-loading font is re-measured without overlap.
- **Change — Docs and coverage**
  - Update `docs/ui-defaults.md` for the header layout and the Theme tab.
  - Update the next-pass coverage list.
  - Make sure each PR's changeset is in place.

### Desired end state

- A host can brand the editorial themes without forking CSS. The remaining families are listed as tracked work.

## Cross-cutting verification

- Run `pnpm check` once per PR before opening it, never from several worktrees at the same time.
- Attach PR screenshots of Compact, Newsprint, and later Report, at three widths.

**Coverage list** (✓ done in this initiative, → next pass):

| Family | Header | Axis text | Color reach |
| --- | --- | --- | --- |
| scatter, bar | ✓ M1 | ✓ M2 | ✓ M4 |
| row, line, box, histogram, ECDF | ✓ M1 | ✓ M3 | ✓ M4 |
| data table, pivot, summary, metric card, markdown | ✓ M1 | → | → |
| map, calendar, heatmap, 3D scatter, Sankey, parallel coordinates, color legend | ✓ M1 | → | ✓ M4 for map and density; → for the rest |

## Open decisions and spikes

1. **Visual sign-off:** approve the Newsprint and Report tokens at the Milestone 3 study. Fallback: ship Newsprint alone and keep Report behind the picker until it is approved.
2. **Host lock:** decide whether a host can lock the theme or hide the picker. Default for now: no new prop. Revisit it in Milestone 5.
3. **Text measurement:** settled by the Milestone 2 spike, with the per-stack factor as the fallback.

## Below the cut line

- A theme editor, importing themes, and user-authored themes.
- Bundled webfonts.
- Direct annotations.
- Automated pixel-diff visual regression.
- Per-chart surface and spacing overrides.
- Next-pass families: tables, metric card, markdown, calendar, heatmap, 3D scatter, Sankey, parallel coordinates, and color legend.
- In-place title editing gestures, owned by [in-place editing](../in-place-chart-editing/intent-brief.md). This plan leaves the header usable as a drag handle and writes the same `title`, `subtitle`, and `note` settings.
