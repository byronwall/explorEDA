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

/** Tables past this many rows ask before opening; they take seconds and memory. */
export const LARGE_TABLE_ROWS = 500_000;

/** Asks before opening a table large enough to take a while. */
export function LargeTableNotice({
  fileName,
  rows,
  floating = false,
  onOpen,
  onCancel,
}: {
  fileName: string;
  rows: number;
  floating?: boolean;
  onOpen: () => void;
  onCancel: () => void;
}) {
  const open = useRef<HTMLButtonElement>(null);
  useEffect(() => open.current?.focus({ preventScroll: floating }), [floating]);
  // About 18 ms per 1,000 rows in a production build.
  const seconds = Math.max(10, Math.round(((rows / 1000) * 0.018) / 5) * 5);
  return (
    <div
      role="group"
      aria-label={`Open ${fileName}?`}
      data-large-table-notice=""
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
      <p className="font-medium">
        {fileName} has {rows.toLocaleString()} rows
      </p>
      <p className="mt-1 text-muted-foreground">
        Opening it takes about {seconds} seconds and a lot of this tab&apos;s
        memory.
      </p>
      <div className="mt-3 flex gap-2">
        <Button ref={open} type="button" size="sm" onClick={onOpen}>
          Open all rows
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

type Pending =
  | { kind: "sheet"; file: File; table: TableFile; busy?: string }
  | { kind: "large"; file: File; table: TableFile };

/**
 * Opens a read table after any choice it needs: which sheet to use when a
 * workbook has several, and whether to open a very large table. `prompt` is
 * the element to render while it asks.
 */
export function useImportChoice(
  open: (table: TableFile) => void,
  onError: (message: string) => void,
  floating = false
) {
  const [pending, setPending] = useState<Pending>();
  const confirm = useCallback(
    (file: File, table: TableFile) => {
      if (table.rows.length > LARGE_TABLE_ROWS) {
        setPending({ kind: "large", file, table });
        return;
      }
      setPending(undefined);
      open(table);
    },
    [open]
  );
  const offer = useCallback(
    (file: File, table: TableFile) => {
      if ((table.sheets?.length ?? 0) > 1) {
        setPending({ kind: "sheet", file, table });
        return;
      }
      confirm(file, table);
    },
    [confirm]
  );
  const choose = async (sheet: string) => {
    if (pending?.kind !== "sheet") return;
    if (sheet === pending.table.sheet) {
      confirm(pending.file, pending.table);
      return;
    }
    setPending({ ...pending, busy: sheet });
    try {
      confirm(pending.file, await readTableFile(pending.file, { sheet }));
    } catch (error) {
      setPending({ ...pending, busy: undefined });
      onError(error instanceof Error ? error.message : String(error));
    }
  };
  const cancel = () => setPending(undefined);
  const prompt =
    pending?.kind === "sheet" ? (
      <SheetPicker
        fileName={pending.file.name}
        sheets={pending.table.sheets ?? []}
        suggested={pending.table.sheet}
        busy={pending.busy}
        floating={floating}
        onChoose={(sheet) => void choose(sheet)}
        onCancel={cancel}
      />
    ) : pending?.kind === "large" ? (
      <LargeTableNotice
        fileName={pending.file.name}
        rows={pending.table.rows.length}
        floating={floating}
        onOpen={() => {
          setPending(undefined);
          open(pending.table);
        }}
        onCancel={cancel}
      />
    ) : null;
  return { offer, prompt };
}
