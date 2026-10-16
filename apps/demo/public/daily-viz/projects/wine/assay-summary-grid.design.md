# Thirteen wine assays, each on its own ruler

**Question.** How do thirteen assays compare across cultivars when each keeps its own scale?

- **Encoding.** Each assay panel shows native unweighted quartiles and medians across the three cultivar groups.
- **Ordering.** Assay field names alphabetically; cultivar labels in their order.
- **Baseline.** No universal zero or raw-unit baseline is imposed across unlike assays.
- **Scale.** Each assay intentionally has its own linear value domain. Axis heights must not be compared across assays.

## What this design gives up

The individual wine identity and cross-assay covariance disappear in grouped summaries. Source assay units are not fully specified by the publisher.

The assay fields have different source units and scales. Parallel-coordinate axes are separate, so steep segments do not measure chemical relationships directly. No classifier or quality model is evaluated.
