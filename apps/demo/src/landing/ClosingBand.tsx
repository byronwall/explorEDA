import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InstallCommand } from "./CodePanel";
import { docsPath } from "../docs/paths";
import { EXAMPLES_PATH } from "../routes";

/** The page's last call to action, the one dark band on the page. */
export function ClosingBand() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="landing-band grid gap-8 rounded-2xl px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
    >
      <div>
        <h2
          id="closing-heading"
          className="text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl"
        >
          Add explorEDA to a React app
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80">
          Pass your rows as <code className="font-mono">data</code> and save the
          settings it hands back. The quick start covers the rest.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:min-w-80">
        <InstallCommand command="pnpm add exploreda" tone="dark" />
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            asChild
            className="flex-1 bg-white font-semibold text-brand-navy hover:bg-white/90"
          >
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
    </section>
  );
}
