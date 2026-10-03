import orderBookSource from "./OrderBook.example.tsx?raw";
import ordersExplorerSource from "./OrdersExplorer.example.tsx?raw";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { PACKAGE_README_URL, REPO_URL } from "./links";
import { SectionHeading } from "./SectionHeading";

const boundaries = [
  {
    direction: "Into the workspace",
    icon: ArrowDownToLine,
    items: [
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
    ],
  },
  {
    direction: "Out to your app",
    icon: ArrowUpFromLine,
    items: [
      {
        name: "onStateChange",
        role: "Callback",
        meaning:
          "Called after meaningful edits with JSON settings, never raw rows. Your app decides where to keep them; do not feed each result back into savedData.",
      },
      {
        name: "ref.current.getSettings()",
        role: "Read",
        meaning:
          "Returns the current settings whenever your app asks, starting right after mount. Use it for an initial snapshot or an on-demand save; edits still arrive through onStateChange.",
      },
    ],
  },
];

const inlineCode =
  "rounded bg-muted px-[0.3em] py-0.5 font-mono text-[0.9em] text-foreground";

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
      tabIndex={-1}
      className="scroll-mt-8 focus:outline-none"
    >
      <SectionHeading
        id="integration-heading"
        heading="Use it in your React app"
      >
        The order book is the published{" "}
        <code className={inlineCode}>ExplorEda</code> component. This site adds
        the page around it: routing, file import, and a reset button. Edits
        arrive through <code className={inlineCode}>onStateChange</code>, and{" "}
        <code className={inlineCode}>getSettings()</code> reads the current
        settings whenever your app asks.
      </SectionHeading>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <CodePanel
            files={[
              {
                name: "OrdersExplorer.tsx",
                code: ordersExplorerSource,
                note: "It reads the initial settings after mount and offers a later read on demand. onStateChange still reports edits. Without savedData, this opens summary and row views.",
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
              href="/datasets/shop-operations.csv"
            >
              example CSV
            </a>
            .
          </p>
        </div>

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/40 px-5 py-3">
              <h3 className="text-sm font-semibold">Settings in and out</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Three props and one ref method. Settings are JSON your app owns.
              </p>
            </div>
            {boundaries.map((group) => (
              <section
                key={group.direction}
                aria-label={group.direction}
                className="border-b border-border px-5 py-4 last:border-b-0"
              >
                <h4 className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <group.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {group.direction}
                </h4>
                <dl className="mt-3 grid gap-4">
                  {group.items.map((item) => (
                    <div key={item.name}>
                      <dt className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <code className="break-all font-mono text-[13px] font-semibold">
                          {item.name}
                        </code>
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {item.role}
                        </span>
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {item.meaning}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
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
