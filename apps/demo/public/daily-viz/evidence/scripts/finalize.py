#!/usr/bin/env python3
"""Finalize portable catalogue, ordered backlog, and honest handoff documents.
No publishing, scheduling, Git writes, external requests, or arbitrary execution.
"""
from __future__ import annotations
import collections,csv,hashlib,json,re,sys
from pathlib import Path
from provenance import INFO
ROOT=Path(__file__).resolve().parents[2]
BASE='ea8b52ff742f11d1fb89457acabbcd27b0bd04e7'
def dump(path,obj):
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
def main():
    cat=json.loads((ROOT/'catalog.json').read_text());ds=json.loads((ROOT/'datasets.json').read_text())
    families=list(INFO);byfamily={f:[p for p in cat if p['dataset_ids']==[f]] for f in families}
    # A deterministic round-robin by family, alternating formats within a family.
    kind_cycle=['notebook','composition','dashboard','notebook','composition','notebook','composition','notebook']
    queues={}
    for f,pieces in byfamily.items():
        pools={k:[p for p in pieces if p['kind']==k] for k in ('notebook','composition','dashboard')};queue=[]
        for k in kind_cycle:
            if pools[k]: queue.append(pools[k].pop(0))
        for pool in pools.values():queue.extend(pool)
        queues[f]=queue
    order=[]
    while any(queues.values()):
        for f in families:
            if queues[f]:order.append(queues[f].pop(0))
    improvements={'nb-ercot-signed-error','nb-co2-seasonal-centering','nb-sunspots-smoothing-cost','nb-strikes-duration-tail','nb-wine-profile-scales','cp-ercot-error-zero','cp-grunfeld-firm-shapes','cp-wine-assay-summary-grid','cp-strikes-duration-dot-rows'}
    for seq,p in enumerate(order,1):
        f=p['dataset_ids'][0];p['release_order']=seq;p['topic']=INFO[f][2]
        p['proposed_slug']=f+'-'+Path(p['entry_path']).name.removesuffix('.eda.md').removesuffix('.eda')
        if p['kind']=='composition':
            note=(ROOT/p['companion_path']).read_text();m=re.search(r'^\*\*Question\.\*\* (.+)$',note,re.M)
            if m:p['question']=m[1];p['search_intent']=m[1]
        peers=[x for x in byfamily[f] if x['id']!=p['id']]
        peers.sort(key=lambda x:(x['kind']==p['kind'],x['kind']!='notebook',x['id']))
        p['related_ids']=[x['id'] for x in peers[:3]]
        if p['id'] in improvements:p['series_id']='improve-this-visualization'
        p['release_status']='backlog-only-not-scheduled'
        p['new_dataset_disclosure']=next(d['reuse_disclosure'] for d in ds if d['id']==f)
        p['numeric_claim_policy']='Fixed-snapshot findings are linked to calculations; labels and coverage are documented in field dictionaries and prepared-table audits. No claim of automatic narrative refresh.'
        p['required_page_credit']=next(d['required_page_credit'] for d in ds if d['id']==f)
    dump('catalog.json',order)
    with (ROOT/'release-plan.csv').open('w',newline='',encoding='utf-8') as out:
        keys=['sequence','id','kind','title','topic','dataset_ids','question','entry_path','project_path','series_id','related_ids','readiness','release_status']
        w=csv.DictWriter(out,fieldnames=keys,lineterminator='\n');w.writeheader()
        for p in order:
            row={k:p.get(k,'') for k in keys};row['sequence']=p['release_order'];row['dataset_ids']=';'.join(p['dataset_ids']);row['related_ids']=';'.join(p['related_ids']);w.writerow(row)
    allids=[p['id'] for p in order]
    unrun=[{'id':'native-project-compilation','affected_ids':allids,'reason':'Authorized packet is selected source, not a runnable checkout. No installed baseline build or dependency graph is available.','required_capability':'Run the baseline built exploreda-dsl project command against all 17 folders.','status':'not-run'},
           {'id':'browser-rendering-and-interactions','affected_ids':allids,'reason':'No baseline demo/project application was running. Fixed artboards, axes, empty states, pointer/keyboard filtering and traces were not rendered or exercised.','required_capability':'Codex browser checks at 1280, 783 and 390 CSS pixels.','status':'not-run'},
           {'id':'repository-tests-and-types','affected_ids':allids,'reason':'No runnable checkout; Vitest, TypeScript, demo round-trip/coverage tests and pnpm check were not executed.','required_capability':'Baseline workspace dependencies and the commands in evidence/RUNSHEET.md.','status':'not-run'},
           {'id':'public-catalogue-integration','affected_ids':allids,'reason':'Artifacts are portable source files, not registered demo examples. Notebook library support does not establish a public catalogue route.','required_capability':'Minimal React/TypeScript catalogue and route adaptation described in report.md; owned by Codex.','status':'not-integrated'}]
    limits=[{'id':'ercot-original-acquisition','affected_ids':[p['id'] for p in byfamily['ercot']],'reason':'The supplied CSV matches the authorized SHA-256, but the packet does not give its original EIA API request or upstream acquisition timestamp.','required_capability':'Retain baseline provenance or have Codex inspect original preparation history. Do not replace the supplied series silently.','status':'disclosed-provenance-limitation'},
            {'id':'selected-text-captures','affected_ids':[p['id'] for f in ['football','tate'] for p in byfamily[f]],'reason':'Real final-score fields and museum metadata fields were transcribed from readable GitHub responses. Original whole-file SHA-256 is unavailable; selected-capture SHA-256 and upstream Git blob SHA-1 are supplied. Tate full-source row count is unknown; the delivered prefix has 60 records.','required_capability':'Optional independent re-fetch and field-by-field reconciliation at the recorded Git blob before publication.','status':'disclosed-capture-limitation'},
            {'id':'historical-unit-and-vintage-limits','affected_ids':[p['id'] for f in ['longley','wine','grunfeld','danish'] for p in byfamily[f]],'reason':'Some historical benchmark fields have only source units or source rate fractions in the inspected documentation. No undocumented monetary multiplier, assay unit, percentage conversion, or current-data claim is made.','required_capability':'Verify original statistical documentation before strengthening unit labels. Current labels deliberately retain source units.','status':'disclosed-measurement-limitation'},
            {'id':'transport-topic-gap','affected_ids':[],'reason':'No dedicated transport-data piece is delivered. A bike-sharing download failed; energy, geography, science, culture, environment, sport and everyday-life questions are covered. Transport remains a qualitative editorial gap despite meeting all numeric targets.','required_capability':'Accessible licensed transport snapshot and a distinct computed analysis.','status':'editorial-gap'},
            {'id':'independent-rendered-editorial-review','affected_ids':allids,'reason':'Files contain original questions, prepared evidence and designs, but no human or rendered editorial review is claimed. The concentration on historical benchmarks is a practical acquisition compromise.','required_capability':'Codex collection/validation plus editorial review of claims, scales, source credits and mobile readability.','status':'review-pending'}]
    blocked=[{'id':'candidate-barley','affected_ids':[],'reason':'Vega datapackage metadata explicitly lists the barley dataset license as unspecified. The repository code license cannot be applied to the measurements.','required_capability':'Dataset-specific redistribution permission or another documented basis.','source_url':'https://github.com/vega/vega-datasets/blob/main/datapackage.md#barley','status':'excluded-and-replaced-with-longley','bundled':False},
             {'id':'candidate-bike-sharing','affected_ids':[],'reason':'Direct binary data download failed in this compute environment; no rows or findings were invented.','required_capability':'Download and preserve the official UCI archive, then compute evidence.','source_url':'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset','status':'not-authored','bundled':False},
             {'id':'permission-restricted-local-candidates','affected_ids':[],'reason':'Local copper, Scotland and STAR98 dataset copyright notices require express permission; they were not treated as public-domain package assets.','required_capability':'Publisher permission or a replacement dataset with documented redistribution rights.','status':'excluded','bundled':False}]
    dump('gaps.json',{'numeric_targets':{'notebook':40,'composition':25,'dashboard':10},'delivered_counts':dict(collections.Counter(p['kind'] for p in order)),'numeric_shortfalls':{'notebook':0,'composition':0,'dashboard':0},'native_compiler_verified_entries':0,'browser_verified_entries':0,'unrun_checks':unrun,'limitations':limits,'blocked_candidates':blocked,'incomplete_artifact_files':[],'repository_changes':{'files_created':0,'commits_created':0,'pushed':False,'pr_opened':False,'deployed':False,'scheduled':False}})
    nrows=sum(d['output_row_count'] for d in ds);nnew=sum(d['existing_material_status']=='new' for d in ds)
    rows='\n'.join(f'| {d["id"]} | {d["base_output_row_count"]:,} | {len(d["output_tables"])} | {d["existing_material_status"]} |' for d in ds)
    readme=f'''# explorEDA daily visualization corpus

## Delivery status

**40 narrative notebooks, 25 compositions, and 10 dashboards are actual files in this archive.** All requested numeric targets are met. There are **17 dataset families, {nnew} conservatively new to the inspected demo, 32 prepared CSV tables, and {nrows:,} prepared rows** across different and sometimes repeated grains. Prepared rows must not be summed as independent observations.

Every notebook contains four analytical chart steps and a fifth record-table step, substantive prose, two reproducible findings and a caveat. Compositions have a native artboard plus a design companion. Dashboards have eight panels: an instruction note, six analytical/selector/metric views, and a source table. There are 35 design/investigation companions and 150 per-piece finding records. Some findings are intentionally shared with related formats; the audit reports unique calculation counts.

**All 75 entries remain pending local compiler verification.** Native DSL compilation: **0**. Browser validation: **0**. This is an authored publication backlog, not a claim that 75 pages were installed or published. No outlines are counted as completed files. No files or commits were created in the repository; no PR, push, deployment or publication schedule was created.

## Authoritative baseline

Repository: `byronwall/explorEDA` at `{BASE}`. The supplied selected source packet is authoritative, not a runnable checkout. Its 37 extracted files match the packet manifest. Relevant contracts, examples and syntax tests were inspected before authoring. Read-only GitHub access also confirmed the root and library package manifests at this baseline. See `evidence/source-inspection.json`.

The actual baseline notebook **fence parser** was executed successfully on all 40 notebooks and 240 blocks. It separates Markdown and `eda` fences; it does **not** compile the DSL. Do not confuse `evidence/validation/notebook-parser.json` with compiler or rendering proof.

## Open the corpus

Extract this archive to a directory of your choosing. Each `projects/<family>` folder is independent and includes `exploreda.eda`, local `data/*.csv`, and its analyses. An entry's `eda query=` names an explicit project query. There are no API keys, runtime Internet data dependencies, CORS assumptions or absolute dataset paths.

Use a built checkout of the named baseline, not an arbitrary newer npm release. The exact build and project-check commands are in **[evidence/RUNSHEET.md](evidence/RUNSHEET.md)**. The built viewer takes a family folder as its argument. Folder notebooks are ordinary `.eda.md` Markdown files with `eda` fences; composition/dashboard analyses are `.eda` files. Never load a notebook as a JSON notebook or concatenate its source with another family's project.

Notebook selections are local to each chart. Dashboard selections are intended to cross-filter peer charts within one query population. All written findings describe the unfiltered frozen snapshot and do not automatically change with interaction.

## Read and validate

- `catalog.json` is the stable piece inventory with questions, discovery metadata, related IDs, local paths, evidence links, readiness and release order.
- `datasets.json` records credits, licenses, retrieval/capture semantics, coverage, missingness, transformations, row counts and SHA-256 hashes. `sources.json` records what authoritative sources support.
- `evidence/raw/` preserves the real source snapshots; `evidence/fields/` documents every prepared field; `evidence/findings/` contains calculations, denominators, filters, rounding, eligible row IDs and exact input hashes.
- `release-plan.csv` is an ordered daily-release **backlog**, using sequence numbers rather than invented publication dates. `gaps.json` separates numerical shortfalls (none), blocked candidates, provenance limitations and unrun checks.
- `manifest.json` lists every archive member, size and SHA-256, except that its own SHA-256 is intentionally null. Validation reports describe exactly what ran.

Normal offline rebuilding uses only Python, pandas and NumPy, plus the bundled raw files. `prepare.py` rebuilds data and project contracts; `provenance.py` rebuilds source records; `build.py` recomputes evidence and authors the files from explicit editorial specifications; `finalize.py` restores release metadata and documentation; `validate.py` audits them. Reference acquisition scripts are separate, optional and must be reviewed before execution. No arbitrary expression evaluation or synthetic measurements are used.

Prepared floats are serialized with **12 significant digits**. All published numeric findings are computed again from those serialized CSVs. Missing values remain empty CSV cells and are never replaced with invented measurements.

## Dataset inventory

| Family | Base rows | Tables | Demo relationship |
|---|---:|---:|---|
{rows}

Three families are explicitly related to existing material: ERCOT uses the exact forecast-example bytes; fertility is a different historical World Bank indicator; UCI Wine cultivar data is different from the existing Wine Quality dataset but conservatively counts as related wine material. Other families are new relative to the supplied demo catalogue, not a claim about unseen branches.

## Known limits

Most snapshots are historical teaching or benchmark data, not current reporting. Tate is a 60-record alphabetic metadata prefix, not a representative artist sample. Football covers group-stage final scores only. The fertility table retains empty terminal years rather than pretending they are zero. Some benchmark units remain explicitly source-defined. Two real-data captures were transcribed from readable GitHub fields; the preserved selected bytes have SHA-256 hashes, while original whole-file SHA-256 is unavailable.

The corpus meets the numeric target but **does not include a dedicated transport analysis**. The full compiler, native query evaluation, demo integration, repository tests and browser checks are still Codex handoff gates. See **[report.md](report.md)** and **[gaps.json](gaps.json)** before publication.
'''
    (ROOT/'README.md').write_text(readme,encoding='utf-8')
    report=f'''# Editorial and integration report

## Outcome and interpretation of “complete”

The artifact-production target is met as authored source: 40 notebooks, 25 compositions and 10 dashboards. All 75 have physical entry files, local real data, two evidence-backed findings, source records and discovery metadata. They are not outlines or proposed chart inventories. No incomplete artifact file is included in the delivered counts. The remaining gate is executable/native validation and public-demo integration, not data or prose generation.

Readiness is deliberately `pending-local-compiler-verification` for every entry. Successful Python computation, structural checks and the real notebook fence-parser run do not establish that a renderer accepts every setting, that an artboard is legible, or that a linked selection behaves correctly. The two-level status—authored content versus native verification—must survive integration.

## Source baseline and access

The authorized repository is `byronwall/explorEDA` at `{BASE}`. The packet is selected source, not a dependency-complete checkout. Its 37 manifest hashes are verified in `evidence/source-inspection.json`. Inspection covered repository guidance; notebook/project/dashboard/composition documentation; forecast data and notebook; notebook parser/compiler/reader and tests; DSL project/composition/compile/setting/reference implementation and relevant tests; demo catalogue, coverage, saved settings and analysis loading; dataset provenance and reserve-source research; and the DSL CLI. Large implementation files were inspected in relevant sections rather than represented as a line-by-line code review.

Read-only GitHub access confirmed the baseline package manifests and supplied small real external data records. No repository write was attempted. Direct compute-environment Internet and binary downloads were unavailable, so acquisition used installed historical data snapshots with dataset-specific rights, exact authorized CSV bytes, and disclosed selected-field captures through GitHub. The optional reference acquisition scripts document those routes rather than claiming failed downloads succeeded. Original upstream retrieval dates are not inferred from local file-copy times.

`apps/demo/src/demos/coverage.test.ts` was requested in the reading route but was not in the selected packet and was not separately inspected. The applicable test command is retained as an unrun integration check; it is not listed as a read file.

## Editorial strategy

The release sequence alternates dataset families and then formats. It avoids publishing a run of near-identical plots from one benchmark. Each family has a specific observation unit: hour, weekly atmospheric reading, month, operating day, household, strike, firm-year, country-year, flower, wine assay, match, team appearance or catalogue record. A change of unit is explicit in a prepared table and query, never an implicit denominator switch.

“Different questions, same data” is used for ERCOT, CO2, ocean temperatures, fertility and football. The series does not promise fifty arbitrary views. For example, the ERCOT notebooks distinguish signed from absolute error, relative error from level, and clock patterns from coverage; the dashboard investigates individual hours while the composition explains the zero baseline. These are different reading tasks with shared source provenance.

“Improve this visualization” is an original design series, not a recreation of a protected reference layout. Its references are the baseline's supported primitives and the actual source dictionaries. The substantive changes are documented in each design companion:

| Problem in a basic view | Change and benefit | Information relinquished |
|---|---|---|
| Two high demand lines make a small miss difficult to read. | Subtract forecast from served demand and retain a constant zero guide. | The original demand level disappears; the notebook keeps the original pair. |
| A long-term CO2 rise hides the within-year pattern. | Subtract each year's available-week mean before comparing months. | Absolute atmospheric concentration and incomplete-year weighting are no longer visible in the centered panel. |
| An extreme duration compresses shorter strikes. | Use a documented logarithmic duration view and retain the original-unit table. | Equal screen distances no longer mean equal numbers of days. |
| Different firm sizes dominate a shared absolute scale. | Rebase investment to a common starting index while keeping shared axes. | Indexing hides absolute financial magnitude and can magnify small denominators. |
| Multiple chemical assays are placed on one raw ruler. | Give each assay a labeled scale and compare within that assay. | Cross-assay line height cannot be read as a common physical quantity. |

The notebooks state observations, not causal mechanisms. A boundary in the Nile series is not a causal experiment; an influential plant observation is not automatically erroneous; cultivar classification is not a wine tasting score; metadata date spans are not automatically lifespans; and group-stage performance is not a tournament-wide result. Static conclusions are accompanied by filters, eligible counts and exclusions in the evidence files.

## Data, licenses and reproducibility

Seventeen families are delivered, with fourteen conservatively new relative to the inspected catalogue. Thirty-two CSV tables contain {nrows:,} rows across multiple grains; these include derived summaries, long forms, lookups and repeated observations and must not be added as a population. The five root companion files and the manifest retain source credits so Codex can show them on the eventual page.

Every dataset has source and license URLs, a documented acquisition method, a local capture time with its meaning, coverage, missingness, units, transformations, row counts, raw SHA-256 and prepared-table SHA-256. Installed snapshots retain their package versions and dataset-specific copyright declarations. A package code license is not used to override a data license. In particular, barley was removed when the current Vega dataset metadata identified its rights as unspecified; it is not present as a ready file or a fallback fixture. Copper, Scotland and STAR98 were also excluded where their local notices required permission.

The ERCOT CSV is byte-identical to the authorized forecast sample. Its original EIA request and upstream retrieval time are not in the packet and remain a provenance limitation rather than fabricated metadata. The football and Tate snapshots are selected-field transcriptions of actual readable repository records. Their capture scripts, recorded upstream Git blob SHA-1 values and captured-byte SHA-256 values make the transformation auditable; they do not establish the SHA-256 of an unavailable original whole file. Tate's full-source count is explicitly null. An independent field-by-field reconciliation is recommended before publishing those two families.

Preparation is deterministic and offline. Floats are written with 12 significant digits, empty values remain null, and evidence calculations re-read these exact outputs. An expression record names the operation, fields, filters, denominator, numerator where applicable, rounding and contributing row IDs. Means, medians, Pearson correlations, quantiles and shares are computed, not read from chart appearance. Prepared model quantities and standardized fields are identified as offline transformations, not native DSL functions.

Grunfeld and football provide richer related tables. Their lookup keys must be unique and Python joins are audited as many-to-one, preserving the base population. A firm average repeated onto every firm-year is context, not an additive total. A team aggregate repeated onto each appearance likewise must not be summed as though it represented different teams. Native query tracing still needs to be checked in the application.

## Actual format support

The baseline's notebook reader/compiler/component is real. `parseNotebook.ts` separates prose and fenced `eda` blocks; `compileNotebook.ts` combines definitions globally while retaining file-line diagnostics; `readNotebook.ts` evaluates one named project query; `ExplorEdaNotebook.tsx` places charts inline. Notebook clicks and brushes stay local to their chart. A global filter declaration can narrow the notebook, but no invented cross-notebook selection syntax is used.

Dashboard and composition entries are plain `.eda` files. Sources, field contracts, explicit identity queries and relationships live in `exploreda.eda`. Each composition uses fully qualified source fields because the inspected composition lowering does not perform ordinary field-alias rewriting. The corpus uses eight composition mark families—path, point, band, summary, density, strip, horizon and waffle—rather than inventing named finished charts. Supplied bands represent observed ranges, not forecast uncertainty. Summary marks are unweighted. Transformations such as rebasing, anomaly calculation, ranks and standardization remain in prepared CSVs.

Native notebook support does **not**, on its own, establish a public notebook catalogue route. The inspected `apps/demo/src/demos/analyses/types.ts` contract exposes `project`, `tableFiles` and `text`; `loadAnalysis.ts` compiles dashboard views. The inspected `examples.ts` catalogue is the subset of example records marked `listed`. Neither contract establishes a Markdown-notebook catalogue branch. This is a conclusion about the inspected route and loader, not a claim to have searched every router file in a full checkout.

## Smallest demo integration

Preserve the existing React and TypeScript stack. Keep a static catalogue; do not add a CMS, scheduled publisher, framework migration or library redesign.

1. Copy family assets beneath a public corpus directory, preserving the data relationships. Add a small catalogue adapter that maps each root-relative corpus path into the existing demo asset base. Existing dashboard/composition entries should reuse `ExampleAnalysis.project`, `.tableFiles` and `.text` and the loader in `apps/demo/src/demos/analyses/loadAnalysis.ts`. Its sample compilation is not proof that every source row works; use its `sample: false` option for complete-row verification.
2. Add a discriminated notebook branch to the existing catalogue/opening flow rather than pretending a notebook is dashboard text. Reuse `readNotebookText(text, {{ project, tables, name }})` to obtain the chosen query rows, then use `ExplorEdaNotebook` with `text`, `data` and `name`. Preserve field types through the existing loader where applicable. Do not introduce a JSON notebook format. Omitting `onTextChange` prevents persisted text changes but is not itself a claim that every on-screen editor becomes read-only; confirm the desired public interaction policy in the actual host.
3. Reuse the existing examples catalogue and source-credit surfaces. Include the article title, description, reader question, related IDs and source/license links from the corpus catalogue. Register each integrated example in `apps/demo/src/demos/coverage.ts`, update expectations in `coverage.test.ts` where required, and retain the dashboard text round-trip test. Do not mark an example reviewed merely because a capability tag says it is used.

The source snapshot does not supply every public route implementation or a complete current application tree. Codex should inspect the actual routing owner before choosing a precise component filename. This report intentionally names the real inspected integration contracts without inventing an existing route, a prop or a new API.

## Capability opportunities and remaining checks

A static narrative's evidence can diverge from a live filtered chart. A small fixed-snapshot/evidence indicator or reset-to-article-population affordance would help; this corpus provides the metadata but does not invent automatic prose interpolation. Aggregated daily/monthly rows retain offline provenance; a native mark trace reaches the prepared row, not necessarily every original source observation. Keep the raw files and preparation path available rather than promising recursive tracing that was not verified.

Composition documentation notes that some value/strip/size or density extents can rescale with live filters even when position domains remain stable. Shared-scale settings and fixed axes must therefore be tested, not inferred from the design description. Check ordered repeats, missing cells, log-domain exclusions, supplied-range bands, category colors, narrow labels and zoom behavior. No rendered preview image or export comparison was produced. PNG export is the documented composition output; this delivery does not imply SVG, PDF or editable-slide support.

The numeric count floor and target have no gap. Remaining qualitative limits include the historical-benchmark emphasis, a small nonrepresentative culture prefix, incomplete original capture metadata and **no dedicated transport-data story** after the bike-sharing acquisition failed. Those are stated separately from actual blocked artifact candidates in `gaps.json`.

Run the bundled offline audit, then compile all family projects in the baseline checkout. Run notebook/composition/views tests, library type checks, demo coverage and dashboard round-trip tests, and `pnpm check`. Exercise pointer and keyboard flows at 1280, 783 and 390 CSS pixels, including clearing one filter while retaining another, empty results, null values and source tracing. Those native commands and browser checks are explicitly unrun here. Codex owns collection, validation, integration and the review PR; this production run made no repository files or commits.
'''
    (ROOT/'report.md').write_text(report,encoding='utf-8')
    runsheet='''# Rebuild and validation run sheet

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
'''
    (ROOT/'evidence/RUNSHEET.md').write_text(runsheet)
    (ROOT/'evidence/requirements.txt').write_text('numpy==2.3.5\npandas==2.2.3\n')
    print('FINALIZED',len(order),'catalog entries, release order, README, report and gaps')
if __name__=='__main__':main()
