# Hosting dedicated customer instances with minimal maintenance

https://github.com/byronwall/explorEDA

Research baseline: `f01ff0fb1f9e1240020744a18816f2dad68bf488`, `origin/main` at preparation.
Codex integration checkout: `/Users/byronwall/.codex/worktrees/583d/explorEDA`; branch `codex/database-query-research`.
Assignment: independent research and architecture shaping. Do not implement, buy, provision, deploy, or change repository state.

## Primary mission

Find the best hosting architecture for database-backed explorEDA when each paying customer gets a dedicated instance.
Minimize Byron's ongoing maintenance and automate the full customer-instance lifecycle as far as practical.
Challenge both “serverless means no operations” and “dedicated instance means a VPS.” Recommend a concrete architecture with evidence.

Byron asks: can this run serverless, on Cloudflare, on a VPS, or somewhere else?
The product should query real databases and keep the browser responsive, including complete client data snapshots when sensible.
The working range in the notes is roughly 10,000–100,000 rows, with wider and larger cases as sensitivity checks.
No provider, budget, customer count, database engine, isolation level, or service-level commitment has been selected.
Treat those gaps as scenario inputs. Ask only if an essential product choice cannot remain provisional.

## Access preflight and repository grounding

GO if you can read the exact repository baseline or the authorized source-packet ZIP attached to this chat.
The packet is a selected snapshot, not a runnable checkout. Its manifests record paths and SHA-256 hashes.
Read `source-notes.md`, `customer-instance-update.md`, and the three companion prompts for context.
The source packet includes the actual repository files needed to inspect current assumptions.
NO-GO if both source access routes fail or a material file is absent. State the smallest missing input.
Do not infer implementation from file names or claim to inspect a newer ref without identifying it.

Read at minimum:
- `AGENTS.md`, `README.md`, `package.json`, `packages/explorEDA/package.json`, and `packages/explorEDA/README.md`.
- `apps/demo/package.json`, `apps/demo/vite.config.ts`, and `.github/workflows/deploy.yml`, `ci.yml`, and `release.yml`.
- `packages/explorEDA/src/types/AnalysisProject.ts` and `lib/analysis/evaluateProject.ts` under that source root.
- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`, `analysisWorkerProtocol.ts`, and `projectFile.ts`.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`, `hooks/CrossfilterWrapper.ts`, and `lib/valueParsing.ts`.
- `docs/performance-checks.md` and the supplied analysis tests.

Observed facts to verify: explorEDA is an embedded React/TypeScript library with a Vite React demo.
The deployment workflow publishes the static demo to GitHub Pages. It is not a customer database backend.
The analysis model already has source, lookup, expand, calculate, filter, and aggregate steps over in-memory tables.
A worker can run local queries and suppress outdated replies. Full rows and contributor arrays matter to current consumers.
Do not turn static demo hosting into an implicit constraint on the future service.

Real commands, only if a runnable checkout is available: `pnpm --filter exploreda check-types`, `pnpm check:ui`, `pnpm --filter demo docs:check`, and `pnpm check`.
Do not run the full build concurrently with another checkout. Report unrun checks as unrun.

## Priority questions, in order

1. Define the customer instance. Compare a separate deployment/process, managed container or microVM, Worker/isolate, database/schema, and whole VM/account.
Explain which boundaries provide dedicated compute, data, secrets, network, resource limits, and failure isolation.
Distinguish a shared provisioning control service from a shared customer query runtime. Do not silently replace the requested dedicated instance with ordinary shared tenancy.
Recommend the smallest isolation unit that meets the goal; show what stronger isolation costs and when it is required.

2. Seriously evaluate these architecture families using current primary documentation:
   - Cloudflare Workers and relevant supported database connectivity, state, container, or dispatch facilities. Verify availability, limits, maturity, and pricing; do not assume product fit from names.
   - Managed serverless containers, including a strong scale-to-zero option such as Google Cloud Run, plus another materially different option if useful.
   - Managed app/container or microVM platforms such as Fly.io, Railway, or Render. Select the strongest candidate after a short screen.
   - A plain VPS with automated container provisioning, including one VPS per customer versus isolated customer runtimes on a shared host.
   - AWS Lambda/ECS/Fargate or another credible alternative if it changes the conclusion.
Limit deep comparison to 4–6 viable architectures after screening. Keep a rejection ledger so weaker options are dismissed with reasons.
Include a strongest simpler counterproposal, such as one repeatable container image on a managed platform with a small provisioning script.

