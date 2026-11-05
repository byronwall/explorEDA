import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router";
import { ExamplesIndex } from "../examples/ExamplesIndex";
import { EXAMPLES_PATH } from "../routes";
import { DocsSite } from "./DocsSite";

export { catalogue } from "./catalogue";

/** The docs or examples page at `url` as static HTML, lazy parts loaded. */
export async function render(url: string) {
  const errors: unknown[] = [];
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      {url === EXAMPLES_PATH ? (
        <div className="landing mx-auto w-full max-w-6xl">
          <ExamplesIndex />
        </div>
      ) : (
        <DocsSite />
      )}
    </StaticRouter>,
    { onError: (error) => void errors.push(error) }
  );
  if (errors.length) {
    throw new Error(`Could not prerender ${url}`, { cause: errors[0] });
  }
  let html = "";
  for await (const chunk of prelude) {
    html += chunk;
  }
  // React preloads every screenshot; let the browser fetch them as it scrolls.
  return html.replace(/<link rel="preload" as="image"[^>]*\/>/g, "");
}
