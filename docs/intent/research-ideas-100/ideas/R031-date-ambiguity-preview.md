# R031 — Explain ambiguous date conversions before applying them

- ID: R031
- Category: Types, quantities, and dates
- Priority: 7
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A date such as 01/02/2025 can be valid under both supported numeric order presets while denoting different days. `parseDateText` already implements explicit day-first and month-first behavior, and `buildConversionPreview` exposes examples and failures before applying settings. Those capabilities are delivered. The remaining research question is whether a successful preview gives enough evidence to notice ambiguous interpretations, especially when its small initial example set happens to contain only unambiguous dates.

Compare the existing converted-value preview with a focused disagreement view that lists rows whose meanings differ between supported presets. Another alternative is a summary showing ambiguous, uniquely interpretable, and invalid counts, with examples for each. Keep selection explicit: a larger fraction of successful parses is evidence about a convention, not permission to choose it automatically. The same investigation should determine whether two-digit years deserve a separate explanation when default parsing and an explicit preset have different acceptance rules.

Construct a small fixture with dates valid under one preset, both presets, or neither, plus ISO values and two-digit years. Reviewers should identify the intended convention from a declared source description, then use each preview to verify it. Acceptance requires that valid-but-different interpretations are visible and that changing the preset preserves an inspectable explanation for every affected row. Reject additional UI if the current examples and failure list already reveal ambiguity reliably with comparable effort.

The holistic date-time intent remains draft and asks for scope discovery, so this candidate supplies evidence for that conversation rather than selecting a piecemeal date redesign. A disagreement summary could reuse the existing parser and preview structure without a new date library or saved format. The cost is bounded scanning and explanatory copy; API impact may be limited to preview metadata. Confidence is high that the ambiguity is real, but user difficulty is unmeasured. The investigation earns its place because valid parsing can still yield the wrong analytical date.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `parseDateText`, `DatePreset`. The parser supports ISO and explicit numeric order presets.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `buildConversionPreview`, `convertFieldValue`. A preview already shows converted values and failures.
- Repository: `packages/explorEDA/src/lib/valueParsing.test.ts` — `reads numeric dates in the preset order and keeps ISO strict`. Tests demonstrate different meanings under day-first and month-first presets.
- Related intent: `docs/intent/date-time-handling/intent-brief.md`.
