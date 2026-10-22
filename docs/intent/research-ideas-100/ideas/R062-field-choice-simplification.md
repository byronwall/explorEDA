# R062 — Simplify field choice without hiding the evidence

- ID: R062
- Category: Accessibility and interaction
- Priority: 79
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Wide datasets make field choice an analytical decision: similar names, calculated variants, and mostly missing columns can all look plausible. The baseline `FieldPicker` already shows types, distributions, distinct counts, and missing counts for the filtered population. `RoleFieldPicker` provides word-aware search, keyboard previews, and shared-color information. The research opportunity is to reduce duplicated choosing behavior while retaining the different jobs of selecting several table columns and selecting one chart role. It is not a proposal to replace mature metadata with a bare dropdown.

Compare keeping the two task-specific controls with shared search and row presentation, against using one configurable field chooser for both jobs. A smaller alternative is to improve labels and ordering in the current controls without unifying them. Relevant ordering candidates include source order, current selection first, and explicit type compatibility with the chosen role. Avoid opaque recommendation scores: users should still see why a field is available, what population its metadata describes, and how a transient preview differs from a committed field change.

Start with a forty-column fixture containing aliases, repeated prefixes, two calculated measures, a date stored as text, and a mostly missing numeric field. Ask users to find one chart measure, switch a color role, and choose six table columns while preserving their order. Acceptance requires fewer failed choices or unnecessary navigation than the existing controls, with metadata scope and preview cancellation unchanged. Reject consolidation if single-role and multi-field tasks become harder to explain, or if a shared component accumulates mode switches that outweigh the small amount of duplication removed.

There is no dedicated field-chooser initiative in the inspected intent set; this is a simplification candidate adjacent to table-content-fit and current-analysis-trust. The source already shares `FieldMetadata`, so the first proof should evaluate behavior, not assume more abstraction is beneficial. API impact can stay internal and no dependency is needed. Confidence is medium because the maintenance and usability savings have not been measured. The investigation earns its place by offering a legitimate removal outcome: preserve two clear controls, unify only the repeated policy, and decline a larger framework if the evidence favors the current structure.

## References

- `packages/explorEDA/src/components/FieldList/FieldPicker.tsx` — `FieldPicker`. Multi-field selection includes filtered metadata and stable chosen order.
- `packages/explorEDA/src/components/charts/roles/RoleFieldPicker.tsx` — `RoleFieldPicker`, `matchField`. Single-role selection adds search ranking and transient previews.
- `packages/explorEDA/src/components/FieldList/FieldPicker.test.tsx` — `shows all fields, keeping the current order first`, `finds fields by name`. Tests protect existing selection order and name search.
- `docs/intent/table-content-fit/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
