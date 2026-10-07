#!/usr/bin/env bash
# Operator run sheet, NOT executed by the investigation.
# Usage: bash /path/to/bundle/apply-and-validate.sh /path/to/a/writable/explorEDA/clone
set -euo pipefail
bundle=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=${1:?Pass the path to a writable explorEDA clone. Keep this bundle outside the clone.}
base=593ca2e1f9210d5bc66985437afc37fcfcd8a56a
branch=codex/deterministic-rendering-data-traceability
patch="$bundle/exploreda-deterministic-rendering-data-traceability.patch"
docdir=docs/intent/deterministic-rendering-and-data-traceability
protodir=packages/explorEDA/src/components/charts/ScatterPlot
cd -- "$repo"
origin=$(git remote get-url origin)
case "$origin" in
  https://github.com/byronwall/explorEDA|https://github.com/byronwall/explorEDA.git|git@github.com:byronwall/explorEDA.git|ssh://git@github.com/byronwall/explorEDA.git) ;;
  *) printf 'NO-GO: unexpected origin: %s\n' "$origin" >&2; exit 1 ;;
esac
printf 'Clone: %s\nCurrent branch: %s\nStatus:\n' "$(pwd)" "$(git branch --show-current)"
git status --short
if [[ -n $(git status --porcelain --untracked-files=all) ]]; then
  echo 'NO-GO: preserve existing changes. Use a separate fresh clone.' >&2; exit 1
fi
command -v pnpm >/dev/null || { echo 'NO-GO: pnpm is unavailable.' >&2; exit 1; }
[[ $(pnpm --version) == 11.9.0 ]] || { echo 'NO-GO: use the repository-declared pnpm 11.9.0.' >&2; exit 1; }
git fetch origin main
actual=$(git rev-parse origin/main)
printf 'Remote base: %s\n' "$actual"
[[ "$actual" == "$base" ]] || { echo 'NO-GO: main moved; review changed source before applying the pinned analysis.' >&2; exit 1; }
if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo 'NO-GO: the required local branch already exists; do not overwrite it.' >&2; exit 1
fi
remote_branch=$(git ls-remote --heads origin "refs/heads/$branch")
[[ -z "$remote_branch" ]] || { echo 'NO-GO: the required remote branch already exists; inspect it before proceeding.' >&2; exit 1; }
# Dry run probes transport/auth; server receive hooks are only proved by the final actual push.
git push --dry-run origin "origin/main:refs/heads/$branch"
printf 'Transport dry-run passed; no remote branch was created.\n'
# Install only the locked dependencies and establish the actual baseline.
pnpm install --frozen-lockfile
pnpm check
# Verify this patch only adds the six authorized paths.
git apply --check "$patch"
git switch -c "$branch" --no-track origin/main
git apply "$patch"
pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/scatterPlan.prototype.test.ts
pnpm --filter exploreda check-types
pnpm --filter exploreda build
pnpm check
# No existing tracked file is supposed to have been edited by this new-file patch.
git diff --exit-code
# Every commit uses exactly the requested author/committer without changing repository config.
export GIT_AUTHOR_NAME='Byron Wall' GIT_AUTHOR_EMAIL='byron@byroni.us'
export GIT_COMMITTER_NAME='Byron Wall' GIT_COMMITTER_EMAIL='byron@byroni.us'
verify_identity() {
  local value
  value=$(git var GIT_AUTHOR_IDENT)
  case "$value" in 'Byron Wall <byron@byroni.us> '*) printf 'Author: %s\n' "$value";; *) echo 'NO-GO: wrong author' >&2; exit 1;; esac
  value=$(git var GIT_COMMITTER_IDENT)
  case "$value" in 'Byron Wall <byron@byroni.us> '*) printf 'Committer: %s\n' "$value";; *) echo 'NO-GO: wrong committer' >&2; exit 1;; esac
}
verify_staged_scope() {
  while IFS= read -r file; do
    case "$file" in
      "$docdir"/*|"$protodir/scatterPlan.prototype.ts"|"$protodir/scatterPlan.prototypeAdapters.ts"|"$protodir/scatterPlan.prototype.test.ts") ;;
      *) printf 'NO-GO: unauthorized staged path: %s\n' "$file" >&2; exit 1;;
    esac
  done < <(git diff --cached --name-only)
  git diff --cached --check
  git diff --cached --stat
  git diff --cached
}
git add -- "$protodir/scatterPlan.prototype.ts" "$protodir/scatterPlan.prototypeAdapters.ts" "$protodir/scatterPlan.prototype.test.ts"
verify_staged_scope
verify_identity
git commit -m 'prototype: isolate deterministic scatter planning and lineage'
prototype_commit=$(git rev-parse HEAD)
git add -- "$docdir/architecture-options.md" "$docdir/implementation-plan.md" "$docdir/prototype-findings.md"
verify_staged_scope
verify_identity
git commit -m 'docs: plan deterministic rendering and data traceability'
docs_commit=$(git rev-parse HEAD)
git status --short
[[ -z $(git status --porcelain --untracked-files=all) ]] || { echo 'NO-GO: unexpected remaining changes; inspect before pushing.' >&2; exit 1; }
[[ $(git branch --show-current) == "$branch" ]] || { echo 'NO-GO: branch changed.' >&2; exit 1; }
git push --set-upstream origin "HEAD:refs/heads/$branch"
printf 'Prototype commit: %s\nDocuments commit: %s\nPushed: https://github.com/byronwall/explorEDA/tree/%s\n' "$prototype_commit" "$docs_commit" "$branch"
