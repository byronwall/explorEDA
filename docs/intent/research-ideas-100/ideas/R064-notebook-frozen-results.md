# R064 — Explain frozen notebook results and dependent definitions

- ID: R064
- Category: Notebooks and narrative
- Priority: 10
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Notebook error recovery is already shipped. `compileNotebook` can substitute a block's last valid text, and `ExplorEdaNotebook.BlockProblems` explicitly warns that the visible results came from the last working version. Tests cover broken blocks and definitions shared across blocks. The research question is whether a reader understands which results are current when an invalid definition supplies a stand-in used elsewhere. A visually intact chart can be reassuring, but the analyst must not mistake an old formula for the newly typed expression or infer that an unaffected-looking block used the invalid draft.

Compare the existing local warning with a compact dependency-aware explanation on affected outputs. One option names the frozen definition and links back to its problem; another keeps warnings local and provides an on-demand notebook status summary. A stricter alternative would temporarily hide affected results, sacrificing continuity to reduce stale-result ambiguity. Do not assume hiding is safer or that all dependent blocks should be frozen: first inspect the compiler's actual stand-in behavior and distinguish frozen text from whether current source rows were re-evaluated.

Create a three-block notebook in a follow-up experiment: a shared calculation, a chart, and a table. Introduce an invalid edit to the calculation, then separately change source rows and repair the text. Ask participants to identify the expression and population behind each visible output at every step. Acceptance requires correct answers and a direct route to the originating diagnostic while unaffected work remains usable. Reject extra status badges if the existing warning and source editor already suffice, or if an explanation incorrectly claims that rows and expression versions were both frozen.

This is a robustness follow-up to completed notebook-analysis milestones, not a request to implement notebooks or last-valid recovery. The maintenance risk is duplicating dependency interpretation outside the compiler; any added status should derive from compile results or a small documented extension. No new execution runtime is justified. Confidence is high that the distinction deserves scrutiny, while this packet review has not demonstrated a user error or runtime defect. The investigation earns its place because an inexpensive comprehension proof can protect the credibility of analytical notebooks before more live narrative or shared-selection features depend on them.

## References

- `packages/explorEDA/src/lib/notebook/compileNotebook.ts` — `compileNotebook`, `NotebookBlockStatus`, `lastValid`. Invalid blocks may compile using previous valid text.
- `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx` — `useNotebookResult`, `BlockProblems`. The UI preserves working text and displays frozen-result warnings.
- `packages/explorEDA/src/lib/notebook/compileNotebook.test.ts` — `freezes only the broken block when others depend on it`. Dependency-aware recovery already has a focused test.
- `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.test.tsx` — `keeps a broken block's last results, frozen, when the host remembers them`. The rendered frozen state is covered by a component test.
- `docs/intent/notebook-analysis/intent-brief.md` — related intent; status and overlap are discussed above.
