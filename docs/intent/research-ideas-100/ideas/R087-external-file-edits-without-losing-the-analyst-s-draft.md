# R087 — External file edits without losing the analyst’s draft

- ID: R087
- Category: Local and database workflows
- Priority: 35
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst may edit a notebook in a text editor while adjusting its charts in explorEDA. The app already has an explicit rule: outside edits win, pending writes to those files are cancelled, other files are flushed, and the folder reloads. Node watching suppresses own-write echoes by content hash; browser folder access detects modified-time changes through polling. The research concerns whether displaced local work needs a recoverable copy and whether event timing preserves the intended policy, not the absence of external-file reload support.

Compare the current outside-wins rule with the same rule plus a temporary recoverable local draft. A third option is a narrow per-file conflict prompt when both sides changed since the last known content. Avoid automatic Markdown or DSL merging unless a concrete task defeats the simpler options. Node's official file-system documentation notes platform-dependent watch behavior, so event delivery should be treated as a notification to reconcile state rather than proof that every intermediate edit was seen. Browser polling has a different observation window.

The proposed experiment interleaves a queued chart edit with an editor's save-by-rename, rapid saves, deletion and recreation, and a write already in flight. Repeat with a deterministic memory adapter, Node files, and the browser folder adapter in a full checkout. Inspect final text, reload notices, own-write loops, and recoverability of the displaced draft. Acceptance requires a documented winner and no silent misdescription of the saved state. Reject automatic merging if a clear outside-wins policy and a temporary copy solve the observed workflow with fewer failure modes.

This follows runtime-modes and browser-only-site while acknowledging that both adapters and folder opening are delivered despite older brief text. API impact can stay internal to the project shell; recovery storage should remain local and bounded. Confidence is high in the opportunity because the policy and timing seams are explicit, but real editor and operating-system behavior was not tested. The investigation is useful to a solo maintainer because it can preserve user work without introducing multi-user collaboration, distributed locks, or a generalized conflict engine.

## References

- `apps/app/src/App.tsx` — `App`, `describeChange`. Supplemental baseline GitHub source explicitly gives outside edits precedence, cancels pending writes, flushes others, and reloads.
- `packages/explorEDA/src/node/projectFiles.ts` — `nodeProjectFiles`, `SETTLE_MS`. Debounces file events and suppresses content-hash echoes of its own writes.
- `packages/explorEDA/src/lib/project/directoryFiles.ts` — `directoryProjectFiles`. Uses periodic modified-time checks for the browser folder adapter.
- `packages/explorEDA/src/lib/project/files.ts` — `memoryProjectFiles`, `editOutside`. Provides an external-edit test seam.
- `docs/intent/runtime-modes/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/browser-only-site/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- [Node.js 24 file-system API](https://nodejs.org/docs/latest-v24.x/api/fs.html) — primary comparison/technical source, accessed 2026-10-20.
