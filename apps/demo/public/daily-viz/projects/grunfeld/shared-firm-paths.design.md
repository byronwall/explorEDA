# Firm investment paths on one absolute scale — design and analytical contract

**Question.** How does investment relate to market value in levels and in annual within-firm changes?

**Encoding.** A repeated path for each firm shows recorded investment using the same vertical scale.
**Ordering.** Firm names alphabetically; years ascend inside each row.
**Baseline.** A shared zero baseline makes absolute investment heights comparable.
**Scale.** Shared linear source 1947-dollar units; no unverified multiplier added.

## Fixed-snapshot findings

Across firm-year levels, market value and investment had correlation 0.862. Eligible rows: 220; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-grunfeld-shared-firm-paths.json).

Across valid within-firm annual changes, the correlation was 0.562. Eligible rows: 209; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-grunfeld-shared-firm-paths.json).

## What this design gives up

Smaller firms become compressed. That is an honest consequence of absolute comparison, not a reason to secretly rescale each row.

These selected historical firms are not a random sample of all businesses. First differences remain observational and can amplify measurement noise. Source monetary units are retained without an unverified multiplier.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Grunfeld investment panel, Kleiber and Zeileis / statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/grunfeld.json).
