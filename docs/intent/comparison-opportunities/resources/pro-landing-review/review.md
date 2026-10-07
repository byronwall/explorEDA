# explorEDA: adversarial product and developer-experience review

## Assessment

The page currently introduces explorEDA as a place to use an analysis tool, not as a toolkit a developer can adopt. A technically sophisticated visitor is likely to leave thinking: “Interesting data explorer. Is the product this website, or something I can embed in my application?”

The current sequence—import data, reopen a saved analysis, then choose a dashboard—serves someone who already knows the product. It does not establish the library’s value before asking a newcomer to do work. [S1]

The strongest material already exists: a React workspace, linked views, saved configuration, formula inspection and preview, and documented smaller chart imports. The opportunity is to expose that material in the right order, not add more capabilities. [S2, S3]

**Review scope:** The live URL returned a client-rendered shell to the web reader. This review examined the source associated with the latest successful GitHub Pages deployment, its downloaded build, and project documentation. Browser navigation was blocked in the review environment, including local rendering. Consequently, visual layout, actual interaction behavior, loading times, and performance were not verified. This is a source-grounded product/DX/content review, not a completed live usability test. [S1, S7]

## Highest-leverage changes

| Priority | Change | Effort |
|---|---|---|
| 1 | Name the embeddable React product in the hero. | Tiny |
| 2 | Put one guided example before import and saved-state controls. | Small |
| 3 | Show the installation, component, and configuration boundary. | Small |
| 4 | Explain the workspace-level advantage over linked charts alone. | Small |
| 5 | Replace the learning dead end with a compact adoption contract. | Small |

### 1. Make the hero answer “What am I adopting?”

**Problem:** The headline, “Explore data by connecting charts and filters,” describes an activity. It does not identify the product as an installable React integration or say that the visitor can put the experience inside an existing application. The next prominent actions reinforce the impression of a standalone file-analysis app. [S1]

**Why it matters:** A developer deciding whether to spend another minute needs the product category before the feature list. Without that category, the demo can succeed as a tool while failing to sell the toolkit.

**Change:** Replace the top copy with:

> **explorEDA · React data-exploration toolkit**
>
> **Embed an interactive analysis workspace in your React app.**
>
> Give users linked charts, record-level tables, and editable calculated fields—without building the surrounding workspace from scratch.
>
> **Explore the order dashboard** · **See the React integration**

This is a proposed positioning statement based on the documented product, not a claim of universal framework support. Lead with the currently documented entry point. Explain smaller composable integrations below it. [S2, S3]

Do not make visitors decode exploratory-data-analysis terminology, infer the framework from the repository, or guess whether this is a chart library, query engine, or hosted application.

**Effort: Tiny.** This is a copy and link change.

**Expected impact:** It corrects the most consequential misunderstanding before the visitor evaluates anything else. Existing examples immediately become evidence of something the developer can use in their own product.

### 2. Demonstrate value before asking for data

**Problem:** The source orders the CSV import and full-analysis JSON form before the examples. Reopening saved state is useful for returning users, but a first-time visitor has no saved state. The strongest proof is introduced after two operational tasks. [S1]

**Why it matters:** Uploading a file requires choosing data, understanding the format, and deciding whether to trust the site. None of that is necessary to discover whether the toolkit is interesting.

**Change:** Use this reading order:

**Product promise → featured example → embedding code → reason to choose it → additional examples and import/reopen tools.**

Reuse the existing order-book dashboard as the default introductory example. Keep the larger 10,000-order dashboard and calculation workflow as deeper examples; they already exist in the example definitions. Do not build another showcase first. [S4]

Give the featured example a single explicit starting action, aligned to its actual controls:

> Select a sales channel. Watch the linked views and matching records change.

Provide an obvious reset and a nearby route to the implementation. The goal is one visible cause-and-effect interaction, not a tour of every chart setting. Verify the chosen gesture in the running application before publishing the instruction.

Keep import available as a secondary “Try your data” action. Collapse the saved-analysis JSON form or move it into the application’s open/import flow. Preserve the functionality; remove it from the first-time explanation.

Do not make “15 linked views” the only pitch. The impressive moment is the relationship between a selection and the other views, not the number of widgets.

**Effort: Small.** Reorder existing elements, feature one existing preset, and add an interaction cue. An embedded demo can come later; a direct launch button already improves the path.

**Expected impact:** The visitor sees the promised outcome without committing data or learning the application first. This addresses interest, comprehension, and trust with the same change.

### 3. Add the bridge from demo to application

**Problem:** The landing page does not expose installation or the public component API. The repository already documents a small integration, but the page makes the developer discover that separately. [S1, S2]

**Why it matters:** A good demo does not answer “How much of this must I build?” The visitor needs to distinguish product-provided behavior from demo-only code.

**Change:** Add a “Use it in your app” section immediately after the featured example. Start with the documented install command:

```sh
# Add the toolkit and its React peer dependencies.
pnpm add exploreda react react-dom
```

