# An indexed sparkline grid trades magnitude for shape — design and analytical contract

**Question.** How different do historical firm trajectories look after each starts at 100?

**Encoding.** A grid of indexed investment paths gives each firm room to show its own trajectory, with the latest observation marked.
**Ordering.** Alphabetic firm order, chronological years within each path.
**Baseline.** Each index begins at 100 by construction; per-panel vertical domains are explicitly allowed to differ.
**Scale.** Common time scale, intentionally separate value scales. Heights must not be compared between panels.

## Fixed-snapshot findings

The highest first-year-normalized investment index in the panel was 696.67. Eligible rows: 220; full expression, denominator, and contributing IDs are in the

The median firm-year investment index was 183.91. Eligible rows: 220; full expression, denominator, and contributing IDs are in the

## What this design gives up

Absolute investment and directly comparable growth amplitude are lost. This is an explicit shape-reading alternative, not an improvement for every task.

An index erases the absolute investment level and can magnify growth from a small base. The reference is each firm’s first supplied year, not a market benchmark. The selected firms and years limit generalization.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Grunfeld investment panel, Kleiber and Zeileis / statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
