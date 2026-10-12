import { Button } from "@/components/ui/button";
import { DslCode } from "@/DslCode";
import { Check, Copy } from "lucide-react";
import { isValidElement, useEffect, useState, type ReactNode } from "react";

/** Copies text, and says so for a moment. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => setCopied(true));
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  css: "CSS",
  dashboard: "Dashboard text",
  text: "Text",
};

/**
 * A framed block of code with a label and a copy button. Dashboard text is
 * drawn in the same colors the demo's editor uses.
 */
export function CodeFrame({
  code,
  language,
  label,
  busy,
}: {
  code: string;
  language?: string;
  label?: string;
  busy?: boolean;
}) {
  const heading =
    label ?? (language ? (LANGUAGE_LABELS[language] ?? language) : "Code");
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 py-1 pl-4 pr-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {heading}
        </span>
        {!busy && <CopyButton text={code} />}
      </div>
      <pre
        aria-busy={busy}
        className="max-h-[32rem] overflow-auto p-4 font-mono text-[0.8rem] leading-6 text-foreground [scrollbar-width:thin]"
      >
        <code>{language === "dashboard" ? <DslCode text={code} /> : code}</code>
      </pre>
    </div>
  );
}

/** A fenced code block in Markdown. */
export function CodeBlock({ children }: { children?: ReactNode }) {
  const code = isValidElement<{ className?: string; children?: ReactNode }>(
    children
  )
    ? children
    : null;
  const language = /language-([\w-]+)/.exec(code?.props.className ?? "")?.[1];
  const text = String(code?.props.children ?? "").replace(/\n$/, "");
  return <CodeFrame code={text} language={language} />;
}
