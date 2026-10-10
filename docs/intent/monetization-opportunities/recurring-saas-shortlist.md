# Ten recurring SaaS directions

Updated October 10, 2026. Original research stays unchanged; inline links identify the limited new platform checks.

**Start by comparing GitHub Actions cost regressions with Shopify promotion leakage.** These are my first two candidates for further investigation. Neither is a selected product or a proven business.

This shortlist follows Byron's preference for recurring SaaS. It replaces the service-focused reading order, while preserving all original research. It includes four Shopify products, one related commerce product, and five developer or operations products.

I favored repeat problems, practical source access, a narrow first release, and useful investigation through explorEDA. I reduced the priority of manual data preparation, one-time fixes, and features already covered by established products. This is a new judgment, not a reuse of Pro's weighted scores. The lower five have greater integration or differentiation risks.

The recurring product pattern is **detect a new problem → explain the affected records → assign a change → check the result**. The subscription pays for that continuing process. Refreshing a dashboard alone is a weaker reason to renew.

| Priority | Product | Buyer | Reason to return | Main build burden |
| --- | --- | --- | --- | --- |
| 1 | GitHub Actions cost regression monitor | Platform lead with material paid CI spend | Workflow changes introduce new waste | Attempt history and credible cost comparisons |
| 2 | Shopify promotion policy monitor | Merchant running frequent promotions | Each campaign can introduce unwanted discounts | Simple policy setup and low-noise findings |
| 3 | Merchant Center repair workbench | Shopping agency or catalogue operator | Product and feed changes introduce new issues | Offer matching and useful repair priorities |
| 4 | Shopify returns improvement tracker | Apparel merchandising lead | New products and batches change return patterns | Reliable cohorts and evidence of improvement |
| 5 | CI flaky-test repair tracker | Test infrastructure lead | New changes introduce unreliable tests | Test identity and retained attempt evidence |
| 6 | Shopify final shipping cost monitor | Bulky-goods merchant | Surcharges and order mix change shipping losses | Final charge access and shipment matching |
| 7 | dbt failed-record explorer | Data team with repeated test failures | Every data run can introduce another failure | Safe failure-row snapshots and test semantics |
| 8 | AWS cost ownership drift monitor | Small platform or finance team | Resources and teams change each month | Billing ingestion and owner rules |
| 9 | Shopify margin change explainer | Merchant with usable cost records | Costs, refunds, and fees change contribution | Several synchronized financial sources |
| 10 | PagerDuty alert-noise improvement tracker | SRE team | Releases and alert rules create new noise | Alert lineage and proof that changes help |

The catalogue identifiers below link each revised product to its original brief. Original prices describe service experiments. They are not adopted SaaS prices.

## 1. GitHub Actions cost regression monitor

**Promise:** “Know which workflow change increased waste, give it an owner, and verify the fix.” Target teams with meaningful paid Actions usage. Charge by organization and a clear usage allowance.

