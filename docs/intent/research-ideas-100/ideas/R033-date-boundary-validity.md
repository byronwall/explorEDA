# R033 — Stress the date parser at precision and offset boundaries

- ID: R033
- Category: Types, quantities, and dates
- Priority: 32
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Date errors often hide at endpoints rather than ordinary noon timestamps. The parser already rejects impossible calendar days, normalizes explicit offsets, accepts fractional seconds, and makes a date-only upper filter bound include the whole day. `utcPeriod` uses exclusive upper boundaries for aggregation. Existing tests cover many common forms. A focused investigation should determine whether unusual offsets, rounding near midnight, and extreme representable dates preserve the same membership contract; none is a confirmed defect from source inspection alone.

Compare a deliberately narrow accepted syntax with the current flexible parser plus explicit validation and precision rules. A replacement library is a third alternative only if the boundary corpus exposes complexity that cannot be maintained locally. Decide whether extra fractional digits are rounded, truncated, or rejected, and specify valid offset components independently from their regular-expression shape. Keep the difference between an inclusive user-entered date bound and an exclusive aggregation endpoint visible in the written contract.

The first experiment should enumerate malformed offsets, submillisecond fractions on both sides of midnight, leap days, early years, and date-only bounds. Define expected timestamps or explicit rejection before exercising parser, filter, and rollup paths. Acceptance requires that accepted values satisfy the chosen range and precision policy and that each observation enters exactly the intended period. Reject broad parser replacement when a small validation adjustment or documented limit resolves the meaningful cases. Retain a counterexample even when the current behavior proves correct.

This is robustness work under the date-time and current-analysis-trust intents, not permission to change existing date semantics silently. The likely cost is a small, durable boundary corpus and a decision about accepted syntax; API changes should be unnecessary unless precision itself becomes a field property. Confidence in the investigation is high because the relevant code is central and hand-written. Runtime outcomes remain unverified in this source-only packet. Its value is preventing a rare endpoint mistake from affecting every chart and filter that reuses the parser.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `parseDateText`, `dateBound`, `timestampOf`. Shared date parsing includes fractions, offsets, and whole-day upper bounds.
- Repository: `packages/explorEDA/src/lib/valueParsing.test.ts` — `parseDateText`, `closes a date-only upper bound at the end of the day`. Tests already cover many valid forms and impossible dates.
- Repository: `packages/explorEDA/src/lib/dailyRollup.ts` — `utcPeriod`, `rollupByPeriod`. Calendar grouping uses explicit exclusive upper boundaries.
- Related intent: `docs/intent/date-time-handling/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
