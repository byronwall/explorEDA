import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Moon, Sun } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "exploreda-docs-theme";

type Theme = "light" | "dark";

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * The docs' light or dark theme: the reader's last choice, else the system's.
 * It marks the page root with `dark` while the docs are open, which is how
 * the workspace and its popovers learn the theme too, and puts the root back
 * as it was when the reader leaves.
 */
export function useDocsTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => storedTheme() ?? systemTheme()
  );

  // Before paint, so the page never flashes the other theme.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const before = root.classList.contains("dark");
    // Switch every color at once instead of fading each control's own way.
    root.classList.add("docs-theme-switching");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("docs-theme-switching"))
    );
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("docs-theme-switching");
      root.classList.toggle("dark", before);
      root.style.colorScheme = "";
    };
  }, [theme]);

  // Follow the system until the reader picks a theme here.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) {
      return;
    }
    const follow = () => {
      if (!storedTheme()) {
        setTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still holds for this visit.
    }
    setTheme(next);
  };

  return { theme, toggle };
}

/** Whether the page root is in the dark theme, following later changes. */
export function useRootIsDark() {
  const [dark, setDark] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const label =
    theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme";
  return (
    <ActionTooltip content={label}>
      <Button variant="ghost" size="icon" aria-label={label} onClick={onToggle}>
        {theme === "dark" ? (
          <Sun aria-hidden="true" />
        ) : (
          <Moon aria-hidden="true" />
        )}
      </Button>
    </ActionTooltip>
  );
}
