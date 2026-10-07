---
title: "Durable editorial chart styling"
slug: "editorial-chart-styling"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Durable editorial chart styling

## My read

Users should make explorEDA charts fit their theme or design system and retain those choices. They should also produce editorial charts with larger titles and deliberate typography. The goal is durable control over the chart’s presentation, with enough room for an authored visual hierarchy.

The primary audience is the end user. Developers supply this experience through their applications. The interactive workspace itself should feel editorial, with better typography and layout throughout current features. This is not limited to a separate presentation or export mode.

The visual direction comes from the Financial Times, The Economist, The Washington Post, and The New York Times. Annual and investor-relations reports provide another reference. These names guide later visual studies; they do not select one newspaper’s font or a copied layout.

Editorial styling includes how a chart presents its title, subtitle, axes, labels, legend, and plot. Typography must influence available space as well as letter appearance. A large title needs room to wrap. A subtitle needs a place in the hierarchy. The chart should adapt without covering marks or silently shrinking the authored text.

This is a new product initiative. It extends the existing charts and workspace. It does not depend on building the separate composition editor first.

## What matters most

- Match a user’s theme or design system through reusable style choices.
- Link charts to a global theme and palette; retain intentional overrides when saving.
- Give titles, subtitles, and supporting labels deliberate typography and space.
- Keep style controls understandable across chart families.
- Preserve the meaning of data colors, units, selections, and status indicators.

## The intended experience

A user applies a visual style to an analysis. They choose a title treatment and supporting typography, then adjust one chart where needed. They add a subtitle that explains the subject or population. They see the result while editing and save the view. Reopening it retains the authored choices.

A developer supplies the application’s visual defaults. The user can see which choices they inherit and which they have changed. Returning a chart to its inherited style should be possible without clearing its analytical settings.

Changing the global theme updates linked charts automatically. An intentional override retains its value. Provide a findable view of overrides so users can spot exceptions without opening every chart’s settings.

## Boundaries

Keep compact workspace controls usable while allowing more expressive chart content. Existing compact defaults do not limit the size of an authored chart title.

Presentation changes must leave calculations, source membership, and filters intact. A decorative color change must not silently redefine an analytical color scale. Larger text must remain readable with long labels, facets, and narrow layouts.

Avoid a separate chart engine, unrestricted CSS editor, or theme marketplace for the first useful version. These are proposed scope limits, not user-selected implementation rules. Font acquisition and arbitrary element placement remain separate choices. Image, slide, and report output belongs to the dedicated [export initiative](../analysis-export/intent-brief.md).

## What seems settled

This is one of the four first-pass priorities. Durable style control, larger titles, and intentional typography are explicit requirements. Charts follow the global theme unless intentionally overridden. Overrides must be easy to find. A particular token schema, font catalogue, or override-screen layout is not selected.

## Possibilities, not decisions

A small reusable style definition could cover text roles, chart surfaces, rules, and spacing. A few editorial presets could provide starting points. Host tokens or a typed host configuration could connect the global theme to an existing design system. The automatic inheritance behavior is settled; its representation remains open.

## Current reality that matters

The package has light and dark CSS tokens, shared color scales, chart-specific style options, and small axis text controls. Saved settings retain chart options. They have no common editorial style definition or subtitle field.

Chart headers use compact title classes. The details view enlarges titles through CSS. That enlargement is a display rule, not a saved user choice. Axis planning uses text sizes to estimate spacing, so typography affects geometry too.

## Next step after confirmation

Shape one interactive chart with a large wrapping title, subtitle, and deliberate axis typography. Change the global theme and verify linked properties update while one explicit override remains. Find that override, clear it, and restore the saved view. Observe spacing and unchanged analytical results before extending the style contract.

See the [reference packet](references/README.md) and [editing initiative](../in-place-chart-editing/intent-brief.md).