Then show the public component boundary with a small example adapted from the documented API:

```tsx
import { ExplorEda } from "exploreda";
import "exploreda/dist/ExplorEda.css";

const orders = [
  { channel: "Web", revenue: 120, cost: 70 },
  { channel: "Retail", revenue: 180, cost: 110 },
];

export function OrdersExplorer() {
  return (
    <ExplorEda
      data={orders}
      savedData={undefined}
    />
  );
}
```

This mounts a workspace; it does not recreate a preconfigured dashboard. Put the real example data and its typed saved configuration behind “View the complete example.” Do not advertise a ten-line dashboard while concealing the configuration required to reproduce the screenshot.

Explain the model with three concrete boundaries:

| Boundary | Meaning |
|---|---|
| `data` | The array of source records supplied by the host application. |
| `savedData` | Restorable workspace configuration, not the raw dataset. |
| `onStateChange` | Configuration snapshots the host can persist. It is not a controlled-state round trip. |

The package documentation explicitly distinguishes settings-only snapshots from full analysis bundles containing source rows. It also says durable storage remains the host’s responsibility. Put that distinction beside the example rather than behind unexplained JSON terminology. [S3]

For the first explanation, describe the data flow in ordinary language: the application supplies records; the workspace configures views and calculations; selections affect linked views; the host can retain the configuration. Put detailed filtering semantics in a linked API note.

**Effort: Small.** Most of the content already exists. The essential work is presenting one complete, reproducible path.

**Expected impact:** It turns “interesting demo” into “plausible integration” while clarifying how much control the application retains.

### 4. Differentiate the workspace, not the existence of linked filtering

**Problem:** Coordinated filtering alone is not a compelling reason for an experienced dc.js or Crossfilter user to switch. Those projects already explain and demonstrate linked interactive views. [S8, S9]

The page’s differentiation is currently unclear. That is a presentation problem, not evidence that differentiation is absent.

**Why it matters:** An incumbent user is comparing the switching cost against work the new toolkit removes. More chart types or another generic reactivity claim do not settle that comparison.

**Change:** Add a brief “Why this exists” section centered on the complete analytical interface:

> Use explorEDA when you need an exploratory workspace inside your application—not just individual charts. Configure linked views, inspect the records behind selections, define calculated fields, and restore the workspace from application-owned settings.

The strongest differentiating hypothesis is that explorEDA removes surrounding application work: configuration interfaces, formula workflows, record inspection, and restorable workspace state. That is more specific than promising better charts.

Translate the existing capabilities into consequences:

| Existing capability | Developer/user consequence to demonstrate |
|---|---|
| Formula dependencies and draft preview | Inspect how a business metric is computed and preview a change before applying it. |
| Serializable workspace settings | Configure an analysis visually, then retain that configuration in the host application. |
| Selective chart registration | Evaluate a smaller integration rather than assuming the entire workspace is mandatory. |

These capabilities are documented; their comparative advantage still needs demonstration. Do not claim competitors cannot implement them. [S3]

The smallest persuasive artifact is a short edit → preview → apply → retain-settings walkthrough using the existing calculation example. Its configuration already describes calculated fields over 10,000 synthetic orders. Explain the saved-settings handoff without implying that the library supplies durable storage. [S3, S4]

For dc.js users, explicitly separate familiar linked filtering from the workspace behavior being added. For custom-stack users, show the application code and interfaces they no longer have to assemble. Do not claim a drop-in engine replacement or performance superiority without proving it.

**Effort: Small.** Add a focused explanation and guide visitors through an existing example. New product functionality is not required for the first version.

**Expected impact:** It provides a defensible reason to evaluate a switch instead of making explorEDA look like an incremental rewrite of coordinated charts.

### 5. Give evaluators an adoption contract, not QA bookkeeping

**Problem:** The page’s learning link leads to feature coverage. That surface tracks implementation, evidence, open gaps, and review status, and its default view is an attention queue. This is useful maintenance information, but it is not a getting-started experience. [S1, S5]

Meanwhile, important integration constraints exist in the repository but are not surfaced on the landing page. [S2, S3, S6]

**Why it matters:** Technical leads and dependency skeptics need clear boundaries: supported runtime, integration surface, compatibility, persistence, package cost, stability, and permission to reuse the software. An “implemented” label does not answer those questions.

**Change:** Make the primary learning route a complete embedding example. Keep coverage public under a clearly named project-status link. Do not conceal limitations; separate user-facing limitations from unfinished review bookkeeping.

Add a compact “Before you integrate” block using facts already documented:

| Topic | Answer to surface |
|---|---|
| Framework | The package declares React/ReactDOM 18 or 19 peer support. Do not substitute a framework-agnostic claim. |
| Runtime and display | Browser workspace; desktop widths of at least 1024 CSS pixels. The 3D chart requires WebGL. |
| State and storage | Settings snapshots are separate from full analysis bundles. Durable storage is supplied by the host. |
| Integration size | Full workspace and documented smaller chart-import paths. Link a reproducible size check before making a “lightweight” claim. |
| Stability and reuse | Link the actual release, license, and API/saved-format compatibility policy. State the policy rather than implying it from a version or badge. |

