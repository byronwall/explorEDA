---
id: exp-rjh4
status: partially_implemented
deps: []
links: []
created: 2026-10-02T03:58:32Z
type: feature
priority: 1
assignee: Byron Wall
parent: exp-b6fo
tags: [runtime-config]
---
# Let hosts read initial and edited workspace settings

## Outcome
An embedding host can read the public saved-settings shape when the workspace first opens and after edits. Both reads match the workspace. Existing onStateChange edit notifications and restore behavior continue.

## Likely Steps
Expose a focused public read through the package boundary using the existing saveToStructure state. Document its timing when savedData is absent or supplied. Keep chart settings, layout, calculations, color scales, filters, and other saved settings in one shape.

## Ready Gate
Confirm the current public boundary and mount timing. Choose the smallest compatible read access without changing the callback's edit-only meaning. Prepare a focused test with an initial snapshot and a later chart edit.

## Proof and cut line
A host reads current settings after mount and after an edit, with the same chart definitions as the UI. Do not add an agent service, new persistence format, or row/sample/visual context.

## Provenance
Intent claims c1, c2, final-inspection-3; selected shape in docs/intent/runtime-configuration-story/shape-brief.md; milestone M2 in docs/intent/runtime-configuration-story/implementation-plan.md. Repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.

## Readiness and ownership
Base: `421abb6` on `codex/runtime-configuration`. No code changes yet. Owner: continuous writer for this scope. Existing package test setup and local demo are available; the ticket viewer is already running at `http://127.0.0.1:7412`. `tk view` could not bind because this sandbox blocks localhost socket creation; reuse the existing viewer.

Owned boundary: focused public package handle to read current saved settings, its type/export, README integration notes, and package proof. Existing `saveToStructure` remains the source. `onStateChange` remains an edit-only notification.

## Decisions
- Must: expose a narrow public getter after workspace mount and after edits, returning `SavedDataStructure` from `saveToStructure`.
- Must: getter reads the live provider store, so initial state, restored state, and edits have the same shape as the UI.
- Must: do not emit an initial `onStateChange` callback or alter restore/change callback behavior.
- Prefer: expose one imperative ref method instead of another callback or public store abstraction.
- Exclude: data rows, a second saved format, persistence policy, and compatibility wrappers.

## Acceptance
- A package test reads the initial settings and reads again after a chart edit; both snapshots match live rendered/provider state.
- Existing restore and edit-only callback tests remain green.
- README explains ref setup and when initial settings are available, including when `savedData` is omitted.
- Record focused package tests and type checking. Browser proof remains open for the combined journey.

## Provenance
Runtime configuration story, milestone 2: `docs/intent/runtime-configuration-story/implementation-plan.md`; outcome and cut line from this ticket's original scope.

## Notes

**2026-10-02T04:24:37Z**

## Execution checkpoint
Owner/session: Continuous writer for runtime configuration roots.
Base and checked state: `421abb6` on `codex/runtime-configuration`, plus the current shared working-tree diff.
Dirty paths and ownership: Same shared writer diff recorded on `exp-3sen`; no commit created.
Implemented but unverified: `ExplorEda` now exposes a ref with `getSettings(): SavedDataStructure`. The method reads the provider's existing `saveToStructure` action. `onStateChange` remains edit-only. README documents when the ref can be read and its relation to callback behavior.
Decisions and source: Use one imperative ref method inside the provider. Do not add a new store, saved shape, or initial callback.
Evidence: Focused public component test reads initial settings and confirms the handle reflects a replacement restore. Existing provider tests for mount/restore silence and edit notifications passed (2 selected tests). Type checking, UI checks, focused tests, and `git diff --check` passed as recorded on `exp-3sen`.
| Criterion | Check | Result | Evidence |
|---|---|---|---|
| Public getter returns initial current saved settings | focused component test | pass | handle returns initial chart inventory |
| Getter reflects a later user chart edit | independent browser review pending | blocked | test covers restore replacement; browser proof remains required |
| Existing restore and edit callback semantics | selected provider tests | pass | no mount/restore echo; chart/filter changes notify |
Next action: Root to review the diff and verify the read after an edit in the browser. Keep this root open until that proof passes.

**2026-10-02T04:28:48Z**

## Follow-up checkpoint
This checkpoint supersedes the earlier public API test detail. The public ref test now uses a scoped PlotManager mock while retaining the real DataLayerProvider and ChartSpecPanel. It edits a chart title and layout through `updateChart`, then compares `getSettings()`, rendered chart output, inspector inventory, and the single edit callback snapshot. The test also confirms no callback fires at mount. Focused tests: 4 passed across ChartSpecPanel and ExplorEda; selected provider callback tests: 2 passed. Typecheck, check:ui, and diff check passed. Browser proof remains pending.

**2026-10-02T04:29:18Z**

## Current acceptance state
| Criterion | Check | Result | Evidence |
|---|---|---|---|
| Public getter returns initial current settings | Public component test | pass | Reads initial `SavedDataStructure` after mount |
| Getter reflects a chart edit and matches UI and callback | Public component test with scoped PlotManager | pass | One title/layout edit matches handle, rendered output, inspector, and edit callback snapshot |
| Restore and edit-only callback behavior remain intact | Focused component and provider tests | pass | No mount callback; prop restore is silent; chart edits notify |
| Browser journey at required widths | Independent browser pass in progress | blocked | Required visual proof not yet recorded |

Focused tests, package typecheck, UI convention check, provider callback tests, and `git diff --check` pass on the current shared worktree. Root owns final review and browser acceptance.
