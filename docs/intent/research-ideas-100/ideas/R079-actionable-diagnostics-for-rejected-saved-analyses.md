# R079 — Actionable diagnostics for rejected saved analyses

- ID: R079
- Category: Import, export, and persistence
- Priority: 27
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A saved workspace can contain many charts, formulas, shared aggregates, and geometry references. `validateSavedData` already checks substantial nested structure, and `restoreAnalysisFromStructure` validates semantic references before installing the rebuilt state. The public parser, however, commonly reports a general invalid-settings message. An author correcting hand-edited JSON or a host diagnosing a bad save may need to discover the failing nested field manually. This is a recovery-quality question, not a claim that validation or full-analysis persistence is missing.

Compare a diagnostic-returning companion validator with a small error-path accumulator inside the current checks. Retain the boolean type guard as a convenience if that keeps the API simple. A deliberately limited alternative is a developer-facing validation command that leaves runtime behavior untouched. Research whether errors should stop at the first failure or collect independent failures, and how to distinguish malformed syntax, unknown references, and settings incompatible with the supplied data. Avoid silently deleting invalid charts or inventing replacements for user choices.

Create a corpus of valid saved analyses, then introduce one missing aggregate, inverted axis limit, invalid composition property, and malformed formula at a time. Have a developer repair each using the existing error and a proposed path-specific diagnostic. Record repair steps and mistaken fixes, and verify that a failed attempt leaves the last working analysis intact. Acceptance requires a precise actionable location and reason with materially easier recovery. Reject the richer design if it duplicates validation rules, guesses the intended correction, or saves too little debugging effort.

A compact diagnostic structure would be a modest API addition; maintaining two independent schemas would be unacceptable for a single maintainer. This is a robustness extension of current-analysis-trust, grounded in existing codec and provider checks. Confidence is high in the source-level opportunity, but no usability measurement yet establishes which error categories dominate. The investigation earns priority because a useful failure message can rescue real saved work without adding analytical features, storage infrastructure, or permissive partial-restore behavior.

## References

- `packages/explorEDA/src/utils/saveDataUtils.ts` — `validateSavedData`, `parseSavedData`, `validateSavedAnalysisForData`. Structural validation returns a boolean; public parsers report broad invalid-settings errors.
- `packages/explorEDA/src/types/SavedDataStructure.ts` — `SavedDataStructure`, `SavedAnalysisStructure`. Defines settings and full-analysis persistence boundaries.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `validateAggregateState`, `restoreAnalysisFromStructure`. Checks referenced grouped summaries and calculation definitions during restoration.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
