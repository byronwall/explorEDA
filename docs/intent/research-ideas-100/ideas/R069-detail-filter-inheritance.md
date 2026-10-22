# R069 — Choose explicit inheritance for overview-to-detail navigation

- ID: R069
- Category: Selection and analytical scope
- Priority: 55
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An overview filtered to September and a selected store can lead to several valid detail analyses, depending on whether September should carry over. Parameterized-task-navigation preserves this unresolved policy. The baseline has progressed beyond a simple tab model: `AnalysisParameter`, `AnalysisView.bindings`, `ExplorEdaProject.onOpenView`, and visible applied bindings already exist. `SavedViewsWorkspace` switches and duplicates saved views. The research task is therefore a specific author-defined navigation rule between existing views, not adding parameters, tabs, or query inspection as if those foundations were absent.

Compare destination-owned filters with explicit inheritance of a declared subset of origin context. Destination ownership makes a reusable detail view predictable; inheritance preserves the user's current question but can conceal restrictions if the transferred scope is not visible. A third alternative asks once when the connection is authored, then uses that declared rule every time. Also compare reusing one destination tab with opening a duplicate, but treat this as a consequence of the inheritance contract rather than a separate project-management feature.

Start with two saved views over one source, a store parameter, an origin month filter, and a destination exclusion for canceled orders. Walk through selecting one store, opening detail, changing the month, returning to overview, and opening a second store. Acceptance requires exact expected records at every step, visible parameter context, and preservation of the original overview. Reject an automatic copy-all policy if destination restrictions become contradictory or unexplained. Reject a per-click decision dialog if a connection-level setting produces the same understanding with less interruption.

This is a direct follow-up to parameterized-task-navigation, reconciled against the newer project parameter and view-opening APIs. It should not reopen tab persistence or require a general routing framework. A small connection descriptor may be enough, but the study must settle precedence, missing parameters, and destination reuse before proposing public API changes. Confidence is high that the policy remains useful and unresolved in the intent; the frequency of real overview-to-detail tasks remains unmeasured. The candidate earns its place because a short semantic walkthrough can prevent confusing navigation defaults from becoming difficult-to-change saved behavior.

## References

- `packages/explorEDA/src/types/AnalysisProject.ts` — `AnalysisParameter`, `AnalysisView`, `FilterStep`. Typed parameters and per-view bindings are already modeled.
- `packages/explorEDA/src/components/ExplorEdaProject.tsx` — `ExplorEdaProjectProps`, `onOpenView`, `ProjectScope`. Views can open through the host and applied bindings are displayed.
- `apps/demo/src/SavedViewsWorkspace.tsx` — `changeActive`, `createView`. Switching and duplicating saved views already exist.
- `apps/demo/src/SavedViewTabs.tsx` — `SavedViewTabs`. The existing tab surface provides selection and focus handling.
- `docs/intent/parameterized-task-navigation/intent-brief.md` — related intent; status and overlap are discussed above.
