# Investigate CO2 measurements and their coverage

Which concentrations and missing dates belong to a selected decade and calendar month?

## Investigation sequence

1. Select the 1990s in the decade chart, then one month in the box plot; all peer views should reflect their intersection.
2. Select Missing in coverage. The table should retain null CO2 records while numerical concentration marks disappear.
3. Clear all selections and compare the source-row count with the full snapshot.

## Fixed-snapshot findings

The mean measured concentration in the 1960s was 320.22 ppmv.
The mean measured concentration in the 1990s was 360.38 ppmv.

## Limits

This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

Keeling and Whorf / CDIAC; statsmodels historical snapshot; public domain.
[Full provenance](../../datasets.json); [field dictionary](fields.json).
