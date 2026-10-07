import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronDown,
  CircleCheck,
  Copy,
  Download,
  LoaderCircle,
  MoveLeft,
  MoveRight,
  Pencil,
  Plus,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MOD_KEY } from "./savedViewsHistory";
import type { SavedView } from "./savedViewsSession";

export type SaveState = "saved" | "saving" | "error";

function IconButton({
  label,
  tooltip,
  children,
  className,
  ...props
}: {
  label: string;
  tooltip: ReactNode;
  children: ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <ActionTooltip content={tooltip}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        className={cn("size-8 text-muted-foreground", className)}
        {...props}
      >
        {children}
      </Button>
    </ActionTooltip>
  );
}

function RenameField({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const done = useRef(false);
  const finish = (save: boolean) => {
    if (done.current) {
      return;
    }
    done.current = true;
    const name = draft.trim();
    if (save && name && name !== initial) {
      onCommit(name);
    } else {
      onCancel();
    }
  };
  return (
    <input
      autoFocus
      aria-label="View name"
      className="h-7 rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ width: `${Math.min(24, Math.max(8, draft.length + 2))}ch` }}
      value={draft}
      maxLength={60}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish(false);
        }
      }}
    />
  );
}

export function SavedViewTabs({
  tabs,
  activeId,
  readOnly,
  onSelect,
  onCreate,
  onDuplicate,
  projectMode = false,
  onRename,
  onDelete,
  onMove,
  onExport,
  onExportAll,
  canUndo,
  canRedo,
  undoText,
  redoText,
  onUndo,
  onRedo,
  saveState,
  saveDetail,
  onOpenHistory,
}: {
  tabs: SavedView[];
  activeId: string;
  /** While a past version shows, tabs switch but nothing else changes. */
  readOnly: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: () => void;
  projectMode?: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onExport: () => void;
  /** Exports every view at once; replaces the per-view export button. */
  onExportAll?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoText?: string;
  redoText?: string;
  onUndo: () => void;
  onRedo: () => void;
  saveState: SaveState;
  saveDetail: string;
  onOpenHistory: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);

  useEffect(() => {
    if (readOnly) {
      setRenaming(false);
    }
  }, [readOnly]);
  useEffect(() => {
    // Keep the selected tab in view when the strip scrolls sideways.
    const list = listRef.current;
    if (!list) {
      return;
    }
    const reveal = () => {
      // The tab and its options button share one item positioned in the list.
      const item = list.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]'
      )?.parentElement;
      if (!item) {
        return;
      }
      const left = item.offsetLeft;
      const right = left + item.offsetWidth;
      if (left < list.scrollLeft) {
        list.scrollLeft = left;
      } else if (right > list.scrollLeft + list.clientWidth) {
        list.scrollLeft = right - list.clientWidth;
      }
    };
    reveal();
    window.addEventListener("resize", reveal);
    return () => window.removeEventListener("resize", reveal);
  }, [activeId, tabs.length]);

  const focusTab = (index: number) => {
    const tabs =
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[index]?.focus();
  };

  return (
    <div className="flex min-w-0 items-end gap-1 border-b border-border">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Saved views"
        className="relative flex min-w-0 items-end gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          if (selected && renaming) {
            return (
              <div
                key={tab.id}
                className="flex h-9 shrink-0 items-center border-b-2 border-primary px-1"
              >
                <RenameField
                  initial={tab.name}
                  onCommit={(name) => {
                    setRenaming(false);
                    onRename(name);
                    requestAnimationFrame(() => focusTab(index));
                  }}
                  onCancel={() => {
                    setRenaming(false);
                    requestAnimationFrame(() => focusTab(index));
                  }}
                />
              </div>
            );
          }
          return (
            <div
              key={tab.id}
              className={cn(
                "group flex h-9 shrink-0 items-center border-b-2 transition-colors",
                selected
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={cn(
                  "h-8 max-w-[14rem] truncate rounded-md px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "font-medium"
                )}
                onClick={() => onSelect(tab.id)}
                onDoubleClick={() => {
                  if (selected && !readOnly) {
                    setRenaming(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "F2" && !readOnly) {
                    event.preventDefault();
                    setRenaming(true);
                    return;
                  }
                  let next: number | undefined;
                  if (event.key === "ArrowRight") {
                    next = (index + 1) % tabs.length;
                  } else if (event.key === "ArrowLeft") {
                    next = (index - 1 + tabs.length) % tabs.length;
                  } else if (event.key === "Home") {
                    next = 0;
                  } else if (event.key === "End") {
                    next = tabs.length - 1;
                  }
                  if (next === undefined) {
                    return;
                  }
                  event.preventDefault();
                  focusTab(next);
                  onSelect(tabs[next]!.id);
                }}
              >
                {tab.name}
              </button>
              {selected && !readOnly && (
                <DropdownMenu>
                  <ActionTooltip content="View options: rename, duplicate, move, export, or delete this view">
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${tab.name}`}
                        className="-ml-1 mr-0.5 grid size-6 place-items-center rounded text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
                      >
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                  </ActionTooltip>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => setRenaming(true)}>
                      <Pencil aria-hidden="true" />
                      Rename
                      <DropdownMenuShortcut>F2</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onDuplicate}>
                      <Copy aria-hidden="true" />
                      Duplicate view
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={activeIndex <= 0}
                      onSelect={() => onMove(-1)}
                    >
                      <MoveLeft aria-hidden="true" />
                      Move left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={activeIndex >= tabs.length - 1}
                      onSelect={() => onMove(1)}
                    >
                      <MoveRight aria-hidden="true" />
                      Move right
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onExport}>
                      <Download aria-hidden="true" />
                      {projectMode
                        ? "Export this view with its tables"
                        : "Export analysis"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={tabs.length <= 1}
                      onSelect={onDelete}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete view
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>
      <IconButton
        label="New view"
        className="mb-0.5 shrink-0"
        disabled={readOnly}
        tooltip={
          projectMode
            ? "New view: a blank tab on the active query and frame. Charts and filters stay separate. Definitions are shared with views on the same query."
            : "New view: a blank tab on the same rows. Each view keeps its own charts and filters. Calculations, colors, and field settings stay shared."
        }
        onClick={onCreate}
      >
        <Plus aria-hidden="true" />
      </IconButton>
      <div className="mb-0.5 ml-auto flex shrink-0 items-center gap-0.5 pl-2">
        <IconButton
          label="Undo"
          disabled={!canUndo || readOnly}
          tooltip={
            undoText ? `Undo: ${undoText} (${MOD_KEY}Z)` : `Undo (${MOD_KEY}Z)`
          }
          onClick={onUndo}
        >
          <Undo2 aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Redo"
          disabled={!canRedo || readOnly}
          tooltip={
            redoText
              ? `Redo: ${redoText} (${MOD_KEY}Shift+Z)`
              : `Redo (${MOD_KEY}Shift+Z)`
          }
          onClick={onRedo}
        >
          <Redo2 aria-hidden="true" />
        </IconButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ActionTooltip content={saveDetail}>
          <button
            type="button"
            aria-label={
              saveState === "error"
                ? "Not saved. Open history"
                : saveState === "saving"
                  ? "Saving. Open history"
                  : "Saved. Open history"
            }
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
              saveState === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            onClick={onOpenHistory}
          >
            {saveState === "error" ? (
              <AlertTriangle className="size-4" aria-hidden="true" />
            ) : saveState === "saving" ? (
              <LoaderCircle
                className="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <CircleCheck className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {saveState === "error"
                ? "Not saved"
                : saveState === "saving"
                  ? "Saving…"
                  : "Saved"}
            </span>
          </button>
        </ActionTooltip>
        <IconButton
          label={onExportAll ? "Export project" : "Export analysis"}
          disabled={readOnly}
          tooltip={
            onExportAll
              ? "Export project: download every view, query, and source table as one file"
              : "Export analysis: download this view's charts and the source rows as one JSON file"
          }
          onClick={onExportAll ?? onExport}
        >
          <Download aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}
