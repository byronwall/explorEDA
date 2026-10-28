import { Link } from "react-router-dom";
import { BrandIcon } from "./BrandMark";
import { REPO_URL } from "./links";
import { docsPath } from "../docs/paths";
import { EXAMPLES_PATH } from "../routes";
import { ThemeToggle, useDocsTheme } from "../docs/components/theme";

const navLinkClass =
  "whitespace-nowrap rounded-md px-2 py-1.5 md:px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground";

/** The site's top bar: logo, then docs, examples, the daily collection, and code. */
export function SiteNav({ current }: { current?: "examples" | "daily" }) {
  // The docs' theme choice holds across the whole site.
  const { theme, toggle } = useDocsTheme();
  return (
    <nav
      aria-label="Site"
      className="flex items-center justify-between gap-4 pt-4"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="explorEDA home"
      >
        <BrandIcon className="size-7 text-site-ink" />
        <img
          src="/brand/wordmark.svg"
          alt=""
          className="hidden h-6 w-auto min-[420px]:block dark:brightness-0 dark:invert"
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
        <Link
          className={navLinkClass}
          to="/daily"
          aria-current={current === "daily" ? "page" : undefined}
        >
          Daily
        </Link>
        <Link
          className={`${navLinkClass} hidden sm:block`}
          to={docsPath("team-server")}
        >
          Self-host
        </Link>
        <Link className={`${navLinkClass} hidden sm:block`} to="/#integration">
          Embed
        </Link>
        <a className={`${navLinkClass} hidden sm:block`} href={REPO_URL}>
          GitHub
        </a>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </div>
    </nav>
  );
}
