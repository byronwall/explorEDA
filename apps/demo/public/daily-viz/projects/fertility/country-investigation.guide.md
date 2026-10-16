# Investigate selected fertility paths and empty year cells

Which selected country-years support a comparison, and which year cells are null?

## Investigation sequence

1. Select a country, then a year range ending in 2013; null end-year rows remain in the table but not the numerical scatter.
2. Clear the country selection and compare the same year range across the illustrative cohort.
3. Inspect a 2011 rate and a 2012 null without converting the latter to zero.

## Fixed-snapshot findings

The unweighted mean across the selected countries in 1960 was 5.342 births per woman. [Evidence](../../evidence/findings/db-fertility-country-investigation.json).
The corresponding selected-country mean in 2011 was 2.377 births per woman. [Evidence](../../evidence/findings/db-fertility-country-investigation.json).

## Limits

The countries are an illustrative fixed set, not a representative sample. Total fertility rate is a period measure, not completed lifetime births for a cohort. The supplied 2012 and 2013 columns contain no published values.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

World Bank, UN and national statistical sources; historical snapshot; CC BY 4.0.
[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/fertility.json).
