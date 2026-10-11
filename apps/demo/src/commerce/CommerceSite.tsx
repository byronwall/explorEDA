import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { LandingFooter } from "../landing/LandingFooter";
import { LegalPage } from "./LegalPage";
import { LicensePage } from "./LicensePage";
import { COMMERCE_PAGES, type CommercePath } from "./paths";
import { PricingPage } from "./PricingPage";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground ${
    isActive ? "text-foreground" : "text-muted-foreground"
  }`;

/** Pricing, license, and legal pages, with their own small header. */
export function CommerceSite({ path }: { path: CommercePath }) {
  useEffect(() => {
    document.title = COMMERCE_PAGES[path];
    // A page reached from a section link opens at that section.
    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <nav
        aria-label="Site"
        className="flex items-center justify-between gap-4 border-b border-border pb-3 pt-3"
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="explorEDA home"
        >
          <img src="/brand/icon.svg" alt="" className="size-7" />
          <img src="/brand/wordmark.svg" alt="" className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <NavLink className={navClass} to="/docs">
            Docs
          </NavLink>
          <NavLink className={navClass} to="/pricing">
            Pricing
          </NavLink>
          <NavLink className={navClass} to="/license">
            License
          </NavLink>
        </div>
      </nav>
      {path === "/pricing" ? (
        <PricingPage />
      ) : path === "/license" ? (
        <LicensePage />
      ) : (
        <LegalPage path={path} />
      )}
      <LandingFooter />
    </div>
  );
}
