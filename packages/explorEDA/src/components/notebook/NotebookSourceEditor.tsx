import { useEffect, useMemo, useRef, useState } from "react";
import { highlightDsl } from "@/lib/dsl";

/** How long typing pauses before the notebook takes the new text. */
const SETTLE_MS = 300;

/** Dashboard text in color, one span per token, laid out exactly as typed. */
function HighlightedDsl({ text }: { text: string }) {
  const lines = useMemo(() => highlightDsl(text), [text]);
  return lines.map((tokens, line) => (
    <span key={line}>
      {line > 0 && "\n"}
      {tokens.map((token, index) =>
        token.kind === "space" || token.kind === "text" ? (
          token.text
        ) : (
          <span key={index} className={`eda-dsl-${token.kind}`}>
            {token.text}
          </span>
        )
      )}
    </span>
  ));
}

/**
 * A whole notebook in color: the dashboard text inside `eda` fences, and
 * Markdown headings, laid out exactly as typed.
 */
function HighlightedNotebook({ text }: { text: string }) {
  const parts: { eda: boolean; lines: string[] }[] = [];
  let fenced = false;
  for (const line of text.split("\n")) {
    const fence = /^\s*(```|~~~)/.test(line);
    // The fence lines themselves read as prose; the text between is eda.
    const eda = fenced && !fence;
    const last = parts[parts.length - 1];
    if (last && last.eda === eda) last.lines.push(line);
    else parts.push({ eda, lines: [line] });
    if (fence) fenced = !fenced;
  }
  return parts.map((part, index) => (
    <span key={index}>
      {index > 0 && "\n"}
      {part.eda ? (
        <HighlightedDsl text={part.lines.join("\n")} />
      ) : (
        part.lines.map((line, at) => (
          <span
            key={at}
            className={
              /^#{1,6}\s/.test(line)
                ? "eda-md-heading"
                : /^\s*(```|~~~)/.test(line)
                  ? "eda-md-fence"
                  : undefined
            }
          >
            {at > 0 && "\n"}
            {line}
          </span>
        ))
      )}
    </span>
  ));
}

/**
 * The text of one notebook segment, edited in place: an `eda` block's
 * dashboard text in color, or prose as Markdown. The editor keeps its own
 * draft and hands it on once typing pauses, so each key press doesn't
 * rebuild every chart.
 */
export function NotebookSourceEditor({
  value,
  onChange,
  language,
  label,
}: {
  value: string;
  onChange: (text: string) => void;
  /** `notebook` is a whole notebook: Markdown with colored `eda` blocks. */
  language: "eda" | "markdown" | "notebook";
  label: string;
}) {
  const [draft, setDraft] = useState(value);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const colors = useRef<HTMLPreElement>(null);
  const latest = useRef({ draft, onChange });
  latest.current = { draft, onChange };

  // Take outside changes, such as a chart edit written back, unless the
  // person is still typing here.
  useEffect(() => {
    if (pending.current === undefined) {
      setDraft(value);
    }
  }, [value]);

  // A draft still waiting is handed on when the editor closes.
  useEffect(
    () => () => {
      if (pending.current !== undefined) {
        clearTimeout(pending.current);
        latest.current.onChange(latest.current.draft);
      }
    },
    []
  );

  const change = (next: string) => {
    setDraft(next);
    if (pending.current !== undefined) {
      clearTimeout(pending.current);
    }
    pending.current = setTimeout(() => {
      pending.current = undefined;
      // The segment may have moved since the key press; use the latest.
      latest.current.onChange(next);
    }, SETTLE_MS);
  };

  const rows = Math.max(2, draft.split("\n").length);
  return (
    <div className="eda-notebook-source" data-language={language}>
      {language !== "markdown" && (
        <pre
          ref={colors}
          aria-hidden="true"
          className="eda-notebook-source-colors"
        >
          {language === "eda" ? (
            <HighlightedDsl text={draft} />
          ) : (
            <HighlightedNotebook text={draft} />
          )}
          {"\n"}
        </pre>
      )}
      <textarea
        aria-label={label}
        className={
          language === "markdown"
            ? "eda-notebook-source-input"
            : "eda-notebook-source-input eda-dsl-input"
        }
        value={draft}
        rows={rows}
        spellCheck={language === "markdown"}
        data-language={language}
        autoCapitalize="off"
        autoCorrect="off"
        wrap={language === "eda" ? "off" : "soft"}
        onChange={(event) => change(event.target.value)}
        // Long lines scroll sideways; the colored copy follows.
        onScroll={(event) => {
          if (colors.current) {
            colors.current.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
      />
    </div>
  );
}
