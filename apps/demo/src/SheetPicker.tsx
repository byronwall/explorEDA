import {
  readTableFile,
  type TableFile,
  type WorkbookSheet,
} from "exploreda/readers";
import { Sheet as SheetIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const count = (value: number, unit: string) =>
  `${value.toLocaleString()} ${unit}${value === 1 ? "" : "s"}`;

/**
 * Lists a workbook's sheets so one can be opened. Nonmodal: the page stays
 * usable, and Escape or Cancel closes it. The sheet read first, the largest
 * table, is marked.
 */
export function SheetPicker({
  fileName,
  sheets,
  suggested,
  busy,
  floating = false,
  onChoose,
  onCancel,
}: {
  fileName: string;
  sheets: readonly WorkbookSheet[];
  suggested?: string;
  /** The sheet being read, while it reads. */
  busy?: string;
  /** Pins the picker to the bottom of the viewport. */
  floating?: boolean;
  onChoose: (sheet: string) => void;
  onCancel: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(
    () => first.current?.focus({ preventScroll: floating }),
    [floating]
  );
  return (
    <div
      role="group"
      aria-label={`Choose a sheet from ${fileName}`}
      data-sheet-picker=""
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-left text-sm",
        floating &&
          "fixed inset-x-0 bottom-16 z-50 mx-auto w-[min(32rem,calc(100%-2rem))] shadow-lg"
      )}
    >
      <div className="flex items-center gap-2">
        <SheetIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate font-medium">
          Open a sheet from {fileName}
        </p>
        <ActionTooltip content="Close without opening a sheet">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Cancel"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </ActionTooltip>
      </div>
      <ul className="mt-2 grid gap-1">
        {sheets.map((sheet, index) => (
          <li key={sheet.name}>
            <button
              ref={index === 0 ? first : undefined}
              type="button"
              disabled={busy !== undefined}
              onClick={() => onChoose(sheet.name)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <span className="min-w-0 flex-1 truncate">{sheet.name}</span>
              {sheet.name === suggested && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  Largest
                </span>
              )}
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {busy === sheet.name
                  ? "Opening…"
                  : `${count(sheet.rows, "row")} × ${count(sheet.columns, "column")}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Pending = { file: File; table: TableFile; busy?: string };

/**
 * Opens a read table, asking first which sheet to use when a workbook has
 * more than one. `picker` is the element to render while it asks.
 */
export function useSheetChoice(
  open: (table: TableFile) => void,
  onError: (message: string) => void,
  floating = false
) {
  const [pending, setPending] = useState<Pending>();
  const offer = useCallback(
    (file: File, table: TableFile) => {
      if ((table.sheets?.length ?? 0) > 1) {
        setPending({ file, table });
        return;
      }
      open(table);
    },
    [open]
  );
  const choose = async (sheet: string) => {
    if (!pending) return;
    if (sheet === pending.table.sheet) {
      setPending(undefined);
      open(pending.table);
      return;
    }
    setPending({ ...pending, busy: sheet });
    try {
      const table = await readTableFile(pending.file, { sheet });
      setPending(undefined);
      open(table);
    } catch (error) {
      setPending({ ...pending, busy: undefined });
      onError(error instanceof Error ? error.message : String(error));
    }
  };
  const picker = pending ? (
    <SheetPicker
      fileName={pending.file.name}
      sheets={pending.table.sheets ?? []}
      suggested={pending.table.sheet}
      busy={pending.busy}
      floating={floating}
      onChoose={(sheet) => void choose(sheet)}
      onCancel={() => setPending(undefined)}
    />
  ) : null;
  return { offer, picker };
}
