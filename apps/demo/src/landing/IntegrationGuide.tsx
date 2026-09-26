import ordersExplorerSource from "./OrdersExplorer.example.tsx?raw";
import { PACKAGE_README_URL, REPO_URL } from "./links";

const installCommand = "pnpm add exploreda";

const boundaries = [
  {
    name: "data",
    meaning:
      "The rows your app supplies. Pass a new array when the rows change; in-place mutations are not observed.",
  },
  {
    name: "savedData",
    meaning:
      "Optional settings that restore charts, calculations, filters, and layout. It is read on mount or replacement, not kept in sync.",
  },
  {
    name: "onStateChange",
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

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <pre
      aria-label={label}
      className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed"
    >
      <code>{code.trimEnd()}</code>
    </pre>
  );
}

export function IntegrationGuide() {
  return (
    <section aria-labelledby="integration-heading" id="integration">
      <h2 id="integration-heading" className="text-xl font-semibold">
        Use it in your React app
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The order book is the published <code>ExplorEda</code> component. This
        site adds the page around it: routing, file import, and a reset button.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-3">
          <CodeBlock label="Install command" code={installCommand} />
          <CodeBlock label="Component example" code={ordersExplorerSource} />
          <p className="text-sm text-muted-foreground">
            Without <code>savedData</code>, this opens an empty workspace with
            summary and row views. The order book's charts come from its{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href={`${REPO_URL}/blob/main/apps/demo/src/demos/dashboardSettings.ts`}
            >
              saved settings
            </a>
            , passed as <code>savedData</code> with the{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="/explorEDA/datasets/shop-operations.csv"
            >
              example CSV
            </a>{" "}
            as <code>data</code>.
          </p>
        </div>

        <div className="min-w-0 space-y-5">
          <dl className="space-y-3 text-sm">
            {boundaries.map((item) => (
              <div key={item.name}>
                <dt className="font-mono font-medium">{item.name}</dt>
                <dd className="text-muted-foreground">{item.meaning}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-md border border-border p-4">
            <h3 className="text-sm font-semibold">Before you integrate</h3>
            <dl className="mt-2 space-y-2 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-medium">{fact.label}</dt>
                  <dd className="text-muted-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <a
              className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
              href={PACKAGE_README_URL}
            >
              Package README and API details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