**Data and integration:** Install a GitHub App on selected repositories with Actions read access. Collect runs, jobs, attempts, runner classes, and commit IDs. Backfill a bounded period and refresh completed work. Obtain actual billing separately through authorized billing access or exports. Actions read permission alone does not establish billing access. The [jobs API](https://docs.github.com/en/rest/actions/workflow-jobs) supports this operational source.

**Build around explorEDA:** Repository setup; a daily change digest; workflow baselines; rerun grouping; owner rules; a fix list; and before/after comparisons. Separate workload growth from worse cost per comparable run. Show estimated runtime cost separately from billed spend and verified savings. Start with one runner category.

**explorEDA's role:** Explore waste by workflow, attempt, runner, branch, and date. Trace a flagged group to its jobs. Reuse existing charts and saved views; calculate costs and baselines in the host.

**Main catch:** GitHub already supplies usage and performance views. The product needs better change diagnosis and follow-through. A generic CI dashboard has little distinction. [Native metrics](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/viewing-github-actions-metrics-for-your-organization). [Original O026](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o026).

## 2. Shopify promotion policy monitor

**Promise:** “Catch discounts that exceed your campaign rules while the campaign is still running.” Target stores that change promotions often. Charge per store, with an order allowance.

**Data and integration:** Use Shopify GraphQL order lines, discount applications, and actual discount allocations. Keep a dated merchant policy: allowed combinations, maximum discount, eligible products, and approved exceptions. A configured discount is not independent proof of what the merchant intended. Shopify distinguishes discount applications from the [actual allocated amount](https://shopify.dev/docs/api/admin-graphql/latest/interfaces/DiscountApplication).

**Build around explorEDA:** A small policy editor; order sync; a rule evaluator; new-exception alerts; an approval/dismissal queue; and campaign history. Start with discount caps and a few prohibited combinations. Deep-link to the source order and discount settings. Let the merchant make the correction there.

**explorEDA's role:** Compare codes, products, order sizes, and affected revenue. Inspect which orders violated a rule. No special chart is required; policy evaluation belongs in the host.

**Main catch:** Large discounts can be intentional. Findings need evidence against a declared rule. This is strongest for weekly campaigns; an occasional sale may not support a subscription. Call the measured amount excess discount, not automatically recoverable profit. [Original O003](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o003).

## 3. Merchant Center repair workbench

**Promise:** “Show the product feed problems worth fixing first, and confirm that the repairs worked.” This is adjacent to Shopify. Target Shopping agencies or merchants with large, changing catalogues. Charge per merchant account or catalogue band.

**Data and integration:** Connect Google Merchant API product issues and performance reports through authorized account access. Connect Shopify product and order summaries when available. Match offer ID, variant, market, and language explicitly. Use [Merchant API reports](https://developers.google.com/merchant/api/guides/reports/overview) for the new connector.

**Build around explorEDA:** Account setup; product matching; daily issue snapshots; grouping of repeated causes; a prioritized repair queue; source links; and checks after the next feed update. Start with one merchant account. Add an agency account switcher only after that workflow works.

**explorEDA's role:** Explore issues by category, product value, market, and issue type. Use historical sales or clicks as priority signals. Do not label them guaranteed lost revenue.

**Main catch:** Feed tools already exist, including [DataFeedWatch](https://www.datafeedwatch.com/pricing). The proposed distinction is a useful work queue and repair history. It needs to beat the customer's existing diagnostic workflow. Building a full feed editor would greatly expand the scope. [Original O023](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o023).

## 4. Shopify returns improvement tracker

**Promise:** “Find the variants driving returns, record a product change, and see whether the next cohort improves.” Target apparel brands that can supply useful reasons and product attributes. Charge per store or fulfilled-order band.

**Data and integration:** Sync fulfilled order lines, return lines, quantities, and reason data. Add one returns provider only if Shopify lacks the needed detail. Shopify's [ReturnLineItem](https://shopify.dev/docs/api/admin-graphql/latest/objects/ReturnLineItem) links to fulfilled items and exposes return reasons. Check actual coverage before adding a connector.

**Build around explorEDA:** Return-window settings; product and size mapping; mature sales cohorts; minimum-volume rules; a product problem list; change annotations; and later cohort comparisons. Store enough history to distinguish new patterns from old ones. Keep exchanges, refunds, and returned units separate.

**explorEDA's role:** Filter size, colour, supplier, batch, reason, and sale period together. Open source returns behind an unusual rate. The host computes valid denominators and comparison periods.

**Main catch:** Loop already flags unusual returns and ranks product impact. Target a specific missing workflow, such as supplier/batch investigation with change tracking, or merchants underserved by current tools. A return-rate dashboard alone is insufficient. [Loop Return Insights](https://help.loopreturns.com/en/articles/13680897). [Original O002](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o002).

## 5. CI flaky-test repair tracker

**Promise:** “Give every recurring unreliable test an evidence trail, owner, and verified recovery.” Target teams with a large suite and repeated retries. Charge per suite with a retained-execution allowance.

**Data and integration:** Add a small CI upload step for JUnit results and attempt metadata. GitHub artifact retrieval can use existing files, but expiry limits historical access. Retain commit, environment, parameter identity, attempt, and duration. Start with one test framework's output. See [artifact access](https://docs.github.com/en/rest/actions/artifacts).

**Build around explorEDA:** An uploader; stable test identities; comparable fail/pass evidence; a triage list; owner assignment; issue links; quarantine decisions; and recovery tracking. Same-commit differences are candidates, not conclusive proof of a flaky test. Environment differences still matter.

**explorEDA's role:** Explore failures by test, runner, environment, and revision. Inspect attempts behind each classification. Classification and ticket state belong in the host.

**Main catch:** Buildkite already supports this lifecycle and accepts other CI systems. A small framework-specific product needs a demonstrated convenience, cost, or investigation advantage. Merely supporting GitHub Actions is not a distinction. [Test Engine](https://buildkite.com/platform/test-engine/), [flaky-test workflow](https://buildkite.com/docs/pipelines/configure/tests/flaky-tests). [Original O027](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o027).

## 6. Shopify final shipping cost monitor

**Promise:** “Catch the products and shipping zones where final charges erase your shipping margin.” Target bulky, fragile, or low-margin products. Charge per store or shipment band.

**Data and integration:** Combine Shopify shipping collected with ShipStation shipment IDs and final carrier charges. Start with one carrier and a repeatable invoice import. Automate only after proving the final-charge source is available. Label purchases are not always final charges; [carrier adjustments](https://help.shipstation.com/hc/en-us/articles/29256492262683-ShipStation-Carrier-Adjustments) arrive later.

**Build around explorEDA:** Shipment-to-order matching; split-shipment handling; unmatched-charge checks; cost finality status; unusual surcharge alerts; and a shipping threshold worksheet. Record packaging or policy changes and compare later shipment cohorts. A threshold scenario can show historical arithmetic, but cannot predict customer conversion.

**explorEDA's role:** Compare subsidy by zone, product, parcel size, service, and order value. Trace exceptions to individual charges. Matching and financial calculations stay in the host.

**Main catch:** ShipStation already offers a [shipping cost report](https://help.shipstation.com/hc/en-us/articles/4403822818331-Analytics-Reports-Shipments). The added value must involve final adjustments, actionable patterns, and follow-up. If every invoice needs manual repair, this is a poor fit for the desired SaaS. [Original O004](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o004).

## 7. dbt failed-record explorer

**Promise:** “Explain which source records drive a recurring failed test, then verify the repair on later runs.” Target data teams already storing failed rows. Charge per project and bounded monitored-test count.

**Data and integration:** Upload matched manifest and run-results files after each run. Capture approved failure rows through an export step or a restricted warehouse connection. Snapshot them promptly: dbt replaces earlier [stored failures](https://docs.getdbt.com/reference/resource-configs/store_failures). Start with ordinary count-based tests and complete failure populations.

**Build around explorEDA:** Artifact validation; test-to-table mapping; per-run snapshots; a failing-test inbox; source ownership; repair notes; and recurrence checks. Keep custom failure calculations and truncated populations explicit. Redact unnecessary row fields before upload. Add one warehouse route first.

**explorEDA's role:** Explore failing records by source, customer segment, date, or other business attributes. Compare affected cohorts across runs. The host supplies stable, correctly scoped datasets.

**Main catch:** This has strong component fit but a narrower accessible audience. Customers must permit record access and see value beyond existing dbt or [Elementary](https://www.elementary-data.com/pricing) tooling. Failure counts alone will not support the proposed explorer. [Original O040](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o040).

## 8. AWS cost ownership drift monitor

**Promise:** “Keep new cloud spending assigned to an owner, and resolve exceptions before monthly close.” Target teams with a real recurring allocation problem. Charge per billing account group or spend band.

**Data and integration:** Read CUR 2.0 exports from a restricted S3 location, or query them through Athena. Combine account, resource, tag, and dated owner rules. Process complete export versions; appending each refresh would duplicate charges. See [AWS export delivery](https://docs.aws.amazon.com/cur/latest/userguide/dataexports-export-delivery.html).

**Build around explorEDA:** Export setup; cost-basis settings; owner rules; an unallocated-cost inbox; proposed mappings; approval history; and a close export. Keep revised billing periods consistent. Start with one AWS organization and one agreed cost basis.

**explorEDA's role:** Explore unassigned or disputed cost by service, account, tag, owner, and period. Drill into supporting rows. Aggregate large billing exports before sending a bounded investigation to the browser.

**Main catch:** [CloudZero](https://www.cloudzero.com/solutions/cost-allocation/) already sells allocation capabilities. The opportunity depends on a specific underserved buyer and simpler workflow. Broad cloud cost management would be a large, crowded product. [Original O033](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o033).

## 9. Shopify margin change explainer

**Promise:** “Explain why an order's contribution changed after refunds, fees, and final costs arrived.” Target merchants with reliable cost records. Charge per store and order band.

**Data and integration:** Sync Shopify orders, lines, refunds, and shipping collected. Add dated SKU costs, one shipping charge source, and one processor fee source. Keep different currencies separate initially. Unknown costs must remain unknown; current SKU cost is not necessarily historical cost.

**Build around explorEDA:** Cost imports; source reconciliation; exact monetary calculations; order contribution snapshots; a change-explanation view; alerts; and a correction queue. The useful recurring record is “what changed since last review, why, and who fixed it.” Keep accounting profit and the selected contribution definition distinct.

**explorEDA's role:** Investigate affected orders, products, and cost components. Trace changes to refunds or charges. No new chart type is implied. The difficult work is reliable financial data preparation.

**Main catch:** [BeProfit](https://apps.shopify.com/beprofit-profit-tracker) already covers extensive profit analytics. A narrow explanation and correction workflow must prove extra value. This ranks below the other Shopify ideas because it needs more sources before its headline metric is trustworthy. [Original O001](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o001).

## 10. PagerDuty alert-noise improvement tracker

**Promise:** “Keep noisy alert rules from returning after the team fixes them.” Target an SRE team with a regular alert review. Charge per team or monitored-service band.

**Data and integration:** Collect incidents, underlying alerts, and incident log entries through authorized PagerDuty access. Join a customer rule-to-service owner map. Prove that stable rule IDs and enough event history exist. Incident counts alone can hide grouped alerts.

**Build around explorEDA:** Daily episode reconstruction; rule fingerprints; repeated-noise detection; an owner queue; change annotations; and later comparisons. Suggest a rule or runbook change, then measure the resulting pattern. The first version need not suppress production alerts itself.

**explorEDA's role:** Compare services, rules, time periods, repeated pages, and escalation paths. Inspect the event evidence behind a noisy group. Episode definitions and change tracking belong in the host.

**Main catch:** PagerDuty already offers [alert grouping and noise reduction](https://support.pagerduty.com/main/docs/alert-grouping). The proposed value is maintaining the review and improvement process. Without better evidence or a useful workflow, the native product wins. [Original O037](sources/exploreda-monetization-research/exploreda-monetization-opportunities.md#opportunity-o037).

## What the surrounding SaaS actually contains

For any one option, start with one web application, a database, and a scheduled job. Add file storage where the selected input needs it. One connector and one customer workflow are enough for the first product.

| Shared part | Concrete work |
| --- | --- |
| Product site and account | One clear promise, demo, sign-in, workspace, plan, cancellation, and onboarding |
| Connection and refresh | Server-held credentials, bounded backfill, duplicate-safe refresh, connection status, and disconnect/deletion |
| Domain model | Stable IDs, meaningful row grain, source dates, missing-data checks, and business calculations |
| Home screen | New findings, unresolved cases, resolved cases, and last successful refresh |
| Investigation | Open a finding in a prepared explorEDA view; retain its source records and saved settings |
| Action and return visit | Explicit owner/status list, source links, a digest, and comparison after a recorded change |

**The home screen should present useful findings immediately.** explorEDA opens when the customer needs to understand one. Customers should not have to design charts before receiving value.

For Shopify, plan for public distribution and review when selling to unrelated stores. Use appropriate scopes and data access. Older order history needs additional approval beyond the default 60 days. New public apps normally use Shopify App Pricing. A separately hosted analysis screen does not remove these platform obligations. [Distribution](https://shopify.dev/docs/apps/launch/distribution/select-distribution-method), [scopes](https://shopify.dev/docs/api/usage/access-scopes), [billing](https://shopify.dev/docs/apps/launch/billing).

Start DevOps options as a standalone web app with a narrow read integration or uploader. Keep raw telemetry in its existing store when possible. Send bounded, clearly labelled results to the analysis workspace.

## What explorEDA itself needs

**No blocking new chart capability is established for these first releases.** Existing supplied datasets, project queries, presets, linked exploration, source inspection, and settings callbacks cover the investigation layer. At intake revision `b3acd0b`, I rechecked the public interfaces in [ExplorEda](../../../packages/explorEDA/src/components/ExplorEda.tsx) and [ExplorEdaProject](../../../packages/explorEDA/src/components/ExplorEdaProject.tsx). Pro reviewed a newer main revision. Selected gaps still need a current-code check before implementation.

The likely component work is small and conditional:

- A public selection/filtered-row callback could connect arbitrary chart selections to host actions. Start with an explicit host case list instead.
- An embedded Shopify workspace needs width testing. A compact preset or layout adjustment may be necessary.
- Large sources need bounded server queries and browser capacity checks. A browser worker does not provide a remote query backend.

Sync, alert scheduling, metric definitions, tenant storage, billing, and action history belong in the app. They are not missing chart features. Store view settings with the host's source snapshot or query version so a saved case remains understandable after refresh.

## The next comparison

Compare **Actions cost regressions** with **Shopify promotion leakage** first. Add **Merchant Center repair** if an agency audience is appealing. Keep the first proof narrow: one source, one finding, one customer action, and a second refresh showing fresh value.

Cutover reconciliation and scrap audits leave this shortlist because their proposed initial offers depend heavily on delivered analysis. Wholesale pricing also stays outside: bespoke contract interpretation can create ongoing service work. These ideas remain in the archive.

A useful proof should show that the next customer can connect similar data without custom coding. It should also show that later data creates value without Byron writing another report. The [next steps](likely-next-steps.md) describe that comparison. This document does not select a build or validate subscription prices.
