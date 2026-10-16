# Petal lengths, one measured flower at a time

**Question.** Do the three species' petal lengths overlap at all?

- **Encoding.** A common-scale swarm preserves each measured petal length within its species group.
- **Ordering.** Alphabetic species order; vertical displacement is overlap avoidance, not another measurement.
- **Baseline.** Zero is included because centimetres have a meaningful origin.
- **Scale.** Shared linear length scale across all species.

## What this design gives up

Petal width and the sepal measurements disappear, so separation here is not a validated classification result.

The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.
