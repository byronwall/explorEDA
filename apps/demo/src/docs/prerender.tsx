import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router";
import { examples } from "../demos/examples";
import { ExamplesIndex } from "../examples/ExamplesIndex";
import { EXAMPLES_PATH } from "../routes";
import { DocsSite } from "./DocsSite";

export { catalogue } from "./catalogue";
export { examples };

/** The docs or examples page at `url` as static HTML, lazy parts loaded. */
export async function render(url: string) {
  const example = examples.find((item) => url === `/examples/${item.id}`);
  const errors: unknown[] = [];
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      {example ? (
        <main className="landing mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <a href={EXAMPLES_PATH}>All examples</a>
          <h1 className="mt-6 text-4xl font-bold">{example.title}</h1>
          <p className="mt-3 text-lg">{example.description}</p>
        </main>
      ) : url === EXAMPLES_PATH ? (
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
