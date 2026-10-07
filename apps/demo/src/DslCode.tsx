import { useMemo } from "react";
import { highlightDsl } from "exploreda";

/**
 * Dashboard text drawn in color, one span per token. It renders the text
 * unchanged, so it can sit under a transparent text area and stay aligned.
 */
export function DslCode({ text }: { text: string }) {
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
