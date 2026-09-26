import { Button } from "@/components/ui/button";
import { ArrowRight, Filter, FunctionSquare, Save, Table2 } from "lucide-react";
import { InstallCommand } from "./CodePanel";

const capabilities = [
  { icon: Filter, label: "Linked filters across every view" },
  { icon: Table2, label: "Record tables for any selection" },
  { icon: FunctionSquare, label: "Calculated fields with previews" },
  { icon: Save, label: "Settings your app can restore" },
];

export function Hero({ onOpenFeatured }: { onOpenFeatured: () => void }) {
  return (
    <header className="relative isolate">
      <div
        aria-hidden="true"
        className="landing-hero-bg pointer-events-none absolute inset-x-0 -top-3 -z-10 h-[40rem]"
      />
      <div className="mx-auto max-w-6xl px-1 pt-14 text-center sm:pt-20">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          explorEDA · React workspace for exploratory data analysis
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Embed an interactive{" "}
          <span className="landing-gradient-text">analysis workspace</span> in
          your React app
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Give users linked charts, record-level tables, and editable calculated
          fields without building the workspace around them. Every example on
          this page runs the same component.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={onOpenFeatured}>
            Explore the order book
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#integration">See the React integration</a>
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <InstallCommand command="pnpm add exploreda" />
          <a
            href="#your-data"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            or try your own data
          </a>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl">
        <button
          type="button"
          onClick={onOpenFeatured}
          aria-label="Open the order book example"
          className="landing-shot group block w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
            <div aria-hidden="true" className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
            </div>
            <span className="mx-auto truncate rounded-md bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
              your-app.example/orders
            </span>
            <span className="hidden text-xs font-medium text-primary sm:inline">
              Open live
            </span>
          </div>
          <img
            src="/explorEDA/landing/order-book.jpg"
            alt="The order book workspace: a revenue and margin scatter plot, category and channel bar charts, delivery and order value distributions, and a regional mix, all linked."
            width={2040}
            height={1230}
            className="block h-auto w-full"
          />
        </button>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
