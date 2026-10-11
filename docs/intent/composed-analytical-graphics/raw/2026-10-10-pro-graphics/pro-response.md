Hi, the research is complete: **23 published graphics across all 12 requested families**, with an openable image, composition breakdown, capability assessment, and checked data-source evidence for every entry.

**Complete package:** :chatgpt-content-reference{index="7"}[dataviz-composition-research.zip](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research.zip) — approximately 31 MB, including both reports, all 23 source images, the manifest, full research records, and the visual index.

| File | Contents |
|---|---|
| :chatgpt-content-reference{index="8"}[research-report.pdf](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research/research-report.pdf) | The complete **50-page illustrated report**, with source links and entry bookmarks. |
| :chatgpt-content-reference{index="9"}[research-report.html](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research/research-report.html) | The complete report with search and filters for capability tier and chart family. Every image is embedded for offline reading. |
| :chatgpt-content-reference{index="10"}[manifest.json](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research/manifest.json) | The exact requested manifest fields for all 23 entries. |
| :chatgpt-content-reference{index="11"}[research-records.json](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research/research-records.json) | Full composition specifications, data evidence, verification notes, and supporting URLs. |
| :chatgpt-content-reference{index="12"}[visual-atlas.png](sandbox:/workspace/scratch/b002bb32ace9/deliverables/dataviz-composition-research/visual-atlas.png) | A visual index of all 23 graphics, numbered to match the reports and manifest. |

## What the collection shows

The strongest implementation opportunity is **numeric placement for circle marks alongside the planned path frame**. Eight selected graphics need it, spanning small multiples, sparkline tables, dumbbells, bump charts, tile maps, and an annotated scatterplot. Explicit tile placement by row and column is the next most frequent gap, appearing in three examples.

Several sophisticated compositions also fit the existing strip model once their data is prepared explicitly. Weighted election stripes can become runs of equal-width categorical cells, and country-level unit histograms can become aligned rows of squares. The report distinguishes those prepared-table constructions from features the editor would need to calculate or arrange itself.

### Capability coverage

Entries are grouped in this order and sorted from easiest to hardest within each tier.

| Capability tier | Examples | Entry IDs |
|---|---:|---|
| **Today** | **3** | 01–03 |
| **Planned M2–M6** | **7** | 04–10 |
| **New capability** | **13** | 11–23 |

### Family coverage

Every requested family is represented, and no family has more than two examples.

| Primary family | Examples | Entry IDs |
|---|---:|---|
| Strips, heat strips, and timeline grids | 2 | 01, 02 |
| Small-multiple lines and areas | 1 | 12 |
| Dots, dumbbells, and intervals | 2 | 15, 16 |
| Slopes and bumps | 2 | 17, 22 |
| Waffles and unit grids | 2 | 03, 13 |
| Tile-grid maps with mini charts | 2 | 18, 19 |
| Ridgelines, horizons, and stacked strips | 2 | 06, 23 |
| Sparkline tables | 2 | 04, 14 |
| Fans, bands, and uncertainty | 2 | 05, 10 |
| Normalized stacks and share charts | 2 | 07, 20 |
| Annotated single-frame editorial charts | 2 | 08, 21 |
| Historical composed graphics | 2 | 09, 11 |

The seven graphics excluded by the prompt are absent.

## The five to build first

These five provide a useful progression through the editor’s existing model and planned additions.

### 1. WSJ measles heatmap — entry 01

**Build target: Today.**

This is the clearest baseline for the current strip renderer: one state per row, one year per cell, a shared quantitative color scale, missing observations, and a vaccine-introduction guide. It tests whether repeated rows, sparse labels, and a single annotation can form a finished editorial graphic. The published design makes the historical change legible through alignment and color. :chatgpt-content-reference{index="0"}

The implementation specification preserves null values and the publisher’s state order. Those details make it a useful data-handling benchmark as well as a layout benchmark.

### 2. The Yield Gap — entry 03

**Build target: Today, using a prepared cell table.**

The graphic compares national wheat and maize yields using one square per country and continent colors. It tests unit counting, categorical color, empty positions, and coordinated crop sections. :chatgpt-content-reference{index="1"}

The proposed decomposition uses repeated thin strips of squares. Country joins, averaging, binning, and square packing happen before rendering, with those preparation steps recorded explicitly. This demonstrates how much the existing primitives can support while keeping the data contract clear.

