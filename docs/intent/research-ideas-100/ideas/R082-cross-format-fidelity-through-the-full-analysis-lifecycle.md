# R082 — Cross-format fidelity through the full analysis lifecycle

- ID: R082
- Category: Import, export, and persistence
- Priority: 19
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

explorEDA already reads delimited text, JSON, Excel, Parquet, and Arrow, with explicit handling for large integers, decimals, dates, nested values, and workbook results. `readers.test.ts` includes adversarial fixtures and an Arrow-versus-Parquet comparison. Those strengths make a broader lifecycle experiment useful: a decoder can produce correct rows while downstream field declaration, calculation, or saved-state reconstruction changes how those rows are interpreted. This investigation targets that composition of boundaries, not a claim that current readers discard precision.

Compare a small shared semantic fixture corpus with independently maintained format-specific fixtures. The shared corpus would state intended distinctions and known format limitations before encoding; the alternative would keep separate tests but add common analytical assertions. Include empty versus missing cells, duplicate headers, exact identifier text, timestamp precision, and nested structures represented as text. Let formats differ where their contracts inherently differ. The goal is a trustworthy analysis handoff, not forcing every format into a falsely identical type system.

The proposed experiment encodes a dozen carefully chosen rows in five supported formats, imports each, applies the same field settings and simple grouped measure, saves a full analysis, and reopens it. Compare raw values, declared types, valid contributors, and the final displayed measure against a written oracle. Acceptance means every supported distinction survives or is explicitly explained at the boundary where it changes. Reject extra codec machinery if the remaining differences are intrinsic format limitations already communicated correctly, or if maintaining generated binary fixtures outweighs the defects they reveal.

Cost should remain modest by selecting a compact adversarial corpus rather than multiplying every chart by every format. This follows current-analysis-trust while leaving the separate questions of inference policy, decimal arithmetic, and date interpretation to their own candidates. Confidence is high that the integration seam deserves examination, but several binary fixture assets are excluded from the packet and no reader tests were executed here. The future run must obtain those assets or generate its own before claiming empirical parity.

## References

- `packages/explorEDA/src/lib/readers/readTable.ts` — `readTableFile`, `readTableText`, `withFieldTypes`. Normalizes reader results into rows and declared field types.
- `packages/explorEDA/src/lib/readers/readers.test.ts` — `adversarial delimited files`, `Arrow and Feather`, `Parquet`. Contains exact-value and cross-format fixture assertions already.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — `stringifySavedAnalysis`, `parseSavedAnalysis`. The full-analysis codec tags undefined and nonfinite raw values.
- `packages/explorEDA/src/types/SavedDataStructure.ts` — `SavedAnalysisStructure`. Defines what travels with a full saved analysis.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
