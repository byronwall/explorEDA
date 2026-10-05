# Local run record

Checked October 3, 2026, at repository revision `038be515b0d0869c69f4da45f4744266b073ac19`.
The checkout started clean with detached HEAD. It remains detached. No commit, push, PR, or deployment was made.

## Run it

The development server runs at [the scatter lab](http://127.0.0.1:5184/?view=scatter-lab).
A frozen production build runs at [the preview](http://127.0.0.1:5185/?view=scatter-lab).
The Chrome tab shows the preview. Both servers remain running for local testing.

Use the [README run commands](README.md) to restart. Build the package before starting the demo.

## What changed locally

The imported lab lives under `apps/demo/src/scatter-lab/`. The landing page has a lazy route and navigation link.
The demo now declares Radix Tooltip, using the version already in the workspace lockfile.

The full original patch failed its dependency hunks against this checkout. The LandingPage hunk passed and was applied separately.
Two local repairs let repository checks pass: remove an unsupported Testing Library option, and return void from theme cleanup.
Original source, patches, and Pro results remain in the research folder.

Package source and the public settings model were not changed. Demo-only work needs no changeset.

## Checks

| Gate | Local result |
| --- | --- |
| Node / pnpm | 24.21.0 / 11.9.0 |
| Frozen dependency install | Pass |
| `pnpm check` | Pass: UI rules, builds, types, 521 package tests, 58 demo tests |
| Numerical runner | 30 of 30 pass; seeded coverage simulations also recorded |
| Final DSL checker tests | 275 of 275 pass |
| Both Sleuth validators | Pass with zero warnings |
| Real Vite and production route | Rendered in Chrome |
| Responsive smoke | 1280, 783, 390 pixels; no page-wide horizontal overflow observed |

The focused browser smoke exercised layer controls, group filtering, fixed reference counts, source inspection, and native rendering.
It also checked real Penguins loading, the narrow comparison switch, keyboard source inspection, and JSON restore.
Group filtering left 500 analysis rows. A full reference retained 1,000 rows. Penguins loaded 344 source rows.

The broad check emitted existing chunk-size notices and React test warnings. It exited successfully.
Rebuilding package assets while Vite was open caused stale-module reload messages. Final responsive checks used the frozen build.

## Limits and next proof

This smoke does not repeat every scenario in the Pro report. Original performance measurements came from its offline browser harness.
Repeated local filter/hover timings and full Gaussian coverage interpretation remain separate promotion gates.
The archived DSL tests check a prototype subset. They do not prove native compilation or actual row calculations.

See [local machine results](local-validation.json), [numerical results](local-numerical-results.json), and the two native integration plans.
Screenshots remain under `tmp/scatter-test-bed/`; the untouched original evidence ZIP remains under `originals/`.
