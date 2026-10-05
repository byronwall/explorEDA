import { useEffect, useRef, type RefObject } from "react";

/** Layers and fields that give Escape their own meaning. */
const OWN_ESCAPE =
  "[data-radix-popper-content-wrapper], [role='dialog'], [role='alertdialog'], [role='menu'], [role='listbox'], input, textarea, select, [contenteditable='true']";

/**
 * Calls `onEscape` when Escape is pressed while focus is outside `ref`, such
 * as on a chart the user clicked beside a nonmodal panel. Escape inside the
 * panel stays with the panel's own handler, and open popovers, dialogs,
 * menus, and text fields elsewhere keep theirs. It runs before a chart's own
 * Escape, so one press closes the panel and the next clears the chart.
 */
export function useEscapeOutside(
  ref: RefObject<HTMLElement | null>,
  onEscape: () => void
) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && ref.current?.contains(target)) {
        return;
      }
      if (target instanceof Element && target.closest(OWN_ESCAPE)) {
        return;
      }
      if (document.querySelector("[role='dialog'][aria-modal='true']")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onEscapeRef.current();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [ref]);
}
