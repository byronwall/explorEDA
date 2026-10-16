# Each household remains a dot in the food-share comparison — design and analytical contract

**Question.** How do absolute food spending and the food budget share differ across these households?

**Encoding.** One dot per household is spread into a swarm along its food-share value within its income quartile.
**Ordering.** Quartiles ascend from lower to higher income. Vertical dot displacement prevents overlap and has no measured meaning.
**Baseline.** Zero is no food expenditure as a share of income.
**Scale.** One shared linear percentage scale across the quartiles.

## Fixed-snapshot findings

Income and food expenditure had correlation 0.911. Eligible rows: 235; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-engel-household-share-swarm.json).

Income and food share had correlation -0.416. Eligible rows: 235; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-engel-household-share-swarm.json).

## What this design gives up

The original income and franc expenditure disappear, and swarm displacement is not an extra variable.

The historical sample covers working-class Belgian households, not contemporary consumers. Household composition and other omitted factors may affect both income and food spending. Ratios share a denominator with income.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Engel household data via statsmodels; historical Belgian sample; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/engel.json).
