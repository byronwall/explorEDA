# R026 — Reconcile missing, blank, invalid, and converted-value counts

- ID: R026
- Category: Data quality and missingness
- Priority: 1
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A field can contain no property, null, an empty string, whitespace, a declared null token, an invalid measurement, or a valid zero. Those states lead to different repair decisions. The repository already centralizes reading in `isMissingValue` and `numericExclusionReason`, and `buildConversionPreview` distinguishes failed conversions from missing results. However, categorical and numeric profiles follow different counting branches. That observed structure warrants an accounting investigation; it does not establish that their intentionally different meanings are defective.

The question is which distinctions an analyst needs to carry from raw data into effective values. Compare a small shared state classification used by diagnostic consumers with keeping the existing rules and adding an explicit reconciliation explanation. A third option is retaining detailed reasons only in conversion previews. Define whether whitespace is a category, a missing measurement, or a configured null token in each context, and make those scope differences deliberate rather than silently forcing every surface into one convention.

The first experiment should use twelve labeled rows covering these states, including zero, false, Infinity, and a failed date conversion. Before running anything, specify the expected partitions for raw profiles, converted profiles, and calculated inputs. Acceptance requires every row to have an explainable state and each displayed total to reconcile with its population. Reject the broader classification if current outputs already support the repair tasks and additional states merely multiply labels without changing an analytical decision.

This is a bounded robustness follow-up to the missingness and current-analysis-trust intents. Both acknowledge existing profiles and exclusions; neither makes a new state system approved work. A reusable classification could touch profile and preview types, while an explanatory view may need no public API. Keep original values intact. Confidence in investigating the boundary is high because the branches are visible in source; confidence that any behavior should change remains untested. The value is preventing data preparation from disguising why observations stopped contributing.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `isMissingValue`, `numericExclusionReason`. Central helpers distinguish missing and numeric exclusions.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `convertFieldValue`, `buildConversionPreview`. Conversion previews separate missing and failed values.
- Repository: `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts` — `calculateValueStatistics`. Numeric and categorical profiling take distinct counting paths.
- Repository: `packages/explorEDA/src/lib/valueParsing.test.ts` — `numeric eligibility`. Tests compare eligibility across profiles and reducers.
- Related intent: `docs/intent/missingness-and-expected-records/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
