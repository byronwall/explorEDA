# Design explicit expected-record reconciliation

https://github.com/byronwall/explorEDA

Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6. Mode: Design.

What should explorEDA build so analysts can compare explicit expectations with actual observations, inspect absent and unexpected records, and keep the result in a notebook?

Act as a data analysis product designer who has built reconciliation tools. Compare strong designs and primary sources. Recommend an ambitious, staged capability. Byron is the demand; no outside-demand gate applies.

## Access and reading

Confirm access to the attached complete-file source packet at this baseline. Stop and name the smallest missing input if decisive source is unavailable. Do not infer implementation from filenames.

Read AGENTS.md, docs/agent-guide.md, README.md, AnalysisProject.ts, evaluateProject.ts and its tests first. Then read project persistence, notebook compilation and findings, project DSL, and the R028 brief. The old R028 demand threshold is superseded by this mission. Joint missingness research already has an open PR: this run addresses absent observations, not missing cells.

## Ranked questions

1. Design the complete analyst flow from choosing expected and actual sources through inspecting matched, absent, duplicate, invalid-key, and unexpected memberships. Compare explicit expected-key tables with bounded schedule generation. Recommend independently shippable stages. Do not infer expectations from observed category combinations.
2. Compare at least three strong tools or primary references for reconciliation, expected sampling, and completeness. Which semantics and interactions fit an embedded React analysis workspace?
3. Specify identity and grain: composite keys, typed equality, missing keys, duplicates on either side, date precision, legitimate exclusions, multiple observations per expectation, filtered populations, and refresh. Which denominator answers which question? Absent expectations have no actual source row; give them honest provenance and actions.
4. Define the saved model, public API, project query integration, trace behavior, notebook findings, text round trips, and folder reopen behavior. Existing lookup diagnostics are ingredients, not a reconciliation interface. Keep the implementation direct. Compare reuse with a dedicated result operator.
5. Give exact small fixtures and expected memberships, including valid zero, an absent key, duplicate observations, an unexpected key, legitimate skipped dates, typed key collisions, and composite keys. Explain count identities without treating all status sets as disjoint when they are not.
6. Give ordered milestones with files/modules, important tests, a docs page and runnable example in each feature milestone, and the main risk. Separate Build, Explore, Defer, and Avoid recommendations with stable IDs. Avoid a general rules engine, ingestion monitoring, or paid services.

## Constraints and evidence

Preserve React and TypeScript; use pnpm. Cite repository paths and symbols for code claims and primary sources with URLs for external claims. Separate facts, inferences, and proposals. No repository mutations: Codex will check and integrate your proposal. Do not execute a broad robustness audit. Existing project key identity uses a single entityKey; examine this boundary rather than assuming composite identity exists.

## Deliverables

Attach a complete Markdown research report and a separate implementation plan. Lead with what to build. Include all ranked answers, sources, tradeoffs, stable recommendation IDs and dispositions, exact fixtures, and open questions. Include diagrams or companions only when useful. Link every original artifact in the final response; an optional ZIP is acceptable. Do not create manifests or hash receipts just for process. End with access status, files read, what was checked, what is proposed, and download links. A summary must not replace the full reports.
