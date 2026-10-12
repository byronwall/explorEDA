import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteNav } from "./SiteNav";
import { InstallCommand } from "./CodePanel";
import { VIEWER_PATH } from "../routes";
import { LiveOrderBook } from "./LiveOrderBook";

const quietLinkClass =
  "text-sm text-white/70 underline-offset-4 hover:text-white hover:underline";

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
      <div className="landing-hero relative pb-36">
        <div
          aria-hidden="true"
          className="landing-hero-grid pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SiteNav />

          <div className="grid gap-6 pb-7 pt-8 text-white sm:pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-teal/40 bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-brand-teal motion-safe:animate-pulse"
                />
                A React component for exploratory data analysis
              </p>
              <h1 className="mt-4 text-[2.5rem] font-bold leading-[1.02] tracking-[-0.035em] text-balance sm:text-5xl lg:text-[3.25rem]">
                Click a bar.{" "}
                <span className="text-brand-teal">Every chart answers.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Give your users linked charts, the rows behind every mark, and
                formulas they can read, then get their work back as JSON. The
                workspace below is the real component, not a recording.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:w-80 lg:flex-col lg:items-stretch">
              <Button size="lg" variant="brand" onClick={onOpenFeatured}>
                Explore the order book
                <ArrowRight aria-hidden="true" />
              </Button>
              <InstallCommand command="pnpm add exploreda" tone="dark" />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a href="#your-data" className={quietLinkClass}>
                  Try your own data
                </a>
                <a href="#integration" className={quietLinkClass}>
                  See the React code
                </a>
                {canResume && (
                  <Link to={VIEWER_PATH} className={quietLinkClass}>
                    or reopen your last analysis
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto -mt-36 max-w-6xl px-4 sm:px-6">
        <LiveOrderBook onOpenFull={onOpenFeatured} />
      </div>
    </header>
  );
}