The framework, runtime, persistence, and import-path details come from the package documentation and manifest; version declarations are not evidence that every configuration has been tested. [S3, S6]

Add direct repository and API/example links. Also answer whether imported data leaves the browser—but verify the data path before publishing a privacy claim.

For scale, use the existing 10,000-row, 15-view example as a named workload, not as proof of speed. A later small benchmark note should distinguish startup from warm filtering and include the fields, views, browser, hardware, and measured results. Do not extrapolate from a dependency’s benchmark. [S4]

**Effort: Small** for the compatibility block and navigation. Measuring a benchmark is a separate follow-on, not a prerequisite for rewriting the page.

**Expected impact:** Serious evaluators can identify fit and limitations quickly. Clear boundaries build more useful confidence than generic maturity claims.

## What is already working

- **There is meaningful proof to reuse.** The examples include order analysis, product activity, and a calculation-focused scenario, rather than only isolated chart types. Their descriptions also identify synthetic data where relevant. [S4]
- **The opening sentence uses concrete verbs.** It names exploration, charts, and filters. Preserve that plain language while adding the missing product category. [S1]
- **The repository has a usable mental model and integration boundary.** Shared filter state, a React component, and documented saved-state behavior provide the foundation for a clearer landing page. Promote them rather than inventing a new abstraction. [S2, S3]
- **The project exposes limitations and status honestly.** Desktop scope and feature evidence are useful foundations for trust. Preserve the honesty; improve the location and interpretation of that information. [S3, S5]

## Questions the landing page currently leaves unanswered

Some of these are answered in the repository. They remain unanswered for someone evaluating the landing page alone.

| Question | Decision it blocks |
|---|---|
| Is the primary product a complete React workspace, composable chart components, or a reusable analysis engine? | Whether it belongs in the visitor’s architecture. |
| What exact code and configuration reproduce the demonstrated dashboard? | Estimating integration effort. |
| Can application state drive filters, receive selections, and supply custom views? What is the supported extension API? | Retaining control instead of adopting an opaque UI. |
| How do filters combine? Do views exclude their own filter, and how do aggregates respond? | Predicting analytical behavior when coming from Crossfilter-style systems. |
| What is preserved in settings versus a full analysis, and what survives data or package-version changes? | Designing persistence and upgrades. |
| What happens with a representative dataset, many charts, missing values, and larger cardinalities? | Evaluating correctness and responsiveness without extrapolating from a demo. |
| What are the supported environment, dependency cost, stability policy, license, and data-handling boundary? | Approving a new dependency. |

Do not answer every question in the hero. Give each an obvious route to an answer.

## Things not worth working on yet

- **A visual rebrand or additional animation.** The major issue is what the page explains, not a demonstrated need for new decoration.
- **More chart types or a larger gallery.** Improve the first interaction and connection to source before increasing the number of examples.
- **A giant competitor matrix.** One narrow workspace-level comparison and one complete example are more useful now.
- **A comprehensive documentation platform.** Publish a reproducible starter and a compact support contract first. Expand the documentation around actual integration questions.
- **Mobile-workspace engineering or new framework adapters solely to broaden the pitch.** State the supported React/desktop entry point honestly. The landing page should remain readable on smaller screens, but dense workspace support is a separate product decision.
- **Unqualified scale, performance, or maturity claims.** A named workload and explicit limitations are better than unsupported adjectives.

## The single next move

**Rewrite the hero to identify explorEDA as an embeddable React analysis workspace.**

This is the smallest change that corrects the largest misunderstanding. The existing examples cannot sell a developer toolkit when the visitor does not know that the demonstrated experience can belong inside their own application.

Do that before adding another feature, example, or marketing section.

## Sources and verification

- S1: Deployed landing-page source: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/LandingPage.tsx
- S2: Root README: https://github.com/byronwall/explorEDA/blob/main/README.md
- S3: Package README: https://github.com/byronwall/explorEDA/blob/main/packages/explorEDA/README.md
- S4: Example definitions: https://github.com/byronwall/explorEDA/blob/main/apps/demo/src/demos/examples.ts
- S5: Feature coverage UI: https://github.com/byronwall/explorEDA/blob/main/apps/demo/src/CoverageMatrix.tsx
- S6: Package manifest: https://github.com/byronwall/explorEDA/blob/main/packages/explorEDA/package.json
- S7: Successful Pages deployment: https://github.com/byronwall/explorEDA/actions/runs/35555891368
- S8: dc.js project site: https://dc-js.github.io/dc.js/
- S9: Crossfilter project site: https://crossfilter.github.io/crossfilter/

No browser interaction or benchmark was successfully executed. The illustrative component follows the documented API but was not runtime-tested during this review. Prioritization and proposed copy are editorial recommendations, not measured conversion results.
