import type { KeyboardEvent } from "react";

/** Alt-Enter mirrors Alt-click, so keyboard users can trace a facet. */
export function traceOnAltEnter(trace: (() => void) | undefined) {
  if (!trace) return undefined;
  return (event: KeyboardEvent) => {
    if (!event.altKey || event.key !== "Enter") return;
    event.preventDefault();
    trace();
  };
}
