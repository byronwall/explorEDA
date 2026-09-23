---
title: "Developer adoption page — implementation plan"
slug: "developer-adoption-page"
phase: plan
status: current
last_updated: "2026-09-21"
---

# Developer adoption page — implementation plan

## Plan at a glance

Make one usable first-visit path before expanding content. The current demo already loads examples, so the first slice changes the page order and guides one tested selection. The second slice shows the package boundary and a reproducible example. Both leave the existing import and restore flow usable. There is no external service dependency; local demo data is the proof source. Browser checks confirm the page, not the source review alone.

## Implementation strategy

- **First proof:** A featured order example opens, filters linked views, reveals matching records, and resets.
- **Primary seam:** The demo page owns explanation; the `exploreda` public entry owns analysis behavior.
- **Fast local loop:** `pnpm --filter demo dev`, then `pnpm --filter demo test` and `pnpm check` after page changes.
- **Local dependencies:** Existing example data and saved settings; no network service beyond local assets.
- **Live confirmation:** Check the published path only after local behavior works.
- **Rollout and rollback:** The old file tools remain on the page. Revert the page hierarchy without changing saved data or package API.

## Milestone 1: A visitor reaches a useful example first

- **Change — Landing page:** Identify the React workspace and move a featured example above import and saved-analysis restore. Keep those tools visible lower down.
- **Change — Guided action:** Name one control that actually exists. Provide reset and a route to the source example.
- **Verify:** Use a browser at wide, intermediate, and narrow widths. Confirm the selection, linked change, record inspection, keyboard access, and reset. Keep the existing landing test focused on this path.

### Desired end state

- A first-time visitor can see the value without supplying a file.
- Import and restore still work.

## Milestone 2: A developer can reproduce the integration

- **Change — Public example:** Show installation, the public component and CSS, and a link to the full data and typed saved settings behind the featured result.
- **Change — Boundary explanation:** Explain `data`, restore-only `savedData`, and `onStateChange` without implying built-in durable storage. Link API details and label the coverage view as project status.
- **Verify:** Run the displayed snippet in the current build, check links, and verify every compatibility or limitation statement against README and package metadata. Run `pnpm check`.

### Desired end state

- A developer knows which parts the library provides and which parts their app owns.
- The code path recreates the demonstrated state, or the page says exactly what the short snippet omits.

## Below the cut line

- New framework adapters, an inline demo, a documentation platform, and unmeasured speed claims.
- A new gallery or visual rebrand before the first path has been tested.
