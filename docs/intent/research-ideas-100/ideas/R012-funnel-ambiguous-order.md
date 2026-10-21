# R012 — Funnel conclusions under tied timestamps and repeated entry

- ID: R012
- Category: Domain analysis
- Priority: 30
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The shipped funnel has clear rules: `followJourneys` sorts events by time and row ID, accepts the first matching occurrence for each stage, and applies an optional window from the initial entry. Tests deliberately establish equal-timestamp row ordering and first-occurrence behavior. Real logs can have coarse timestamps or repeated attempts, so those choices may change a conversion conclusion. The research should measure sensitivity to an insufficient event ordering contract rather than label the current deterministic convention a bug.

Compare keeping the current rule with requiring an explicit sequence field for tied events, or treating equal-time order as ambiguous unless strictly increasing timestamps prove the transition. For repeated entry, compare the current first-entry journey with a separately prepared attempt identifier. Avoid combining every possible tie, timeout, and reentry choice into a journey language. The central decision is whether a user’s source can establish one defensible attempt and sequence, and whether uncertainty can be exposed without silently selecting the most favorable interpretation.

The first experiment would use four entities, including a tied signup and purchase, an early failed attempt followed by reentry, and a transition exactly on the window boundary. Permute only tied input rows and compare the counted event IDs under each convention. Acceptance requires predictable results, a concise explanation of materially ambiguous journeys, and preserved source contributors. Reject additional settings if alternatives simply shift counts without matching a real source contract or if preprocessing an attempt key is clearer. Keep the existing tests as evidence of the baseline rather than rerunning them in this packet.

An ambiguity summary may be cheap; a configurable sequence field and persisted convention have moderate settings, validation, and documentation cost. A native repeated-attempt engine is a much larger commitment and should be rejected without demand. This is a robustness follow-up to delivered domain views, not a request to build funnels. Confidence is high that the rule is identifiable in code, while confidence in user impact is medium. The experiment earns its place because a small fixture can expose whether source ordering uncertainty changes a consequential analytical answer.

## References

- Repository: `packages/explorEDA/src/components/charts/Funnel/funnelPlan.ts` — `followJourneys`, `planFunnel`, `funnelSelection`. Journeys sort by time then row ID and match the first eligible event after prior stages.
- Repository: `packages/explorEDA/src/components/charts/Funnel/funnelPlan.test.ts` — `orders events at the same time by row`, `counts the first occurrence that follows the step before`, `counts later steps only inside the window`. Tie, first-occurrence, and window policies are already explicit tested behavior.
- Related intent: `docs/intent/domain-analysis-views/intent-brief.md`.
