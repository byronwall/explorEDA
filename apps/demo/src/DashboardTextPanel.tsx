import { useDeferredValue, useMemo, useRef, type UIEvent } from "react";
import { AlertTriangle, CircleX } from "lucide-react";
import type { DslCompileResult, DslDiagnostic } from "exploreda";
import {
  compileDashboardText,
  describeResult,
  type AppliedText,
} from "./dashboardText";
import type { DatumObject } from "./LandingPage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLACEHOLDER = `# Paste or write a dashboard. One chart per line.
scatter x=Revenue y=Margin color=Category
hist Revenue bins=24
row Category
table Revenue,Margin,Category`;

function DiagnosticItem({
  item,
  onShow,
}: {
  item: DslDiagnostic;
  onShow: (item: DslDiagnostic) => void;
}) {
  const Icon = item.severity === "error" ? CircleX : AlertTriangle;
  return (
    <li>
      <button
        type="button"
        className="flex w-full min-w-0 gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => onShow(item)}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "mt-0.5 size-3.5 shrink-0",
            item.severity === "error"
              ? "text-destructive"
              : "text-[var(--warning)]"
          )}
        />
        <span className="min-w-0">
          <span className="font-medium tabular-nums">Line {item.line}</span>
          <span className="sr-only">
            {item.severity === "error" ? " error" : " warning"}
          </span>{" "}
          <span>{item.message}</span>
          {item.suggestion && (
            <span className="block text-muted-foreground">
              {item.suggestion}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

/**
 * A text editor that builds the current view from dashboard text. It checks
 * as you type; Apply replaces the view, and Undo brings the old one back.
 */
export function DashboardTextPanel({
  text,
  onTextChange,
  rows,
  applied,
  onApply,
}: {
  text: string;
  onTextChange: (text: string) => void;
  rows: DatumObject[];
  applied?: AppliedText;
  onApply: (result: DslCompileResult) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const deferred = useDeferredValue(text);
  const result = useMemo(
    () => (deferred.trim() ? compileDashboardText(deferred, rows) : undefined),
    [deferred, rows]
  );
  const lineCount = Math.max(text.split("\n").length, 6);
  const errorLines = new Set(
    result?.diagnostics
      .filter((item) => item.severity === "error")
      .map((item) => item.line)
  );
  const warningLines = new Set(result?.diagnostics.map((item) => item.line));
  const showingApplied = applied && applied.text === text;
  const nothingBuilt = result && result.charts.length === 0;

  const show = (item: DslDiagnostic) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const lines = text.split("\n");
    const start =
      lines
        .slice(0, item.line - 1)
        .reduce((sum, line) => sum + line.length + 1, 0) +
      item.column -
      1;
    textarea.focus();
    textarea.setSelectionRange(start, start + Math.max(item.length, 1));
  };

  const syncGutter = (event: UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-3 p-3">
      <p className="text-xs text-muted-foreground">
        Describe the whole view, one chart per line. Apply replaces this view
        with what the text describes; Undo brings the old view back.
      </p>
      <div className="flex min-h-[14rem] overflow-hidden rounded-md border border-input bg-background font-mono text-xs leading-5 focus-within:ring-2 focus-within:ring-ring">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="shrink-0 overflow-hidden border-r border-border bg-muted/50 py-2 text-right text-muted-foreground select-none"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div
              key={index}
              className={cn(
                "px-2 tabular-nums",
                errorLines.has(index + 1)
                  ? "text-destructive font-semibold"
                  : warningLines.has(index + 1) && "text-[var(--warning)]"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          aria-label="Dashboard text editor"
          className="min-h-[14rem] flex-1 resize-y whitespace-pre bg-transparent px-2 py-2 outline-none"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          rows={Math.min(Math.max(lineCount, 10), 24)}
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onScroll={syncGutter}
        />
      </div>
      <div role="status" className="text-xs">
        {!result ? (
          <span className="text-muted-foreground">
            Paste dashboard text to check it.
          </span>
        ) : nothingBuilt ? (
          <span className="font-medium text-destructive">
            Nothing can be built yet. Fix the problems below, then apply.
          </span>
        ) : showingApplied ? (
          <span>
            <span className="font-medium">Applied:</span>{" "}
            {describeResult(result)}
            {result.complete ? "" : ". The view shows what could be built."}
          </span>
        ) : (
          <span>
            <span className="font-medium">
              {result.complete ? "Ready:" : "Ready with problems:"}
            </span>{" "}
            {describeResult(result)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={!result || nothingBuilt || showingApplied}
          onClick={() => result && onApply(result)}
        >
          Apply to this view
        </Button>
      </div>
      {result && result.diagnostics.length > 0 && (
        <section aria-label="Problems" className="min-w-0">
          <h3 className="mb-1 text-xs font-semibold">
            Problems{" "}
            <span className="font-normal text-muted-foreground tabular-nums">
              {result.diagnostics.length}
            </span>
          </h3>
          <ul className="flex flex-col">
            {result.diagnostics.map((item, index) => (
              <DiagnosticItem key={index} item={item} onShow={show} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
