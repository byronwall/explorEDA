# Build source-defined covariance regions

Add descriptive Scatter Plot regions with exact inside/outside record selection.
Use chart-local source pairs as the reference, so linked filters do not move the boundary.
Start with a complete linear-axis journey; add nonlinear projection afterward.

Topic score: **18/20**. [Selection and run record](run.md).
[Implementation plan](../../intent/covariance-regions/implementation-plan.md).
[Pro conversation and original reports](https://chatgpt.com/c/6adeacce-77f0-83ea-9469-24059afa1f3b).
The reports finished after 20m41s. No follow-up was needed, 0/1 used.

## Decision and evidence

Use sample covariance with denominator n−1, raw prepared numeric fields, and radius 2.
Inside means squared Mahalanobis distance ≤4. The radius supplies no confidence or error guarantee.
This distance definition matches [R's primary documentation](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/mahalanobis.html).
[JMP](https://www.jmp.com/support/help/en/19.2/jmp/ellipse.shtml) exposes coverage and transformed-coordinate options.
Our proposed design instead keeps raw-field meaning fixed and names the radius directly.

Current code supports the needed source population through `useGetAllIds` and full-source facet grouping.
The existing covariance summary uses peer-eligible rows; do not reuse that population for this new reference.
Exact `__ID` filters already represent record sets, including the empty set.
Trace dispatch belongs in `ChartTracePanel.tsx`. Canvas-point clicks pass through an earlier brush callback.
Both are concrete integration work; neither is automatic overlay behavior.

Local review corrected the project persistence contract: `analysisRowKeys.ts` already encodes filters as string row keys.
A numeric-only saved marker validator would reject those settings.
Use numeric runtime selections and the existing encoded representation at the project boundary.
Record identity alone cannot preserve a region estimated from other changed rows.
Release region results when a project reevaluation or external-folder reopen cannot establish an unchanged reference.
Prevent old host echoes from restoring released results within that evaluation.

Numerical tolerances remain prototype work. [LAPACK's 2×2 routine](https://netlib.org/lapack/explore-html/db/d54/group__laev2_gacd10150d9e7ed9fc85ba274c3dcc9849.html)
documents cancellation limits for a small eigenvalue. The proposed constants are not proven production bounds.
Singular models remain unclassified. Nonlinear projection must preserve raw membership and respect [log-domain limits](https://d3js.org/d3-scale/log).

## Local dispositions

Build means include in a proposed milestone, not approval to ship.

| Pro ID | Local disposition | Reason                                                                                                 |
| ------ | ----------------- | ------------------------------------------------------------------------------------------------------ |
| CR-001 | Build             | Descriptive regions add cloud comparison and exact member inspection.                                  |
| CR-002 | Build             | Chart-source reference stays stable during linked filtering without frozen snapshots.                  |
| CR-003 | Build             | Radius 2 names a geometric threshold without implied coverage.                                         |
| CR-004 | Build             | Existing typed color/facet identities define groups.                                                   |
| CR-005 | Build             | Estimation, current rows, members, and marks can differ.                                               |
| CR-006 | Build             | One chart-owned ID filter gives exact source membership and empty selection.                           |
| CR-007 | Build             | A side/key marker identifies ownership without another ID list.                                        |
| CR-008 | Build             | Semantic/source changes release the old region claim atomically.                                       |
| CR-009 | Build, corrected  | Respect project string keys and evaluation boundaries; trusted full analysis restore remains separate. |
| CR-010 | Build             | Stable centered/scaled moments and solves protect useful unit/offset cases.                            |
| CR-011 | Build             | Rank-deficient models cannot define the chosen bounded region.                                         |
| CR-012 | Build             | Display transforms must not redefine membership.                                                       |
| CR-013 | Build             | Existing SVG/trace conventions need explicit input and keyboard integration.                           |
| CR-014 | Build             | Persistence, export, undo, docs, and example complete the first journey.                               |
| CR-015 | Build / Explore   | Build nonlinear projection in M2; explore optional principal directions separately.                    |
| CR-016 | Explore           | Calibrate conditioning, boundary, and projection tolerances before release.                            |
| CR-017 | Defer             | Held/live and separate historical references require a different lifecycle.                            |
| CR-018 | Defer             | Robust and inferential regions change the estimator or statistical question.                           |
| CR-019 | Avoid             | Error labels, percentage promises, silent regularization, and pixel membership misstate the result.    |
| CR-020 | Avoid             | No new framework, selection platform, per-row metadata, or speculative capacity system is needed.      |

## Validation and limits

Current origin/main remains `9d64a021e35d312887b1bc848e307f42b6c3091f` after collection.
Read both complete reports. The downloaded bundle passed safe-path, symlink, CRC, inventory, and UTF-8 checks.
No downloaded program ran. Pro's Library save was rejected; normal downloads were available and needed no Library upload.

A locally authored rational solver confirms fixture moments, memberships, Core reference changes, singular cases,
affine invariance, near-singular exact distances, and controlled projection coordinates.
These checks validate mathematical anchors, not the proposed production tolerances or application behavior.
Originals and scratch stay under ignored `tmp/`; the conversation is their durable source link.

Baseline scatter/restore tests and docs checks passed during preparation.
Collection checks and final PR status are recorded in [run.md](run.md).
No feature implementation, browser acceptance, persistence acceptance, or performance result is claimed.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/covariance-regions/assets/pro-results/covariance-regions-2026-10-25/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
