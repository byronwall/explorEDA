import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { EXAMPLES_PATH } from "@/routes";
import { cn } from "@/lib/utils";
import { BookOpen, Menu, Search, X } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  catalogue,
  GROUP_LABELS,
  type DocsGroup,
  type DocsPage,
} from "../catalogue";
import { docsPath } from "../paths";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Pages whose title, summary, or highlights contain every word typed. */
function matches(page: DocsPage, query: string) {
  const text = [page.title, page.summary, ...page.highlights]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

/** The page list, grouped by section, with a filter box above it. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const groups = useMemo(
    () =>
      (Object.keys(GROUP_LABELS) as DocsGroup[])
        .map((group) => ({
          group,
          pages: catalogue.filter(
            (page) => page.group === group && matches(page, query)
          ),
        }))
        .filter(({ pages }) => pages.length > 0),
    [query]
  );

  // "/" jumps to the filter, as on most docs sites.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        target?.closest("input, textarea, select, [contenteditable=true]")
      ) {
        return;
      }
      if (!input.current?.offsetParent) {
        return;
      }
      event.preventDefault();
      input.current.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Filter pages
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={input}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
            }
          }}
          placeholder="Filter pages"
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 font-mono text-[0.7rem] text-muted-foreground"
        >
          /
        </kbd>
      </div>
      <nav aria-label="Docs pages" className="space-y-6">
        {groups.length === 0 && (
          <p className="px-2 text-sm text-muted-foreground">
            No page matches “{query}”.
          </p>
        )}
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
                            ? "bg-primary/10 font-medium text-primary"
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
    panel.current?.querySelector<HTMLElement>("input")?.focus();
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
      </div>
    </div>
  );
}

function DocsHeader({ onOpenNav }: { onOpenNav: () => void }) {
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
          <img src="/brand/icon.svg" alt="" className="size-6" />
          <img
            src="/brand/wordmark.svg"
            alt=""
            className="hidden h-5 w-auto sm:block"
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
          <BookOpen aria-hidden="true" className="size-4 text-primary" />
          Docs
        </Link>
        <nav aria-label="Site" className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to={EXAMPLES_PATH}>Examples</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="https://github.com/byronwall/explorEDA">GitHub</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

/**
 * The docs frame: a header, the page list on the left, the page in the
 * middle, and an optional rail on the right for its contents.
 */
export function DocsLayout({
  children,
  rail,
}: {
  children: ReactNode;
  rail?: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="landing min-h-screen bg-background">
      <DocsHeader onOpenNav={() => setNavOpen(true)} />
      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <div
        className={cn(
          "mx-auto max-w-[92rem] px-4 lg:grid lg:gap-10 lg:px-6",
          rail
            ? "lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)_13.5rem]"
            : "lg:grid-cols-[15.5rem_minmax(0,1fr)]"
        )}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-14 -ml-2 h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain py-6 pl-2 pr-3 [scrollbar-width:thin]">
            <SidebarNav />
          </div>
        </aside>
        <main className="min-w-0 pb-24">{children}</main>
        {rail && (
          <aside className="hidden xl:block">
            <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 [scrollbar-width:thin]">
              {rail}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