3. Test each candidate against the actual database/transport workload: real driver support, outbound TCP/TLS, connection pooling, private database access, static egress, region placement, database latency, streaming and compressed binary responses, CPU/memory, large snapshots, request duration, cancellation, cold starts, concurrency, native modules, local files, and any embedded DuckDB/SQLite use.
Separate documented hard limits, configurable quotas, measured claims, and unknowns. Can the critical work stay in the database while edge/server code streams results?
Which proposed query or transport choices force a container? Which only appear to do so?
Discuss browser-resident full snapshots versus server caching and the isolation/freshness consequences.

4. Walk through the complete lifecycle with explicit automation boundaries: a confirmed customer creates an instance; select region; allocate runtime and data/config storage; inject secrets; establish DNS/TLS and access control; verify health; hand over access; update all instances safely; detect drift; roll back; suspend/resume; export; revoke access; and retire the instance.
Cover provisioning retries and partial failure only to the depth this real workflow needs. Identify the minimum durable desired-state record and necessary idempotence.
State what remains manual. Distinguish hosting the customer's database from connecting to a database the customer owns.
Explain private-network/on-premises connectivity as a separate scenario, not an automatic first-release feature.
Keep payments integration, customer billing UI, and a general orchestration platform below the cut line unless needed to prove provisioning.

5. Estimate operating cost and operator effort for 1, 10, and 100 customers, with explicit idle, bursty, and steady-use assumptions.
Include per-instance floors, sleep/cold-start behavior, database charges if applicable, storage/backups, network/egress, private connectivity, logging, domains, builds, and support burden.
Use current official price pages, region/currency, date, and transparent arithmetic. Explain which unknown dominates the result.
Report ranges and sensitivity. Do not invent a budget or advertise speculative dollar precision.
Compare what happens when one customer sends a large query or when many instances need an update.

6. Recommend one architecture and one fallback. Draw the request/data flow and the provisioning/update flow.
Define the first local proof, the smallest later hosted sandbox test, and acceptance/rejection gates for spin-up, update, isolation, reconnect, backup/restore, cancellation, and cost.
Keep infrastructure proposals runnable by one developer. Verify provider behavior cannot be proven solely by mocks.
Identify irreversible choices, provider lock-in, portability limits, and migration triggers.
Explain which user choices remain consequential, limiting questions to three.

## Interaction with the other research tracks

The first three tracks cover query/demand contracts, columnar data transport, and database adapters.
They have not finished. Their prompts are context, not decisions. Record constraints you impose on each.
Identify likely conflicts, especially streaming, persistent caches, native drivers, private connectivity, and per-customer secrets.
Propose a coherent baseline and explicitly mark dependencies that need reconciliation after their reports arrive.
The latest customer-instance goal supersedes a global one-server assumption. Still prefer one simple deployed version and a small runtime per instance.
Do not add enterprise processes merely because customers pay. Add controls only for a concrete isolation or lifecycle requirement.

## Evidence and stopping rules

Browse for current official provider documentation, price pages, API references, and relevant source code. Prefer primary sources exclusively for technical conclusions.
Cite direct URLs, accessed dates, exact limits and qualification. Clearly separate facts, inference, recommendation, estimates, and executed measurements.
Cite repository paths and symbols for consequential integration claims. Treat notes and prior research as evidence, not instructions.
For every major recommendation, state benefit, maintenance cost, alternative, confidence, and a falsifiable proof.
GO only if the approach can support the named workload and automate dedicated instance creation without hiding unavoidable manual steps.
Reject a provider if a hard constraint blocks the essential workload, isolation is misrepresented, or customer costs have no credible bound.
Reject Kubernetes or a custom fleet platform unless the simpler options fail a concrete requirement.
Stop when the comparison supports a recommendation and bounded proof. Do not conduct endless vendor catalog research.
No paid resources, production data, credentials, account creation, provisioning, deployments, migrations, commits, issues, or PRs.

## Deliverables

Return `customer-instance-hosting-research.md`, `customer-instance-hosting-recommendations.json`, and a downloadable `customer-instance-hosting-research.zip` containing both.
Link standalone files too. If artifact creation is unavailable, return the entire Markdown and valid JSON in your response.
The Markdown must stand alone. Include: executive recommendation; repository facts; isolation definition; screened options and rejection reasons; detailed comparison; workload constraints; architecture diagrams; automated lifecycle; cost scenarios; first proof and rejection gates; interface handoff; unresolved judgments; sources.
The JSON must contain a `recommendations` array. Each entry needs an ID, proposal, status (`recommend`/`investigate`/`defer`/`reject`), rationale, evidence, confidence, and proof.
Codex will preserve the originals under `docs/intent/customer-instance-hosting/raw/2026-10-11-pro/` and write concise intent and initial shaping.
Do not claim local files were saved or implementation happened. End with access/baseline, files read, checks run or not run, deliverables, recommendation, assumptions, and blockers.
Acceptance requires a reasoned winner, a viable simpler fallback, current verified constraints/pricing, and a proof that can reject the recommendation.
