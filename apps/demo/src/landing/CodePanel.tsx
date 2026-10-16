import { Check, Copy } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { useState, type ReactNode } from "react";

export function CopyButton({
  text,
  label,
  className = "text-muted-foreground hover:bg-muted hover:text-foreground",
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
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

function HighlightedCode({ code }: { code: string }) {
  return (
    <Highlight code={code} language="tsx" theme={themes.github}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <code>
          {tokens.map((line, lineIndex) => (
            <div key={lineIndex} {...getLineProps({ line })}>
              {line.map((token, tokenIndex) => (
                <span key={tokenIndex} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </code>
      )}
    </Highlight>
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3">
        <div role="tablist" aria-label="Example files" className="flex">
          {files.map((item, index) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={`relative px-3 py-3 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                index === active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActive(index)}
            >
              {item.name}
              {index === active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-site-accent"
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
        className="h-[28rem] overflow-auto whitespace-pre-wrap break-words bg-card p-4 text-xs leading-relaxed [scrollbar-width:thin] sm:p-5 sm:text-[13px]"
      >
        <HighlightedCode code={code} />
      </pre>
      {file.note && (
        <p className="border-t border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          {file.note}
        </p>
      )}
    </div>
  );
}

export function InstallCommand({
  command,
  label = "install command",
  tone = "light",
}: {
  command: string;
  /** What the copy button says it copies. */
  label?: string;
  /** "dark" sits on the navy hero band. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={
        dark
          ? "inline-flex items-center justify-between gap-3 rounded-lg border border-band-border bg-white/5 py-1.5 pl-4 pr-1.5"
          : "inline-flex items-center justify-between gap-3 rounded-lg border border-border bg-card py-1.5 pl-4 pr-1.5 shadow-sm"
      }
    >
      <code className="font-mono text-sm">
        <span
          aria-hidden="true"
          className={`select-none ${dark ? "text-brand-teal" : "text-muted-foreground"}`}
        >
          ${" "}
        </span>
        {command}
      </code>
      <CopyButton
        text={command}
        label={label}
        className={
          dark ? "text-white/70 hover:bg-white/10 hover:text-white" : undefined
        }
      />
    </div>
  );
}
