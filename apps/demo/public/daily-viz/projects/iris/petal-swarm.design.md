# Petal lengths, one measured flower at a time — design and analytical contract

**Question.** Which pairs of measured dimensions make the supplied species groups easier to distinguish?

**Encoding.** A common-scale swarm preserves each measured petal length within its supplied species group.
**Ordering.** Alphabetic species order; vertical displacement is overlap avoidance, not another measurement.
**Baseline.** Zero is included because centimetres have a meaningful origin.
**Scale.** Shared linear length scale across all species.

## Fixed-snapshot findings

Mean petal length for setosa was 1.462 cm. Eligible rows: 50; full expression, denominator, and contributing IDs are in the

Mean petal length for virginica was 5.552 cm. Eligible rows: 50; full expression, denominator, and contributing IDs are in the

## What this design gives up

Petal width and the sepal measurements disappear, so separation here is not a validated classification result.

The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Fisher / UCI Iris, scikit-learn corrected variant; CC BY 4.0.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
