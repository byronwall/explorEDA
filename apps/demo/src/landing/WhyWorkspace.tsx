import {
  ArrowRight,
  Calculator,
  Crosshair,
  FileJson,
  Filter,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { docsPath } from "../docs/paths";
import { SectionHeading } from "./SectionHeading";

const pillars: {
  icon: LucideIcon;
  title: string;
  gesture: string;
  body: string;
  topic: string;
}[] = [
  {
    icon: Filter,
    title: "Every view filters every other",
    gesture: "Click or drag",
    body: "Select a bar, a range, or a cell and the rest of the workspace narrows to match, record table included.",
    topic: "filters",
  },
  {
    icon: Crosshair,
    title: "Trace any mark to its rows",
    gesture: "Alt-click",
    body: "Follow a bar, a point, or a total back through each step to the source records that produced it.",
    topic: "trace",
  },
  {
    icon: Calculator,
    title: "Formulas people can read",
    gesture: "Edit a field",
    body: "Calculated fields show what they depend on and preview a draft before it reaches a single chart.",
    topic: "calculated-fields",
  },
  {
    icon: FileJson,
    title: "Work your app keeps",
    gesture: "onStateChange",
    body: "Layouts, filters, and formulas arrive as JSON. Store them anywhere and restore them through savedData.",
    topic: "developers",
  },
];

export function WhyWorkspace() {
  return (
    <section aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        eyebrow="What you get"
        heading="A whole workspace, not another chart library"
      >
        Charts are the easy part. explorEDA ships what goes around them: linked
        selection, record inspection, readable formulas, and settings your app
        can save.
      </SectionHeading>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, gesture, body, topic }) => (
          <li
            key={title}
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all focus-within:ring-2 focus-within:ring-ring hover:-translate-y-0.5 hover:border-site-accent/50 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-xl bg-brand-navy text-brand-teal"
            >
              <Icon className="size-5" />
            </span>
            <h3 className="mt-5 font-semibold leading-snug">
              <Link
                to={docsPath(topic)}
                className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
              >
                {title}
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
            <p className="mt-auto flex items-center justify-between pt-5 text-xs">
              <kbd className="rounded border border-border border-b-2 bg-background px-1.5 py-px font-mono text-[11px] font-medium text-foreground">
                {gesture}
              </kbd>
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-site-accent motion-reduce:transition-none"
              />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
