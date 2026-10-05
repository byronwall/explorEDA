# Scatter lab source bundle

This is a source submission for byronwall/explorEDA, reviewed at baseline
94bfe0b325b9a19100def647e5555766a1f7eb9f. No repository was written here.

Start with docs/research/scatter-test-bed/report.md and validation.json.
Use the separately delivered scatter-test-bed.patch as the simplest way to
apply all new files and the three existing-file changes. Run git apply --check
first in the correct existing checkout; preserve unrelated edits and branch
state. Do not apply both the full patch and integration.patch.

Alternatively, the source bundle contains all new files in their exact relative
paths, with only the existing-file edits in docs/research/scatter-test-bed/integration.patch.
Inspect new destination paths before copying; do not overwrite unrelated work.

The intended route is /?view=scatter-lab. Node24, pnpm11.9.0 and the existing
workspace are required. Full install/build/Vitest/route validation is unverified.
Actual numerical and offline real-component browser evidence is included.
Screenshots under tmp/scatter-test-bed are review evidence, not commit content.
