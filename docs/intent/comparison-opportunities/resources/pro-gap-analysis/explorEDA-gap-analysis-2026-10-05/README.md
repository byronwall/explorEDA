# explorEDA: detailed gap and coverage audit

**Date:** October 5, 2026. **Repository:** byronwall/explorEDA. **Revision:** `362db58082df9c1b57c2305a49823a1dae385081`.

## Important limitation

Fresh application-browser verification could not be completed. Real Chromium blocked the public URL, local HTTP build and file URL with `ERR_BLOCKED_BY_ADMINISTRATOR`. No application tests are reported as passed. See report 04 and the three actual block-page screenshots. Historical repository browser reports and independent CSV checks are clearly distinguished.

## Start here

Open `index.html` for the linked report library, or `reports/00-executive-report.pdf`. Each detailed report is provided as PDF, HTML and Markdown.

- **00 Executive report:** principal findings, corrected growth and recommended order.
- **01 Transcript reanalysis:** all 20 original memos, including conditional and adjacent scope.
- **02 Comprehensive gap register:** all 92 original IDs, current evidence, narrower remaining gaps and proposed proof.
- **03 Coverage matrix review:** 52 feature rows, 19 examples, all-row commentary and 25 proposed outcome dimensions.
- **04 Browser evidence and test plan:** actual navigation failures, historical proof boundaries, independent oracles and 35 unexecuted scenarios.
- **05 Tooling limitations:** every material obstacle and practical repository-readiness improvements.
- **06 Method and source index:** pinned sources and evidence classifications.

## Structured supporting files

`data/` contains JSON and spreadsheet-compatible CSV ledgers for requirements, transcripts, growth, feature commentary, the full example matrix, sources and browser scenarios. The existing matrix recount is **52 features; 51 supported; 30 with historical review; 22 needing attention; 182 declared pairs; 37 reviewed pairs in 7 examples**. These are catalogue counts, not product-completion percentages.

`fixtures/` contains two synthetic JSON fixtures and a CSV variant with mathematical expected results. `evidence/` contains the three browser-block screenshots, structured browser log, exact downloaded production deployment build and artifact provenance. `browser/` contains a navigation capture utility, not an already-passed interaction suite. `SHA256SUMS.txt` hashes the final package files.

## Reproduction and safety

All repository operations in this audit were read-only. Nothing was committed, pushed, edited, filed or posted to the repo. Files in this ZIP were created only for this report. Proposed IDs, schemas and tests are recommendations, not repository changes.

The production build intentionally omits the development-only coverage matrix. A later authorized test of `?view=coverage` needs a development target. Do not disable browser administrator policies to run the utility; use an authorized environment. No private browser profile or credentials are included.
