# Guidance for future Pro gap reviews

Pro's strongest work was careful scope separation and correction of stale claims.
Its largest shortfall was the requested browser proof. The tool report explains the limit clearly, but the run could detect it earlier.
The seven-report package is useful as an archive. Future review output should put decisions before report volume.

## Changes to the review process

1. Pin a source commit. State the application build commit separately and compare them before testing.
2. Test browser access before the full transcript pass. Load one example, select one mark, and open one trace.
3. If browser access fails, issue a clear browser NO-GO. Continue only as a labeled source review with unexecuted scenarios.
4. Preserve stable gap IDs. For each ID, state what changed, what remains, and what evidence supports the result.
5. Separate capability state, proof state, intent strength, scope, and priority. One status cannot carry all five meanings.
6. Read retirement records before ranking work. Keep waived checks waived and merged plans planned-only.
7. Rank a few user outcomes. Explain their cost of failure, reuse value, dependencies, and smallest decisive proof.
8. Verify the actual matrix declarations. Do not use a hand transcription as the only recount input.
9. Use keys and values as expected results. A screenshot can show appearance, but cannot establish contributor equality.
10. Return one short decision report and full ledgers. Generate PDF/HTML only when requested.

Use the [copy-ready prompt](../../prompts/pro-gap-analysis.md). It supplies real paths, commands, and output gates.

## Disposition of Pro's repository recommendations

| Pro recommendation | Review decision | Smallest useful action |
| --- | --- | --- |
| R1: deterministic review target | Accept the need; narrow the mechanism. | Document the production URL and local development command. Pin the build under test. Keep the development matrix gate. A public preview system is optional. |
| R2: retained revision-bound proof | Accept. | Save the next browser result with commit, fixture hash, steps, expected/observed keys, viewport, and artifact link. Use the existing PR attachment path for screenshots. |
| R3: shared generated outcome catalogue | Defer the generator. Accept stable IDs and separate states. | Maintain the reconciliation ledger and validate counts. Add a schema/generator only when repeated drift justifies it. |
| R4: freeze old audits and identify latest | Apply now. | Preserve the prior report and Pro package. Replace stale current claims and link the current report from the inventory. |
| R5: compact read-only input archive | Conditional. | Offer a pinned source/fixture archive if Pro still cannot obtain complete files. Do not create another mandatory release artifact first. |
| R6: known-answer browser fixtures | Accept for the next trust batch. | Use the small synthetic fixture and exact-key oracles. Add only checks that protect important contracts. |
| R7: performance measurements | Accept before optimization. | Measure one representative dataset and a facet/column variation. Record hardware and timings before choosing a cache, worker, or backend. |

The browser administrator policy is an environment restriction. Repository changes cannot repair it.
Do not install another browser service or weaken controls to force a pass.
Use an authorized environment or return the source review with a browser NO-GO.

## Handle each reported tool limit

| Reported limit | Future handling |
| --- | --- |
| DNS and web/archive access failures | Use authorized GitHub reads. Distinguish transport failure from application downtime. |
| Connector endpoint allowlists | Use a known run-specific artifact endpoint. Record the limitation; do not invent repository paths. |
| Truncated reads and cross-tool file IDs | Read complete response ranges. Track files and read scope. Do not call a partial read a full audit. |
| No streaming shell session | Use only supported process controls. Prefer a retained build when a checkout is unavailable. |
| All browser URLs blocked | Stop dependent interaction testing after a conclusive preflight. Preserve one failure record and continue as source-only. |
| Browser alternative absent | Report it. A suggestion or installation is not completed testing. |
| Screenshot navigation race | Capture the committed page state. Label error pages as environment evidence. |
| Production coverage route absent | Use the local development target. This is an intentional build boundary. |
| Old tmp screenshot links absent | Use retained attachments or artifacts. Keep the narrative historical; do not recreate old screenshots as proof. |
| No source maps or source snapshot in build | Treat the bundle as a deployment artifact. Obtain source separately for semantic review. |
| Toolchain differs from Node 24/pnpm 11.9 | Record the versions. Do not report a failed application check when no build was attempted. |
| Markdown/PDF converter unavailable | Use Markdown as the primary report. Document production failure separately from application testing. |
| Tool deprecation warning | Attribute it to the harness. Do not call it an application console warning. |

## Reject weak future output

Reject a complete-review claim if required files are unavailable or browser proof is missing.
Reject a runtime-defect claim without a failing contract and reproduction, or a clearly labeled source-only failure.
Reject feature completion inferred from a registry name, plan, example declaration, or one historical review.
Reject a global completion percentage across composite gaps and parked ideas.
Reject a recommendation for broad infrastructure without a current consumer or measured problem.
