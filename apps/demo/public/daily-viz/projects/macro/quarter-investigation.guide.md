# Investigate a historical quarter, not today’s economy

Which quarters combine GDP contraction, unemployment change, and a particular inflation context?

## Investigation sequence

1. Brush negative GDP growth and inspect the remaining quarters in the record table.
2. Select a decade and verify the intersection, including the first-quarter missing-change behavior.
3. Clear all filters before comparing the fixed narrative extrema with live charts.

## Fixed-snapshot findings

The smallest derived annualized quarterly GDP growth rate was -7.95%. [Evidence](../../evidence/findings/db-macro-quarter-investigation.json).
The largest derived annualized quarterly GDP growth rate was 16.69%. [Evidence](../../evidence/findings/db-macro-quarter-investigation.json).

## Limits

This is an old source vintage, not current revised GDP. Annualizing a quarterly change is a mathematical convention, not the year-on-year rate. The first supplied quarter has no preceding observation in this file.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

U.S. macroeconomic sources via statsmodels; historical vintage; public domain.
[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/macro.json).
