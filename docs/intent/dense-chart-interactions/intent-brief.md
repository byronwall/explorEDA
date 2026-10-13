---
title: "Change chart settings where the data is"
slug: "dense-chart-interactions"
phase: intent
status: current
last_updated: "2026-10-12"
---

# Change chart settings where the data is

## My read

Analysts should change a chart while they explore it, with less travel through settings panels. The useful control should be close to the feature that prompted the change. The chart should remain visible so the analyst can judge the result.

The main opportunity is repeated work. An analyst might compare several color fields, change a measure, adjust grouping, or inspect a different pair of variables. These changes should have short, clear routes. Infrequent presentation choices can use the full settings editor when a local control adds little value.

Byron wants a wide range of approaches before choosing a design. Other tools should inform the work through specific, verified examples. A famous product or a long feature list does not prove that an interaction works well. The comparison must explain the action, its target, its result, and why that pattern fits this linked-chart workspace.

The scatter example is a useful test: right-click a point, choose Color by, and select a field. The outcome matters more than that exact sequence. A better route may use a visible encoding control, a local editor, a modifier gesture, or another approach.

## What matters most

- Give frequent analysis changes short routes near the chart.
- Preserve ordinary click-to-filter as the main mark interaction.
- Compare several distinct interaction models before narrowing the shape.
- Ground competitor claims in current primary sources.
- Keep data, field names, filter state, and edit scope clear.

## The experience or behavior you appear to want

The analyst notices a feature, reaches its relevant controls, makes a change, and sees the result without losing the chart. A point can lead to chart-wide encoding choices, but the interface must state that scope. Editing one category's color differs from changing the color field. Editing a shared scale may affect several charts.

Fast pointer gestures should have clear keyboard and touch routes. Dense marks, long field names, many fields, and small panels must not turn local editing into guesswork. A compact menu should help users reach an editor. It should not become another large settings panel.

## Boundaries

Research and document shaping are in scope. Application changes, deployment, and merge are outside this run. The endpoint is an open review PR with new intent and shaping documents.

The proposed interaction model must preserve the ordinary click-to-filter flow. Existing trace gestures have a lower priority. Alt-click may open configuration if that improves the experience and leaves a useful inspection route.

Do not treat a frequency estimate as measured usage. No usage telemetry was supplied. Rank likely changes by analysis scenarios, mark uncertainty, and propose tests that could change the ranking.

Keep the existing React and TypeScript product. Reuse useful controls and state paths where they fit. Avoid a new interaction framework before one representative flow proves its value.

## What seems settled

The desired gain is less effort during exploration, with more useful actions near their objects. The full settings editor remains available. Existing code does not decide which gestures deserve to stay.

The latest user direction explicitly opens Alt-click and tracing access to redesign. It gives click-to-filter the stronger claim on simple pointer input.

## Possibilities, not decisions

Object menus, direct manipulation, encoding chips, compact toolbars, keyboard commands, temporary edit modes, and local editors are candidates. Right-click Color by is an example to compare, not a committed design. Frequency rankings and the first implementation slice await research.

## Current reality that matters

The repository already has inline title edits, local axis range edits, axis dragging, field selection, table menus, and composition menus. Valid settings apply live. The chart edit hook can group a continuous edit into one undo step. Shared color scales make edit scope a key concern.

## Next step after confirmation

The research run is authorized and submitted. Collect Pro's evidence, compare alternatives, and propose a bounded shape with a first proof. Preserve broad ideas in a separate brainstorm and linked research. Record the chosen route and deferred options without treating proposals as approved implementation.

See the [run record](run.md) and [research prompt](raw/2026-10-12-pro/prompt.md).
