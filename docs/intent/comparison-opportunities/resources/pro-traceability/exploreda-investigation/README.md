# explorEDA — deterministic rendering and data traceability investigation

**Status: PARTIAL. Repository mutation: NO-GO in the investigation runtime.**

Repository inspected: `byronwall/explorEDA`, `main` at
`593ca2e1f9210d5bc66985437afc37fcfcd8a56a`.
No clone, branch, commit, push or pull request was created. The GitHub connector permitted source reads; local Git could not resolve github.com, and pnpm was unavailable.

## Read the deliverables

- [Architecture options](deliverables/docs/intent/deterministic-rendering-and-data-traceability/architecture-options.md): current behavior, scored alternatives and bounded decision.
- [Implementation plan](deliverables/docs/intent/deterministic-rendering-and-data-traceability/implementation-plan.md): contracts, Crossfilter populations, lineage, determinism, eight phases, all eleven chart dispositions and eighteen backlog tasks.
- [Prototype findings](deliverables/docs/intent/deterministic-rendering-and-data-traceability/prototype-findings.md): actual checks, measurements, limitations and implementation gates.

The recommended architecture is chart-specific pure planners with a shared, small plan/trace envelope. Keep Crossfilter outside planning, preserve its distinct ID populations, and start with a scatter slice. The patch is an investigation and internal experiment, not a completed chart migration.

## Patch and source

`exploreda-deterministic-rendering-data-traceability.patch` adds exactly six files: the three requested Markdown documents and three experimental modules/tests under `packages/explorEDA/src/components/charts/ScatterPlot/`. The complete source tree is under `deliverables/`. No dependency, public export, release or saved-data file is changed.

The source includes a non-React planner, an SVG/recording adapter and four repository Vitest cases. The repository suite was **not run**. Local verification independently exercised twelve standalone assertion groups using the two compiled pure modules; it does not replace the integrated Vitest test.

## Verification evidence

`verification/results.json` records the isolated test groups and benchmark. `verification/probe-input.json` uses an explicit `$undefined` tag for missing input values; `probe-plan.json` and `probe.svg` are executed outputs. `probe-render.png` and `svg-validation.json` record the minimal SVG adapter rendered in Chromium with networking blocked. Command/access evidence is under `evidence/`.

Benchmark caveat: 10,000 generated rows adapted from the pinned shop generator; two calculated columns evaluated directly. This is not the actual CSV import, CalculationManager or fourteen-panel calculated-orders workflow. Serialized bytes are not heap usage. Repeated timings vary by machine.

The patch was applied and byte-checked only in a clean scratch directory without a Git repository. This verifies patch syntax/content, not actual target compilation or a successful commit/push.

## Run sheet for an authenticated environment

Keep this extracted bundle outside the repository so that it does not become an untracked working-tree change. Use the actual paths on the target machine. The guarded script stops on a wrong repo, dirty checkout, moved base, existing requested branch, missing/wrong pnpm or any check failure. It prints staged diffs and verifies both commit identities. It does not discard changes, push main, or create a PR.

```sh
# Clone into a fresh writable location. This command was NOT run successfully by the investigation.
git clone https://github.com/byronwall/explorEDA.git /path/to/explorEDA

# Review the patch and run sheet before applying. The script performs repository validation,
# then makes separate prototype/document commits and pushes only the named work branch.
less /path/to/bundle/exploreda-deterministic-rendering-data-traceability.patch
less /path/to/bundle/apply-and-validate.sh
bash /path/to/bundle/apply-and-validate.sh /path/to/explorEDA

# Optional: repeat only the isolated Node probe from this bundle. This is NOT pnpm/Vitest.
cd /path/to/bundle
node verification/run-probe.cjs
```

A subsequent operator should append its actual integrated results and pushed commit IDs to the findings document rather than leaving the original access limitation as the only delivery record. The investigation's historical statements must not be rewritten as if those checks had run here.
