# R026: reconcile value-state accounting

https://github.com/byronwall/explorEDA

Repository: /Users/byronwall/Projects/explorEDA. Source commit: `f4cacdde180e16ad814451a8c064e394535565d6` (origin/main).
Target research branch: codex/missing-state-accounting-research-2026-10-21.

## Mission and decision

Act as a data-analysis product researcher with TypeScript and data-quality expertise.
Study catalogue R026, priority1: which value-state distinctions must remain visible from raw rows through conversions and calculated fields?
Decide between keeping present contracts with explanations, detailed conversion previews only, or a small shared diagnostic classification.
Be candid. Preserve useful differences. Do not assume a source difference is a defect.
R026 is the highest-ranked eligible idea. R043,R077,R001,R051 remain next candidates.
R008 is researched in PR464. R011 overlaps PR461. Do not repeat those surveys.
PR455 already studied joint missingness and eligibility. Its pinned summary is included for reuse.
This mission concerns individual value accounting, not a new joint-pattern diagnostic.
No named demand is supplied. Lack of demand does not block a correctness investigation.
It limits product-value claims and implementation scope.

## GO and NO-GO

Verify owner, repository, baseline and packet inventory before work.
Use the attached selected-source packet if GitHub access is absent. It is not a runnable checkout.
The packet includes exact baseline files and separately identified local/historical additions.
State which paths were read and which checks you could run.
Stop with NO-GO if required source is absent, the repository is wrong, or material rules require guessing.
State the smallest missing evidence. Partial source access cannot support a complete-runtime claim.
No writable checkout is required. Return complete downloadable artifacts instead of changing Git.

## Current source anchors to verify

`isMissingValue` treats null, undefined and whitespace-only strings as missing measurements.
`numericExclusionReason` distinguishes booleans, blanks and nonfinite measurements.
`calculateValueStatistics` has numeric and categorical counting branches.
`buildConversionPreview` reports valid/missing/failed. Without conversion, a present invalid number can count as valid.
`convertFieldValue` can turn a failed conversion into undefined while preserving a preview error.
`applyFieldSettings` skips absent properties; raw values remain a separate concern.
`useFilteredFieldProfiles` uses effective values and filter ownership. Preview uses raw rows.
FieldOverview combines population missing and excluded into one missing display; FieldMetadata has separate labels.
These are source observations, not executed product defects. Check them in the attached code.

## Reading route

Read AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md and docs/ui-defaults.md.
Then read the full R026 brief, catalogue overview, selected idea/review records and local queue.
Read valueParsing.ts, fieldSettings.ts, fieldProfiles.ts, statisticsCalculator.ts and their included tests.
Trace dataTypeDetection, fieldDistribution, useFilteredFieldProfiles, FieldOverview, FieldRowReadings and FieldMetadata.
Read applyFilter, field settings provider tests, Calculator, CalculationState and calculation preview.
Read missingness/current-analysis-trust intent and fields/summary/calculated-fields docs.
Use the pinned PR455 summary without reopening its broad survey or treating its gates as demand requirements.

## Ranked questions

1. Define a row ledger and conservation equations for each surface. Which population and value stage does each count describe?
2. Reconcile null, absent property, explicit undefined, empty text, whitespace, declared null token, invalid number/date, zero and false.
   Keep raw reason distinct from effective missingness. Determine which distinctions actually change a repair decision.
3. Compare raw profiles, conversion draft, applied profiles, calculated inputs/results, missing filters and distribution exclusions.
   Identify intentional differences, misleading labels and any source-predicted accounting inconsistency separately.
4. Compare retain/document, preview-only reasons and a small private classification. Score complexity, analytical clarity and preservation of raw values.
   Reject a universal state model if it forces incompatible category and measurement semantics together.
5. Recommend the smallest useful research integration, lesson/example, or bounded repair proposal.
   Pair each proposed feature with its docs page and runnable example. Queue large implementation for review.

## First experiment and rejection criteria

Before computing, write twelve labeled rows: absent property, explicit undefined, null, empty string, whitespace,
configured token NA, invalid text, numeric Infinity, zero, false, finite numeric text, invalid ISO date2025-02-30.
Use numeric and categorical settings, explicit null-token settings, and a separate date conversion scenario.
Write expected row partitions before comparing source-derived outcomes. Include calculated propagation through existing functions.
Supply IDs and explain every total; include one filtered population so scope differences remain explicit.
Do not JSON-serialize undefined/Infinity into a changed fixture without documenting that loss.
A source packet cannot execute the React application. Separate arithmetic, source predictions, proposed probes and executed tests.
Acceptance: each row has an explainable stage-specific state and displayed totals reconcile to their declared population.
Reject broader classification when present tools already support the repair task or extra labels change no decision.
Do not infer absent records, impute values, clean automatically, or diagnose missingness mechanisms.

## Evidence and comparisons

Cite exact repository paths and symbols for each recommendation. Use stable recommendation IDs MS01 onward.
Separate facts, inferences, hypotheses and proposed changes. Report uncertainty and negative results.
Use current primary sources for decisive external claims, including current retrieval dates and URLs.
Compare only directly relevant contracts, such as Arrow validity, pandas missing-value behavior and OpenRefine conversion diagnostics.
These products provide alternatives, not authority to overwrite explorEDA semantics.
No unsourced market-demand, robustness or performance claims.
No general quality platform, schema migration, new database service or production framework.
No application implementation, public API addition, Git push, merge, deployment or paid provisioning.
Codex owns local verification, document integration and the review PR.

## Deliverable contract

Provide four complete standalone Markdown files:

- `missing-state-decision.md`: decision, alternatives matrix, findings, recommendation IDs, confidence and GO/NO-GO gates.
- `sources-and-contracts.md`: repository receipts, current primary-source comparisons, facts/inferences, limits and unanswered questions.
- `row-ledger-and-proof.md`: twelve-row fixture, predeclared partitions, reconciliation equations, source-derived predictions and executable local proof proposal.
- `research-queue.md`: concise existing catalogue IDs with next actions; no new100-idea list.

Bundle these in `missing-state-research.zip`. Include `manifest.json` with path, byte size and SHA256 for all four reports.
Link ZIP and all standalone companions in the final response. Also publish ZIP and manifest SHA256 values.
If downloadable files are unavailable, return every file's complete content with explicit boundaries.
Do not use ChatGPT Library upload as a prerequisite for inbound collection.
For each substantive recommendation state problem, repository evidence, alternative, cost, API impact, confidence and rejection proof.
Recommend adopt/investigate/defer/reject dispositions for Codex review, not implementation approval.
Conclude with access status, files read, checks actually run, deliverables, unresolved gaps and assumptions.
Missing source that blocks a decision merits a focused follow-up; product choices may remain explicit proposals.
Codex will collect originals, verify integrity and claims, integrate documents, run gates and open a scoped review PR.
