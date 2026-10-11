import license from "../../../../LICENSE?raw";
import commercialLicense from "../../../../docs/legal/commercial-license.md?raw";
import terms from "../../../../docs/legal/terms-of-sale.md?raw";
import refunds from "../../../../docs/legal/refund-policy.md?raw";
import privacy from "../../../../docs/legal/privacy-policy.md?raw";
import security from "../../../../SECURITY.md?raw";
import support from "../../../../SUPPORT.md?raw";
import { Markdown } from "./Markdown";
import type { CommercePath } from "./paths";

/** Each page's source is the repository file, so the site and repo agree. */
const SOURCES: Partial<Record<CommercePath, string>> = {
  "/legal/commercial-license": commercialLicense,
  "/legal/terms": terms,
  "/legal/refunds": refunds,
  "/legal/privacy": privacy,
  "/security": security,
  "/support": support,
};

export function LegalPage({ path }: { path: CommercePath }) {
  if (path === "/legal/license") {
    return (
      <article className="max-w-3xl pb-16 pt-10">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">
          explorEDA License
        </h1>
        <p className="mt-3 text-muted-foreground">
          The license in the repository and the npm package.
        </p>
        <pre className="mt-8 whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/30 p-5 font-mono text-sm leading-6">
          {license}
        </pre>
      </article>
    );
  }
  const source = SOURCES[path];
  return (
    <article className="max-w-3xl pb-16 pt-10">
      {source && <Markdown source={source} />}
    </article>
  );
}
