import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Copy, Pencil, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartTitle } from "../chartAccessibility";
import { InlineTextEditor } from "./InlineTextEditor";
import { useChartEdit } from "./useChartEdit";

export const TITLE_EDIT_DESCRIPTION =
  "Double-click or press Enter to edit the title";

/**
 * Lets a chart's title be edited where it is drawn. Double-click, Enter, or
 * F2 on the title opens a field in its place, and the context menu offers
 * the same edit and a reset to the inherited name. The chart shows each
 * keystroke; Escape puts the old title back.
 */
export function useTitleEditing(settings: ChartSettings, displayTitle: string) {
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; title: Element }>();
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const edit = useChartEdit(settings.id);
  // The name the chart shows when its title is blank, from its fields.
  const inherited = getChartTitle({ ...settings, title: "" }, getFieldLabel);
  const custom = Boolean(settings.title.trim()) && displayTitle !== inherited;

  const start = () => {
    setMenu(undefined);
    setEditing(true);
  };
  const stop = () => setEditing(false);

  const titleProps = {
    // The title is the grid's drag handle. A press starts a drag and the
    // grid's placeholder takes the release, so `dblclick` never reaches the
    // title. The second press of a double-click opens the editor instead,
    // and stops there so it starts no drag.
    onMouseDown: (event: MouseEvent) => {
      if (event.altKey || event.button !== 0 || event.detail !== 2) return;
      event.preventDefault();
      event.stopPropagation();
      start();
    },
    // Outside the grid, such as in chart details, the browser's event works.
    onDoubleClick: (event: MouseEvent) => {
      if (event.altKey) return;
      event.preventDefault();
      start();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Enter" || event.key === "F2") {
        event.preventDefault();
        start();
      }
    },
    onContextMenu: (event: MouseEvent) => {
      // Shift keeps the browser's own menu, as table headers do.
      if (event.shiftKey) return;
      event.preventDefault();
      event.stopPropagation();
      const box = event.currentTarget.getBoundingClientRect();
      const fromKeyboard = event.clientX === 0 && event.clientY === 0;
      setMenu({
        x: fromKeyboard ? box.left : event.clientX,
        y: fromKeyboard ? box.bottom : event.clientY,
        title: event.currentTarget,
      });
    },
  };

  const editor = editing ? (
    <InlineTextEditor
      initialValue={displayTitle}
      placeholder={inherited}
      ariaLabel="Chart title"
      onChange={(text) =>
        // Blank text, or the inherited name itself, follows the fields again.
        edit.apply({ title: text.trim() === inherited ? "" : text })
      }
      onCommit={() => {
        edit.commit();
        stop();
      }}
      onCancel={() => {
        edit.cancel();
        stop();
      }}
    />
  ) : null;

  const focusTitle = (element: Element) => {
    if (element instanceof HTMLElement) element.focus({ preventScroll: true });
  };

  const overlay =
    menu &&
    createPortal(
      <DropdownMenu
        open
        modal={false}
        onOpenChange={(open) => {
          if (!open) setMenu(undefined);
        }}
      >
        <DropdownMenuTrigger asChild>
          <span
            aria-hidden="true"
            className="pointer-events-none fixed h-0 w-0"
            style={{ left: menu.x, top: menu.y }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          collisionPadding={12}
          aria-label={`Actions for the title ${displayTitle}`}
          className="max-w-[min(280px,calc(100vw-24px))]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!editing) focusTitle(menu.title);
          }}
        >
          <DropdownMenuItem onSelect={start}>
            <Pencil aria-hidden="true" />
            Edit title
            <span className="ml-auto pl-4 text-xs text-muted-foreground">
              Enter
            </span>
          </DropdownMenuItem>
          {custom && (
            <DropdownMenuItem
              onSelect={() => {
                edit.apply({ title: "" });
                edit.commit();
              }}
            >
              <RotateCcw aria-hidden="true" />
              <span className="truncate">Reset to “{inherited}”</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => {
              void navigator.clipboard?.writeText(displayTitle);
            }}
          >
            <Copy aria-hidden="true" />
            Copy title
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
      document.body
    );

  return { editing, editor, titleProps, overlay };
}
