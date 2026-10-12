import { Link } from "react-router-dom";
import { BrandIcon } from "./BrandMark";
import { REPO_URL } from "./links";
import { EXAMPLES_PATH } from "../routes";

const navLinkClass =
  "rounded-md px-2.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal aria-[current=page]:text-white";

/** The site's top bar on the navy band: logo, then docs, examples, and code. */
export function SiteNav({ current }: { current?: "examples" }) {
  return (
    <nav
      aria-label="Site"
      className="flex items-center justify-between gap-4 pt-4 text-white"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        aria-label="explorEDA home"
      >
        <BrandIcon className="size-7 text-white" />
        <img
          src="/brand/wordmark.svg"
          alt=""
          className="h-6 w-auto brightness-0 invert"
        />
      </Link>
      <div className="flex items-center gap-1 text-sm">
        <Link className={navLinkClass} to="/docs">
          Docs
        </Link>
        <Link
          className={navLinkClass}
          to={EXAMPLES_PATH}
          aria-current={current === "examples" ? "page" : undefined}
        >
          Examples
        </Link>
        <Link className={`${navLinkClass} hidden sm:block`} to="/#integration">
          Embed
        </Link>
        <a className={navLinkClass} href={REPO_URL}>
          GitHub
        </a>
      </div>
    </nav>
  );
}
