import { useEffect } from "react";

/** The title in `index.html`, for pages that set none. */
const SITE_TITLE = "explorEDA · Embeddable React analysis workspace";

/**
 * Shows `title` in the tab while the page is open. Prerendered pages ship
 * with it already; this keeps it right as the app moves between pages.
 */
export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) {
      return;
    }
    document.title = `${title} · explorEDA`;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [title]);
}
