# Scatter test bed

Research from [Build Scatter Plot Test Bed](https://chatgpt.com/c/6ac08186-7fb0-83ea-864e-34a7564edb4c), retrieved October 3, 2026.

Start with [the intent brief](../../intent/advanced-scatter-analysis/intent-brief.md) for goals and [the local run record](local-validation.md) for current checks.

- [Original prompt](original-prompt.txt): the full scientific scope, definitions, boundaries, and acceptance gates.
- [Pro report](report.md): method definitions, source review, results, and ranked follow-up experiments.
- [Pro validation](validation.json): recorded results from its offline environment.
- `originals/`: untouched source ZIP, full patch, and screenshot ZIP.
- `source-bundle/`: extracted source and reports. Original screenshot files are under `tmp/pro-scatter-evidence/`.
- `download-manifest.json`: downloaded file sizes and SHA-256 checksums.

The active implementation is in `apps/demo/src/scatter-lab/`. Extracted source remains a reference copy.
The downloaded patch does not apply in full to this newer checkout. Its route edit applies; the dependency was added separately.
Local repairs are recorded separately from Pro evidence. Do not treat the old report as current repository certification.

Use Node 24 and pnpm 11.9.0 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter exploreda build
pnpm --filter demo dev --host 127.0.0.1 --port 5184
```

Open `http://127.0.0.1:5184/?view=scatter-lab`. Stop the server with Ctrl+C.

The [DSL folder](../config-dsl/README.md) contains the full session transcript and the three language passes.
