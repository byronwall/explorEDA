# Recommendation review

Status: Codex dispositions for proposed intent. These decisions do not approve implementation.

All 15 original recommendations are retained unchanged in [the source JSON](https://chatgpt.com/c/6ad59131-5e44-83ea-a362-9192357f37a2).
Adopt means include in the proposal. Investigate means prove the hypothesis. Defer means omit from the core scope.

| ID    | Recommendation                                                                  | Disposition | Reason or qualification                                                                                                                            |
| ----- | ------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS-01 | Establish renderer truth and honest mode documentation                          | adopt       | Adopt explicit mode boundaries. Static checks confirm the docs describe observation controls too broadly.                                          |
| TS-02 | Add arbitrary named scale groups and an explicit Own scale action               | adopt       | Adopt arbitrary named groups as proposed intent. Reuse existing field units. Leave old-save policy open; no compatibility layer is approved.       |
| TS-03 | Prove focused-axis overlays with an optional two-axis presentation              | investigate | Investigate focused axes. Provider docs support scale mapping, not this interaction. Reject it if users misattribute a ruler.                      |
| TS-04 | Drive precise shared-cursor inspection from original samples                    | adopt       | Adopt original-sample lookup. The current cursor reads reduced geometry and exact-X matches.                                                       |
| TS-05 | Make ranges, transforms, clipping and resets truthful per group                 | adopt       | Adopt owner-specific ranges and transforms. The current right scale bypasses primary bounds and true-log enablement.                               |
| TS-06 | Separate row selection from time zoom, pan and reset                            | adopt       | Adopt separate selection and navigation semantics. Test the exact controls; avoid adding a navigator now.                                          |
| TS-07 | Stabilize Calendar time references and preserve aggregate meaning               | adopt       | Adopt a separate Calendar repair proposal. Do not block observation scale work on this independent slice.                                          |
| TS-08 | Investigate shared-time lanes as a layout of scale groups                       | investigate | Investigate lanes after the scale model works. Scroll, labels, and complete image export need proof.                                               |
| TS-09 | Investigate exact long-form irregular observation series                        | investigate | Investigate only after a concrete raw-tag task. Keep one-measure long-form support bounded; no generic data-provider framework.                    |
| TS-10 | Preserve extrema and provenance under bounded rendering reduction               | adopt       | Adopt fidelity as a requirement. The current constant-X reducer drops all but the first point above its threshold. Timing budgets remain proposed. |
| TS-11 | Carry stable scale identity through Notes, trace, save, undo and export         | adopt       | Adopt stable identity across existing contracts. Existing annotation left/right identity and strict series validation need explicit changes.       |
| TS-12 | Make every value and scale control keyboard and narrow-layout accessible        | adopt       | Adopt keyboard and narrow-width access as release gates. No new control has passed those gates yet.                                                |
| TS-13 | Defer normalized and indexed overlays until a named task needs them             | defer       | Defer until a named comparison requires a transformed quantity and fixed baseline.                                                                 |
| TS-14 | Defer synchronized navigation across separate charts                            | defer       | Defer separate-chart synchronization. Within-chart lanes are a smaller first scope.                                                                |
| TS-15 | Keep React, TypeScript and D3; allow one measured renderer spike only if needed | adopt       | Adopt retaining React, TypeScript, and D3. No local evidence supports a replacement.                                                               |

Counts: 10 adopt, 3 investigate, 2 defer. No follow-up is needed for a material research gap.

Rejected alternatives: unlimited axis gutters as a default, hidden independent scales, automatic normalization, and renderer replacement now.
Also reject implicit duplicate averaging, mixed-scale additive stacks, and domain changes caused only by focus or linked filters.

The old-save policy, exact duplicate drawing rule, focused-axis threshold, and performance budgets remain decisions or experiments.
Pro’s optional compatibility boundary is not adopted. Follow repository rules before adding old-format support.
