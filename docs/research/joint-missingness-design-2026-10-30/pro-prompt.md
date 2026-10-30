# Design joint missingness as an analysis users can keep

https://github.com/byronwall/explorEDA

Source baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` (`origin/main`, October 30, 2026).
Mode: **Design**.

## Mission and decision

What should explorEDA build so an analyst can find joint missingness patterns, select their exact records,
and explain how those patterns affect an analysis in a saved notebook?

Design the capability and a staged implementation plan. Go beyond per-field missing counts.
The result should help an analyst answer which fields are absent together, which groups differ,
which observations remain usable for a chosen analysis, and what records establish each answer.
Byron, the owner, wants this capability. Do not require outside demand or a usability study before designing it.

Act as a senior visual analysis designer with experience in missing-data exploration and linked record views.
Compare serious alternatives. Recommend a strong, buildable design and explain its limits.

## Access check

Read the supplied source packet at the exact baseline above, or the repository at that commit.
The packet contains complete files, each introduced by its repository path.
If decisive source is missing from both, stop and name the smallest missing input.
Do not imply that a partial reading proves current runtime behavior.

## Product and current foundations

explorEDA is a React and TypeScript library with a demo, local folder app, and text-authored notebooks.
It combines linked charts, calculated fields, raw/effective value inspection, and restorable settings.
Use pnpm. Keep the existing React architecture. Assume one local owner, one client, and one deployed version.

Current source observations to confirm:

- `fieldProfiles.ts` and `statisticsCalculator.ts` provide marginal summaries, not joint patterns.
  `missingRowCount` includes blank text. Numeric exclusions remain distinct from missing values.
- `valueParsing.ts` owns raw-value reading. Blank text, null, undefined, finite zero, and false need distinct treatment.
- `fieldSettings.ts` can convert invalid values or authored null tokens into effective missing values.
  The provider retains raw rows. Conversion preview uses raw rows and is not a general numeric-eligibility count.
- `useFilteredFieldProfiles.ts` accounts for filter owners. A diagnostic needs one explicit denominator,
  rather than mixing field-specific owner-excluded populations into an apparent common pattern table.
- Heatmap groups categorical row/column values. Its empty cells do not imply missing observations.
  The chart registry has no joint-missingness chart.
- `FilterTypes.ts` has no general disjunction of multi-field patterns. Selecting exact patterns cannot
  silently become the Cartesian product of independent field choices. Row-position filters already exist.
- Notebook findings follow a named chart's own selection. Notebooks use local selections.
  A dashboard-wide filter change alone is not proof that notebook findings use the intended population.

These are source observations, not browser acceptance or feature implementation.

## Reading route

Read at minimum these packet groups. Discover adjacent source through repository access if useful.

1. `AGENTS.md`, `README.md`, `CODING_STANDARDS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`,
   `docs/research/DIRECTION.md`, and the missingness intent.
2. `docs/research/joint-missingness-2026-10-19/{README,decisions,evidence}.md`,
   `docs/research/missing-state-accounting-2026-10-21/{README,evidence}.md`, and catalogue R027/R028.
3. Parsing, profiles, conversion, profile tests, filtered profiles, `DataLayerProvider.tsx`,
   `CrossfilterWrapper.ts`, `applyFilter.ts`, `chartPopulation.ts`, and row-ID filters.
4. Heatmap definition and plan; registry; trace scope, types, and record table.
5. Saved settings, save validation, DSL coverage/compile/export, notebook findings/provider/writeback,
   project source/reference types, and evaluator.
6. Demo docs pages for fields, heatmap, dashboard text, and notebooks; example registration and docs gate.

The October 19 run was a conditional review: it deferred a diagnostic until a named author failed with existing tools.
This new Design mission replaces that demand gate, under the current DIRECTION.
Retain the review's valid semantic distinctions; do not repeat its robustness audit or stop at a recipe.
The October 21 review covers stage-specific accounting. Do not broaden this mission into repairing all value contracts.
The merged selection-refresh plan is adjacent design context, not a built prerequisite.
Design a first milestone that works on current main. State any later dependency explicitly.

## Ranked questions

1. **What should the user see and do?** Compare an exact pattern-frequency view (including UpSet-style encoding),
   a record-by-field matrix, completeness/analysis-eligibility exploration, and combinations of these.
   Study at least three strong named tools or research systems using primary docs or papers.
   Choose one coherent design. Show entry, field choice, pattern reading, selection, record tracing,
   group comparison, and notebook continuation. Include low-fidelity layouts if they resolve a choice.
2. **What exactly is a pattern?** Decide exact versus inclusive intersections, present versus missing states,
   treatment of raw missing input versus conversion failure versus effective missingness, and calculated fields.
   Explain valid zero/false, blank categories, nonfinite numeric values, authored null tokens, and absent properties.
   Define source/current/local population and denominator, including empty populations and selections across patterns.
   Decide which distinctions belong in milestone one and which need a later explicit mode.
3. **How does an analyst assess consequences without causal overclaiming?** Design bounded group comparisons
   and a complete-case or chosen-field eligibility reading. State exactly what can be concluded from the data.
   Do not infer MCAR/MAR/MNAR, impute values, diagnose causes, assign a quality grade, or infer expected records.
   Explain how marginal rates can conceal joint omissions or subgroup concentration.
4. **How does this fit the existing data and interaction model?** Recommend a chart, field tool, or other surface
   from evidence. Specify settings, pattern identity, exact selection representation, owner-excluded scope,
   trace payloads and source records, refresh behavior, notebook findings, Undo, host callbacks,
   JSON/text persistence, folder reopen, and chart image export. Keep call stacks and state shapes small.
   A selected semantic pattern may need to re-evaluate after edits; do not confuse it with frozen row membership.
5. **How do we build it in useful stages?** Name existing files/modules and small additions.
   Each milestone must include its docs page/section and runnable demo example in the same milestone.
   Include exact fixture values, record memberships, and denominator expectations that prove the contract.
   Bound field count, pattern count, rendering, and computational cost; distinguish omitted display from omitted records.
   Give a first proof a worker can implement without waiting for another research PR.

## Evidence and scope

Cite paths and symbols for repository claims. Cite current primary sources, with URLs, for decisive external claims.
Separate facts, inferences, and proposals. Say what you could not inspect.
Use ambition for the capability and restraint for architecture. Prefer existing profile, filter, trace,
field-picker, notebook, and save mechanisms when they fit. Do not add an independent missing-data engine.

Include a small six-field fixture with overlapping patterns, unequal groups, an isolated omission,
a rare joint omission, a conversion failure, zero and false, and one all-complete record.
Provide exact counts, shares, and source IDs for pattern selection and group comparisons.
Include a second case with equal marginal missing counts and different complete-case membership.
Specify exact and inclusive intersection answers separately if both are proposed.

Expected-record generation/reconciliation, imputation, cleaning automation, statistical mechanism tests,
remote monitoring, enterprise permissions, and unrelated parser repairs are outside this mission.
Do not require new chart dependencies or a general rules language without a concrete advantage.

## Deliverables

1. A Markdown report. Lead with one paragraph stating what to build and why.
   Answer the ranked questions, compare alternatives, cite primary sources, and show the user flow.
2. A Markdown implementation plan. Give independently useful milestones, affected files, acceptance tests,
   exact expected values, docs and runnable examples, persistence coverage, and the main risk of each milestone.
3. Recommendations with stable `JM-D01`-style IDs and **Build**, **Explore**, **Defer**, or **Avoid** dispositions.
   Build means put in a plan, not permission to ship. Give one reason for each recommendation.
4. Attach both Markdown files as downloads and link each in the final response. A ZIP is optional.
   If you supply fixture data, mockups, diagrams, or companion code, attach and link every companion too.
   Do not create an integrity manifest solely for this task. If file creation fails, provide full Markdown inline.

Codex will check decisive claims against current code, preserve every original result artifact,
write the repository plan and short research summary, and open a review PR.
Do not commit, push, implement the feature, merge, deploy, or provision services.
End with access status, files read, what you checked versus proposed, deliverable links, and open questions.
