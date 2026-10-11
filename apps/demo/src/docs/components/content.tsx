import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { docsPath, slugify } from "../paths";
import { inlineLinkClass, proseClass } from "./chrome";
import { WorkedOrder } from "./workedOrder";
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

export function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-6 text-muted-foreground [&>p]:m-0 [&>p]:text-sm [&>p]:leading-6">
      {title && <span className="font-medium text-foreground">{title} </span>}
      {children}
    </div>
  );
}

/** A row of named cards, such as a chart's modes or row scopes. */
export function Terms({
  items,
}: {
  items: readonly (readonly [name: string, body: string])[];
}) {
  return (
    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      {items.map(([name, body]) => (
        <div key={name} className="rounded-lg border border-border bg-card p-4">
          <dt className="text-sm font-semibold">{name}</dt>
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
    <ol className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card font-mono text-sm">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5"
        >
          <span className="font-semibold text-foreground">{row.name}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            =
          </span>
          <span className="sr-only">equals</span>
          <span className="text-muted-foreground">{row.expression}</span>
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
    <ol
      aria-label={label}
      className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[15px] top-9 h-[calc(100%-2.5rem)] w-px bg-border"
            />
          )}
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary shadow-sm"
          >
            {index + 1}
          </span>
          <div className="pt-1">
            <p className="font-semibold">{step.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

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
  return (
    <a className={inlineLinkClass} href={href}>
      {children}
    </a>
  );
}

/** How Markdown elements render on a docs page. */
export const mdxComponents: MDXComponents = {
  h2: ({ children }) => {
    const id = slugify(textOf(children));
    return (
      <h2
        id={id}
        className="mt-12 scroll-mt-8 border-t border-border pt-6 text-xl font-semibold tracking-tight first:mt-0 sm:text-2xl"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg font-semibold">{children}</h3>
  ),
  p: ({ children }) => <p className={`mt-4 ${proseClass}`}>{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground marker:text-border">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-7 text-muted-foreground">
      {children}
    </ol>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  ),
  kbd: ({ children }) => (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </kbd>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  a: Anchor,
  // Blocks a page can use without importing them.
  Callout,
  CalcChain,
  DocsLink,
  Figure,
  LiveExample,
  SettingsReference,
  Steps,
  Terms,
  WorkedOrder,
};
