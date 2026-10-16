# Dropping one day moves the airflow slope from 0.95 to 1.10

**Question.** Which single days pull the airflow–loss line the most?

- **Encoding.** The left panel shows original observed pairs; the right panel shows one refitted slope per omitted observation.
- **Ordering.** Original row sequence identifies omitted points; it is not a verified date sequence.
- **Baseline.** Loss includes zero; the slope panel uses a position scale centered on the observed range, not zero.
- **Scale.** Separate labeled scales reflect different quantities. The panels are not dual axes on one plot.

## What this design gives up

The paired display does not show multivariable controls or prediction uncertainty. No row is removed from the reference data.

Leave-one-out fits diagnose sensitivity, not data validity. The omitted points are not automatically errors, and the single-predictor model ignores other measured process conditions.
