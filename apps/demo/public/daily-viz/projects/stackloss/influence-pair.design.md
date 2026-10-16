# An influential plant observation is not automatically an error — design and analytical contract

**Question.** How much does the airflow–loss slope change when each observation is omitted in turn?

**Encoding.** The left panel shows original observed pairs; the right panel shows one refitted slope per omitted observation.
**Ordering.** Original row sequence identifies omitted points; it is not a verified date sequence.
**Baseline.** Loss includes zero; the slope panel uses a position scale centered on the observed range, not zero.
**Scale.** Separate labeled scales reflect different quantities. The panels are not dual axes on one plot.

## Fixed-snapshot findings

The smallest leave-one-out airflow slope was 0.9479 loss units per airflow unit. Eligible rows: 21; full expression, denominator, and contributing IDs are in the

The largest leave-one-out airflow slope was 1.0982 loss units per airflow unit. Eligible rows: 21; full expression, denominator, and contributing IDs are in the

## What this design gives up

The paired display does not show multivariable controls or prediction uncertainty. No row is removed from the reference data.

Leave-one-out fits diagnose sensitivity, not data validity. The omitted points are not automatically errors, and the single-predictor model ignores other measured process conditions.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Brownlee plant observations via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
