# R077 — Bounded integration and review plan

**Mission:** selection identity after immutable source replacement.  
**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA).  
**Reviewed baseline:** [`f4cacdde180e16ad814451a8c064e394535565d6`](https://github.com/byronwall/explorEDA/commit/f4cacdde180e16ad814451a8c064e394535565d6).  
**Research date:** October 22, 2026, America/Indianapolis.  
**Supplied integration branch:** `codex/selection-identity-research-2026-10-22`; this report does not claim that the branch was created or checked out.  
**Status:** GO for source research and bounded independent verification; NO-GO now for a new plain-row identity API or larger implementation. No product changes were implemented in this research run.

## 1. Integration decision

Adopt the no-retarget contract as the review criterion: a preserved row-specific selection must still denote the same logical record or output occurrence. When that cannot be established, retain explicit unresolved intent or deliberately invalidate the selection. Never substitute the current occupant of an old position, merge equal-looking observations, or quietly convert an unresolved positive inclusion into an unrestricted population.

The smallest recommended route has two parts. Plain unkeyed workspaces use snapshot-scoped row selections and deliberate invalidation on source replacement, including the supplied-settings restore path. Hosts needing continuity use the existing project model with trustworthy, unique typed keys and unchanged output grain. Investigate the existing mapping omissions before designing another public key input. These are proposed contract and verification decisions; this report does not declare current runtime behavior compliant.

The source basis is narrow. `initializeData` assigns positional `__ID` values. The provider's replacement effect resets data and can immediately restore the supplied saved settings. Project encoding currently visits chart-linked and Rows filters, while saved state also has workspace filters. These source facts justify exact tests, not a claim that every replacement fails. [Sources: `initializeData`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L21), [`DataLayerProvider` replacement effect](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1586-L1655), [`mapIdFilters`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L6-L28), [`SavedDataStructure`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/SavedDataStructure.ts#L24-L54).

**The strongest alternative is reset on every replacement, including projects.** It offers a simple lifecycle rule and avoids pretending untrusted keys are stable. Its cost is discarding useful project continuity already expressed by the existing reorder/removal test. Prefer the conditional project route if the bounded proof confirms it can remain trustworthy with small repairs. If it cannot, explicit reset remains an acceptable product decision, but it is an alternative contract requiring review, not a passing result against the preserved-membership oracle. [Existing test source: `projectIdentity.test.tsx`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/projectIdentity.test.tsx#L39-L107).

No named demand, frequency, adoption benefit, host usability result, or performance improvement is established. Correctness value and the potential reduction in API surface justify this bounded investigation independently of those unknowns.

## 2. Eight recommendations and candidate dispositions

“Adopt” below means adopt a research or contract decision for subsequent review. It does not mean code was changed or a release approved. These are the same eight recommendation identifiers used by the companion reports.

| Recommendation and disposition | Concrete consequence and gate |
| --- | --- |
| **SI01 — Adopt identity and no-retarget contract** | Distinguish logical source identity, physical occurrence, predicate membership, query-output identity and aggregate-group identity. A preserved selection must pass exact membership and provenance checks. Never use matching totals as the deciding proof. |
| **SI02 — Adopt plain invalidation policy; investigate restore guard** | Treat positional row filters as belonging to one source snapshot. Verify no-save reset, then unchanged supplied settings and host echo during replacement. If positional filters are restored onto unrelated occupants, investigate the smallest guard covering every affected owner. Make reset observable without assuming the existing edit callback reports it. |
| **SI03 — Adopt conditional project-key route** | Use the existing project model only with stable source identity, trustworthy typed keys and unchanged output meaning. Verify the key selected by promotion; uniqueness in one snapshot or generated row numbering alone is insufficient. Preserve the existing unique-key chart case. |
| **SI04 — Investigate bounded mapping and schema coverage repair** | Reproduce encoding, decoding and unresolved-reporting coverage for workspace filters and API-legal chart `localFilters`, alongside chart-linked and Rows filters. Include workspace-only missing-field checks. Correct a proven omission at the existing boundary before adding a second identity API. |
| **SI05 — Investigate fallback and source-reference safety** | Run frozen F01 and separately labeled supplemental F02/A01/A02. Preserve duplicate occurrences as distinct records, while refusing cross-replacement continuity from position alone. Investigate fallback parsing and delimiter-based output-key collisions; any internal key repair requires saved-state compatibility review. |
| **SI06 — Investigate lifecycle consistency** | Verify pending worker results, raw source details, saved inspection, unresolved warnings and sentinel persistence together. Preserve existing chart-trace invalidation. Choose explicit behavior for disappearing/reappearing rows before describing it as supported. |
| **SI07 — Adopt frozen proof and docs/example gate** | Keep the 12-row oracle unchanged; capture actual selected labels, physical references, saved predicates, trace targets and CSV bytes. Pair any user-visible repair with one lesson and one runnable fixture in the same milestone. |
| **SI08 — Defer new plain-key API; reject platform expansion** | A new key prop is NO-GO now. Reconsider only if a concrete useful host task cannot be served reasonably by invalidation or the existing project route and reliable keys are available. Reject universal identity/versioning/replay work under this mission. |

Documentation-only closure remains an **adopt-if-proven** disposition: retain current behavior if independent exact controls agree and the remaining gap is explanatory. It is not available if a supported path silently changes a selected record or exposes inconsistent source details. A reproduced narrow fault supports an **investigate-and-repair** disposition for that fault; it does not justify rewriting filters, queries or persistence wholesale.

## 3. Preserve useful existing behavior

The independent verifier should first establish a clean reference result for these controls:

- **Plain reset without `savedData`.** The existing provider broadly resets state on changed data. A proposed targeted invalidation policy must not be confused with the already existing broad reset.
- **Same-data host echo.** The fingerprint shortcut applies when data and field references have not changed. Preserve that case while separately testing echo during replacement; the latter follows a different branch.
- **Unique-key project selections.** Retain the chart reorder/removal behavior expressed by the existing component test. Add exact record labels and source references, since a total is only a secondary checksum.
- **Ownership.** Rows filters remain local to Rows; workspace predicates remain global; chart self-exclusion remains deliberate. Adding identity traversal must not change which consumer owns a filter.
- **Transient trace closure.** Chart trace selection already carries a revision and becomes stale when that revision changes. Treat this as a positive guard, then investigate other inspection channels separately.

These are source-grounded controls, not test passes observed in this run. [Sources: `setData`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L682-L749), [same-data echo shortcut](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1628-L1638), [`RowsView`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/RowsView.tsx#L20-L51), [`CrossfilterWrapper`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts#L134-L210), [`ChartTraceScope`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx#L108-L118).

The plain-workspace documentation explicitly treats `savedData` as a restore input, not controlled state. Its warning remains valid. Host echo should nevertheless be tested as the requested adversarial case, and the project host example has its own view-settings update pattern. Do not collapse those contracts into a blanket rule that echo either always works or is never relevant. [Sources: package README, callback/restore contract](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md#L74-L104), [project host example](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md#L510-L540).

## 4. Bounded product seams to investigate

### Existing mapping and schema checks first

Keep the first candidate repair centered on `analysisRowKeys.ts`. Its shared traversal is the natural place to compare coverage of `charts[].filters`, `rowsSettings.filters`, `workspaceFilters` and `charts[].localFilters`. Encoding, decoding and unresolved reporting must agree about the supported row-filter owners. Preserve non-ID value/range/text/date predicates, filter metadata, input immutability and owner-specific behavior. A diagnostic `__ID` filter in a type-legal local scope is useful evidence about saved-state handling; it is not evidence of an ordinary UI gesture or customer demand. [Source: complete existing adapter](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L1-L63).

Schema validation is related but distinct. `settingsFieldUsage` already visits chart `localFilters`; it omits independent workspace filters. Investigate workspace-only use of the removed `cohort` field without incorrectly reporting that all local schema checks are absent. A missing predicate field must remain an explicit invalid/unavailable condition until repaired or deliberately cleared. [Source: `settingsCompatibility.ts`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/settingsCompatibility.ts#L36-L155).

### Plain restore guard and project promotion

The plain replacement guard must consider both data-array changes and field-metadata reference changes, because the existing effect treats both as data changes. A matching saved-state fingerprint does not skip restoration when data changed. Preserve supported same-snapshot restores; do not describe settings containing positional IDs as portable to an unrelated snapshot. Under the proposed conservative plain contract, even M01's fresh identical clone invalidates row-specific selections because it creates a new snapshot boundary; that is a proposed policy, not a current guarantee or a demonstrated failure. The implementation choice—internal invalidation, explicit host sanitization, or another small guard—requires the runnable proof and compatibility review. No new callback API is selected here. [Source: provider replacement effect](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1586-L1655).

Project promotion is conditional. `sourceFromRows` can choose an ID-like field, a unique text field or generated row numbers; `singleTableProject` then uses the same selection adapter. Verify the chosen `entityKey` and its temporal meaning. Keep the proof's `logicalId` outside production key inference, and explicitly test regeneration of positional numbering as a negative control. Existing promotion reduces host setup; it does not certify stable business identity. [Sources: `sourceFromRows`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/sources.ts#L52-L119), [`singleTableProject`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/sources.ts#L203-L260).

### Fallbacks, pending results and unresolved intent

F01 remains the frozen occurrence probe. F02, a swap of two duplicate-key occurrences, and A01, a unique string key ending in `:row:9`, are supplemental hypotheses discovered afterward. Report them separately; do not retrofit the original oracle. Any repair should preserve source occurrence distinction and inspect the narrow reference resolution condition before introducing infrastructure. [Source: `sourceRowIdentities` and `resolveSourceRow`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/sourceRowIdentity.ts#L12-L69).

Supplemental **A02** tests output-key uniqueness when parent and child string keys contain delimiters. Expansion concatenates the step ID, parent key and child reference; that construction suggests an adversarial collision probe, not an observed runtime fault. Require exact distinct output keys and memberships. If reproduced, assess a narrow unambiguous internal encoding and existing saved-key compatibility; do not expand SI05 into a universal identity redesign. [Source: expansion output-key construction](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts#L404-L418).

For SI06, use a deterministic worker to hold one result while new source tables are supplied. Request-ID protection exists, but the query panel receives current tables alongside the displayed evaluation. Test stage values, selected source details and applied bindings during pending, after the current result, and after an obsolete reply. Keep this a consistency test, not a latency benchmark. Also test fixed encoded host settings versus a persisted unresolved sentinel; the decoder retains already-prefixed sentinels, so reappearance policy cannot be inferred from one path alone. [Sources: `useAnalysisEvaluation`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts#L108-L188), [query-panel inputs](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEdaProject.tsx#L328-L335), [sentinel decoding](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L41-L63).

## 5. One lesson and one runnable fixture

**Lesson:** “A selected position, a matching value and a persistent record are different promises.” Explain plain snapshot reset, conditional project continuity, and explicit unresolved state using the same 12 records. Avoid a general identity tutorial or a second R051 filter-ownership survey.

**Proposed new component:** `apps/demo/src/docs/live/SelectionIdentityExample.tsx`. This path is a proposal, not an existing file or a created asset. Import it directly into the existing developers MDX page. Provide plain and project modes in one fixture, not separate missions or a new example framework.

Use the frozen `R077-12-v1` ledger unchanged. Its frozen JSON SHA-256 is `297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15`. The point/chart selection is `{L02,L05,L10}`; Rows is `{L04,L08,L10}`; the diagnostic workspace row selection is `{L01,L10,L12}`; the semantic `cohort = keep` predicate initially matches `{L01,L02,L04,L06,L08,L10,L12}`. The complete ledger, mutation sets and interpretation are in [proof-plan.md](proof-plan.md). Keep all frozen expected sets; label additional probes separately.

The proposed fixture should:

- Offer unchanged/clone/reverse/append/delete/duplicate/missing/type-change/grain-change actions, restoring the prescribed baseline between independent mutations.
- Display intended logical labels, resolved labels, unresolved/reset status and current physical order. Distinctive measures are secondary checks, not replacements for record membership.
- Distinguish real point gestures, real value-based table filtering and manually seeded row-specific saved-filter diagnostics. Do not invent a row-checkbox workflow that has not been established.
- Show a semantic name predicate selecting both Mira records and then the appended Mira record, explaining deliberate predicate reevaluation without treating equal names as identity.
- Use the real Rows CSV export path and inspect the produced bytes. Full analysis JSON remains a separate negative control that intentionally contains all current provider input rows, regardless of selection. Inside `ExplorEdaProject`, those inputs are evaluated query outputs. Underlying project source tables belong to the separate native project serialization contract.
- Exercise source/query inspection and chart trace separately. A deliberately closed chart trace can satisfy the invalidation contract while saved source inspection needs its own resolution check.

The combined frozen `{L10}` expectation applies to the Rows/CSV consumer that receives `C ∩ W ∩ P ∩ T`. The workspace count receives `C ∩ W ∩ P`; chart rendering can exclude its own filter dimension. Add the ownership control with W disabled: global `{L02,L10}` versus Rows `{L10}`. This is a consumer clarification, not an oracle change. [Sources: `RowsView`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/RowsView.tsx#L20-L51), [`DataTable` filtering/export input](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx#L123-L158), [`DataTableToolbar.handleExport`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx#L35-L58), [full-analysis save](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1348-L1355).

### Actual example infrastructure and registration gate

The existing `LiveExampleSpec` requires a CSV path and saved settings; its renderer loads that file and mounts plain `ExplorEda`. It has no source-replacement controls or project-mode branch. Therefore merely adding `selection-identity` to `live/examples.ts` would not execute this proof. Keep the dedicated fixture small and give it explicit lifecycle checks. [Sources: `LiveExampleSpec`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/live/examples.ts#L42-L80), [`LiveExample` loader](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/live/LiveExample.tsx#L109-L132), [plain renderer](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/live/LiveExample.tsx#L211-L222).

Register the specific lifecycle test in **existing `apps/demo/e2e/pages.e2e.ts`**, which is already selected by the `pages` project. Do not rely on a new arbitrarily named E2E file: the Playwright projects match only pages, index and folder filenames. An alternative new file would require an explicit configuration change and proof it was discovered. Preserve the ordinary docs checks. Give this dedicated fixture its own selector and explicit assertions instead of marking it as a generic `data-docs-example` that the existing capture route cannot render. At intermediate/narrow widths, a compact static explanation and the frozen expected-ID summary can replace the interactive workspace; verify that fallback and overflow explicitly. This does not expand the library's desktop workspace support. [Sources: Playwright projects](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/playwright.config.ts#L43-L50), [page examples and viewport checks](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/e2e/pages.e2e.ts#L17-L96), [browser requirements](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md#L271-L280).

## 6. Destination map

The following destinations were verified at the reviewed baseline. New paths are separately labeled. Changes remain proposed.

| Existing destination | Bounded integration purpose |
| --- | --- |
| [`packages/explorEDA/README.md`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md) | Add replacement/restore contract and conditional promotion-key guidance beside the embedding and project examples. |
| [`apps/demo/src/docs/pages/developers.mdx`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/developers.mdx) | Host the single lesson and dedicated runnable fixture; preserve the savedData warning. |
| [`apps/demo/src/docs/pages/filters.mdx`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/filters.mdx) | Add a concise record-selection/value-predicate distinction and link to the lesson. |
| [`apps/demo/src/docs/pages/trace.mdx`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/trace.mdx), [`export.mdx`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/export.mdx) | Document only the verified invalidation/unresolved and selected-CSV behaviors affected by a repair; keep full-analysis semantics explicit. |
| [`apps/demo/e2e/pages.e2e.ts`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/e2e/pages.e2e.ts) | Add the explicitly registered replacement lifecycle scenario and exact export assertions. |
| [`docs/intent/current-analysis-trust/intent-brief.md`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/current-analysis-trust/intent-brief.md) | Reconcile exact membership, restore and export evidence without reopening unrelated chart work. |
| [`docs/intent/renderer-independent-replay/intent-brief.md`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/renderer-independent-replay/intent-brief.md) | Link the source-binding lesson; keep the broader architecture seed deferred. |
| [`docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md`](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md) | Record the research decision, conditional repair candidates and unresolved verification gates. |

**Proposed destinations:** the one component path above, plus these four research reports under `docs/research/selection-identity-2026-10-22/` during Codex integration. The supplied prompt and queue identify that local research collection; the four reports are not claimed to exist at the baseline. No additional intent initiative or generic example platform is needed for this decision.

## 7. Review milestones and stop gates

### Milestone A — Accept the research handoff

Codex independently verifies repository/ref identity, attachment and deliverable hashes, exact source claims, the frozen oracle and the four-report package. Preserve historical R043 evidence at its separately labeled ref; it is prior partition reasoning, not replacement test evidence. Reconcile any later integration-branch changes before applying conclusions to them. Record the supplied branch name without treating it as an existing checkout.

**Exit:** source preflight and artifact integrity accepted, or a precise smallest missing input recorded. No runtime pass may be inferred from this milestone. [The current R077 brief remains a research candidate](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md#L1-L20).

### Milestone B — Run the bounded proof

Use a complete runnable checkout. Extend the existing provider/project/source-identity test seams with the frozen matrix, isolated ownership runs, scope-correct CSV capture and deterministic worker checks. Record each case's expected and actual logical IDs, current physical IDs/references, predicates, trace status and exported labels. Capture assertions and actual command output, including failures. Keep the source-only predictions visible alongside those results rather than overwriting them.

**Exit:** either exact controls agree and documentation-only closure is justified, or a narrow observed disagreement identifies an affected path and smallest candidate repair. A same-count or same-total result cannot close a membership case. Unsupported in-place mutation remains outside the pass set. A missing runtime is a blocked verification gate, not evidence of a defect.

### Milestone C — Review a bounded repair, only if warranted

Implement only independently reproduced problems: mapping coverage, restore invalidation, source-reference parsing, unresolved diagnostics or snapshot-consistent inspection as applicable. Each change must identify the failing case it addresses and preserve the controls in section 3. Pair any changed user behavior with the relevant docs and the single runnable fixture in the same milestone, as repository rules require. A product change requires the repository's changeset process; a research-only handoff does not establish such a change. [Source: AGENTS rules for intent, checks and changesets](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md#L3-L35).

**Exit:** independent exact-membership checks pass, the example demonstrates the chosen contract, and behavior under missing/duplicate/reappearing keys is documented. If the bounded repair needs a new public identity architecture, stop and reconsider SI08 instead of expanding this mission implicitly.

### Milestone D — Integration and open review

Codex owns integration, targeted tests, the registered docs/browser exercise, one full `pnpm check`, and the open review PR. Check source-only predictions against executed logs before labeling any finding reproduced. The PR should lead with the observed problem, narrow change and resulting contract; attach evidence appropriate to visible changes under repository rules. Report unrun or blocked checks explicitly.

**Exit:** a reviewable integration with truthful verification status. This report neither performs nor claims a commit, PR, merge, deployment, browser pass or full-check pass. Larger implementation remains proposed.

## 8. Proposed validation run sheet

The commands below are **unrun**. They require a full checkout and dependencies, not the selected text snapshot. Add the R077 cases first; merely running the pre-existing tests does not execute the new matrix. Check the reviewed baseline before edits, then keep an ordinary diff of the independently reviewed changes. Run the final full check once, not concurrently across worktrees. [Repository verification commands](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md#L12-L17).

```bash
# Precondition: complete local checkout, before integration edits.
set -eu
R077_BASELINE=f4cacdde180e16ad814451a8c064e394535565d6
git remote get-url origin
git rev-parse HEAD
test "$(git rev-parse HEAD)" = "$R077_BASELINE"
git status --short
if ! git diff --quiet || ! git diff --cached --quiet; then
  printf '%s\n' "STOP: tracked worktree or index changes prevent baseline attribution."
  exit 1
fi
if test -n "$(git ls-files --others --exclude-standard)"; then
  printf '%s\n' "STOP: review and remove untracked source/test/config files before baseline verification."
  exit 1
fi

# Install the checkout's locked dependencies using its pinned pnpm version.
pnpm install --frozen-lockfile

# After adding the frozen R077 cases to these existing test seams:
pnpm --filter exploreda exec vitest run \
  src/test/providers/projectIdentity.test.tsx \
  src/test/providers/DataLayerProvider.test.tsx \
  src/test/providers/dataLayerState.test.ts \
  src/test/lib/analysis/sourceRowIdentity.test.ts \
  src/test/lib/analysis/evaluateProject.test.ts \
  src/test/lib/analysis/useAnalysisEvaluation.test.tsx \
  src/components/project/ProjectQueryPanel.test.tsx
pnpm --filter exploreda check-types

# After adding the single docs fixture and its explicitly registered scenario:
pnpm --filter demo build
pnpm --filter demo docs:verify --project=pages

# Codex integration gate: run once after the bounded changes are ready.
pnpm check
git diff --check
git status --short
```

If source drift prevents exact-baseline verification, identify and review the diff; do not silently relabel later work as this baseline. No command above creates a branch, commit or PR. Opening the review PR belongs to Codex's later integration responsibility.

## 9. Scope and completion limits

This remains one selection-identity mission. Following the supplied prompt's scope exclusions, R008/PR464, R011/PR461 and completed R043 work are not repeated. Mosaic integration belongs to PR462. R001 and R051 remain next catalogue candidates; their investigations are not bundled here. R043 contributes the distinction between identity partitions and equal values, not proof that replacements preserve records.

The research recommendation is complete when the four reports and manifest are independently reviewable. Product completion requires the later execution gates above. The smallest unresolved input is a runnable exact-baseline checkout for those checks, not another market survey or a universal identity design. Eight recommendations guide that handoff: **SI01–SI08**. Companion reports: [decision.md](decision.md), [evidence.md](evidence.md), and [proof-plan.md](proof-plan.md).
