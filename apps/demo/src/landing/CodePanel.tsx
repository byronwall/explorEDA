import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "function",
  "return",
  "const",
  "type",
  "if",
  "useEffect",
  "useState",
]);

const TOKEN =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|((?<=^|[\s(])<\/?[A-Za-z][\w.]*|\/>)|([A-Za-z_$][\w$]*)/g;

// A small TSX highlighter for the landing snippets; not a general parser.
function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const [text, comment, string, tag, word] = match;
    const index = match.index ?? 0;
    if (index > last) {
      nodes.push(code.slice(last, index));
    }
    const className = comment
      ? "tok-comment"
      : string
        ? "tok-string"
        : tag
          ? "tok-tag"
          : word && KEYWORDS.has(word)
            ? "tok-keyword"
            : undefined;
    nodes.push(
      className ? (
        <span key={index} className={className}>
          {text}
        </span>
      ) : (
        text
      )
    );
    last = index + text.length;
  }
  nodes.push(code.slice(last));
  return nodes;
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-[var(--code-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--code-fg)_10%,transparent)] hover:text-[var(--code-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export interface CodeFile {
  name: string;
  code: string;
  note?: ReactNode;
}

export function CodePanel({ files }: { files: CodeFile[] }) {
  const [active, setActive] = useState(0);
  const file = files[active];
  if (!file) {
    return null;
  }
  const code = file.code.trimEnd();

  return (
    <div className="landing-code overflow-hidden rounded-xl border border-border shadow-xl">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3">
        <div role="tablist" aria-label="Example files" className="flex">
          {files.map((item, index) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={`relative px-3 py-3 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                index === active
                  ? "text-[var(--code-fg)]"
                  : "text-[var(--code-muted)] hover:text-[var(--code-fg)]"
              }`}
              onClick={() => setActive(index)}
            >
              {item.name}
              {index === active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--code-tag)]"
                />
              )}
            </button>
          ))}
        </div>
        <CopyButton text={code} label={file.name} />
      </div>
      <pre
        role="tabpanel"
        aria-label={file.name}
        className="max-h-[30rem] overflow-auto p-5 text-[12.5px] leading-relaxed"
      >
        <code>{highlight(code)}</code>
      </pre>
      {file.note && (
        <p className="border-t border-border/40 px-5 py-3 text-xs text-[var(--code-muted)]">
          {file.note}
        </p>
      )}
    </div>
  );
}

export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="landing-code inline-flex items-center gap-3 rounded-lg border border-border py-1.5 pl-4 pr-1.5 shadow-sm">
      <code className="font-mono text-sm">
        <span
          aria-hidden="true"
          className="select-none text-[var(--code-muted)]"
        >
          ${" "}
        </span>
        {command}
      </code>
      <CopyButton text={command} label="install command" />
    </div>
  );
}
