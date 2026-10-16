# Local integration status

This copy is integrated into the demo at `/daily`. All 75 entries pass the repository's native compiler with full local data. The project queries include the required glyph. The original Pro delivery is preserved separately; its production-time report and gaps below describe the handoff, before Codex validation. See `integration.json` for the local validation record. Written findings refer to unfiltered snapshots.

The source archive served here contains this corrected integration copy. `original-manifest.json` describes Pro's original archive. `manifest.json` describes this integration copy, excluding the source ZIP itself.

---

# explorEDA daily visualization corpus

## Delivery status

**40 narrative notebooks, 25 compositions, and 10 dashboards are actual files in this archive.** All requested numeric targets are met. There are **17 dataset families, 14 conservatively new to the inspected demo, 32 prepared CSV tables, and 9,627 prepared rows** across different and sometimes repeated grains. Prepared rows must not be summed as independent observations.

Every notebook contains four analytical chart steps and a fifth record-table step, substantive prose, two reproducible findings and a caveat. Compositions have a native artboard plus a design companion. Dashboards have eight panels: an instruction note, six analytical/selector/metric views, and a source table. There are 35 design/investigation companions and 150 per-piece finding records. Some findings are intentionally shared with related formats; the audit reports unique calculation counts.

**All 75 entries remain pending local compiler verification.** Native DSL compilation: **0**. Browser validation: **0**. This is an authored publication backlog, not a claim that 75 pages were installed or published. No outlines are counted as completed files. No files or commits were created in the repository; no PR, push, deployment or publication schedule was created.

## Authoritative baseline

Repository: `byronwall/explorEDA` at `ea8b52ff742f11d1fb89457acabbcd27b0bd04e7`. The supplied selected source packet is authoritative, not a runnable checkout. Its 37 extracted files match the packet manifest. Relevant contracts, examples and syntax tests were inspected before authoring. Read-only GitHub access also confirmed the root and library package manifests at this baseline. See `evidence/source-inspection.json`.

The actual baseline notebook **fence parser** was executed successfully on all 40 notebooks and 240 blocks. It separates Markdown and `eda` fences; it does **not** compile the DSL. Do not confuse `evidence/validation/notebook-parser.json` with compiler or rendering proof.

## Open the corpus

Extract this archive to a directory of your choosing. Each `projects/<family>` folder is independent and includes `exploreda.eda`, local `data/*.csv`, and its analyses. An entry's `eda query=` names an explicit project query. There are no API keys, runtime Internet data dependencies, CORS assumptions or absolute dataset paths.

Use a built checkout of the named baseline, not an arbitrary newer npm release. The exact build and project-check commands are in **[evidence/RUNSHEET.md](evidence/RUNSHEET.md)**. The built viewer takes a family folder as its argument. Folder notebooks are ordinary `.eda.md` Markdown files with `eda` fences; composition/dashboard analyses are `.eda` files. Never load a notebook as a JSON notebook or concatenate its source with another family's project.

Notebook selections are local to each chart. Dashboard selections are intended to cross-filter peer charts within one query population. All written findings describe the unfiltered frozen snapshot and do not automatically change with interaction.

## Read and validate

- `catalog.json` is the stable piece inventory with questions, discovery metadata, related IDs, local paths, evidence links, readiness and release order.
- `datasets.json` records credits, licenses, retrieval/capture semantics, coverage, missingness, transformations, row counts and SHA-256 hashes. `sources.json` records what authoritative sources support.
- `evidence/raw/` preserves the real source snapshots; `evidence/fields/` documents every prepared field; `evidence/findings/` contains calculations, denominators, filters, rounding, eligible row IDs and exact input hashes.
- `release-plan.csv` is an ordered daily-release **backlog**, using sequence numbers rather than invented publication dates. `gaps.json` separates numerical shortfalls (none), blocked candidates, provenance limitations and unrun checks.
- `manifest.json` lists every archive member, size and SHA-256, except that its own SHA-256 is intentionally null. Validation reports describe exactly what ran.

Normal offline rebuilding uses only Python, pandas and NumPy, plus the bundled raw files. `prepare.py` rebuilds data and project contracts; `provenance.py` rebuilds source records; `build.py` recomputes evidence and authors the files from explicit editorial specifications; `finalize.py` restores release metadata and documentation; `validate.py` audits them. Reference acquisition scripts are separate, optional and must be reviewed before execution. No arbitrary expression evaluation or synthetic measurements are used.

Prepared floats are serialized with **12 significant digits**. All published numeric findings are computed again from those serialized CSVs. Missing values remain empty CSV cells and are never replaced with invented measurements.

## Dataset inventory

| Family | Base rows | Tables | Demo relationship |
|---|---:|---:|---|
| ercot | 1,417 | 3 | existing-repository-family |
| co2 | 2,284 | 3 | new |
| elnino | 732 | 3 | new |
| sunspots | 309 | 1 | new |
| nile | 100 | 1 | new |
| macro | 203 | 1 | new |
| grunfeld | 220 | 2 | new |
| stackloss | 21 | 1 | new |
| engel | 235 | 2 | new |
| strikes | 62 | 1 | new |
| danish | 55 | 1 | new |
| fertility | 648 | 4 | related-existing-demo-family |
| iris | 150 | 1 | new |
| wine | 178 | 2 | related-existing-demo-family |
| longley | 16 | 2 | new |
| football | 48 | 3 | new |
| tate | 60 | 1 | new |

Three families are explicitly related to existing material: ERCOT uses the exact forecast-example bytes; fertility is a different historical World Bank indicator; UCI Wine cultivar data is different from the existing Wine Quality dataset but conservatively counts as related wine material. Other families are new relative to the supplied demo catalogue, not a claim about unseen branches.

## Known limits

Most snapshots are historical teaching or benchmark data, not current reporting. Tate is a 60-record alphabetic metadata prefix, not a representative artist sample. Football covers group-stage final scores only. The fertility table retains empty terminal years rather than pretending they are zero. Some benchmark units remain explicitly source-defined. Two real-data captures were transcribed from readable GitHub fields; the preserved selected bytes have SHA-256 hashes, while original whole-file SHA-256 is unavailable.

The corpus meets the numeric target but **does not include a dedicated transport analysis**. The full compiler, native query evaluation, demo integration, repository tests and browser checks are still Codex handoff gates. See **[report.md](report.md)** and **[gaps.json](gaps.json)** before publication.
