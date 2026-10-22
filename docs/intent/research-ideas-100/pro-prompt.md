https://github.com/byronwall/explorEDA

# Produce 100 research ideas for explorEDA

## Mission and decision
Produce exactly 100 distinct, useful research ideas for expanding, improving, or making explorEDA more robust. This is a substantial research backlog, with several paragraphs on EACH idea. It will support a personal developer's recurring research task, which runs every six hours. That task may later choose topics from this list. Do not change or operate the task now. Codex will collect your work, review it, and open a docs-only PR.

Research the product as it exists, not a generic visualization library. Treat the code as React and TypeScript. Prioritize useful analytical work, reliable behavior, clear interaction, integration, data preparation, and credible examples. Include ambitious directions and small high-value investigations. Do not fill the count with minor variants or enterprise infrastructure.

## Access and baseline
Target source commit: 9b16d78e3ed0742ed4d5858c1939fec9e758b510. The attached exploreda-research-source.zip is an authorized selected source snapshot of this exact repository and baseline. Its SOURCE-MANIFEST.json lists all included paths and hashes. It includes tracked source, tests, project rules, and selected documentation. It excludes assets, data files, dependencies, generated output, historical raw research, and local secrets. It is not a runnable checkout. Prefer this baseline for current-state claims; use connected GitHub access for additional context if available, while distinguishing newer changes.

GO: Verify repository identity and baseline from the packet manifest or GitHub. Confirm that source, tests, and intent documents are readable. Read-only access is sufficient; artifact creation is preferred. Record access limits. If only the packet is available, continue using it and state its limits.
NO-GO: Stop and report the smallest unblock action if neither source route works, the repository is wrong, files cannot be read, or a complete set of 100 substantial ideas cannot be delivered. Do not pretend to have reviewed unavailable files. If file creation fails, provide the complete content in the response. Do not truncate the report to an outline.

## Ranked reading route
1. AGENTS.md, README.md, CODING_STANDARDS.md, docs/agent-guide.md, docs/ui-defaults.md, and package.json.
2. packages/explorEDA/README.md, packages/explorEDA/package.json, packages/explorEDA/src/components/ExplorEda.tsx, packages/explorEDA/src/providers/DataLayerProvider.tsx, packages/explorEDA/src/types/ChartTypes.ts, packages/explorEDA/src/types/SavedDataStructure.ts, packages/explorEDA/src/utils/saveDataUtils.ts, packages/explorEDA/src/analysis.ts.
3. docs/application-feature-inventory.md, docs/analytical-chart-coverage.md, docs/composition-mode.md, docs/calculation-workflow.md, docs/performance-checks.md, docs/example-coverage.md.
4. Existing docs/intent/**/intent-brief.md, shape-brief.md, implementation-plan.md, and initiative-map.json. These include work already shipped and proposals. Check source before calling a proposed gap absent. Do not count a shipped feature as a new idea.
5. Discover relevant implementations and tests under packages/explorEDA/src, especially charts, composition, analysis, parsing, calculations, persistence, readers, CLI, and project/notebook flows. Inspect demo consumers under apps/demo/src/demos and docs.

## Priority questions
1. Which 100 research questions would most improve this specific product, without repeating current capabilities or prior research? Distinguish a new direction, a precise follow-up to existing intent, and a robustness investigation.
2. What concrete user problem, decision, or reliability concern motivates each question? What does the repository already provide? What uncertainty remains?
3. What alternatives should a later research run compare? What small experiment could reject a weak idea quickly? What evidence would justify implementation, deferral, or rejection?
4. How should the ideas be grouped and ranked so a six-hour research task can select an independent, useful topic? Retain breadth; do not make a rigid implementation roadmap.

## Breadth and quality
Cover multiple relevant areas: analytical methods, chart semantics, composed graphics, data quality and missingness, transformations, quantities and dates, linked selection, inspection and provenance, accessibility and interaction, large data and measured performance, import/export and persistence, embedded API, local/database workflows, notebooks and narrative, documentation and examples, testing and reproducibility. Choose categories from evidence, not a fixed quota. Avoid 100 chart-type requests. Include simplification or removal investigations when justified. Review competing products and primary technical sources where these help formulate a decision; distinguish comparison evidence from claims about explorEDA. Do not imply every idea needs external research or a new dependency.

The developer is one person. Prefer simple designs and direct data flow. No speculative multi-tenant systems, version coexistence, enterprise safeguards, or framework migration. React remains React. Use pnpm for proposed commands. No application implementation, Git mutation, PR creation, automation edits, or changes to existing documents in your environment.

## Evidence rules
Each idea must cite real repository paths and symbols or tests. Do not fabricate line numbers. Separate observed behavior, inference, and the proposed question. Check whether a related intent already exists and whether it has shipped. Say when uncertain. For external factual claims, use current primary sources, with URLs and access dates. Do not label a hypothesis a confirmed defect. State confidence in the opportunity and evidence gaps. Proposed experiments are not executed tests.

## Exact deliverables
Create a downloadable ZIP named exploreda-100-research-ideas.zip containing:
- README.md: standalone overview, taxonomy, selection guidance, top 15 ideas with rationale, existing-work overlap, access limits, and instructions for a future research task. Clearly state that these are research candidates, not approved implementation.
- ideas/R001-short-slug.md through ideas/R100-short-slug.md: exactly 100 individually usable source documents. Use stable IDs R001–R100. EACH needs at least four substantive paragraphs and 250–450 words of prose, excluding metadata and reference lists. Do not satisfy this with repetitive filler or bullet-only entries.
- ideas.json: an index with exactly 100 records. Each record needs id, title, category, path, priority (1–100, unique), research_kind (new-direction/follow-up/robustness/simplification), status (candidate), summary, research_question, why_now, repo_evidence (paths and symbols), related_intents (paths), dependencies (idea IDs), first_experiment, acceptance_evidence, rejection_signal, confidence (high/medium/low), and external_sources (URLs, possibly empty).
- sources.md: external sources and their role, plus repository source coverage and unverified claims.
- manifest.json: baseline commit, generated file list, total idea count, per-idea word and paragraph counts, and checks actually executed.
Also provide standalone download links for README.md, ideas.json, and sources.md. The archive is the authoritative complete collection.

For EACH idea document use: title and metadata (ID, category, priority, kind, status); four or more prose paragraphs covering (1) user problem and current repository evidence, (2) research question and at least two viable alternatives, (3) first experiment, acceptance evidence, and explicit rejection signal, (4) cost, API/maintenance impact, related intent, uncertainty, and why the investigation earns its place. Add a references section with exact repository paths/symbols and external links when used. Supply enough context to paste that single idea into a later Pro prompt. Prefer plain technical language, short sentences, and short paragraphs.

Quality gates: verify exactly 100 unique IDs and priorities; every index path exists; all idea documents meet the paragraph and word minimums; no duplicate questions; no shipped feature is misreported as absent; dependency IDs resolve; source paths exist in the packet or are explicitly identified as external to it. Review overlap across the whole set and revise weak duplicates. If a gate fails, repair it before final delivery. Do not output scripts as a substitute for the report.

Final response: link every downloadable artifact. Summarize access status, inspected source areas, exact counts, executed artifact checks, unrun product checks, and material limits. Codex owns local reconciliation, validation, commits, and the review PR. Be candid about uncertainty.
