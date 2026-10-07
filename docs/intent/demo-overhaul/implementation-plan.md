---
title: "Demo overhaul — implementation plan"
slug: "demo-overhaul"
phase: plan
status: current
last_updated: "2026-10-06"
---

# Demo overhaul — implementation plan

## Plan at a glance

Build one complete Flights analysis first, on the landed multi-table contract, then repeat its pattern for Beijing, World Bank, and Earthquakes. Curate the catalogue last, once every replacement capability exists and has been reviewed in the browser.

Each analysis has three parts: a prep script that writes frozen CSV tables, a project definition with lookups and calculated fields, and dashboard text with one `view` per focused tab. Writing tabs as dashboard text keeps them short, reviewable, and checkable by the DSL compiler. A test compiles every tab against the full query result and recomputes the quoted findings.

The prep scripts also generate a facts module, so note copy reads its numbers from the audited data rather than restating them by hand. Each family lands as its own stacked PR with screenshots. The catalogue PR removes old public entries only after the four analyses are on screen.

## Implementation strategy

- **First proof:** `/examples/january-flights` opens on a finished result, with five focused tabs over four related tables.
- **Primary seam:** `ExampleData.analysis` (`apps/demo/src/demos/analyses/types.ts`): table files, a project, and tab text. `resolveAnalysisExample` loads it into the existing project-example path.
- **Fast local loop:** `pnpm --filter demo exec vitest run src/demos/analyses` and `pnpm --filter demo dev`.
- **Local dependencies:** frozen CSVs under `apps/demo/public/datasets/<family>/`; downloads are cached in `tmp/data-cache`.
- **Provider/live confirmation:** each prep script pins its source by version, checksum, or query, and records counts and key audits in `manifest.json`.
- **Rollout and rollback:** each analysis is one catalogue entry; removing the entry removes the example. Old entries stay until the catalogue milestone.

### Material dependency proof strategy

The multi-table feature is real from the first proof: `evaluateAnalysisQuery`, `ExplorEdaProject`, and saved project sessions. A session from a file-backed analysis saves `tablesFrom` instead of its rows, and the tables are fetched again on restore. Public data is fetched only by the prep scripts, never during a demo load.

## Milestone 1: Flights proof

- **Change — analysis seam:** `analyses/types.ts`, `loadAnalysis.ts`, `LandingPage.tsx`, `savedViewsSession.ts`, and `SavedViewsWorkspace.tsx`. The dashboard-text query runs only while that panel is open.
- **Change — data:** `apps/data-samples/prepare/flights.ts` reads the pinned nycflights13 1.0.2 `.rda` files and writes four tables, a manifest, and `facts/flights.ts`.
- **Change — library:** bar `categoryOrder` (A to Z); project field settings keep declared names.
- **Verification:** `analyses.test.ts` checks flight N, unique IDs, the distance total, missing-lookup counts, and clean compilation of every tab; screenshots at 1440, 900, and 390 px.

### Desired end state

- The analysis opens in about 3 s locally; every tab charts all 27,004 flights.
- Notes quote audited numbers; unmatched aircraft and weather stay visible.
- Reload restores the session from `/viewer` and from the example URL.

## Milestone 2: Beijing air quality

Prepare the 12-station 2016 station-day grid with a stations lookup. Tabs cover coverage, seasons, joint particle–gas density, temperature–ozone fits by season, and high-value profiles.

### Desired end state

- Coverage counts reconcile with the constructed 4,392-row grid; missing days stay visible.

## Milestone 3: World Bank indicators

Freeze the indicator and country-metadata extracts. Exclude aggregates through metadata. Tabs cover income and longevity, endpoint shifts, historical paths, a map, and access gains.

### Desired end state

- Country counts and endpoint cohorts reconcile with the manifest; the map plots each economy at its capital, from country metadata, so no geometry ships.

## Milestone 4: Earthquakes

Freeze one USGS catalogue query with inclusive bounds. Tabs cover geography, timing, magnitude and depth, distributions, and metadata completeness.

### Desired end state

- Event counts match the frozen query; the point map and distributions agree with the source table.

## Milestone 5: Curated catalogue

Combine the Shop examples into one analysis, refine Wine, keep Lorenz, and remove superseded public entries. Add capability filters that open the relevant tab. Replace guide banners with short result context.

### Desired end state

- Seven public entries; each removed entry maps to a verified replacement in the coverage manifest.
- A capability choice reaches its tab; useful fixtures and data files remain.

## Below the cut line

- Report blocks, saved-state manifests, and sharing.
- Reusing one analysis worker across tab switches; each switch currently re-evaluates in about 1 s (`.tickets/exp-dv01.md`).
- Custom category orders beyond A to Z.
