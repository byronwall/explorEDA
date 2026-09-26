import { Button } from "@/components/ui/button";
import type { ExampleData } from "@/demos/examples";
import { ArrowRight } from "lucide-react";
import { REPO_URL } from "./links";

interface FeaturedExampleProps {
  example: ExampleData;
  onOpen: (exampleId: string) => void;
}

const steps = [
  "Open the order book: 500 synthetic orders in seven linked views.",
  "Click Web in Sales channels. Every other chart and the orders table narrow to web orders.",
  "Click Web again, or use Reset workspace, to return to all orders.",
];

export function FeaturedExample({ example, onOpen }: FeaturedExampleProps) {
  const Icon = example.icon;

  return (
    <section
      aria-labelledby="featured-heading"
      className="rounded-lg border border-border bg-card p-5 text-card-foreground sm:p-6"
    >
      <div className="flex flex-wrap items-start gap-3">
        <Icon
          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Featured example
          </p>
          <h2 id="featured-heading" className="text-xl font-semibold">
            {example.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {example.description}
          </p>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-md border border-border p-3"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button onClick={() => onOpen(example.id)}>
          Open the order book
          <ArrowRight aria-hidden="true" />
        </Button>
        <a
          className="text-sm text-primary underline-offset-4 hover:underline"
          href={`${REPO_URL}/blob/main/apps/demo/src/demos/dashboardSettings.ts`}
        >
          Example settings source
        </a>
        <a
          className="text-sm text-primary underline-offset-4 hover:underline"
          href={example.data}
        >
          Example data (CSV)
        </a>
      </div>
    </section>
  );
}
