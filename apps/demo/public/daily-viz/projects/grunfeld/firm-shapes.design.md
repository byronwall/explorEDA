# An indexed sparkline grid trades magnitude for shape

**Question.** Which firms' investment grew fastest relative to where they started?

- **Encoding.** A grid of indexed investment paths gives each firm room to show its own trajectory, with the latest observation marked.
- **Ordering.** Alphabetic firm order, chronological years within each path.
- **Baseline.** Each index begins at 100 by construction; per-panel vertical domains are explicitly allowed to differ.
- **Scale.** Common time scale, intentionally separate value scales. Heights must not be compared between panels.

## What this design gives up

Absolute investment and directly comparable growth amplitude are lost. This is an explicit shape-reading alternative, not an improvement for every task.

An index erases the absolute investment level and can magnify growth from a small base. The reference is each firm’s first year, not a market benchmark. The selected firms and years limit generalization.
