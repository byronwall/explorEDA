# Selections and live findings through data refresh

https://github.com/byronwall/explorEDA

Mode: **Design**. Source baseline: `5594c95690859e8ce456aa3228fa9265ba686d12`.
Branch: `codex/selection-refresh-design-2026-10-29`.

## Mission

What should explorEDA build so an analyst can keep selected records and live notebook findings through a data refresh?
Design the workflow, identity contract, and independently shippable milestones.
Support records whose measures change while their keys remain stable.
Make removed or ambiguous records understandable without silently selecting other records.

Act as a designer of embedded analytical tools with experience in keyed tables, linked views, and reproducible notebooks.
Compare strong alternatives and recommend a useful capability, with candid tradeoffs.
Byron is the demand. Do not require outside demand or a usability study before designing it.

## Access check

Confirm access to this exact commit or the attached selected source packet before proceeding.
The packet contains complete files at the named baseline, rather than a runnable checkout.
If decisive source is missing from both, stop and name the smallest missing input.
Do not claim runtime or browser checks from source reading.

## Why this question is new

Main now has live notebook findings, shares, differences, engineering histograms, and Spearman pair discovery.
Findings follow one chart's current selection and expose its current records.
Their results are derived; saved settings contain definitions.

The October 22 R077 study audited source replacement and proposed bounded repairs.
Several repairs now exist in main. Read current code before relying on its historical findings.
That study asked whether to add an API after repairs, and allowed a no-change outcome.
This Design asks how to deliver a coherent keyed refresh capability across plain workspaces, project views, and notebooks.
It includes changed measures under stable keys, repeated refresh, and live findings after refresh.
Do not repeat the audit or gate the design on its old outside-demand rules.

Open live-findings research PR #507 includes an exploratory saved-evidence milestone.
Frozen historical evidence, capture, and restore are separate from this mission.
Other open plans cover preparation, joins, distributions, and regression; they are unbuilt proposals, not prerequisites.

## Reading route

Read at minimum these complete files from the packet. Follow relevant imports through GitHub when needed.

1. Rules and product:
   - `AGENTS.md`, `README.md`, `CODING_STANDARDS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`.
   - `docs/research/DIRECTION.md`.
   - `packages/explorEDA/README.md` and package manifests.
2. Current refresh and saved state:
   - `packages/explorEDA/src/providers/DataLayerProvider.tsx`.
   - `packages/explorEDA/src/providers/lib/carryRowSelections.ts` and `dataLayerState.ts`.
   - `packages/explorEDA/src/lib/rowIdFilters.ts`.
   - `packages/explorEDA/src/types/SavedDataStructure.ts`, `FilterTypes.ts`, and `AnalysisProject.ts`.
   - `packages/explorEDA/src/utils/saveDataUtils.ts`.
3. Project identities and query outputs:
   - `packages/explorEDA/src/components/ExplorEdaProject.tsx`.
   - `packages/explorEDA/src/components/project/analysisRowKeys.ts`, `sourceRowIdentity.ts`, and `settingsCompatibility.ts`.
   - `packages/explorEDA/src/lib/analysis/evaluateProject.ts` and `useAnalysisEvaluation.ts`.
4. Notebook values and ownership:
   - `packages/explorEDA/src/lib/notebook/findings.ts`, `compileNotebook.ts`, `readNotebook.ts`, and `writeBack.ts`.
   - `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx` and `NotebookFindings.tsx`.
   - `apps/app/src/ProjectWorkspace.tsx`.
   - `packages/explorEDA/src/lib/project/folder.ts` and `writeFolder.ts`.
5. Tests and runnable documentation:
   - `packages/explorEDA/src/test/providers/savedSelectionRestore.test.tsx` and `projectIdentity.test.tsx`.
   - `packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts`, `selectionIdentityFixture.ts`, and `sourceRowIdentity.test.ts`.
   - `packages/explorEDA/src/lib/notebook/findings.test.ts`.
   - `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.test.tsx`.
   - `apps/demo/src/docs/pages/developers.mdx`, `project-folders.mdx`, and `notebooks.mdx`.
   - `apps/demo/src/docs/live/NotebookFindingsExample.tsx`.
6. Historical context:
   - `docs/research/selection-identity-2026-10-22/README.md` and `decisions.md`.
   - `docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md`.

## Current facts to check

`DataLayerProvider` rebuilds rows when `data` or field declarations change.
With the same supplied save, it calls `carryRowSelections` against the rows that accompanied that save.
The helper matches row content, and drops an affected filter when a selected record disappears or changes.
This is useful conservative behavior, rather than a keyed same-record refresh contract.
New settings arriving with new rows have a different restore path.
Same-state host echoes use a saved-state fingerprint to avoid rebuilding.

Project views already encode runtime positions as query row keys, then decode those keys for the next result.
`sourceRowIdentities` uses typed unique entity keys and positional fallbacks for missing or duplicate keys.
`mapRowIdFilters` traverses chart, chart-local, Rows, and workspace filters.
Do not propose those traversal repairs as missing features.

