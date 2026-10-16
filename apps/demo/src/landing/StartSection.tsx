import { Button } from "@/components/ui/button";
import { ArrowRight, FileJson } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { WORKFLOWS } from "./workflows";

/**
 * Where to go after the demo: open a file in this browser on the left, or
 * run explorEDA somewhere else on the right. The hero's Open a file lands
 * here, right below the demo.
 */
export function StartSection({
  upload,
  samples,
  savedAnalysis,
  openAnalysis,
}: {
  /** The drop zone that opens a file in this browser. */
  upload: ReactNode;
  /** Buttons that open bundled sample data. */
  samples: ReactNode;
  /** The form that reopens pasted analysis JSON, shown in a dialog. */
  savedAnalysis: ReactNode;
  /** The button that opens the pasted analysis. */
  openAnalysis: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <section
      aria-labelledby="your-data-heading"
      id="your-data"
      className="scroll-mt-8"
    >
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h2
            id="your-data-heading"
            className="text-2xl font-bold tracking-[-0.02em] text-site-ink"
          >
            Open your own data
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your file stays in this browser. CSV, TSV, JSON, JSON Lines, Excel,
            Parquet, and Arrow all open the same workspace.
          </p>
          <div className="mt-5">{upload}</div>
          {samples}
          <p className="mt-4 text-sm text-muted-foreground">
            Exported an analysis earlier?{" "}
            <button
              type="button"
              onClick={() => dialog.current?.showModal()}
              className="inline-flex items-center gap-1 rounded-sm font-medium text-site-accent transition-colors duration-150 hover:text-site-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FileJson aria-hidden="true" className="size-3.5" />
              Reopen it from JSON
            </button>
          </p>
          <dialog
            ref={dialog}
            aria-labelledby="json-heading"
            className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/40"
          >
            {savedAnalysis}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => dialog.current?.close()}>
                Cancel
              </Button>
              {openAnalysis}
            </div>
          </dialog>
        </div>
        <div className="min-w-0">
          <h2
            id="workflows-heading"
            className="text-2xl font-bold tracking-[-0.02em] text-site-ink"
          >
            Run it where your data lives
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The same workspace runs on your computer, on a server for your team,
            and inside your own app.
          </p>
          <ul
            id="workflows"
            className="mt-5 divide-y divide-border border-y border-border"
          >
            {WORKFLOWS.map(
              ({ title, where, body, command, to, icon: Icon }) => (
                <li
                  key={title}
                  className="group relative grid grid-cols-[1.25rem_minmax(0,1fr)_1rem] gap-x-3 rounded-sm py-3.5 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring"
                >
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 size-5 text-site-accent"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="font-semibold text-site-ink transition-colors duration-150 group-hover:text-site-accent">
                        <Link
                          to={to}
                          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                          {title}
                        </Link>
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {where}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {body}
                      {command && (
                        <>
                          {" "}
                          <code className="whitespace-nowrap rounded bg-muted px-1 py-px font-mono text-xs text-foreground">
                            {command}
                          </code>
                        </>
                      )}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 size-4 text-muted-foreground transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-site-accent"
                  />
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
