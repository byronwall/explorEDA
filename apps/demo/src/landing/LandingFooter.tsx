import { PACKAGE_README_URL, REPO_URL } from "./links";

const links = [
  { label: "GitHub", href: REPO_URL },
  { label: "npm", href: "https://www.npmjs.com/package/exploreda" },
  { label: "Package README", href: PACKAGE_README_URL },
];

export function LandingFooter() {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border py-8 text-sm text-muted-foreground">
      <p>
        <img
          src="/brand/wordmark.svg"
          alt="explorEDA"
          className="inline h-4 w-auto align-[-2px] dark:brightness-0 dark:invert"
        />{" "}
        · Linked charts for exploring data, in your browser, on your computer,
        or on your team's server
      </p>
      <nav aria-label="Project links" className="flex gap-5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-sm underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