`ExplorEdaNotebook` supplies compiled settings to its provider and uses local chart selections.
`FindingContext.revision` and contributor IDs describe current evaluation, not portable record identity.
The project app passes notebook query rows to the notebook component.
Inspect this route before assuming project row keys reach a notebook automatically.

## Ranked questions

1. **Choose the record identity and refresh contract.** Compare an explicit plain-row key declaration, project-key reuse,
   and a shared narrow boundary that can serve both. Recommend one coherent design.
   Decide who declares source continuity, how typed or compound keys work, and how measure edits differ from record replacement.
   Separate exact record selection from field predicates that should re-evaluate against current values.
   Decide whether a missing member remains unresolved, leaves a partial selection, or invalidates that owner.
   Keep an active empty selection distinct from clearing a filter to all rows.
2. **Specify the analyst and host flows.** Show select records → refresh with edits/additions/deletions → read updated findings
   → inspect retained and missing members → clear or repair deliberately → save and reopen.
   Cover local notebook selections and ordinary linked workspaces without changing their scope defaults.
   Show the authoring declaration or host API and the minimal visible status needed for a decision.
   Decide which actions create an undo step and what Undo means after a source refresh.
3. **Design the smallest complete data path.** Name changes to input props, runtime IDs, saved JSON, text declarations,
   notebook compilation/write-back, project query identity, and folder loading/saving.
   Avoid a second project identity implementation. Decide how notebook query keys can reach live findings and record inspection.
   Treat query grain changes, duplicate keys, missing keys, key-type edits, and compound-key delimiters explicitly.
   Say which owners and query shapes ship first, and what unsupported shapes visibly do.
4. **Ground the design in strong existing tools.** Compare keyed selection and refresh in a small set of named tools or libraries.
   Use primary documentation or source, such as AG Grid, TanStack Table, Perspective, or other better matches.
   Explain which ideas transfer to explorEDA's React library and local notebooks, and which impose excess machinery.
   Do not turn this into a market survey or an audit of existing wording.
5. **Give a buildable milestone plan with exact tests.** Each milestone must deliver a complete user action and identify files,
   important tests, documentation section, runnable example, and its main risk.
   Include repeated refresh, host echoes, selection edits between refreshes, save/reopen, and current contributor inspection.
   Separate predicted results from checks actually performed. Use meaningful fixtures rather than tests of internal structure.

## Proof anchors

Reuse the existing 12-record typed-key fixture where it helps. Add changed measures and notebook findings.
Before deriving outcomes, state the selected logical IDs, the policy, and exact expected results.
Use a small independent example with records A(value 10), B(20), C(30), selected A and C.
Initially count is 2, sum is 40, and mean is 20.
After reorder, A becomes 15, C remains 30, and unselected D(100) arrives.
Under the proposed same-key refresh, selected IDs remain A,C; sum becomes 45 and mean 22.5.
Then remove C, return it, duplicate A, and change A's key type.
You must decide and explain the expected membership and unavailable states for each transition.
Do not silently treat record predicates as equivalent to value/range predicates.

Cover numeric `101` versus string `"101"`, zero, false, missing keys, repeated equal rows,
measure conversion changes, source replacement under a different source identity, and an expanded query with two child rows.
Do not promote a parent selection to every child without an explicit contract.
Distinguish numeric contributors from selected records when measures are invalid.

## Evidence and boundaries

Cite current repository paths and symbols for code facts. Distinguish facts, inference, and proposals.
Cite primary external sources with URLs for claims that decide the design.
Current code takes precedence over historical reports. Name missing evidence plainly.

Keep React and TypeScript. Use pnpm. Assume one developer, one deployed version, and local files.
Do not add version coexistence, a provenance platform, remote services, collaboration, event sourcing, or a universal identity registry.
Do not implement historical captures, change statistical reducers, or rely on another unbuilt research PR.
Do not require a separate audit before the first useful milestone.
Performance work needs a measured workload; choose direct synchronous code unless the workload requires more.

## Deliverables

Put the decision, what to build, at the top of the report.
Return two substantive downloadable Markdown files:

- `selection-refresh-design.md`: recommended design, alternatives, user and host flows, source comparisons,
  exact refresh matrix, risks, and stable SR01… recommendations with Build/Explore/Defer/Avoid dispositions and reasons.
- `implementation-plan.md`: ordered, independently shippable milestones naming files, exact tests,
  documentation sections, runnable examples, and the main risk for each.

Keep the review concise while giving enough detail to start milestone one.
Link each deliverable in the final response. A ZIP is optional; do not generate receipts or manifests just for this request.
Preserve any useful diagrams, mockups, or companion data as linked files if you produce them.
If file creation is unavailable, provide the complete reports inline.

Codex will verify decisive claims, preserve all original result assets, integrate the plan, and open a review PR.
Do not modify the repository, execute downloaded code, commit, or push.
End with access status, files read, checks performed versus proposals, deliverable links, and open questions.
