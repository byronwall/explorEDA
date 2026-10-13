import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { InstallCommand } from "./CodePanel";
import { LiveOrderBook } from "./LiveOrderBook";
import { SiteNav } from "./SiteNav";
import { VIEWER_PATH } from "../routes";

export function Hero({
  onOpenFeatured,
  canResume = false,
}: {
  onOpenFeatured: () => void;
  /** An analysis is saved in this browser and can reopen in the viewer. */
  canResume?: boolean;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 sm:px-6">
      <SiteNav />

      <div className="grid gap-6 pb-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
        <div>
          <h1 className="text-[2.5rem] font-bold leading-[1.04] tracking-[-0.035em] text-brand-navy text-balance sm:text-5xl lg:text-[3.25rem]">
            Explore a CSV with charts that filter each other
          </h1>
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Click a bar or drag across the scatter below, and every other view
            narrows to match. Open your own file here, or embed the same
            workspace in a React app.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:w-80 lg:flex-col lg:items-stretch">
          <Button size="lg" variant="brand" asChild>
            <a href="#your-data">
              <Upload aria-hidden="true" />
              Open your own CSV
            </a>
          </Button>
          <Button size="lg" variant="outline" onClick={onOpenFeatured}>
            Explore the order book
            <ArrowRight aria-hidden="true" />
          </Button>
          <InstallCommand command="pnpm add exploreda" />
          {canResume && (
            <Link
              to={VIEWER_PATH}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:self-start"
            >
              or reopen your last analysis
            </Link>
          )}
        </div>
      </div>

      <LiveOrderBook onOpenFull={onOpenFeatured} />
    </header>
  );
}
