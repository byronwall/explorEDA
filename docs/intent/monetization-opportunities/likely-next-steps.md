# Likely next steps

**License the package, build two demos, then test one complete customer task.** Byron prefers SaaS. The remaining choice is which buyer and repeated problem to serve, and whether to sell the component alongside.

## 0. Decide the package license

Nothing can be adopted or sold until the repository and the npm package carry a license. The [component-licensing report](component-licensing/report.md) recommends MIT for the existing `exploreda` package with a commercial superset reserved for later, and explains why deciding now, with no outside contributors, avoids the backlash that follows relicensing after adoption. Also required regardless of route: ship `THIRD_PARTY_NOTICES.md` with the package (done) and keep build tools out of runtime dependencies (done).

## 1. Build two public-data demos

Before any customer conversation, load real data into the demo and see whether a finding falls out in ten minutes. Each demo also produces screenshots for a landing page.

- **dbt or CI:** pull public GitHub Actions run and job history, or public dbt artifacts, from three to five large open-source repositories through the public API. Load them with `ExplorEdaProject` and look for a real flaky test or failing-record pattern.
- **Shopify:** use a development store with generated orders and build the first "Explore your store" screen: orders this month, by product, by discount code, with linked charts.

Then read the [shortlist](recurring-saas-shortlist.md) comparison of the dbt failed-record explorer and "Explore your store". Choose based on interest in the customer and access to realistic examples. The ranking does not establish demand. Keep the other ideas in the archive for later sessions.

## 2. Describe the first five minutes

Write one short flow: connect a source, see a finding, inspect the evidence, and record a correction. Define what the home screen shows before the user opens explorEDA. Specify why the customer should return next week.

For dbt, use one project and a few count-based tests. For the store explorer, use one store and a handful of presets. Avoid expanding into general data observability or all-store profitability.

## 3. Prove the data and the action

When an authorized sample is available, check IDs, dates, completeness, and one metric by hand. Use an existing explorEDA view to explain one finding. Compare the result with the customer's current tool.

A sample file can answer this first question. A SaaS decision also needs a credible repeatable connector. Record the exact access or source needed for automated refresh. Do not assume manual cleanup will disappear later.

## 4. Prove repeat value

Run the same process on a second period or after a recorded change. Show a fresh problem, a verified improvement, or useful confirmation that a policy still holds. Keep workload changes and missing data visible.

The key test is whether the software produces this value without Byron writing a new report. Also check whether a second customer can use the same source contract without custom coding.

Subscription pricing needs its own test. Use the buyer's repeated benefit and required support to choose a proposed plan. Pro's audit prices do not establish that plan. No outreach or sales action has occurred.

## 5. Shape one product

After selecting the buyer and task, write a small shape brief. Include one connector, useful default findings, an explorEDA investigation, and a saved action loop. Recheck the relevant current code and platform access rules.

Keep accounts, synchronization, alerts, billing, and domain calculations in the host app. Add component features only when a specific workflow needs them. Keep every source file unchanged as decisions accumulate.
