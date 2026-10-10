---
title: "Durable editorial chart styling"
slug: "editorial-chart-styling"
phase: shape
status: current
last_updated: "2026-10-06"
---

# Durable editorial chart styling

## My read

Users should be able to fit explorEDA charts to a theme or design system and keep those choices. They should also be able to produce editorial charts with larger titles and deliberate typography. The goal is durable control over a chart's presentation, with room for an authored visual hierarchy.

The primary audience is the end user. Developers deliver this experience through their applications. The interactive workspace itself should feel editorial; this is not a separate presentation or export mode. Users reach the editorial look by choosing a workspace theme. The current compact look stays the default, and the theme picker is built to hold further themes.

The Financial Times, The Economist, The Washington Post, and The New York Times set the visual direction, along with annual and investor-relations reports. These references guide visual studies. They do not select one newspaper's font or a copied layout.

Editorial styling covers a chart's title, subtitle, source note, axes, labels, legend, and plot. Typography must shape the available space as well as the letterforms. The chart should adapt without covering marks or silently shrinking the authored text.

This work extends the existing charts and workspace. It does not depend on the separate composition editor.

## What matters most

- Choose a workspace theme from a picker and opt in to an editorial look.
- Link charts to the global theme and palette, and keep deliberate overrides when saving.
- Give titles, subtitles, source notes, and axis text deliberate typography and space.
- Make every override findable from one place.
- Preserve the meaning of data colors, units, selections, and status indicators.

## The intended experience

A user opens the theme picker and chooses an editorial theme. Every linked chart restyles immediately. They add a subtitle and a source note to one chart, then enlarge that chart's title. The enlarged title is an override, and it appears in the workspace's list of overrides. When they switch to another theme, everything else follows, and the override keeps its value. They save, reopen, and see the same result.

A developer supplies the application's defaults through design-system tokens. The analysis records only the style choices the user made deliberately, and a chart override wins over both. Returning a chart to the theme leaves its analytical settings unchanged.

## Boundaries

Keep compact workspace controls usable while allowing more expressive chart content. The compact defaults do not cap the size of a title under an editorial theme. A title wraps to two lines and then clamps, with a visible hint to enlarge the chart or shorten the title. Authored text is never scaled down silently.

Presentation changes must leave calculations, source membership, and filters intact. A theme change may recolor a palette, but it must not reassign which category takes which color slot. Larger text must stay readable with long labels, facets, and narrow layouts.

The first version excludes a separate chart engine, an unrestricted CSS editor, a theme editor or marketplace, and bundled font files. Image, slide, and report output belongs to the dedicated [export initiative](../analysis-export/intent-brief.md).

## What seems settled

- This is one of the four first-pass priorities.
- A workspace theme picker is the entry point. It offers Compact (the default) and two editorial themes: Newsprint and Report.
- Precedence runs host tokens, then the analysis theme, then chart overrides. Unset values follow the host.
- A chart may override title and subtitle size and weight, axis text sizes, and its named palette.
- The new authored text roles are a subtitle and a source note. Axis text follows the theme.
- Themes name font stacks for each text role. Hosts may point a role at a webfont they already load.
- A Theme tab lists every override, with a reset for each.
- The first release fully supports a subset of chart families. The remaining families are tracked explicitly.
- The theme must reach all chart colors, including the families that currently bypass the shared palettes.

## Possibilities, not decisions

The exact visual tokens for Newsprint and Report need a side-by-side study on real charts. A host might also lock the theme or hide the picker. User-authored themes and direct annotations remain later possibilities.

## Current reality that matters

The package has light and dark CSS tokens, shared color scales, chart-specific style options, and small axis text controls. Saved settings keep chart options, but there is no saved theme, subtitle, or source-note field. Hosts theme the workspace only by overriding CSS variables.

Some charts still miss a theme or palette change:

- Line chart series use a local palette in `LineChart.tsx` instead of the shared categorical palettes.
- The region map and scatter density draw with fixed d3 Blues and RdBu ramps. The heatmap and calendar heatmap already use the theme's heat tokens, but they cannot take a chosen numerical scale.
- Categorical scales store one hex value per category, so dark mode reuses the light colors.
- The scale editor cannot reorder categories.

The chart title sits in the panel header, which is also the drag handle and toolbar. It renders as one truncated line. The details view enlarges it only through CSS. Chart height subtracts fixed header allowances, and axis planning estimates text width from font size. Larger or serif text therefore needs measured space.

## Next step after confirmation

Review the [shape brief](shape-brief.md). Its first proof covers Compact and Newsprint on the scatter and bar charts: one restyled header, themed axes, and a single listed override.

See the [reference packet](references/README.md) and the [editing initiative](../in-place-chart-editing/intent-brief.md).
