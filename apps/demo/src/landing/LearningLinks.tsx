import { ArrowRight, BookOpen, Workflow, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

const links: {
  to: string;
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    to: "?view=docs",
    title: "Browse chart guides",
    body: "Scatter and bar: fields, row scope, selection, and settings.",
    icon: BookOpen,
  },
  {
    to: "?view=docs&topic=rendering",
    title: "How rendering works",
    body: "Follow one order from its raw row to a drawn point.",
    icon: Workflow,
  },
];

export function LearningLinks() {
  return (
    <nav
      aria-label="Learning guides"
      className="mb-6 grid gap-3 sm:grid-cols-2"
    >
      {links.map(({ to, title, body, icon: Icon }) => (
        <div
          key={to}
          className="group relative flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-accent/40 sm:px-5"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-primary"
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              to={to}
              className="text-sm font-semibold text-card-foreground after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
            >
              {title}
            </Link>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
          <ArrowRight
            aria-hidden="true"
            className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
          />
        </div>
      ))}
    </nav>
  );
}
