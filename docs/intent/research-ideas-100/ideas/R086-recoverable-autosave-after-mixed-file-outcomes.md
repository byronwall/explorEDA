# R086 — Recoverable autosave after mixed file outcomes

- ID: R086
- Category: Local and database workflows
- Priority: 6
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A local project edit can affect shared definitions and an analysis file together. The Node adapter already writes each file through a temporary sibling and rename, so partial-file contents are addressed. `FolderSaver`, inspected through GitHub at the exact baseline, debounces edits and flushes waiting files concurrently while reporting one save state. Its tests cover a single refused write. The unresolved question is how users recover when one related write succeeds and another fails, especially when completion order changes the final status.

Compare retaining failed text and status separately for each path with adding a coordinated save operation only for edits proven to require it. A simpler retry panel may be enough; a journal or transaction protocol should not be assumed. Define what Saved means when a previous attempt failed but another file later completes. Also distinguish waiting work from writes already in progress, and decide whether retry should reuse the failed text or the latest queued edit. Those choices affect recovery more directly than generic storage abstraction.

Use `memoryProjectFiles` and a controllable adapter to queue two related files. Refuse one write, complete the other before and after that refusal, then retry, edit again, and reload. Compare the files with the last intended project state and record every reported status. Accept a design when failed text remains recoverable, the affected path stays visible, and success is reported only for work actually persisted. Reject coordinated transactions if per-file tracking and explicit retry preserve all demonstrated edits more simply; reject any retry that overwrites a newer external change.

The likely first outcome is a small state-machine clarification rather than a new persistence system. This extends the shipped local workflow under runtime-modes and the reliability concerns of current-analysis-trust. Confidence is high from the concrete concurrent-save seam, but no mixed-outcome failure has been executed here. Supplemental app files are identified separately from the packet. The investigation earns an early slot because truthful save status protects ordinary analytical work and can be tested with a few deterministic event sequences.

## References

- `apps/app/src/saver.ts` — `FolderSaver`, `flush`, `queue`. Supplemental baseline GitHub source; tracks pending writes and publishes saved/saving/failed states.
- `apps/app/src/saver.test.ts` — `reports a refused save with its file`. Supplemental baseline GitHub source; already tests a single refused save.
- `packages/explorEDA/src/node/projectFiles.ts` — `nodeProjectFiles`. Writes beside the target and renames to avoid partial-file reads.
- `packages/explorEDA/src/lib/project/files.ts` — `memoryProjectFiles`. Offers deterministic refused writes for a small failure experiment.
- `docs/intent/runtime-modes/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
