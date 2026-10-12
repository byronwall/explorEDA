import { examples } from "@/demos/examples";
import type { ExplorEdaProps } from "exploreda";
import { useEffect, useState } from "react";
import { CodeFrame } from "../components/code";

/** The dashboard text a demo example is built from. */
export function ExampleText({ id }: { id: string }) {
  const text = examples.find((example) => example.id === id)?.text;
  if (!text) {
    throw new Error(`Example "${id}" has no dashboard text`);
  }
  return (
    <CodeFrame code={text.trim()} language="dashboard" label="Dashboard text" />
  );
}

/** The library's own Dashboard text reference. */
export function DashboardTextReference() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void import("exploreda").then(({ DSL_REFERENCE }) => {
      if (live) setText(DSL_REFERENCE);
    });
    return () => {
      live = false;
    };
  }, []);
  return (
    <CodeFrame
      code={text ?? "Loading the reference…"}
      label="Dashboard text reference"
      busy={text === null}
    />
  );
}

/**
 * One line per prop. The record covers every key of `ExplorEdaProps`, so a
 * new prop fails to compile until it is described here.
 */
const PROPS: Record<keyof ExplorEdaProps, string> = {
  data: "The rows to explore. Pass a new array when rows change.",
  fieldNames:
    "Declared output columns, including when the result contains no rows.",
  savedData:
    "Settings to restore: charts, calculations, Rows, grid, metadata, color scales, field settings, and grouped summaries. An input for the first or a replacement restore, not a controlled value.",
  onStateChange:
    "Called with the current settings after each meaningful change, once per edit. Not called on mount or when data or savedData change.",
  sidePanels:
    "Host panels on the right edge, each with a toolbar button beside Fields and Rows.",
  readOnly:
    "Shows the charts without accepting edits. Host panels stay usable.",
  toolbarStart: "Host content that leads the toolbar line, such as view tabs.",
  toolbarEnd: "Host actions that end the toolbar line, such as undo or export.",
  schema:
    "What the Schema diagram shows: a project's schema, whether it can be edited, and which view it opens on. Without it, the diagram shows this workspace's table and its calculated fields.",
  onAddSource:
    "Shows Add source in the Schema diagram. The host picks a file, then can turn the workspace into a project with singleTableProject and addSourceFromRows from exploreda/analysis.",
};

export function PropsReference() {
  return (
    <dl
      aria-label="ExplorEda props"
      className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    >
      {Object.entries(PROPS).map(([prop, line]) => (
        <div
          key={prop}
          className="grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <dt>
            <code className="font-mono text-[0.8125rem] font-semibold text-foreground">
              {prop}
            </code>
          </dt>
          <dd className="text-sm leading-6 text-foreground/80">{line}</dd>
        </div>
      ))}
    </dl>
  );
}
