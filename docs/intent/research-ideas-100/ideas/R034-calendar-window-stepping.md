# R034 — Choose reproducible semantics for stepping calendar windows

- ID: R034
- Category: Types, quantities, and dates
- Priority: 70
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Comparing adjacent months is cumbersome when an analyst repeatedly types bounds, but stepping by thirty days does not mean stepping by one calendar month. `datePresets` already offers latest-source ranges and bounded calendar groups; `utcPeriod` already computes UTC boundaries. The calendar-period intent explicitly leaves stepping and completed-period behavior unresolved. The research question is therefore about the meaning and reproducibility of a step, not adding date presets that the product already has.

Compare storing only the absolute range produced by each step with storing a compact relative period descriptor anchored to an explicit source date. Absolute ranges are predictable on restore; descriptors can preserve an analytical intention when data grows but need clear refresh semantics. Test calendar-month stepping separately from shifting an arbitrary interval by its duration. A range ending mid-month may mean the last complete month, the current partial month, or an equal elapsed slice; the interface must not choose among these meanings invisibly.

Use a tiny January-to-March dataset spanning a leap year, then add records that change its latest date. Step each alternative forward and backward and enumerate source memberships. Acceptance requires explainable boundaries, a documented treatment of partial periods, and identical restored results when the anchor has not changed. Reject relative saved periods if they complicate understanding without improving a demonstrated adjacent-period task. Explicitly reject any design that silently substitutes the current clock for the existing source-anchored reference.

This precise follow-up should be reconciled with the broader draft date-time rework before implementation. It could reuse existing filters and save absolute bounds with no new persisted type; relative descriptors would add validation and documentation obligations. Keep live scheduling and timezone configuration outside this proof. Confidence is medium because the repeated task is plausible but not supplied as an observed user session. The investigation earns its place by identifying a small interaction that can improve repeated comparisons without sacrificing reproducibility.

## References

- Repository: `packages/explorEDA/src/lib/datePresets.ts` — `datePresets`. Existing quick ranges anchor to the latest source date.
- Repository: `packages/explorEDA/src/lib/dailyRollup.ts` — `utcPeriod`, `TimeBucket`. UTC calendar boundaries already define intervals.
- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `dateBound`. Date-only bounds have an explicit inclusive interpretation.
- Related intent: `docs/intent/calendar-period-analysis/intent-brief.md`.
- Related intent: `docs/intent/date-time-handling/intent-brief.md`.
