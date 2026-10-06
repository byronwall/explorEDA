---
id: exp-daa4
status: partially_implemented
deps: [exp-l1vm]
links: []
created: 2026-10-06T02:54:21Z
type: feature
priority: 2
assignee: Codex
tags: [multi-source]
---
# Build relationships and choose chart grain from the schema

## Outcome
Users create links, resolve cardinality consequences, choose chart grain, and export/import a complete investigation.

## Decisions
Keep React and TypeScript. Use the existing worktree, saved tabs, and history. Source rows stay outside checkpoints. Never select an arbitrary lookup match or silently change chart grain. Preserve single-source use.

## Work
- Add schema panel with drag linking and equivalent keyboard/touch selectors, declared/observed cardinality, and stable glyphs.
- Provide aggregate-at-current-grain or explicit expanded-frame choices, conflict repair, and unresolved dependency handling.
- Integrate source/frame context and explicit entity/measure behavior into chart plans and traces; translate saved row selections.
- Add project serialization with dependency closure, examples, usage docs, and an initial measured scale probe.

## Readiness and ownership
Owner: current Codex execution. Base: a2e67c0 plus planning commit. Synthetic shop fixture only. Package builds before demo/browser checks. Separate core writer owns lib/analysis; host/UI writer owns integration.

## Acceptance
Create a link by pointer and keyboard at 1280/783/390 widths. Resolve duplicate-key fixture explicitly. Preserve order total 150 and item revenue 140; do not report repeated parent sum 310 as order revenue. Export/import full and active-view projects.
Run focused semantic tests, pnpm check, and browser checks at 1280, 783, and 390 px. Save screenshots under tmp.

## Provenance
Implementation plan milestone m2. User authorized same-worktree implementation, commits, and PRs with images. No deployment or publishing.


## Notes

**2026-10-06T03:32:03Z**

Implementation checkpoint: schema authoring, observed cardinality, explicit aggregate/expanded frame choices, stable identity controls, and project file boundary are implemented in the shared diff. Focused chart/provider checks42/42, package typecheck, and UI conventions pass. Authoring/browser/export proof at1280/783/390 remains. Preserve dependency on accepted configured view/history round trip. Next: independent browser verification.

**2026-10-06T04:38:29Z**

Browser checks passed the schema link preview and order/item populations. Full-project export/import preserved the investigation and reloaded correctly. Active Items export/import retained one view and its Orders, Items, and Products dependencies. The item total stayed 140. Responsive screenshots now have verified 1280, 783, and 390 pixel widths.
