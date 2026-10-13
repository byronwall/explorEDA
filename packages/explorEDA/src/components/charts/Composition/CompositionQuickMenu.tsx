import { useEffect, useRef } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { ChartImageActions } from "../export/chartImageContext";
import type { QuickAction } from "./quickActions";

/**
 * The right-click menu over a composition: a list of what the pointed-at
 * object is made of, each line opening that part of the editor. It is a
 * popover rather than a native menu so it works inside the details dialog,
 * and arrow keys move through it.
 */
export function CompositionQuickMenu({
  x,
  y,
  heading,
  actions,
  container,
  image,
  onRun,
  onClose,
}: {
  x: number;
  y: number;
  /** Names what the menu is about: the element, mark, and repeat. */
  heading: string;
  actions: QuickAction[];
  container?: HTMLElement | null;
  /** The composition's image actions, listed after its own. */
  image?: ChartImageActions | null;
  onRun: (action: QuickAction) => void;
  onClose: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>("[role='menuitem']")
      ?.focus();
  }, []);
  const move = (event: React.KeyboardEvent) => {
    const items = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role='menuitem']"
      ) ?? []),
    ];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step) {
      event.preventDefault();
      items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
    }
  };
  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor asChild>
        <span
          aria-hidden="true"
          style={{ position: "fixed", left: x, top: y, width: 0, height: 0 }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={2}
        container={container ?? undefined}
        className="eda-quick-menu"
        onKeyDown={move}
        // The menu renders inside the artboard's tree, whose pointer-down
        // clears the selection; a click on a line must not.
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div ref={listRef} role="menu" aria-label={`Quick actions: ${heading}`}>
          <div className="eda-quick-menu-heading">{heading}</div>
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="eda-quick-menu-item"
              data-destructive={action.destructive || undefined}
              data-action={action.id}
              onClick={() => {
                onRun(action);
                onClose();
              }}
            >
              <span>{action.label}</span>
              {action.detail && (
                <span className="eda-quick-menu-detail">{action.detail}</span>
              )}
            </button>
          ))}
          {actions.length === 0 && (
            <div className="eda-quick-menu-detail eda-quick-menu-empty">
              Nothing drawn here. Right-click a mark, label, or guide.
            </div>
          )}
          {image && (
            <>
              <div role="separator" className="eda-quick-menu-separator" />
              {(
                [
                  ["Copy image", "E", image.copy],
                  ["Download image", "⇧E", image.download],
                ] as const
              ).map(([label, key, run]) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className="eda-quick-menu-item"
                  disabled={!!image.reason}
                  onClick={() => {
                    run();
                    onClose();
                  }}
                >
                  <span>{label}</span>
                  <span className="eda-quick-menu-detail">{key}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
