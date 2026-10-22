https://github.com/byronwall/explorEDA

# R001: When can users trust a fitted curve and reuse its equation?

Research the existing React/TypeScript library at commit `63dfa75851ef57bb3782e6d7c1ef104784cd4064` (origin/main, refreshed October 22, 2026).
One mission: decide the smallest justified response when changing measurement units or coordinate offsets makes fit predictions, expanded coefficients, and displayed equations disagree.
Give a candid numerical and product review. Retaining current behavior is a valid result. Do not implement application changes.

## Selection and current evidence

This is catalogue R001, priority 4. Read its complete brief and local review in the packet.
Higher-ranked R026, R043, and R077 have completed research in PR465, PR466, and PR484.
They remain review proposals, not merged repairs. R008 is complete in PR464; R011 overlaps retention PR461.
Compared with R051 (filter scope comprehension), R086 (autosave recovery), and R031 (date ambiguity), R001 has the highest eligible catalogue priority and a compact independent numerical oracle.
R051 has navigation, missing-state, and replacement findings to reuse. R086 needs file outcome probes. Those are next, not reasons to skip R001.
No named customer demand is established. Correctness research is authorized; new statistical methods or a solver rewrite are not presumed useful.
Main advanced after the catalogue baseline. Inspect the supplied exact snapshot rather than repeating stale counts or feature-gap claims.
Open PR462 owns Mosaic and PR454 axes. Keep their surveys outside this mission.

Observed source facts, not runtime proofs:

- `regression.ts`: linear sums are centered, but `predict` uses expanded intercept plus slope times X.
- Polynomial X is standardized, Householder QR solves it, and prediction uses the standardized basis. Reported coefficients expand into powers of original X.
- `formatCoefficient` uses roughly three significant digits below 1000, integer rounding at larger magnitudes, and exponential notation for tiny values.
- `fitEquation`, `FitLabels`, and `FitTraceBody` expose an expanded equation. Trace coefficients use their own precision. Inspect both.
- Existing tests cover one linear large offset and basic exact/noisy polynomial cases. A passing existing test does not certify arbitrary engineering scales.
- `planFitMarks` evaluates `outcome.predict`; equation labels use `fitEquation`. Filtering excludes the chart's own brush from refits.

## Access preflight

GO only if the repository identity and exact baseline can be verified through GitHub or the supplied packet.
The source packet is an authorized selected text snapshot, not a runnable checkout. Its header records the source commit and each file hash.
Use the packet if GitHub indexing cannot expose the exact ref. State coverage limits and all checks you cannot run.
If required evidence is absent, report NO-GO and the smallest missing item. Do not replace this mission with a general survey.
No write access is required. Return downloadable research artifacts; Codex owns integration, commits, and PRs.

## Reading route

Read AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, package manifests, and README.
Then read the R001 brief, selected catalogue records and reviews, and both related intent briefs.
Primary implementation route:

1. `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` and `regression.test.ts`.
2. `fitPlan.ts`, `FitLabels.tsx`, `FitTraceBody.tsx`, `useScatterFits.ts`, and `definition.ts` in that same folder.
3. `apps/demo/src/docs/pages/scatter.mdx` and the supplied regression demo and live-example excerpts.
   Read more exact-baseline source only if needed. Cite paths and symbols. Distinguish omitted source from absent capability.
   Local commands for Codex later: `pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/regression.test.ts`, `pnpm --filter exploreda check-types`, and `pnpm check` before a review PR.

## Ranked questions

1. Where does disagreement become material? Separately evaluate internal prediction, full expanded coefficient reconstruction, rounded equation reconstruction, trace precision, and reported residual metrics. Do not use coefficient relative error alone when the intercept or a coefficient is near zero.
2. Which smallest response earns its cost: existing approximation plus docs; more honest formatting; a centered equation with explicit origin/scale; a representation-specific warning; or an actual numerical repair? Compare these against a solver rewrite and explain why the latter does or does not earn its cost.
3. Which proof gates protect ordinary useful fits and reject harmful safeguards? Define an error envelope tied to response variation, numerical representation, and a realistic measurement tolerance. Explain the distinction between visual trend reading and copying an equation.
4. How should docs and one focused runnable example explain any earned boundary? Name the existing docs page and example. Keep new UI/API controls conditional on proof.

