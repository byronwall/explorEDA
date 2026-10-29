import MarkdownIt from "markdown-it";
import { memo, useLayoutEffect, useMemo, useRef, type MouseEvent } from "react";
import { findingFor } from "@/lib/notebook/findings";
import { useNotebookFindings } from "./NotebookFindings";

// Raw HTML in a notebook shows as text, and links can't run script, so a
// notebook from someone else can't run code in the page.
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

/** `{{name}}` in prose text shows that finding's live value. */
const VALUE_TOKEN = /\{\{\s*([A-Za-z_][\w-]*)\s*\}\}/g;
/** A link to `#finding:name` opens that finding's records. */
const RECORDS_LINK = /^#finding:([A-Za-z_][\w-]*)$/;

// Before text_join, so an escaped brace stays its own token and literal.
// Code spans and link destinations are not text tokens, so they stay too.
markdown.core.ruler.after("inline", "eda_findings", (state) => {
  for (const block of state.tokens) {
    if (block.type !== "inline" || !block.children) continue;
    block.children = block.children.flatMap((token) => {
      if (token.type !== "text" || !token.content.includes("{{"))
        return [token];
      const parts: (typeof token)[] = [];
      let at = 0;
      for (const match of token.content.matchAll(VALUE_TOKEN)) {
        if (match.index > at) {
          const text = new state.Token("text", "", 0);
          text.content = token.content.slice(at, match.index);
          parts.push(text);
        }
        const value = new state.Token("finding_value", "", 0);
        value.meta = { name: match[1] };
        parts.push(value);
        at = match.index + match[0].length;
      }
      if (!parts.length) return [token];
      if (at < token.content.length) {
        const text = new state.Token("text", "", 0);
        text.content = token.content.slice(at);
        parts.push(text);
      }
      return parts;
    });
  }
});

// The value fills in after render, so it changes without re-rendering the
// paragraph around it.
markdown.renderer.rules.finding_value = (tokens, index) => {
  const name = markdown.utils.escapeHtml(tokens[index]!.meta.name as string);
  return `<span class="eda-finding-value" data-finding="${name}">{{${name}}}</span>`;
};

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, index, options, _env, self) =>
    self.renderToken(tokens, index, options));
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index]!;
  const records = RECORDS_LINK.exec(token.attrGet("href") ?? "");
  if (records) {
    token.attrSet("data-finding-records", records[1]!);
    token.attrSet("class", "eda-finding-link");
  } else {
    // Links leave the notebook in a new tab, so the analysis stays open.
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noreferrer noopener");
  }
  return defaultLinkOpen(tokens, index, options, env, self);
};

/** A notebook's prose, rendered from its Markdown. */
export const NotebookProse = memo(function NotebookProse({
  text,
}: {
  text: string;
}) {
  // React sets innerHTML again whenever this object changes, which would
  // replace a focused link; keep one object per text.
  const html = useMemo(() => ({ __html: markdown.render(text) }), [text]);
  const ref = useRef<HTMLDivElement>(null);
  const findings = useNotebookFindings();
  const results = findings?.results;
  // Write each value into its own span, so a focused link or selected text
  // around it stays where it was.
  useLayoutEffect(() => {
    if (!results) return;
    for (const element of ref.current?.querySelectorAll<HTMLElement>(
      "[data-finding]"
    ) ?? []) {
      const result = findingFor(results, element.dataset.finding!);
      if (element.textContent !== result.text)
        element.textContent = result.text;
      if (result.unavailable) element.dataset.unavailable = result.unavailable;
      else delete element.dataset.unavailable;
    }
  }, [html, results]);
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLElement>(
      "[data-finding-records]"
    );
    if (!link || !findings) return;
    event.preventDefault();
    findings.openRecords(link.dataset.findingRecords!, link);
  };
  return (
    <div
      ref={ref}
      className="eda-notebook-prose"
      onClick={onClick}
      // markdown-it escapes raw HTML (html: false) and drops unsafe links.
      dangerouslySetInnerHTML={html}
    />
  );
});
