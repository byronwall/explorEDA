import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InstallCommand } from "./CodePanel";
import { docsPath } from "../docs/paths";
import { EXAMPLES_PATH } from "../routes";

/** The page's last call to action, on the navy band. */
export function ClosingBand() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="landing-hero relative overflow-hidden rounded-3xl px-6 py-14 text-white sm:px-12 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="landing-hero-grid pointer-events-none absolute inset-0"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2
            id="closing-heading"
            className="text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl"
          >
            Hand your users the{" "}
            <span className="text-brand-teal">whole analysis.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            One component, your rows, and settings you store however you like.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:min-w-80">
          <InstallCommand command="pnpm add exploreda" tone="dark" />
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" size="lg" asChild className="flex-1">
              <Link to={`${docsPath("developers")}#quick-start`}>
                Read the quick start
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="flex-1 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to={EXAMPLES_PATH}>Browse examples</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
