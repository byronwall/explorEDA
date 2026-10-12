import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import type { Plugin } from "vite";

type Transform = (this: unknown, code: string, id: string) => unknown;

/**
 * Compiles docs pages from MDX. A `?raw` import keeps the page's source text,
 * which the docs search indexes; the MDX plugin drops the query before it
 * checks a file, so it would compile those too without this guard.
 */
export function docsMdx(): Plugin {
  const plugin = mdx({ remarkPlugins: [remarkGfm] }) as Plugin;
  const compile = plugin.transform as Transform;
  return {
    ...plugin,
    enforce: "pre",
    transform: function (code: string, id: string) {
      return /[?&]raw\b/.test(id) ? null : compile.call(this, code, id);
    } as Plugin["transform"],
  };
}
