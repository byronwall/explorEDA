import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "./ui/button";
import { usePanelBox } from "./FieldList/FieldList";
import { useEscapeOutside } from "@/hooks/useEscapeOutside";

/**
 * A host-supplied panel on the workspace's right edge. The workspace adds its
 * toolbar button and shows it in the place of Rows and workspace settings, one
 * panel at a time. The host owns `open` and `wide`, so the panel keeps its
 * state when the host remounts the workspace.
 */
export interface ExplorEdaSidePanel {
  /** Stable key, also used for the panel element's id. */
  id: string;
  /** Names the toolbar button and titles the panel. */
  label: string;
  /** Hover help for the toolbar button. */
  tooltip: string;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The wide size shows more detail. Omit `onWideChange` to keep one size. */
  wide?: boolean;
  onWideChange?: (wide: boolean) => void;
  /** A single letter that toggles the panel, such as "h". */
  shortcut?: string;
  /** Extra header controls, shown before the size and close buttons. */
  actions?: ReactNode;
  /** Pinned under the header while the content scrolls. */
  banner?: ReactNode;
  children: ReactNode;
}

export function WorkspaceSidePanel({
  panel,
  autoFocus,
  workspaceRef,
  onClose,
}: {
  panel: ExplorEdaSidePanel;
  autoFocus: boolean;
  workspaceRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const box = usePanelBox(workspaceRef);
  useEscapeOutside(panelRef, onClose);

  useEffect(() => {
    // A host remount must not pull focus; only an explicit open does.
    if (autoFocus) panelRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const { label, wide = false, onWideChange } = panel;
  return (
    <aside
      id={panel.id}
      ref={panelRef}
      tabIndex={-1}
      className="eda-settings-drawer eda-side-panel"
      aria-label={label}
      data-wide={wide || undefined}
      style={
        box
          ? ({
              "--eda-field-list-top": `${box.top}px`,
              "--eda-field-list-right": `${box.right}px`,
              "--eda-field-list-height": `${box.height}px`,
            } as CSSProperties)
          : {}
      }
      onKeyDown={(event) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          !(event.target instanceof Node) ||
          !panelRef.current?.contains(event.target)
        ) {
          return;
        }
        event.preventDefault();
        onClose();
      }}
    >
      <div className="eda-settings-drawer-head eda-side-panel-head">
        <h2 className="eda-side-panel-title">
          <span aria-hidden="true">{panel.icon}</span>
          {label}
        </h2>
        {panel.actions}
        {onWideChange && (
          <Button
            variant="ghost"
            size="icon"
            className="eda-settings-drawer-wide"
            aria-label={wide ? `Narrow ${label}` : `Expand ${label}`}
            aria-pressed={wide}
            tooltip={
              wide
                ? "Narrow the panel to show more of the charts"
                : "Expand the panel to show more detail"
            }
            onClick={() => onWideChange(!wide)}
          >
            {wide ? <Minimize2 /> : <Maximize2 />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Close ${label}`}
          tooltip={`Close ${label.toLowerCase()} (Esc)`}
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      {panel.banner}
      <div className="eda-side-panel-body">{panel.children}</div>
    </aside>
  );
}
