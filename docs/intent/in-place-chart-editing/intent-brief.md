---
title: "Edit chart features in place"
slug: "in-place-chart-editing"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Edit chart features in place

## My read

Users should edit a chart feature where they see it. Titles, subtitles, and axis limits are the first examples. The user wants an easier route to advanced edits while keeping the result visible. Finding the right settings tab should not be necessary for every small change.

Text and axes have the highest value. Text edits support readability and quick dashboard creation. Opening settings is a chore; direct editing removes that repeated interruption. This is one of the four first-pass priorities.

The durable goal is a clear connection between a visible feature and its editable value. The user proposed double-click and right-click as possible entry gestures. Axis limits might also support dragging. These are interaction hypotheses, not selected requirements. A compact editor anchored to a title or axis could achieve the same outcome.

The editing flow should make the target and effect clear. Editing a title changes chart text. Editing an axis bound changes the display domain. Brushing selects records. Those operations can occur near the same visual area, so the interface must distinguish them. Direct editing should retain a keyboard route and an exact numerical entry path.

This initiative owns access to editing and the local edit session. The existing axis-domain initiative owns the meaning of domain limits, zoom, and reset. Editorial styling owns the visual choices and subtitle presentation. These projects can share a first proof without becoming one large editor project.

## What matters most

- Reach an editable feature directly from the chart.
- Keep the chart visible while making and judging the change.
- Support titles, subtitles, and axis limits as initial examples.
- Offer exact input beside any proposed axis-drag gesture.
- Keep editing distinct from selection, inspection, chart movement, and resizing.

## The intended experience

A user activates a chart title and sees an editor at that location. Valid changes appear immediately. They can reach the same action by keyboard or a visible contextual control. Existing undo restores an unwanted change; there is no separate preview-and-accept stage for every edit.

They activate an axis endpoint and enter an exact bound. If dragging proves useful, they can adjust the display and then refine the value numerically. They can reset the edited feature. Saved state retains accepted changes through the existing settings path.

## Boundaries

Direct edits must update the same chart settings used by current controls. Do not create a second editable chart state or a continuously synchronized text language.

An edit gesture must not accidentally start chart movement or set a filter. Existing Alt-click and Alt-Enter tracing must remain reachable. Axis context menus already offer field inspection, so new actions must fit that behavior.

Invalid numerical drafts must not become active limits. Escape can end a local editor; any proposed cancellation behavior must fit immediate updates and existing undo. Read-only history previews remain read-only. Reuse the current undo path instead of building a separate history system. Grouping a drag into a useful undo step needs proof.

## What seems settled

Direct text and axis edits are prioritized. Valid changes apply immediately, using existing undo for recovery. Double-click, right-click, and axis dragging remain possible mechanisms. The user has not selected a gesture or first-release coverage for every chart feature.

## Possibilities, not decisions

Candidate entry points include double-click, a context-menu action, and an anchored edit control. A title might use an inline text input. An axis might use a small bounds popover or endpoint handles. One gesture can be tested first without imposing it on every feature.

## Current reality that matters

Title and axis-label fields already update through live chart settings. The settings editor keeps session reset values. There is no shared subtitle setting.

Titles sit inside the chart’s drag handle and can expose trace actions. Axis labels support field inspection through modifier-click and a context menu. Common numerical axes still lack a complete editable bounds contract. These are existing interaction constraints, not reasons to reject direct editing.

## Next step after confirmation

Compare a few entry gestures on one title and one numerical axis. Prove immediate valid updates, useful undo steps, invalid-bound handling, reset, and saved-state restore. Check that editing leaves row counts unchanged and does not move the chart. Add axis dragging only if it improves the task over exact entry.

See the [reference packet](references/README.md), [axis-domain initiative](../axis-domain-controls/intent-brief.md), and [editorial styling initiative](../editorial-chart-styling/intent-brief.md).
