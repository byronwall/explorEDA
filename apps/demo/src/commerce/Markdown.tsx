import { marked } from "marked";
import { useMemo } from "react";
import { REPO_URL } from "../landing/links";

/** Repository file links in the legal documents, mapped to site pages. */
const LINKS: Record<string, string> = {
  "commercial-license.md": "/legal/commercial-license",
  "terms-of-sale.md": "/legal/terms",
  "refund-policy.md": "/legal/refunds",
  "privacy-policy.md": "/legal/privacy",
  "../../LICENSE": "/legal/license",
  LICENSE: "/legal/license",
  "SUPPORT.md": "/support",
  "SECURITY.md": "/security",
};

function siteHref(href: string): string {
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
  return (
    LINKS[href] ?? `${REPO_URL}/blob/main/${href.replace(/^(\.\.\/)+/, "")}`
  );
}

/** Drops YAML front matter and HTML comments, which are notes for editors. */
function clean(source: string): string {
  return source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/<!--[\s\S]*?-->\n?/g, "");
}

/**
 * Renders one of the repository's own Markdown documents. The text is part
 * of the build, not user input.
 */
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => {
    const renderer = new marked.Renderer();
    const link = renderer.link.bind(renderer);
    renderer.link = (token) => link({ ...token, href: siteHref(token.href) });
    return marked.parse(clean(source), { async: false, renderer }) as string;
  }, [source]);
  return (
    <div
      className="legal-prose"
      // eslint-disable-next-line react/no-danger -- repository Markdown rendered at build time
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
