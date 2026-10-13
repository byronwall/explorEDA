import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { EXAMPLES_PATH } from "@/routes";
import { cn } from "@/lib/utils";
import { BookOpen, Menu, Search, X } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { catalogue, GROUP_LABELS, type DocsGroup } from "../catalogue";
import { BrandIcon } from "../../landing/BrandMark";
import { docsPath } from "../paths";
import { SearchButton, SearchProvider, useOpenSearch } from "./search";
import { ThemeToggle, useDocsTheme } from "./theme";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The page list, grouped by section. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const groups = (Object.keys(GROUP_LABELS) as DocsGroup[]).map((group) => ({
    group,
    pages: catalogue.filter((page) => page.group === group),
  }));

  return (
    <div className="space-y-6">
      <nav aria-label="Docs pages" className="space-y-6">
        {groups.map(({ group, pages }) => (
          <div key={group}>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
              {GROUP_LABELS[group]}
            </p>
            <ul className="mt-2 space-y-0.5">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <li key={page.topic}>
                    <NavLink
                      to={docsPath(page.topic)}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                          focusRing,
                          isActive
                            ? "bg-docs-accent/10 font-medium text-docs-accent"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )
                      }
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70 group-aria-[current=page]:opacity-100"
                      />
                      {page.title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

/** The sidebar as a sheet over the page, for screens without room for it. */
function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    panel.current
      ?.querySelector<HTMLElement>('[aria-current="page"], nav a')
      ?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Docs pages"
        className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-border bg-background shadow-xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold">Docs</span>
          <ActionTooltip content="Close the page list">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close the page list"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </Button>
          </ActionTooltip>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav onNavigate={onClose} />
        </div>
        <nav
          aria-label="Site"
          className="flex shrink-0 gap-1 border-t border-border px-3 py-2 sm:hidden"
        >
          <Button asChild variant="ghost" size="sm">
            <Link to={EXAMPLES_PATH} onClick={onClose}>
              Examples
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="https://github.com/byronwall/explorEDA">GitHub</a>
          </Button>
        </nav>
      </div>
    </div>
  );
}

function DocsHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { theme, toggle } = useDocsTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-[92rem] items-center gap-3 px-4 lg:px-6">
        <ActionTooltip content="Show every docs page">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 lg:hidden"
            aria-label="Show every docs page"
            onClick={onOpenNav}
          >
            <Menu aria-hidden="true" />
          </Button>
        </ActionTooltip>
        <Link
          to="/"
          aria-label="explorEDA home"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-md",
            focusRing
          )}
        >
          <BrandIcon className="size-6 text-brand-navy dark:text-white" />
          <img
            src="/brand/wordmark.svg"
            alt=""
            className="hidden h-5 w-auto sm:block dark:brightness-0 dark:invert"
          />
        </Link>
        <span aria-hidden="true" className="h-5 w-px bg-border" />
        <Link
          to={docsPath()}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold",
            focusRing
          )}
        >
          <BookOpen aria-hidden="true" className="size-4 text-docs-accent" />
          Docs
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-1 md:ml-6 md:flex-1">
          <SearchButton className="hidden w-full max-w-sm md:flex" />
          <SearchIconButton />
          <nav aria-label="Site" className="ml-auto flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to={EXAMPLES_PATH}>Examples</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <a href="https://github.com/byronwall/explorEDA">GitHub</a>
            </Button>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </div>
    </header>
  );
}

/** Search as an icon, for screens too narrow for the search field. */
function SearchIconButton() {
  const open = useOpenSearch();
  return (
    <ActionTooltip content="Search the docs">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Search the docs"
        onClick={open}
      >
        <Search aria-hidden="true" />
      </Button>
    </ActionTooltip>
  );
}

const RailContext = createContext<HTMLElement | null>(null);

/**
 * Puts a page's right-rail content in the frame's rail. The frame stays
 * mounted across pages, so the sidebar keeps its scroll position.
 */
export function Rail({ children }: { children: ReactNode }) {
  const target = useContext(RailContext);
  return target ? createPortal(children, target) : null;
}

/**
 * The docs frame: a header, the page list on the left, the page in the
 * middle, and, with `withRail`, a rail on the right that pages fill with
 * `<Rail>`.
 */
export function DocsLayout({
  children,
  withRail = false,
}: {
  children: ReactNode;
  withRail?: boolean;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [rail, setRail] = useState<HTMLElement | null>(null);
  const { pathname } = useLocation();
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="landing docs-root min-h-screen bg-background text-foreground">
      <SearchProvider>
        <DocsHeader onOpenNav={() => setNavOpen(true)} />
        <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
        <div
          className={cn(
            "mx-auto max-w-[92rem] px-4 lg:grid lg:gap-10 lg:px-6",
            withRail
              ? "lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)_13.5rem]"
              : "lg:grid-cols-[15.5rem_minmax(0,1fr)]"
          )}
        >
          <aside className="hidden lg:block">
            <div className="sticky top-14 -ml-2 h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain py-6 pl-2 pr-3 [scrollbar-width:thin]">
              <SidebarNav />
            </div>
          </aside>
          <RailContext.Provider value={withRail ? rail : null}>
            <main className="min-w-0 pb-24">{children}</main>
          </RailContext.Provider>
          {withRail && (
            <aside className="hidden xl:block">
              <div
                ref={setRail}
                className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 [scrollbar-width:thin]"
              />
            </aside>
          )}
        </div>
      </SearchProvider>
    </div>
  );
}