## Bounded experiment and evidence contract

Use one small NIST certified polynomial regression case, plus a transparent synthetic measurement fixture and its translated/scaled copies.
Fetch current primary NIST sources. Preserve raw reference values, certification precision, URLs, and retrieval dates.
Freeze inputs and expected outputs before comparing candidates. Include exact hashes and arithmetic recipes when tools permit.
Independent references can use exact rational arithmetic or high precision. Do not merely compare two copies of the same binary64 algorithm.
Use deterministic cases: ordinary-scale negative controls; large offsets with small variation; unit changes; repeated X; nearly constant but representable X; insufficient distinct X; supported degrees 2–6 near sample limits; and a non-exact residual case.
Keep the matrix small. Report input rounding and loss of distinguishability separately from solver error. Out-of-range overflow stress cases must not stand in for representative use.
For each case show input units/range, n, degree, expected unavailable status, baseline result, error metrics, scale-based tolerance, and pass/fail/unknown.
Evaluate held-out in-range predictions as well as fitted rows. Treat extrapolation separately.
Recompute SSE independently from predictions and compare reported fit metrics; do not infer a defect solely from cancellation-prone subtraction.
When reconstructing displayed text, use the actual formatter rules, Unicode minus/superscripts, grouping separators, and zero suppression. Do not use unrounded coefficients as a proxy for the displayed equation.
If execution is unavailable, return precise fixtures, expected values, and unrun checks. Source prediction is not executed product evidence.
Do not claim browser, copied-expression, export, or full workflow tests without executing them.

Current primary sources must support decisive external claims. Start with NIST's Statistical Reference Datasets and official numerical-library documentation on conditioning/basis conversion. A small comparator set is sufficient.
Separate observed repository facts, external facts, inference, proposed experiments, and executed checks.
Provide direct primary-source URLs and exact source locations. Record failed access and uncertainty. Do not invent demand or imply certified NIST data certifies this library.

## Decision and scope gates

GO for a proposed repair only with a reproducible material discrepancy, an independently justified tolerance, and ordinary-scale controls.
GO for a representation-only remedy only when it improves agreement without suppressing a valid curve or misrepresenting units.
NO-GO for new controls if discrepancies are immaterial, existing explanation suffices, or safeguards block useful fits more often than they reveal instability.
Retain current solver if the evidence supports it. Separate prediction instability from equation rounding and basis conversion.
Stop after one bounded comparison. Do not expand to uncertainty bands, new regressors, hypothesis testing, model selection, notebooks, a universal numerical API, or a benchmark platform.
Keep large implementation proposed for Byron's review. Do not modify production code or claim a local Git operation.
Any later visible milestone must include `/docs/scatter` (source page above) and a focused runnable example in the same milestone.

## Required deliverables

Return four complete standalone Markdown files:

1. `R001-report.md`: decision, methods, case results, alternatives, product meaning, uncertainty, and GO/NO-GO.
2. `R001-sources.md`: exact-baseline source ledger and current primary external sources; verified versus attributed claims.
3. `R001-decisions.md`: stable RC01, RC02, etc. recommendations. Each needs problem, evidence, keep/fix/explore/avoid classification, cost, alternatives, confidence, proof gate, and intended local destination.
4. `R001-proof-and-docs.md`: frozen fixture definitions, reference values, runnable proof recipe or executed results, rejection controls, and concise proposed intent/docs/example edits. Clearly label unrun checks.
   Also return `R001-manifest.json` with file sizes and SHA256 hashes, and `R001-research.zip` containing exactly those four reports plus that manifest.
   Link every standalone file, manifest, and ZIP in the final response. State output inventory and ZIP/manifest hashes outside the archive.
   If artifact creation is unavailable, supply all complete contents in the response and state the fallback.
   Codex will read all outputs, independently check decisive claims, assign adopt/investigate/defer/reject dispositions, integrate documents, and open a review PR.
   At most two focused follow-ups will address material gaps. Open product choices can remain proposals if the evidence supports useful review.
   End with access status, exact baseline, files read, checks executed, unrun checks, artifact links, and unresolved blockers. Do not call this complete if any priority question is silently unanswered.
