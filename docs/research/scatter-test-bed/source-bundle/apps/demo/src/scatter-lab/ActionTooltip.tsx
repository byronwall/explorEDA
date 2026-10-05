import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

/** Demo-local reuse of the shared ActionTooltip composition; no deep import.
 * Keyboard focus opens help after focus-induced scrolling has settled. The
 * older shared trigger suppresses focus help, contrary to AGENTS.md. */
export function ActionTooltip({ children, content }: { children: ReactElement; content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelFocus = () => { if (focusTimer.current !== null) clearTimeout(focusTimer.current); focusTimer.current = null; };
  useEffect(() => () => { if (focusTimer.current !== null) clearTimeout(focusTimer.current); }, []);
  return <Tooltip.Provider delayDuration={140}>
    <Tooltip.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild onFocus={event => {
        // Radix otherwise opens immediately, then closes on the focus scroll.
        event.preventDefault(); cancelFocus();
        const target = event.currentTarget;
        focusTimer.current = setTimeout(() => { if (document.activeElement === target) setOpen(true); }, 160);
      }} onBlur={() => { cancelFocus(); setOpen(false); }} onPointerDown={cancelFocus}
        onKeyDown={event => { if (event.key === "Escape") { cancelFocus(); setOpen(false); } }}>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Content className="eda-soft-tooltip sl-tooltip" sideOffset={5} collisionPadding={12}>{content}</Tooltip.Content></Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>;
}
