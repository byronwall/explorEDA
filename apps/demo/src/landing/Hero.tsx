import { Button } from "@/components/ui/button";
import { ArrowRight, Filter, FunctionSquare, Save, Table2 } from "lucide-react";
import { InstallCommand } from "./CodePanel";
import { REPO_URL } from "./links";
import { LiveOrderBook } from "./LiveOrderBook";

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

const capabilities = [
  { icon: Filter, label: "Linked filters across every view" },
  { icon: Table2, label: "Record tables for any selection" },
  { icon: FunctionSquare, label: "Calculated fields with previews" },
  { icon: Save, label: "Settings your app can restore" },
];

export function Hero({ onOpenFeatured }: { onOpenFeatured: () => void }) {
  return (
    <header className="relative isolate">
      <nav
        aria-label="Site"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 pt-3"
      >
        <span className="text-lg font-bold tracking-tight">explorEDA</span>
        <div className="flex items-center gap-1 text-sm">
          <a className={navLinkClass} href="#integration">
            Docs
          </a>
          <a className={navLinkClass} href="#examples-heading">
            Examples
          </a>
          <a className={navLinkClass} href={REPO_URL}>
            GitHub
          </a>
        </div>
      </nav>
      <div
        aria-hidden="true"
        className="landing-hero-bg pointer-events-none absolute inset-x-0 -top-3 -z-10 h-[40rem]"
      />
      <div className="mx-auto max-w-6xl px-1 pt-12 text-center sm:pt-16">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
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
        <LiveOrderBook onOpenFull={onOpenFeatured} />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          This is the real workspace. Click{" "}
          <span className="font-medium text-foreground">Web</span> in Sales
          channels and watch every view follow.
        </p>
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
