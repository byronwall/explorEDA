# Investigate the supplied ERCOT forecast hours

Which hours combine large errors, unusual forecast levels, and a particular clock-hour context?

## Investigation sequence

1. Select Below forecast, then brush a high absolute-error range. The table should retain only the intersection.
2. Clear the error-direction chart and verify that the same error-range selection remains.
3. Alt-click an error point and reconcile actual minus forecast against the source row.

## Fixed-snapshot findings

The mean signed error was -1,242.9 MWh per supplied hour. [Evidence](../../evidence/findings/db-ercot-forecast-investigation.json).
The mean absolute error was 2,591.7 MWh per supplied hour. [Evidence](../../evidence/findings/db-ercot-forecast-investigation.json).

## Limits

Actual is electricity served in each supplied hour, not unconstrained demand. These observations alone cannot identify why consumption or supply changed. The UTC snapshot includes partial boundary dates.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

EIA / ERCOT; authorized repository snapshot; U.S. public-domain data.
[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/ercot.json).
