import type { ReactNode } from "react";
import { GLANCES } from "../glance";
import { SettingsReference } from "../reference/SettingsReference";
import { inlineCodeClass, proseClass } from "./chrome";
import { DocsLink, Heading } from "./content";

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-4 py-3.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-6 text-foreground/85">
        {children}
      </dd>
    </div>
  );
}

/** What a chart answers, what it needs, and the gestures it takes. */
export function AtAGlance({ chartType }: { chartType: string }) {
  const glance = GLANCES[chartType];
  if (!glance) {
    return null;
  }
  return (
    <dl
      aria-label="At a glance"
      className="mt-8 grid divide-y divide-border overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1fr_1fr_1.25fr] md:divide-x md:divide-y-0"
    >
      <Cell label="Use it for">{glance.useFor}</Cell>
      <Cell label="You need">{glance.needs}</Cell>
      <Cell label="On the chart">
        {glance.gestures.length === 0 ? (
          "Nothing to select: it reads the rows that pass every filter."
        ) : (
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2.5 gap-y-1.5">
            {glance.gestures.map(([gesture, effect]) => (
              <div key={gesture} className="contents">
                <dt>
                  <kbd className="whitespace-nowrap rounded border border-b-2 border-border bg-background px-1.5 font-sans text-xs font-medium text-foreground">
                    {gesture}
                  </kbd>
                </dt>
                <dd className="leading-snug">{effect}</dd>
              </div>
            ))}
          </dl>
        )}
      </Cell>
    </dl>
  );
}

/**
 * The section that ends every chart page. The page's MDX leaves it out, so
 * each chart documents its settings the same way.
 */
export function SavedSettings({ chartType }: { chartType: string }) {
  return (
    <>
      <Heading level={2}>Saved settings</Heading>
      <p className={`mt-4 ${proseClass}`}>
        Every setting this chart type saves, and its value in a new chart. Each
        name is also its path in{" "}
        <DocsLink topic="dashboard-text">Dashboard text</DocsLink>: write{" "}
        <code className={inlineCodeClass}>name=value</code>, and reach inside an
        object setting with a dot, as in{" "}
        <code className={inlineCodeClass}>margin.left=40</code>.
      </p>
      <SettingsReference type={chartType} />
    </>
  );
}
