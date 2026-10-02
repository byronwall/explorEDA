---
id: exp-rjh4
status: open
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
