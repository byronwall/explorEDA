# R011 — Retention maturity grounded in an observation cutoff

- ID: R011
- Category: Domain analysis
- Priority: 8
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Retention is already implemented, including future cells, partial-period flags, and pooled denominators restricted to cohorts that have reached a period. `planRetention` derives its observation horizon from the maximum readable time in `allIds`. That is a useful data-anchored default. A quiet final week, a late-loaded event, or an unrelated event far in the future raises a different question: whether the last event is reliable evidence that activity could have been observed throughout every earlier period.

Compare retaining the maximum-event rule with an explicit observation cutoff and with a simpler last-complete-period setting. The explicit cutoff can represent source knowledge but needs an understandable owner and refresh policy. The period setting is easier for manual analysis but loses precision. Keep zero activity separate from unobserved time, and decide whether partial cohorts contribute to a pooled summary. This research is about the evidence behind maturity, not replacing the shipped calendar-period definition or adding survival analysis.

The first experiment would use a small event log with a known collection interval, then remove final activity, add one late event, and add an event beyond the declared interval. Compute expected cohort eligibility and pooled denominators by hand. Acceptance requires the selected policy to preserve genuine zero activity, prevent unsupported maturity claims, and remain understandable after peer filtering. Reject the new setting if real sources cannot provide reliable cutoff information or if it produces more contradictory states than the current rule. Existing partial-cell rendering must be treated as the baseline, not a new feature.

A cutoff may require one validated setting or source annotation and a small change to preparation; a system for ingestion completeness would exceed the one-developer scope. The domain-analysis implementation is present even though its initiative map retains older execution wording. This candidate follows that work and the expected-records seed through a precise denominator question. Confidence is high in the conceptual distinction and medium in demand. No incorrect production cohort has been demonstrated, and the availability of trustworthy observation metadata remains the central evidence gap.

## References

- Repository: `packages/explorEDA/src/components/charts/Retention/retentionPlan.ts` — `RetentionInput`, `RetentionCell`, `planRetention`. The plan derives lastTime from allIds and uses observed/partial flags in cohort cells.
- Repository: `packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts` — `leaves periods past the data blank and marks the one it ends in`, `pools cohorts only over the periods each has reached`. Future-cell and maturity behavior already has focused tests.
- Related intent: `docs/intent/domain-analysis-views/intent-brief.md`.
- Related intent: `docs/intent/missingness-and-expected-records/intent-brief.md`.
