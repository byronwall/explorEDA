import { cn } from "@/lib/utils";
import {
  CircleAlert,
  Info,
  Lightbulb,
  Link2,
  type LucideIcon,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { docsPath, slugify } from "../paths";
import { inlineLinkClass, proseClass } from "./chrome";
import { CodeBlock } from "./code";
import { WorkedOrder } from "./workedOrder";
import {
  DashboardTextReference,
  ExampleText,
  PropsReference,
} from "../reference/generated";
import { LiveExample } from "../live/LiveExample";
import { SettingsReference } from "../reference/SettingsReference";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

/** A link to another docs page by topic. */
export function DocsLink({
  topic,
  children,
}: {
  topic: string;
  children: ReactNode;
}) {
  return (
    <Link className={inlineLinkClass} to={docsPath(topic)}>
      {children}
    </Link>
  );
}

/** A section heading with a link to itself that shows on hover. */
function Heading({ level, children }: { level: 2 | 3; children?: ReactNode }) {
  const text = textOf(children);
  const id = slugify(text);
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag
      id={id}
      className={cn(
        "group/heading scroll-mt-20 font-semibold tracking-tight text-foreground",
        level === 2 ? "mt-14 text-2xl first:mt-0" : "mt-9 text-lg [h2+&]:mt-5"
      )}
    >
      {children}
      {/* Pointer only: the page contents give keyboard users the same links,
          and a named link here would join the heading's own name. */}
      <a
        href={`#${id}`}
        aria-hidden="true"
        tabIndex={-1}
        className="ml-2 inline-flex translate-y-[-1px] align-middle text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover/heading:opacity-100"
      >
        <Link2 aria-hidden="true" className="size-4" />
      </a>
    </Tag>
  );
}

export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: ReactNode;
}) {
  return (
    <figure className="my-10">
      <div className="landing-shot overflow-hidden rounded-xl border border-border bg-muted">
        <img
          className="block aspect-video w-full object-cover object-top"
          src={src}
          alt={alt}
          width={1280}
          height={720}
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

const CALLOUTS: Record<
  "note" | "tip" | "warning",
  { icon: LucideIcon; label: string; box: string; tint: string }
> = {
  note: {
    icon: Info,
    label: "Note",
    box: "border-primary/25 bg-primary/[0.04]",
    tint: "text-primary",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    box: "border-border bg-muted/50",
    tint: "text-[var(--eda-dsl-string)]",
  },
  warning: {
    icon: CircleAlert,
    label: "Watch out",
    box: "border-warning/40 bg-warning/[0.07]",
    tint: "text-warning",
  },
};

/** A boxed aside: a note, a tip, or something to watch out for. */
export function Callout({
  title,
  type = "note",
  children,
}: {
  title?: string;
  type?: keyof typeof CALLOUTS;
  children: ReactNode;
}) {
  const { icon: Icon, label, box, tint } = CALLOUTS[type];
  return (
    <aside
      aria-label={title ?? label}
      className={cn("mt-6 flex gap-3 rounded-lg border px-4 py-3.5", box)}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", tint)} />
      <div className="min-w-0 text-sm leading-6 text-foreground/80 [&>p]:m-0 [&>p+p]:mt-2 [&>p]:text-sm [&>p]:leading-6">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        {children}
      </div>
    </aside>
  );
}

/** A row of named cards, such as a chart's modes or row scopes. */
export function Terms({
  items,
}: {
  items: readonly (readonly [name: string, body: string])[];
}) {
  return (
    <dl
      className={cn(
        "mt-5 grid gap-3",
        items.length % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {items.map(([name, body]) => (
        <div
          key={name}
          className="rounded-lg border border-border bg-card p-4 shadow-[inset_0_2px_0_0_color-mix(in_oklab,var(--primary)_55%,transparent)]"
        >
          <dt className="text-sm font-semibold text-foreground">{name}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {body}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A chain of calculated fields, each with its formula and optional value. */
export function CalcChain({
  rows,
}: {
  rows: readonly { name: string; expression: string; value?: string }[];
}) {
  return (
    <ol className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card font-mono text-sm">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5"
        >
          <span className="font-semibold text-[var(--eda-dsl-key)]">
            {row.name}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            =
          </span>
          <span className="sr-only">equals</span>
          <span className="text-foreground/80">{row.expression}</span>
          {row.value && (
            <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
              {row.value}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Numbered stages joined by a line. */
export function Steps({
  label,
  steps,
}: {
  label: string;
  steps: readonly { title: string; detail: string }[];
}) {
  return (
    <ol aria-label={label} className="mt-6">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-border"
            />
          )}
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-4 ring-background"
          >
            {index + 1}
          </span>
          <div className="pt-0.5">
            <p className="font-semibold text-foreground">{step.title}</p>
            <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Where links relative to the package README point. */
const README_BASE =
  "https://github.com/byronwall/explorEDA/blob/main/packages/explorEDA/";

function Anchor({
  href = "",
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link className={inlineLinkClass} to={href}>
        {children}
      </Link>
    );
  }
  const external = /^(https?:|mailto:|#)/.test(href)
    ? href
    : new URL(href, README_BASE).toString();
  return (
    <a className={inlineLinkClass} href={external}>
      {children}
    </a>
  );
}

/** How Markdown elements render on a docs page. */
export const mdxComponents: MDXComponents = {
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  // Imported Markdown, such as the package README, starts with its own h1.
  h1: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  pre: CodeBlock,
  table: ({ children }) => (
    <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-sm [&_tbody_tr:first-child>td]:border-t-0">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-muted/50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-border px-3 py-2 align-top leading-6 text-foreground/80">
      {children}
    </td>
  ),
  p: ({ children }) => <p className={`mt-4 ${proseClass}`}>{children}</p>,
  ul: ({ children }) => (
    <ul
      className={`mt-4 list-disc space-y-2 pl-5 ${proseClass} marker:text-primary/50`}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className={`mt-4 list-decimal space-y-2 pl-5 ${proseClass} marker:font-medium marker:text-primary/70`}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  code: ({ children }) => (
    <code className="rounded border border-border/70 bg-muted/70 px-[0.3em] py-px font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  ),
  kbd: ({ children }) => (
    <kbd className="rounded border border-border border-b-2 bg-card px-1.5 py-px font-mono text-[0.8em] text-foreground">
      {children}
    </kbd>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  hr: () => <hr className="my-10 border-border" />,
  a: Anchor,
  // Blocks a page can use without importing them.
  Callout,
  CalcChain,
  DocsLink,
  DashboardTextReference,
  ExampleText,
  Figure,
  LiveExample,
  PropsReference,
  SettingsReference,
  Steps,
  Terms,
  WorkedOrder,
};
