# R032 — Separate civil dates, instants, and numeric epoch conventions

- ID: R032
- Category: Types, quantities, and dates
- Priority: 69
- Kind: follow-up
- Status: design-researched; implementation proposed
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The October 26 Design run supersedes the conditional research brief below.
Byron is demand; no outside-demand study is required.
Build canonical scalar values with temporal metadata in three complete slices:
UTC civil dates/instants/explicit epochs, authored zones, then genuine month labels.
See the [review and dispositions](../../../research/temporal-preparation-2026-10-26/README.md)
and [implementation plan](../../temporal-preparation/implementation-plan.md).
No feature is implemented by this research.

## Original candidate context

A birthday, a monthly reporting label, and a sensor timestamp describe different temporal things. The repository currently uses a simple datetime interpretation with UTC parsing and formatting. `timestampOf` accepts finite numeric timestamps, while `utcPeriod` starts from nonblank strings; field conversion also produces ISO strings. Those observed boundaries raise a representation question rather than proving inconsistent results in normal flows. Analysts need to know when a number means epoch milliseconds and when a date is only a calendar label.

Compare preserving the existing UTC-string contract with explicit preparation presets against adding minimal metadata for civil date, instant, and epoch unit. The former keeps runtime values simple; the latter could prevent accidental interpretation changes but expands every consumer. TC39 Temporal documentation distinguishes date-only values from exact instants, providing a semantic comparison rather than a dependency recommendation. A year-month value also needs a declared meaning: a period label should not silently imply an observed event at its first midnight.

The first experiment should create a decision table and tiny fixture containing date-only text, equivalent offset timestamps, seconds, milliseconds, and year-month values. Evaluate intended period membership through current conversion and rollup entry points, then compare the smallest explicit alternatives. Acceptance requires one documented meaning for every accepted representation and no automatic seconds-versus-milliseconds guessing. Reject a richer field model if UTC strings plus explicit preparation cover representative tasks cleanly and the extra metadata offers no observable analytical benefit.

This is a scope-discovery follow-up to the draft date-time intent. It should inform that coherent rework before isolated chart controls grow separate conventions. Adding temporal kinds would affect field settings and saved analysis semantics, so the initial output should be a contract recommendation and counterexamples, not an implementation. Confidence is medium: source boundaries are clear, but civil-date demand remains unverified. The investigation matters because a correctly drawn date can still represent the wrong kind of time.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `timestampOf`, `parseDateText`. Numeric timestamps and string date parsing already have central helpers.
- Repository: `packages/explorEDA/src/lib/dailyRollup.ts` — `utcDay`, `utcPeriod`. Day and period entry points accept different raw representations.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `FieldSettings`, `convertFieldValue`. Field settings currently expose datetime conversion and display options.
- Related intent: `docs/intent/date-time-handling/intent-brief.md`.
- External comparison: https://tc39.es/proposal-temporal/docs/ (accessed 2026-10-20).
