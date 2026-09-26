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
        <span className="font-semibold text-foreground">explorEDA</span> · A
        React workspace for exploratory data analysis
      </p>
      <nav aria-label="Project links" className="flex gap-5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
