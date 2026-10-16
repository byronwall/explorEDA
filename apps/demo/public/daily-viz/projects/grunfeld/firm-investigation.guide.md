# Trace a firm-year through an explicit company lookup

How do a selected firm’s annual changes compare with its own panel summary?

## Investigation sequence

1. Select one firm before reading the annual line, then trace a row into its company summary lookup.
2. Brush negative investment changes and inspect the intersection with the selected firm.
3. Clear the firm selector and confirm that base firm-year count is preserved, not multiplied by the lookup.

## Fixed-snapshot findings

Across firm-year levels, market value and investment had correlation 0.862. [Evidence](../../evidence/findings/db-grunfeld-firm-investigation.json).
Across valid within-firm annual changes, the correlation was 0.562. [Evidence](../../evidence/findings/db-grunfeld-firm-investigation.json).

## Limits

These selected historical firms are not a random sample of all businesses. First differences remain observational and can amplify measurement noise. Source monetary units are retained without an unverified multiplier.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

Grunfeld investment panel, Kleiber and Zeileis / statsmodels; public domain.
[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/grunfeld.json).
