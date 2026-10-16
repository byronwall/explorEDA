import { Button } from "@/components/ui/button";
import { DslCode } from "@/DslCode";
import { Check, Copy } from "lucide-react";
import { Highlight, type PrismTheme, type Token } from "prism-react-renderer";
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

/** Languages Prism colors; anything else shows as plain text. */
const PRISM_LANGUAGES = new Set(["ts", "tsx", "js", "jsx", "json", "css"]);
const SHELL_LANGUAGES = new Set(["bash", "sh", "shell"]);

/** Prism leaves color to these classes, so code follows the docs' theme. */
const NO_THEME: PrismTheme = { plain: {}, styles: [] };

/**
 * Prism token types, drawn with the dashboard text colors so every code
 * sample in the docs reads alike.
 */
const TOKEN_KINDS: Record<string, string> = {
  keyword: "keyword",
  tag: "keyword",
  "class-name": "type",
  builtin: "type",
  function: "key",
  property: "key",
  "attr-name": "key",
  string: "string",
  "template-string": "string",
  "attr-value": "string",
  char: "string",
  number: "number",
  boolean: "constant",
  constant: "constant",
  comment: "comment",
  operator: "operator",
  punctuation: "operator",
};

function tokenKind(token: Token) {
  for (let index = token.types.length - 1; index >= 0; index -= 1) {
    const kind = TOKEN_KINDS[token.types[index]!];
    if (kind) {
      return kind;
    }
  }
  return null;
}

function PrismCode({ code, language }: { code: string; language: string }) {
  return (
    <Highlight code={code} language={language} theme={NO_THEME}>
      {({ tokens }) =>
        tokens.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 && "\n"}
            {line.map((token, index) => {
              // An empty line's one token holds a newline we already wrote.
              if (token.empty) {
                return null;
              }
              const kind = tokenKind(token);
              return kind ? (
                <span key={index} className={`eda-dsl-${kind}`}>
                  {token.content}
                </span>
              ) : (
                token.content
              );
            })}
          </span>
        ))
      }
    </Highlight>
  );
}

/** A shell command: the program, its flags, quoted text, and comments. */
function ShellCode({ code }: { code: string }) {
  return code.split("\n").map((line, lineIndex) => {
    const comment = line.indexOf("#");
    const command = comment >= 0 ? line.slice(0, comment) : line;
    let first = true;
    return (
      <span key={lineIndex}>
        {lineIndex > 0 && "\n"}
        {command.split(/(\s+|"[^"]*"|'[^']*')/).map((part, index) => {
          if (!part || /^\s+$/.test(part)) {
            return part;
          }
          const kind = first
            ? "keyword"
            : /^["']/.test(part)
              ? "string"
              : part.startsWith("-")
                ? "constant"
                : null;
          first = false;
          return kind ? (
            <span key={index} className={`eda-dsl-${kind}`}>
              {part}
            </span>
          ) : (
            part
          );
        })}
        {comment >= 0 && (
          <span className="eda-dsl-comment">{line.slice(comment)}</span>
        )}
      </span>
    );
  });
}

function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  if (language === "dashboard") {
    return <DslCode text={code} />;
  }
  if (language && PRISM_LANGUAGES.has(language)) {
    return <PrismCode code={code} language={language} />;
  }
  if (language && SHELL_LANGUAGES.has(language)) {
    return <ShellCode code={code} />;
  }
  return code;
}

/**
 * A framed block of code with a label and a copy button. Code is drawn in
 * the same colors the demo's dashboard text editor uses.
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
        <code>
          <HighlightedCode code={code} language={language} />
        </code>
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
