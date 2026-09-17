---
title: "Data visualization review and example coverage — implementation plan"
slug: "data-viz-review-and-example-coverage"
phase: plan
status: current
last_updated: "2026-09-15"
---

# Data visualization review and example coverage — implementation plan

## Plan at a glance

Build the judgment tool before building more samples. The first milestone creates the repository skill and tests it against three existing examples with different visual demands. That proof determines whether the rubric is specific enough to guide repairs.

The second milestone inventories current chart and feature support. It adds one typed coverage manifest beside the demo definitions. The manifest records why each example exists and which stable feature IDs it intentionally demonstrates. A small test checks that every registered chart type and every required feature has a declared example. This is semantic coverage, not source-code coverage.

The third milestone renders the manifest as a feature matrix in the demo. Only then should the fourth milestone add or revise examples to close gaps. This order prevents speculative sample creation and keeps the matrix honest. Existing examples remain usable throughout. Removing the new matrix route or manifest import returns the demo to its current behavior.

## Implementation strategy

- **First proof:** Three evidence-based reviews produced by the new skill.
- **Primary seam:** The coverage manifest connects registered capabilities to examples without changing chart runtime code.
- **Fast local loop:** `pnpm --filter demo test && pnpm --filter demo build`
- **Local dependencies:** Existing saved settings, datasets, registry, and Vitest. No network service is required.
- **Provider/live confirmation:** None. Final proof is local browser review of the demo matrix and representative examples.
- **Rollout and rollback:** Add the matrix as an additive demo view. Existing example URLs and configurations remain unchanged until a reviewed replacement is ready.

## Milestone 1: The skill gives useful chart-first reviews

Create the smallest complete review skill. Keep the rubric in `SKILL.md` unless it becomes difficult to scan.

- **Change — Add `.agents/skills/data-viz-review/SKILL.md`.**
  - Define accepted inputs: screenshot, rendered page, chart, table, or dashboard.
  - Require visual inspection before source inspection.
  - Use critical gates for unclear purpose, misleading scales, unlabeled encodings, hidden state, and unreadable output.
  - Review these sections when applicable: purpose and title; hierarchy and layout; typography and spacing; marks and ink; axes, scales, ticks, and grids; labels and annotations; color and legends; tables; dashboard relationships; filters and interaction; accessibility and viewport behavior.
  - Require a compact output: verdict, blockers, section findings, three priority fixes, then secondary notes.
  - Include chart-family prompts for categorical comparisons, trends, distributions, relationships, facets, tables, and coordinated dashboards.
- **Proof — Run three review trials.**
  - Review line-chart, categorical-charts, and Lorenz without reading their source during the visual pass.
  - Confirm that findings cite visible evidence and differ by example.
  - Revise the skill once if any section produces generic or repeated advice.

### Desired end state

- The repository has one usable review skill based on Byron's transcript themes.
- A simple chart, faceted view, and coordinated dashboard each receive a decisive review.
- The rubric does not award quality for interaction count.

## Milestone 2: Feature coverage becomes explicit and checked

Define coverage only after the first reviews reveal which distinctions matter.

- **Change — Add a typed coverage manifest near `apps/demo/src/demos/examples.ts`.**
  - Reuse existing example IDs.
  - Give each feature a stable ID, label, family, and short review intent.
  - Give each example a list of intentionally demonstrated feature IDs.
  - Start with current features: 11 chart types; titles and axis labels; linear, log, time, and band scales where truly supported; ticks and grids; categorical and numerical color; legends; wrap and grid facets; shared scales; brushing; cross-chart filtering; active filter display; table sorting, filtering, paging, and formatting; dashboard layout; empty and invalid states; accessibility naming; and desktop resize behavior.
  - Do not mark a feature covered because its default setting exists. The example must make it visible and reviewable.
- **Change — Add one completeness test.**
  - Compare all registered chart types with declared type coverage.
  - Check that each required feature maps to at least one example.
  - Reject unknown example IDs and unknown feature IDs.
  - Allow explicit `not-demonstrated` gaps so the matrix can land before all examples are complete.
- **Proof — Generate the first gap report.**
  - Confirm that every chart type is nominally present.
  - Confirm that weak areas such as meaningful titles, axis labels, saved filter state, scale variants, and failure states remain visible as gaps.

### Desired end state

- One manifest states what the sample set is meant to prove.
- One test catches registry or manifest drift.
- The first result is an honest backlog, not a forced green matrix.

## Milestone 3: The demo renders the feature matrix

Make coverage legible without requiring a maintainer to read TypeScript.

- **Change — Add one matrix view to the demo.**
  - Render feature families as grouped rows and examples as columns.
  - Show `supported`, `shown`, `reviewed`, and `gap` with text or icons, not color alone.
  - Link each example cell to its existing example URL.
  - Include a short definition for each feature and summary counts by family.
  - Keep the page useful as a standalone reference that can later support article content.
- **Change — Add one focused view test.**
  - Check grouping, status labels, links, and accessible names.
  - Do not snapshot the full matrix markup.
- **Proof — Browser review at supported desktop widths.**
  - Confirm the table remains scannable, horizontal overflow is obvious and usable if required, and gaps are not hidden.

### Desired end state

- A maintainer can see type and feature coverage in one view.
- Every shown feature links to the example that proves it.
- The matrix remains derived from one manifest.

## Milestone 4: A minimal example basis closes material gaps

Revise existing samples before adding new ones. Add a new example only when no current example can demonstrate the feature clearly.

- **Change — Improve example intent and static clarity.**
  - Replace blank and generic titles with question-led titles.
  - Add axis labels and units where they change interpretation.
  - Keep configuration controls closed until requested.
- **Change — Close uncovered feature families.**
  - Add or revise one scale-focused example.
  - Add one clear active-filter and cross-chart relationship example.
  - Add one table-focused example that makes sorting, filtering, paging, truncation, and formatting reviewable.
  - Add one state example for empty, missing, or invalid data if current runtime support exists.
- **Proof — Review each changed example with the skill.**
  - Mark `reviewed` only after the review has no critical blocker.
  - Record short review metadata in the manifest, not the full prose report.

### Desired end state

- Every registered chart type and required feature is intentionally shown or explicitly deferred.
- The smallest useful example set covers the current product surface.
- Each reviewed example is a good chart first and an interactive example second.

## Cross-cutting verification

- Run `pnpm --filter demo test` after manifest or matrix changes.
- Run `pnpm --filter demo build` after route or view changes.
- Run the repository skill on at least one example from each feature family before declaring full review coverage.
- Use browser inspection for visual quality. Unit tests only protect manifest integrity and matrix behavior.

## Open decisions and spikes

- **Where the matrix lives:** Start inside the demo because it already owns examples and routes. Move it to docs only if publication needs diverge.
- **Review persistence:** Start with `reviewed`, review date, and a short note in the manifest. Add separate reports only if repeated review history becomes useful.

## Below the cut line

- Screenshot contact sheets and visual regression tests.
- Automated scoring from screenshots or DOM measurements.
- Pairwise or combinatorial example generation.
- New chart types added only for coverage breadth.
- A public article generated from the matrix.
- Mobile support, which the project currently excludes.
