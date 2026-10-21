# R084 — An explicit analytical contract for exported CSV

- ID: R084
- Category: Import, export, and persistence
- Priority: 67
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Analysts often export a filtered table to continue work elsewhere. `toTableCsv` already escapes commas, quotes, and line breaks, and the reliability integration test verifies calculated values and displayed sort order. Its cell conversion deliberately turns null-like values into empty fields. CSV also lacks the richer type and settings context carried by `SavedAnalysisStructure`. The research question is which losses matter in actual handoffs and how to make the available export choices clear, rather than treating an ordinary interchange format as a broken persistence codec.

Compare keeping plain CSV with explicit scope and type guidance against offering a small optional schema-and-scope companion. A third alternative is to steer reproducible handoffs to the existing full-analysis bundle and reserve CSV for tabular consumption. Separate raw values from formatted display strings and calculated outputs. Ask whether field labels or canonical names belong in headers, whether the receiving tool preserves identifier text, and how users distinguish a missing value from an intentionally empty string after reopening the export.

Prepare a filtered table with one calculated field, quoted text, exact identifier strings, empty strings, missing cells, and nonfinite raw input. Export it and reopen the file in explorEDA and a named downstream consumer. Compare intended row membership and value distinctions with the source table, then give users the alternative full bundle. Acceptance requires a format choice that preserves the distinctions their task actually needs and a reproducible account of scope. Reject a companion envelope if documentation plus the existing analysis bundle solves the same task with less complexity.

The cost is mainly product semantics and example coverage; a new sidecar format would add maintenance and should need strong evidence. This is a precise follow-up to reusable-analysis-outputs and current-analysis-trust, while the delivered CSV and full-bundle features remain acknowledged. Confidence is medium because the source behavior is clear but downstream workflows have not been observed. The investigation earns a slot by reducing mistaken assumptions at a common analytical boundary without promising every spreadsheet or programming tool will infer the same types.

## References

- `packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx` — `toTableCsv`, `DataTableToolbar`. Exports selected columns and supplied filtered rows, escaping punctuation and rendering null-like values as empty cells.
- `packages/explorEDA/src/test/providers/analysisReliability.test.tsx` — `keeps the table, active derived filter, edited formula, CSV, and restored analysis in agreement`. Existing coverage connects calculations, filtered rows, CSV, and restoration.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — `stringifySavedAnalysis`, `parseSavedAnalysis`. Provides the richer existing bundle alternative.
- `docs/intent/reusable-analysis-outputs/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
