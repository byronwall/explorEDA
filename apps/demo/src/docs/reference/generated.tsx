import { examples } from "@/demos/examples";
import type { ExplorEdaProps } from "exploreda";
import { useEffect, useState } from "react";
import { labelClass } from "../components/chrome";

const codeClass =
  "mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-[0.8rem] leading-6 text-foreground";

/** The dashboard text a demo example is built from. */
export function ExampleText({ id }: { id: string }) {
  const text = examples.find((example) => example.id === id)?.text;
  if (!text) {
    throw new Error(`Example "${id}" has no dashboard text`);
  }
  return <pre className={codeClass}>{text.trim()}</pre>;
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
    <pre className={codeClass} aria-busy={text === null}>
      {text ?? "Loading the reference…"}
    </pre>
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
};

export function PropsReference() {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table
        aria-label="ExplorEda props"
        className="w-full min-w-[30rem] border-collapse text-sm"
      >
        <thead className="bg-muted/50 text-left">
          <tr>
            <th scope="col" className={`px-3 py-2 ${labelClass}`}>
              Prop
            </th>
            <th scope="col" className={`px-3 py-2 ${labelClass}`}>
              What it does
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Object.entries(PROPS).map(([prop, line]) => (
            <tr key={prop}>
              <th scope="row" className="px-3 py-2 text-left align-top">
                <code className="font-mono text-[0.85rem] text-foreground">
                  {prop}
                </code>
              </th>
              <td className="px-3 py-2 align-top leading-6 text-muted-foreground">
                {line}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