### 3. Big-tech opening prices in a sparkline table — entry 14

**Build target: M2 paths plus numeric circle placement.**

Fourteen company rows combine percentage changes, price histories, highlighted extrema, and latest values. That makes the table a useful test of alignment between text and small charts, as well as point annotations on ordered paths. :chatgpt-content-reference{index="2"}

A consequential detail is the scaling: the source passes date-sorted observations to each sparkline, spaces them by observation order, and uses the documented shared vertical-limit default. The report preserves that distinction so unequal company histories are not mistaken for a shared calendar axis. :chatgpt-content-reference{index="3"}

### 4. OBR current-budget and PSNFL fan charts — entry 05

**Build target: M2 paths and M3 bands.**

The selected March 2025 fiscal figure supplies a practical uncertainty benchmark with a downloadable workbook. Its two panels combine historical values, central forecasts, nested uncertainty bands, and fiscal-target annotations. :chatgpt-content-reference{index="4"}

This build would exercise ordered band layers, shared time, separate vertical domains, and annotations that retain their intended meaning as the displayed data changes. Two ordinary panel instances are sufficient for the proposed decomposition.

### 5. Causes of death versus media coverage — entry 07

**Build target: M5 normalized stacking.**

Our World in Data’s graphic compares deaths from selected causes with mentions of those causes by three news outlets. Four normalized columns make the differences visible, while labels and explanatory text identify the compared populations. :chatgpt-content-reference{index="5"}

This is the strongest normalization benchmark in the collection because the denominator is part of the argument. A faithful rebuild must retain the selected-cause population for deaths and the corresponding cause-mention populations for media coverage.

## Capability gaps, ranked by frequency

These counts come from the selected examples. An entry can require more than one addition, so the counts should not be added together as independent unlocks.

| New capability | Entries needing it | Reusable addition |
|---|---:|---|
| **Numeric positions for circle marks** | **8** | Bind circles to numeric coordinates in the same named frame as paths. |
| **Tile-grid arrangement driven by row and column fields** | **3** | Place repeated units at explicit addresses while preserving geographic gaps and stable positions. |
| Horizontal bar length encoding | 1 | Map values to horizontal rectangle lengths from a shared baseline. |
| Data-driven repeat height | 1 | Size repeated rows from a field and accumulate their vertical placement. |
| Continuous color gradients along paths | 1 | Interpolate stroke color between endpoint attributes. |
| Gradient fills in areas | 1 | Vary fill color continuously across a band using a shared position or value scale. |

The milestone dependencies are also recorded separately: **13 examples use paths, six use bands, three use normalized stacking, and one uses compound frames**. These are overlapping counts.

## Data quality and reconstruction limits

**Twenty entries are Available, three are Obtainable, and none use synthetic data.** “Available” means a data response was retrieved and its relevant schema checked. The entries separately identify publication-vintage uncertainty, transformations, and stated reuse terms.

The three Obtainable cases have specific remaining gaps:

| Entry | What still needs to be recovered |
|---|---|
| **02 — Presidential-election strips** | The checked numeric vote source ends in 2016, while the image includes a November 2020 projection. That projection snapshot remains unverified. |
| **20 — Population-weighted capital-city shares** | The share data is available, but the exact national population totals used to determine the original row heights were not established. |
| **22 — Changing nature of middle-class jobs** | Public microdata sources are identified, but the exact published occupation-level table was not recovered. |

The audit also surfaced details that would materially affect a rebuild:

- **Missingness needs explicit representation.** The measles source has both null rates and an absent grid record; the report specifies how to preserve both.
- **Sparkline scales need explicit scope.** The banana-yield table uses local sparkline domains, while the technology table uses shared vertical limits.
- **Averages need a defined population.** The banana table’s displayed average is calculated from rounded decade means. The source transformation was checked and the displayed values reproduced.
- **Compound frames should be used selectively.** The banana table coordinates an annual path frame with a decade heat strip inside each repeated country row, making it the clearest M6 example in this set.
- **M4 still needs a direct benchmark.** The collection does not claim a verified median-and-IQR example. The HBCU graphic uses means and standard deviations, which the report keeps distinct from the planned paired-distribution summaries.

All 23 image files, manifest mappings, summary counts, embedded HTML images, and ZIP contents passed validation. The PDF was rendered and visually reviewed, including enlarged previews for the tall graphics.

