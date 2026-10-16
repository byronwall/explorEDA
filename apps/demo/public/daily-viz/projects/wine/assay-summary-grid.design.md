# Thirteen assays cannot share one raw value ruler — design and analytical contract

**Question.** Which measurements dominate a raw numerical view of the wine assays?

**Encoding.** Each assay panel shows native unweighted quartiles and medians across the three cultivar groups.
**Ordering.** Assay field names alphabetically; cultivar labels in their supplied order.
**Baseline.** No universal zero or raw-unit baseline is imposed across unlike assays.
**Scale.** Each assay intentionally has its own linear value domain. Axis heights must not be compared across assays.

## Fixed-snapshot findings

The maximum recorded proline value was 1680.0 source units. Eligible rows: 178; full expression, denominator, and contributing IDs are in the

The maximum recorded hue value was 1.710 source units. Eligible rows: 178; full expression, denominator, and contributing IDs are in the

## What this design gives up

The individual wine identity and cross-assay covariance disappear in grouped summaries. Source assay units are not fully specified by the publisher.

The assay fields have different source units and scales. Parallel-coordinate axes are separate, so steep segments do not measure chemical relationships directly. No classifier or quality model is evaluated.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Aeberhard and Forina / UCI Wine recognition; CC BY 4.0; source assay units.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
