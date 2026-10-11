---
title: "Targets, events, and supplied intervals"
slug: "reference-marks"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Targets, events, and supplied intervals

## My read

Users should interpret an existing chart against a target, event, or known interval without preparing a custom renderer. A horizontal target on a line chart or a tolerance band on a scatter plot can answer a useful question with little new product surface. This is one of the strongest remaining comparison recommendations because it improves several current chart families.

Start with a fixed reference and a readable label. Keep its value independent of brushing unless the user chooses a population-derived reference. Whole-source median, current-selection median, and a fixed target are different references. The intended capability includes saved settings and clear scope; it does not require a general graphics editor.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Keep reference value, units, and population visible.
- Persist the reference with chart settings.
- Preserve selection and trace gestures.

## The intended experience

Add a target to an existing chart, filter the workspace, and see which observations cross it. Inspect the reference definition and source values. Save and restore the chart. A later interval can display supplied lower and upper values. Event annotations can mark a known release date on a time axis.

## Boundaries

Supplied bounds do not imply a computed confidence interval. Do not bundle inferential methods with the first line. Labels must not hide essential marks. Identity lines require comparable units. Keep arbitrary element placement in the existing composition initiative. Use normal compact chart settings and accessible help.

## What seems settled

The proposed first addition is a constant rule. Bands, labels, events, and population-derived rules are extensions that need their own behavior checks.

## Current reality that matters

BaseChart has an overlay seam. The shared chart settings expose axes and filters but no common reference-mark model. Scatter fits are now implemented; a regression curve does not provide saved target and event controls across other charts.

## Expansion trigger

Expand after one fixed target is useful and restores correctly. Add supplied intervals only when a real dataset has lower/upper fields.

## Next step after confirmation

Place one fixed target on a line chart. Filter and restore the view. Verify its value and location remain correct under linear and symlog display. Decide whether a small settings object is enough before sharing it across charts.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
