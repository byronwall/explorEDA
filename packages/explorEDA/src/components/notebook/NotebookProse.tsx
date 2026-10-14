import MarkdownIt from "markdown-it";
import { memo, useMemo } from "react";

// Raw HTML in a notebook shows as text, and links can't run script, so a
// notebook from someone else can't run code in the page.
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, index, options, _env, self) =>
    self.renderToken(tokens, index, options));
// Links leave the notebook in a new tab, so the analysis stays open.
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index]!.attrSet("target", "_blank");
  tokens[index]!.attrSet("rel", "noreferrer noopener");
  return defaultLinkOpen(tokens, index, options, env, self);
};

/** A notebook's prose, rendered from its Markdown. */
export const NotebookProse = memo(function NotebookProse({
  text,
}: {
  text: string;
}) {
  const html = useMemo(() => markdown.render(text), [text]);
  return (
    <div
      className="eda-notebook-prose"
      // markdown-it escapes raw HTML (html: false) and drops unsafe links.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
