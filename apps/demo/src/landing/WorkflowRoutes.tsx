import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { WORKFLOWS } from "./workflows";

/** Every way to run explorEDA beyond this page, each with where it runs. */
export function WorkflowRoutes() {
  return (
    <section aria-labelledby="workflows-heading" id="workflows">
      <SectionHeading
        id="workflows-heading"
        heading="Run it where your data lives"
      >
        This page opens files in your browser. The same workspace also runs on a
        folder on your computer, on a server for your team, and inside your own
        React app.
      </SectionHeading>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKFLOWS.map(({ title, where, body, command, to, icon: Icon }) => (
          <li
            key={title}
            className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-site-accent/50"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Icon aria-hidden="true" className="size-4 text-site-accent" />
              {where}
            </div>
            <h3 className="mt-3 font-semibold text-brand-navy">
              <Link
                to={to}
                className="after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
              >
                {title}
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              {command ? (
                <code className="truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {command}
                </code>
              ) : (
                <span />
              )}
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-site-accent transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
