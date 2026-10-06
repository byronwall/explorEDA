import { useDeferredValue, useMemo, useRef, type UIEvent } from "react";
import { AlertTriangle, CircleX, Copy } from "lucide-react";
import {
  describeDslSource,
  DSL_REFERENCE,
  formatDslDiagnostics,
  type DslCompileResult,
  type DslDiagnostic,
} from "exploreda";
import { toast } from "sonner";
import {
  compileDashboardText,
  describeResult,
  type AppliedText,
} from "./dashboardText";
import type { DatumObject } from "./LandingPage";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
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
  const fields = useMemo(() => describeDslSource(rows), [rows]);
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
        <ActionTooltip content="Copy every problem with its line and fix, as plain text for an agent or a note">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={!result}
            onClick={() => {
              if (result) {
                void navigator.clipboard
                  .writeText(formatDslDiagnostics(result, "dashboard.eda"))
                  .then(() => toast.success("Copied the check report"));
              }
            }}
          >
            <Copy aria-hidden="true" />
            Copy report
          </Button>
        </ActionTooltip>
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
      <details className="min-w-0 text-xs">
        <summary className="cursor-pointer font-semibold">
          Fields and syntax
        </summary>
        <p className="mt-2 text-muted-foreground">
          Write against these fields by name, or alias them, such as{" "}
          <code>rev:num=Revenue</code>.
        </p>
        <pre className="mt-1 overflow-x-auto rounded-md bg-muted/50 p-2 font-mono leading-5">
          {fields
            .map(
              (field) =>
                `${field.name}  ${field.type}  ${field.sample}${field.missing ? `  (${field.missing} missing)` : ""}`
            )
            .join("\n")}
        </pre>
        <pre className="mt-2 overflow-x-auto rounded-md bg-muted/50 p-2 font-mono leading-5">
          {DSL_REFERENCE}
        </pre>
      </details>
    </div>
  );
}
