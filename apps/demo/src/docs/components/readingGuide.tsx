import { Children, isValidElement, useId, type ReactNode } from "react";
import { SCHEMATICS } from "./readingSchematics";

/** One callout: the schematic part it points at, and what that part means. */
export function Part({ children }: { at?: string; children: ReactNode }) {
  return <>{children}</>;
}

const BADGE = 8;

function Badge({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold tabular-nums text-background"
    >
      {n}
    </span>
  );
}

/**
 * A small schematic of a chart with numbered callouts, and a key that says
 * what each numbered part means. A `Part` without `at` joins the key with a
 * dash instead of a number.
 */
export function ReadingGuide({
  chart,
  children,
}: {
  chart: string;
  children: ReactNode;
}) {
  const id = useId();
  const schematic = SCHEMATICS[chart];
  if (!schematic) {
    throw new Error(`ReadingGuide has no schematic for "${chart}"`);
  }
  let n = 0;
  const parts = Children.toArray(children)
    .filter(isValidElement<{ at?: string; children: ReactNode }>)
    .map(({ props }) => {
      const anchor = props.at ? schematic.anchors[props.at] : undefined;
      if (props.at && !anchor) {
        throw new Error(`The ${chart} schematic has no part "${props.at}"`);
      }
      return { anchor, n: anchor ? ++n : 0, body: props.children };
    });
  const keyId = `${id}-key`;
  return (
    <figure className="mt-5 flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-5">
      <svg
        role="img"
        aria-label={`${schematic.label}, with numbered parts`}
        aria-describedby={keyId}
        viewBox={`0 0 ${schematic.width} ${schematic.height}`}
        className="h-auto w-full max-w-[26rem] overflow-visible"
        fontFamily="inherit"
      >
        {schematic.draw(id.replace(/[^\w-]/g, ""))}
        {parts.map(({ anchor, n }) => {
          if (!anchor) {
            return null;
          }
          const { x, y, mx, my } = anchor;
          const dx = x - mx;
          const dy = y - my;
          const length = Math.hypot(dx, dy);
          return (
            <g key={n}>
              {length > BADGE + 2 && (
                <>
                  <line
                    x1={mx + (dx / length) * BADGE}
                    y1={my + (dy / length) * BADGE}
                    x2={x}
                    y2={y}
                    className="stroke-foreground"
                    strokeWidth={1}
                  />
                  <circle cx={x} cy={y} r={2.2} className="fill-foreground" />
                </>
              )}
              <circle
                cx={mx}
                cy={my}
                r={BADGE}
                className="fill-foreground stroke-card"
                strokeWidth={2}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                className="fill-background"
              >
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <ol
        id={keyId}
        className="min-w-0 space-y-2.5 text-sm leading-6 text-foreground/80 [&_p]:m-0 [&_p]:text-sm [&_p]:leading-6"
      >
        {parts.map(({ n, body }, index) => (
          <li key={index} className="flex gap-2.5">
            {n ? (
              <Badge n={n} />
            ) : (
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground"
              >
                –
              </span>
            )}
            {/* Prettier wraps long parts, so MDX may hand them over as a paragraph. */}
            <div className="min-w-0">{body}</div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
