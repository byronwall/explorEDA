# R093 — Discard stale worker computation as well as stale results

- ID: R093
- Category: Measured performance
- Priority: 37
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Project evaluation already runs optionally in a worker, keeps the last completed result visible while updating, and drops responses from older requests. `useAnalysisEvaluation.test.tsx` explicitly protects that behavior. A different performance question remains: an obsolete synchronous evaluation can still occupy the worker before the latest request runs. Rapid parameter changes may therefore produce correct final state but unnecessary waiting. The protocol's simple sources/evaluate messages provide a concrete seam to measure that distinction without claiming a stale-result correctness defect.

Compare coalescing requests before evaluation with terminating and recreating a worker only when obsolete work exceeds a threshold. A third route is to preserve the current protocol if its queue cost is negligible for real projects. Include the existing optimization that sends source tables only when their reference changes; restarting can lose that advantage. Define which parameter interactions deserve immediate execution versus a short deliberate delay. Do not introduce progressive partial analytical results unless a separate task requires their additional scope semantics.

Use a project with a costly expansion and aggregate, then issue a controlled burst of parameter changes while checking an independent direct evaluation of the final input. Measure time to the latest correct result, source-clone cost, worker restarts, and visible updating state. Acceptance requires a meaningful latency improvement while the previous chart remains paired with its actual applied bindings and obsolete outputs never publish. Reject cancellation machinery if coalescing obscures useful intermediate feedback, if worker restart costs more than discarded work, or if representative queries are already fast enough.

This follows current-analysis-trust and parameterized-task-navigation at their execution boundary. It keeps the delivered last-result and stale-response protections intact. Confidence is high that the distinction is technically real, but its magnitude for explorEDA workloads is unmeasured. Public API impact may be avoidable if scheduling stays inside the hook. The maintenance burden should be judged against one repeatable parameter task, making this a useful performance candidate that can end with a clear decision to retain the current simple worker.

## References

- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts` — `useAnalysisEvaluation`, `useWorkerEvaluation`. Tracks request IDs, retains applied bindings, and sends tables when their reference changes.
- `packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts` — `AnalysisWorkerRequest`, `handleAnalysisWorkerRequest`. Processes sources and evaluate messages using the direct evaluator.
- `packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx` — `drops a slow worker result once a newer request has finished`. Already protects against accepting an obsolete response.
- `packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts` — `createAnalysisWorker`. Creates the packaged module worker.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/parameterized-task-navigation/intent-brief.md` — related intent; status reconciled against implementation in the brief.
