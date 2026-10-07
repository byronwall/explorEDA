import { ActionTooltip } from "@/components/ui/tooltip";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  capabilities,
  catalogue,
  type Capability,
  type ExampleData,
} from "./demos/examples";

const labelClass =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const chipClass =
  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface ExampleSelectorProps {
  onSelect: (exampleId: string, tab?: string) => void;
  examplesToShow?: ExampleData[];
}

/**
 * The catalogue of complete analyses. A capability narrows it to the
 * analyses that show it, and each tab link opens the analysis at that tab.
 */
export function ExampleSelector({
  onSelect,
  examplesToShow = catalogue,
}: ExampleSelectorProps) {
  const [capability, setCapability] = useState<Capability>();
  const offered = (Object.keys(capabilities) as Capability[]).filter((name) =>
    examplesToShow.some((example) =>
      example.tabs?.some((tab) => tab.capabilities.includes(name))
    )
  );
  const shown = capability
    ? examplesToShow.filter((example) =>
        example.tabs?.some((tab) => tab.capabilities.includes(capability))
      )
    : examplesToShow;

  return (
    <div>
      <div
        role="group"
        aria-label="Find an analysis by capability"
        className="mb-4 flex flex-wrap items-center gap-1.5"
      >
        <span className={`${labelClass} mr-1`}>Find by capability</span>
        <button
          type="button"
          aria-pressed={capability === undefined}
          onClick={() => setCapability(undefined)}
          className={`${chipClass} ${
            capability === undefined
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground hover:bg-accent/50"
          }`}
        >
          All
        </button>
        {offered.map((name) => (
          <ActionTooltip key={name} content={capabilities[name]}>
            <button
              type="button"
              aria-pressed={capability === name}
              onClick={() =>
                setCapability((current) =>
                  current === name ? undefined : name
                )
              }
              className={`${chipClass} ${
                capability === name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent/50"
              }`}
            >
              {name}
            </button>
          </ActionTooltip>
        ))}
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {shown.map((example) => {
          const Icon = example.icon;
          const { rows, fields, source } = example.dataset;
          const tabs = example.tabs ?? [];
          return (
            <li
              key={example.id}
              className="group relative grid cursor-pointer gap-x-8 gap-y-4 px-5 py-5 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring hover:bg-accent/40 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_1.25rem] lg:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary transition-colors"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-card-foreground">
                    <button
                      type="button"
                      className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      onClick={() => onSelect(example.id)}
                    >
                      {example.title}
                    </button>
                  </h3>
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {example.description}
                  </p>
                </div>
              </div>
              <dl className="ml-8 grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2.5 border-t border-border pt-4 text-sm lg:ml-0 lg:self-stretch lg:content-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <dt className={labelClass}>Data</dt>
                <dd className="min-w-0 text-foreground">
                  <span className="font-medium tabular-nums">{rows}</span>
                  {" · "}
                  <span className="tabular-nums">{fields}</span> fields ·{" "}
                  {source === "Real" ? "real data" : "synthetic"}
                </dd>
                {tabs.length > 0 && (
                  <>
                    <dt className={labelClass}>Tabs</dt>
                    <dd className="flex min-w-0 flex-wrap gap-1.5">
                      {tabs.map((tab) => {
                        const match =
                          capability !== undefined &&
                          tab.capabilities.includes(capability);
                        return (
                          <ActionTooltip
                            key={tab.name}
                            content={`Open at this tab · ${tab.capabilities.join(", ")}`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelect(example.id, tab.name)}
                              className={`relative z-10 rounded-md px-2 py-0.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                match
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-foreground hover:bg-accent"
                              }`}
                            >
                              {tab.name}
                            </button>
                          </ActionTooltip>
                        );
                      })}
                    </dd>
                  </>
                )}
                <dt className={labelClass}>Shows</dt>
                <dd className="min-w-0 text-muted-foreground">
                  {example.shows.join(" · ")}
                </dd>
              </dl>
              <ArrowRight
                aria-hidden="true"
                className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary lg:block"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
