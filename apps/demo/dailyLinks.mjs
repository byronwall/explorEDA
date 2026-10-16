// Shared by the build plugin and the browser: no Node imports here.
export const SITE = "https://exploreda.dev";
export const CORPUS_URL = "/daily-viz";

/** Relative links in a corpus file, rewritten to site URLs. */
export function corpusLinks(text, file) {
  return text.replace(/\]\(([^)]+)\)/g, (match, href) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) return match;
    const target = new URL(href, `${SITE}${CORPUS_URL}/${file}`);
    return `](${target.pathname}${target.hash})`;
  });
}
