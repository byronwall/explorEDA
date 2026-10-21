# R070 — Teach existing chart gestures at the moment they matter

- ID: R070
- Category: Accessibility and interaction
- Priority: 58
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Chart editing is already unusually direct: `useTitleEditing` supports double-click, Enter, F2, and a context menu; `useAxisEditing` offers range typing, title editing, and drag hints. The workspace has a keyboard-shortcuts dialog, and documentation `GLANCES` lists chart gestures. The research question is whether a new user finds the correct existing route without trial and error. More functionality is not automatically the answer when a setting, a gesture, a menu, and a shortcut already express the same action.

Compare strengthening the existing contextual hint with a short, optional task-based walkthrough and with reducing redundant explanations. Contextual hints appear near the target but may be missed before the user knows it is interactive. A walkthrough can reveal the model but interrupts analysis if shown indiscriminately. Removing duplicated wording may make the remaining signal clearer. Preserve ordinary selection, tracing, and editing distinctions; an instructional change must not invite a user to drag an axis when they mean to filter records or imply that a visual range changes the dataset.

Use three first-use tasks on a supplied order dashboard: rename a chart, set an exact vertical range, and inspect the calculation behind a bar. Observe the current interface before showing any explanation, then compare the candidate teaching treatments with a second equivalent chart. Acceptance requires correct actions and correct understanding of their scope, with fewer unsuccessful gestures and no extra persistent chrome. Reject a walkthrough if users skip it or cannot transfer the learned action. Reject more hints if a clearer existing menu label achieves the same result.

This is a simplification investigation adjacent to current-analysis-trust and the completed landing-docs-entry work. It does not re-propose in-place editing, which source and tests already support. The most maintainable result may be one canonical action description shared by hints and docs, but no generalized onboarding system is justified without evidence. Confidence is medium because the repository reveals many access routes while actual discoverability is unknown. The idea earns its place by allowing successful capabilities to become easier to use and by making removal of redundant instruction an acceptable outcome.

## References

- `packages/explorEDA/src/components/charts/InPlace/useTitleEditing.tsx` — `useTitleEditing`, `TITLE_EDIT_DESCRIPTION`. Title gestures and context-menu alternatives are implemented.
- `packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx` — `useAxisEditing`, `DRAG_HINT`. Numeric-axis direct editing and contextual hints are implemented.
- `packages/explorEDA/src/components/KeyboardShortcutsDialog.tsx` — `shortcutGroups`. The workspace has a discoverable shortcut reference.
- `apps/demo/src/docs/glance.ts` — `GLANCES`. Chart docs separately describe useful gestures.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/landing-docs-entry/intent-brief.md` — related intent; status and overlap are discussed above.
