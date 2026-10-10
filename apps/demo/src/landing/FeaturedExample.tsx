import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import type { ExampleData } from "@/demos/examples";
import { ArrowRight } from "lucide-react";
import { REPO_URL } from "./links";
import { SectionHeading } from "./SectionHeading";

interface FeaturedExampleProps {
  example: ExampleData;
  onOpen: (exampleId: string, tab?: string) => void;
}

const linkClass =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

/** The featured analysis: what it covers, each tab, and its source data. */
export function FeaturedExample({ example, onOpen }: FeaturedExampleProps) {
  const firstTable = example.analysis
    ? Object.values(example.analysis.tableFiles)[0]
    : example.data;
  const folder = firstTable?.slice(0, firstTable.lastIndexOf("/"));
  return (
    <section aria-labelledby="featured-heading" className="scroll-mt-8">
      <div className="max-w-3xl">
        <SectionHeading id="featured-heading" heading={example.title}>
          {example.description}
        </SectionHeading>
        {example.tabs && (
          <ul aria-label="Tabs" className="mt-8 grid gap-2 sm:grid-cols-2">
            {example.tabs.map((tab) => (
              <li key={tab.name}>
                <ActionTooltip content={`Open the analysis at ${tab.name}`}>
                  <button
                    type="button"
                    onClick={() => onOpen(example.id, tab.name)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>
                      <span className="block font-medium">{tab.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {tab.capabilities.join(" · ")}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                    />
                  </button>
                </ActionTooltip>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button onClick={() => onOpen(example.id)}>
            Open the analysis
            <ArrowRight aria-hidden="true" />
          </Button>
          <a
            className={linkClass}
            href={`${REPO_URL}/tree/main/apps/demo/src/demos/analyses`}
          >
            Analysis source
          </a>
          {folder && (
            <a className={linkClass} href={`${folder}/manifest.json`}>
              Data sources and audits
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
