import { Button } from "@/components/ui/button";
import type { ExampleData } from "@/demos/examples";
import { ArrowRight } from "lucide-react";
import { REPO_URL } from "./links";
import { SectionHeading } from "./SectionHeading";

interface FeaturedExampleProps {
  example: ExampleData;
  onOpen: (exampleId: string) => void;
}

const steps = [
  {
    title: "Open the order book",
    body: "500 synthetic orders in seven linked views.",
  },
  {
    title: "Click Web in Sales channels",
    body: "Every other chart and the orders table narrow to web orders.",
  },
  {
    title: "Click Web again, or Reset",
    body: "The workspace returns to all 500 orders.",
  },
];

const linkClass =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export function FeaturedExample({ example, onOpen }: FeaturedExampleProps) {
  return (
    <section aria-labelledby="featured-heading" className="scroll-mt-8">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <SectionHeading id="featured-heading" heading={example.title}>
            {example.description}
          </SectionHeading>
          <ol className="mt-8 space-y-0">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-9 h-[calc(100%-2.5rem)] w-px bg-border"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary shadow-sm"
                >
                  {index + 1}
                </span>
                <div className="pt-1">
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button onClick={() => onOpen(example.id)}>
              Open the order book
              <ArrowRight aria-hidden="true" />
            </Button>
            <a
              className={linkClass}
              href={`${REPO_URL}/blob/main/apps/demo/src/demos/dashboardSettings.ts`}
            >
              Settings source
            </a>
            <a className={linkClass} href={example.data}>
              Data (CSV)
            </a>
          </div>
        </div>
        <figure className="min-w-0">
          <div className="landing-shot overflow-hidden rounded-xl border border-border bg-card">
            <img
              src="/explorEDA/landing/order-book-web.jpg"
              alt="The order book after selecting Web: a Channel: Web filter chip, 167 of 500 rows, and every chart narrowed to web orders."
              width={2040}
              height={1230}
              loading="lazy"
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
            After step 2: one click filters every view to 167 of 500 orders.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
