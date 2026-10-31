# Design comparable regional rates with explicit exposure

https://github.com/byronwall/explorEDA

Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6. Mode: Design.

What should explorEDA build so an analyst can compare geographic rates, inspect each numerator and denominator, and keep the comparison in a reusable notebook?

Act as a geographic analysis product designer with experience in statistical rates and linked views. Recommend an ambitious, staged capability. Byron is the demand. Earlier outside-demand gates in the attached intent and R016 brief are superseded by this mission.

## Access and reading

Confirm access to the attached complete-file source packet at this baseline. Stop and name the smallest missing input if decisive source is unavailable. Do not infer implementation from filenames.

Read AGENTS.md, docs/agent-guide.md, README.md, and docs/ui-defaults.md. Then read Map definition, regionMapPlan, RegionMap, useMapData, region trace/settings/tests, shared aggregates, AnalysisProject types, evaluateProject and tests, project persistence/DSL, and notebook reading/findings. Read the R016 brief and October 19 grouped-rates summary. That earlier Review kept a generic rate seed deferred; this Design asks a new geographic capability question, including separate exposure sources and time/boundary alignment.

## Ranked questions

1. Design the full analyst flow for comparing event counts with population or exposure rates across regions. Include unequal populations, event rows plus a separate denominator table, a prepared region-period table, and numerator/denominator evidence. Compare at least three viable designs. Pick one and explain the first shippable workflow and later stages. Avoid a proposal whose only outcome is a recipe or a demand gate.
2. Compare strong tools and primary references for normalized choropleths, exposure rates, and comparable geographic populations. Which interactions and semantics should explorEDA adopt? Distinguish proportions, event intensity, and crude population rates. Explain when a map needs a companion ranked view or table and when uncertainty changes the reading. This is descriptive analysis, not a medical decision tool.
3. Specify grain and validity: one denominator per region-period-population; repeated exposure on event rows; duplicate/conflicting denominator rows; typed keys and changed boundary versions; time windows; incomplete coverage; negative, zero, missing, and invalid inputs; and regions with zero observed events. Distinguish no events from unobserved collection. Do not assume successful joins prove comparability or infer coverage from the last event. Give pooled-versus-mean semantics and exact contributor sets.
4. Specify filter and selection behavior. What happens to a fixed population denominator when an analyst selects an event subtype, date, region, or facet? Which filters can legitimately apply to each input? Explain unavailable comparisons and region selection with no event row. Preserve source identities and trace both inputs. Explain color-domain choices for ratios without copying the current count/sum envelope by assumption.
5. Recommend the saved model, API, minimal computation modules, chart adapter, notebook/query integration, text round trips, host callback behavior, refresh, and folder reopen. Compare a small reusable grouped-rate primitive with map-specific arithmetic. Reuse existing aggregation, lineage, query, and worker machinery where it fits; avoid a universal semantic layer. Shared aggregates currently include count, sum, average, max, and min; Map exposes only count, sum, and average. Keep these facts separate.
6. Give small fixtures with exact expected totals, rates, statuses, and memberships. Include a count/rate rank reversal, a repeated denominator, conflicting denominator, valid zero events with explicit coverage, zero and missing exposure, a time/boundary mismatch, typed-key collision, a filtered numerator with fixed exposure, and a pooled rate that differs from the mean rate. Provide ordered milestones with real files/modules, important tests, a docs page and runnable example in each feature milestone, and the main risk.

## Constraints and evidence

Preserve React and TypeScript; use pnpm. Cite repository paths and symbols for code claims and current primary sources with URLs for decisive external claims. Separate facts, inferences, and proposals. Codex will check and integrate the results; do not mutate the repository. This is feature design, not a robustness audit.

The product runs locally or embedded in a host app. No paid service, remote ingestion monitor, silent boundary crosswalk, automatic causal interpretation, or general GIS workbench. Do not require the pending reusable-output or quantity proposals to ship first. Identify useful shared seams and a bounded independent first milestone. Existing lookup and aggregate steps are ingredients; check whether their actual execution and provenance can express the proposed two-input workflow.

## Deliverables

Attach a complete Markdown report and a separate implementation plan. Lead with what to build. Answer every ranked question with sources and rejected alternatives. Give recommendations stable IDs and Build, Explore, Defer, or Avoid dispositions with reasons. Include exact fixtures and open questions. Diagrams or companions are welcome when useful. Link every original artifact in the final response; an optional ZIP is acceptable. Do not create manifests or hash receipts just for process. End with access status, files read, what was checked, what is proposed, and download links. A summary must not replace the reports.
