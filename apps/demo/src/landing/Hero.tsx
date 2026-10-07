import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InstallCommand } from "./CodePanel";
import { REPO_URL } from "./links";
import { VIEWER_PATH } from "../routes";
import { LiveOrderBook } from "./LiveOrderBook";

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export function Hero({
  onOpenFeatured,
  canResume = false,
}: {
  onOpenFeatured: () => void;
  /** An analysis is saved in this browser and can reopen in the viewer. */
  canResume?: boolean;
}) {
  return (
    <header>
      <nav
        aria-label="Site"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 pt-3"
      >
        <a
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="explorEDA home"
        >
          <img src="/brand/icon.svg" alt="" className="size-7" />
          <img src="/brand/wordmark.svg" alt="" className="h-6 w-auto" />
        </a>
        <div className="flex items-center gap-1 text-sm">
          <a className={navLinkClass} href="#integration">
            Docs
          </a>
          <a className={navLinkClass} href="#examples-heading">
            Examples
          </a>
          <Link className={`${navLinkClass} hidden sm:block`} to="?view=docs">
            Guides
          </Link>
          <a className={navLinkClass} href={REPO_URL}>
            GitHub
          </a>
        </div>
      </nav>
      <div className="mx-auto grid max-w-6xl gap-8 px-1 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end lg:gap-14">
        <div>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.5rem]">
            Embed an interactive analysis workspace in your React app
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Give users linked charts, record-level tables, and editable
            calculated fields without building the workspace around them. Every
            example on this page runs the same component.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch lg:pb-1">
          <Button size="lg" onClick={onOpenFeatured}>
            Explore the order book
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#integration">See the React integration</a>
          </Button>
          <InstallCommand command="pnpm add exploreda" />
          <a
            href="#your-data"
            className="text-sm text-muted-foreground lg:self-start underline-offset-4 hover:text-foreground hover:underline"
          >
            or try your own data
          </a>
          {canResume && (
            <Link
              to={VIEWER_PATH}
              className="text-sm text-muted-foreground lg:self-start underline-offset-4 hover:text-foreground hover:underline"
            >
              or reopen your last analysis
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl lg:mt-12">
        <LiveOrderBook onOpenFull={onOpenFeatured} />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          This is the real workspace. Click{" "}
          <span className="font-medium text-foreground">Web</span> in Sales
          channels and watch every view follow.
        </p>
      </div>
    </header>
  );
}
