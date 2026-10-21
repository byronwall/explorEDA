# R027 — Choose an actionable representation for joint missingness

- ID: R027
- Category: Data quality and missingness
- Priority: 49
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst may see modest missing counts in several columns while overlooking that the same observations lack all of them. `buildFieldProfiles` already provides individual summaries, and field conversion previews expose invalid inputs. The missingness intent explicitly proposes joint patterns, so requesting another missing-count display would repeat delivered work. The useful follow-up is choosing a representation that helps someone identify the affected records and judge whether the pattern changes a planned analysis.

Compare an exact pattern-frequency table, where each row names the fields absent together, with a bounded row-by-field matrix ordered by pattern. The table compresses repeated patterns; the matrix preserves individual observations but can become visually dense. A third contender is a short sequence of ordinary missing-value filters. Preserve raw missingness and conversion failure as separate selectable definitions, and make the denominator either the full source or a named filtered population. Neither view should infer why values are absent.

Prepare a six-field fixture with a common isolated omission, a rare joint omission, an invalid measurement, and valid zeros. Add an imbalanced grouping field so overall percentages can conceal a subgroup. Ask reviewers to find the planted joint omission and return exact row IDs using each representation. Accept the smallest design that finds the pattern correctly and states its denominator. Reject a dedicated diagnostic if existing profiles and filters perform equally well or usefulness depends on an unbounded matrix.

The existing intent remains a candidate seed, and this research narrows its first proof rather than re-opening its entire scope. Reusing field profiles and ordinary row selections should keep maintenance manageable; a pattern index may be sufficient without a new chart type or visualization dependency. Field-count limits and treatment of conversion errors remain evidence gaps. Confidence is medium until an actual incomplete dataset demonstrates demand. The investigation earns a place because it tests a concrete repair workflow before committing to another display.

## References

- Repository: `packages/explorEDA/src/lib/fieldProfiles.ts` — `buildFieldProfiles`, `buildFieldProfile`. Profiles already expose individual field summaries.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `buildConversionPreview`. Conversion failure counts can remain distinct from missingness.
- Repository: `packages/explorEDA/src/types/ChartTypes.ts` — `datum`. The scalar cell model bounds the initial diagnostic.
- Related intent: `docs/intent/missingness-and-expected-records/intent-brief.md`.
