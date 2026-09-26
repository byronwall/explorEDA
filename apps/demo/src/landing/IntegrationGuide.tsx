import orderBookSource from "./OrderBook.example.tsx?raw";
import ordersExplorerSource from "./OrdersExplorer.example.tsx?raw";
import { CodePanel } from "./CodePanel";
import { PACKAGE_README_URL, REPO_URL } from "./links";
import { SectionHeading } from "./SectionHeading";

const boundaries = [
  {
    name: "data",
    role: "Input",
    meaning:
      "The rows your app supplies. Pass a new array when the rows change; in-place mutations are not observed.",
  },
  {
    name: "savedData",
    role: "Restore",
    meaning:
      "Optional settings that restore charts, calculations, Rows filters, and layout. It is read on mount or replacement, not kept in sync.",
  },
  {
    name: "onStateChange",
    role: "Callback",
    meaning:
      "Called after meaningful edits with JSON settings, never raw rows. Your app decides where to keep them; do not feed each result back into savedData.",
  },
];

const facts = [
  {
    label: "Framework",
    value: "React and ReactDOM 18 or 19 as peer dependencies.",
  },
  {
    label: "Screen size",
    value:
      "Desktop viewports of 1024 CSS pixels or more. Narrow layouts are not supported.",
  },
  {
    label: "Browser",
    value:
      "A browser with DOM and Canvas 2D. The 3D scatter chart also needs WebGL.",
  },
  {
    label: "Storage",
    value:
      "None built in. Settings and full analysis exports are JSON your app stores.",
  },
];

export function IntegrationGuide() {
  return (
    <section
      aria-labelledby="integration-heading"
      id="integration"
      className="scroll-mt-8"
    >
      <SectionHeading
        id="integration-heading"
        heading="Use it in your React app"
      >
        The order book is the published <code>ExplorEda</code> component. This
        site adds the page around it: routing, file import, and a reset button.
      </SectionHeading>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <CodePanel
            files={[
              {
                name: "OrdersExplorer.tsx",
                code: ordersExplorerSource,
                note: "Without savedData, this opens a workspace with summary and row views. See OrderBook.tsx for the featured dashboard.",
              },
              {
                name: "OrderBook.tsx",
                code: orderBookSource,
                note: "The featured example: its CSV as data and its typed settings as savedData. parseCsvData and shopDashboard come from this demo app, not the package.",
              },
            ]}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Browse the{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href={`${REPO_URL}/blob/main/apps/demo/src/demos/dashboardSettings.ts`}
            >
              typed saved settings
            </a>{" "}
            or download the{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href="/explorEDA/datasets/shop-operations.csv"
            >
              example CSV
            </a>
            .
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Three props, one boundary</h3>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            {boundaries.map((item) => (
              <div key={item.name} className="py-4">
                <dt className="flex items-baseline justify-between gap-3">
                  <code className="text-sm font-semibold">{item.name}</code>
                  <span className="text-xs text-muted-foreground">
                    {item.role}
                  </span>
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.meaning}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Before you integrate</h3>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={PACKAGE_README_URL}
          >
            Package README and API details
          </a>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-b-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-card p-5">
              <dt className="text-sm font-semibold">{fact.label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
