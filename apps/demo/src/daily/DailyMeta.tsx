import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Keeps metadata in step with client navigation and restores the host page on exit. */
export function DailyMeta({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const previousTitle = document.title;
    const pageUrl = `https://exploreda.dev${pathname}`;
    const restore: Array<() => void> = [];
    for (const [attribute, key, value] of [
      ["name", "description", description],
      ["property", "og:title", heading],
      ["property", "og:description", description],
      ["property", "og:url", pageUrl],
    ]) {
      const existing = document.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`
      );
      const tag = existing ?? document.createElement("meta");
      const previous = tag.content;
      tag.setAttribute(attribute!, key!);
      tag.content = value!;
      if (!existing) document.head.append(tag);
      restore.push(() => {
        if (existing) tag.content = previous;
        else tag.remove();
      });
    }
    const existingLink = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    const link = existingLink ?? document.createElement("link");
    const previousUrl = link.href;
    link.rel = "canonical";
    link.href = pageUrl;
    if (!existingLink) document.head.append(link);
    document.title = `${heading} · explorEDA`;
    return () => {
      document.title = previousTitle;
      restore.forEach((reset) => reset());
      if (existingLink) link.href = previousUrl;
      else link.remove();
    };
  }, [heading, description, pathname]);
  return null;
}
