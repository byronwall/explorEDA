# Investigate a small historical employment benchmark

Which annual observations drive the difference between the levels and changes views?

## Investigation sequence

1. Brush negative employment changes and inspect the corresponding annual count records.
2. Select an era and check the combined subset rather than interpreting either filter separately.
3. Clear all selections and verify that the initial row remains even though its change values are null.

## Fixed-snapshot findings

Employment and nominal GNP in levels had correlation 0.984.
Their valid annual changes had correlation 0.892.

## Limits

This is a small historical regression benchmark, not a current labor-market dataset. GNP is nominal and source units are retained. Similar trends do not establish a stable causal employment model.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

Longley historical employment benchmark via statsmodels; public domain.
[Full provenance](../../datasets.json); [field dictionary](fields.json).
