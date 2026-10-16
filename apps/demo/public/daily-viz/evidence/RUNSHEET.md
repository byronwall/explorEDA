# Rebuild and validation run sheet

The Python preparation/authoring programs are reference artifacts for review before execution. They use only archived inputs. Normal reproduction does not require statsmodels, scikit-learn, GitHub access or an API key. Optional acquisition scripts require their documented original packages or source context and are not part of the deterministic build.

The commands below are a **run sheet**, not a claim they all ran here. `evidence/validation/` identifies executed checks. Native checks need Codex's dependency-complete checkout of the authorized baseline.

```bash
set -euo pipefail

# Set these to the extracted corpus and Codex's authorized repository checkout.
export CORPUS="/path/to/exploreda-daily-viz-corpus"
export REPO="/path/to/explorEDA"
export PYTHONDONTWRITEBYTECODE=1

# Offline rebuild: use an environment with the pinned Python dependencies.
# A fresh environment may install them with this command when networking permits.
python -m pip install -r "$CORPUS/evidence/requirements.txt"
python "$CORPUS/evidence/scripts/prepare.py"
python "$CORPUS/evidence/scripts/provenance.py"
python "$CORPUS/evidence/scripts/build.py"
python "$CORPUS/evidence/scripts/finalize.py"

# Real baseline fence parser only; this is NOT DSL compilation.
node --experimental-strip-types "$CORPUS/evidence/scripts/check-notebook-parser.mjs" --source-root "$REPO"
python "$CORPUS/evidence/scripts/validate.py"

# Native verification: not executed in the production environment.
# Review local changes and branch state in Codex; do not silently reset a worktree.
cd "$REPO"
pnpm --filter exploreda build
for family in "$CORPUS"/projects/*; do
  node packages/explorEDA/dist/cli/exploreda-dsl.js project "$family" --json
done
pnpm --filter exploreda exec vitest run src/lib/notebook/compileNotebook.test.ts src/lib/dsl/composition.test.ts src/lib/dsl/views.test.ts
pnpm --filter exploreda check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm check

# Interactive viewer; stop it after inspecting the family.
node packages/explorEDA/dist/cli/exploreda.js "$CORPUS/projects/co2"

# After any reviewed changes, regenerate the manifest and archive.
# This archives local files only; it does not publish, commit or deploy them.
python "$CORPUS/evidence/scripts/package.py"
```

Tested computation environment: Python 3.13.5, pandas 2.2.3, NumPy 2.3.5; fence parser: Node 22.16.0. The original installed-source capture used statsmodels 0.14.6 and scikit-learn 1.8.0. Native repository commands should use the repository's pinned pnpm and runtime requirements, not assume the production environment substitutes for them. The library package manifest exposes `dist/cli/exploreda-dsl.js`; the CLI source explicitly supports `project <folder> --json` and notebook checks.

The archive's original manifest fingerprints the delivered files. Rebuilding validation reports or changing release metadata changes those fingerprints; regenerate the manifest after reviewed modifications. Browser checks are separate real-input tests, not part of the Python audit.
