import { useEffect, useState, type RefObject } from "react";

interface Section {
  id: string;
  text: string;
}

/** Below the sticky gap at the top, the heading that was passed last is the one being read. */
const READING_LINE = 120;

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * The notebook's section headings, read from the rendered page once it
 * settles. Each gets an id, so a section can be linked and the outline
 * can jump to it.
 */
function useSections(root: RefObject<HTMLElement | null>) {
  const [sections, setSections] = useState<Section[]>([]);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const read = () => {
      const headings = [
        ...host.querySelectorAll<HTMLHeadingElement>(".eda-notebook-prose h2"),
      ];
      const next = headings.map((heading) => {
        const text = heading.textContent?.trim() ?? "";
        if (!heading.id) heading.id = slug(text);
        heading.style.scrollMarginTop = "24px";
        return { id: heading.id, text };
      });
      setSections((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root]);
  return sections;
}

function useCurrent(sections: Section[]) {
  const [current, setCurrent] = useState<string>();
  useEffect(() => {
    if (!sections.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let passed = sections[0]!.id;
      for (const { id } of sections) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= READING_LINE) passed = id;
      }
      setCurrent(passed);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);
  return current;
}

/**
 * A contents rail in the left margin on wide screens: every section of the
 * notebook, with the one being read marked, plus the data and downloads.
 */
export function NotebookOutline({
  root,
}: {
  root: RefObject<HTMLElement | null>;
}) {
  const sections = useSections(root);
  const current = useCurrent(sections);
  if (sections.length < 2) return null;
  return (
    <nav
      aria-label="Sections"
      className="absolute inset-y-0 left-6 hidden w-40 xl:block 2xl:w-48"
    >
      <ol className="sticky top-6 space-y-1.5 text-[13px] leading-snug">
        {sections.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={current === id ? "location" : undefined}
              className={`block transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                current === id
                  ? "font-medium text-site-ink"
                  : "text-muted-foreground"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
        <li className="pt-2">
          <a
            href="#data"
            className="text-site-accent transition-colors duration-150 hover:text-foreground"
          >
            Data and downloads
          </a>
        </li>
      </ol>
    </nav>
  );
}
