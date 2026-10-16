# Follow the same flowers across several measurements

Which flowers remain when a species selection and a petal-length range intersect?

## Investigation sequence

1. Select versicolor, then brush petal length; the sepal plot and table should retain the identical flower IDs.
2. Alt-click a scatter point to inspect its original four measurements.
3. Clear the species chart while preserving the length brush and compare overlap with other species.

## Fixed-snapshot findings

Mean petal length for setosa was 1.462 cm. [Evidence](../../evidence/findings/db-iris-flower-investigation.json).
Mean petal length for virginica was 5.552 cm. [Evidence](../../evidence/findings/db-iris-flower-investigation.json).

## Limits

The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.

Eight panels contain an instruction note, six analytical/selector/metric views, and a source table. Runtime cross-filtering and trace behavior are pending local verification. The query uses one base population; related lookup totals are not additive repeated measures.

## Source credit

Fisher / UCI Iris, scikit-learn corrected variant; CC BY 4.0.
[Full provenance](../../datasets.json); [field dictionary](../../evidence/fields/iris.json).
