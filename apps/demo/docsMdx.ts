import type { Plugin } from "vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";

/**
 * Docs pages are MDX. `?raw` imports (the legal pages) keep their Markdown
 * source; the MDX plugin drops the query before filtering, so skip it here.
 */
export function docsMdx(): Plugin {
  const plugin = mdx({ remarkPlugins: [remarkGfm] });
  const transform = plugin.transform as (
    code: string,
    id: string
  ) => ReturnType<Extract<Plugin["transform"], (...args: never[]) => unknown>>;
  return {
    ...plugin,
    transform(code, id) {
      return /[?&]raw(&|$)/.test(id) ? undefined : transform(code, id);
    },
  } as Plugin;
}
