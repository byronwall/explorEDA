# Time series with shared and independent scales

Status: proposed. No application change is implemented or approved by this research PR.

Byron wants better time-series charts and arbitrary Y axes. He recalls an Internet Explorer tool used at a chemical plant.
His sentence stopped before naming the per-line behavior. Independent scales are the working interpretation.
The research does not identify that tool.

The desired outcome is to compare signals with different units and ranges while retaining exact values and source records.
Users must also compare same-unit magnitudes without losing an outlier in automatic normalization.

## Proposed direction

Let each observation series share a named scale group or own a scale.
Keep scale assignment separate from the visible axes and chart layout.
Preserve React, TypeScript, D3, linked filtering, source traces, Notes, and saved analyses as explicit design constraints.

First improve original-sample inspection. Then prove scale ownership with an explicitly focused axis and an optional two-axis view.
Evaluate shared-time lanes after the group model works. Evaluate raw long-form tags as a separate extension.
Calendar summaries retain one metric and one shared Y scale.

## Success and limits

- Read temperature, pressure, and flow at the same time with explicit units and scale ownership.
- Compare six same-unit sensors, including an outlier, on shared or deliberately independent scales.
- Keep original timestamps, duplicate rows, invalid samples, and source IDs available after drawing reduction.
- Change a view range without filtering rows. Change focus without changing settings or domains.
- Explain every scale in saved images, keyboard use, and narrow layouts.

Twenty irregular tags are a conditional target. No density, performance, or usability result is claimed.
Normalization, separate-chart navigation sync, historian ingestion, and library replacement remain outside the core proposal.

## Review route

- [Design and provider comparison](design-brief.md)
- [Proposed implementation plan](implementation-plan.md)
- [All 15 recommendation decisions](recommendation-review.md)
- [Independent checks and limits](evidence-checks.md)
- [Original Pro report](raw/2026-10-18-pro/time-series-axes-research.md)
- [Run record](../../research/time-series-axes-2026-10-18/run.md)
