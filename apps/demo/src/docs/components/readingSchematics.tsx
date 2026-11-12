import type { ReactNode } from "react";

/** A point on a part (`x`, `y`) and where its numbered badge sits. */
export type Anchor = { x: number; y: number; mx: number; my: number };

export type Schematic = {
  width: number;
  height: number;
  /** What the picture shows, for screen readers. */
  label: string;
  /** The chart's marks. `id` keeps pattern and gradient ids unique. */
  draw: (id: string) => ReactNode;
  anchors: Record<string, Anchor>;
};

// One look for every schematic: marks in the docs accent, a second series
// in orange, context in faint gray, and labels in muted text.
const mark = "fill-docs-accent";
const markLine = "stroke-docs-accent";
const alt = "fill-[var(--eda-dsl-number)]";
const altLine = "stroke-[var(--eda-dsl-number)]";
const faint = "fill-muted-foreground/25";
const axis = "stroke-muted-foreground/60";
const label = "fill-muted-foreground";

const a = (x: number, y: number, mx: number, my: number): Anchor => ({
  x,
  y,
  mx,
  my,
});

function Text({
  x,
  y,
  children,
  end,
  middle,
  ink,
  italic,
  size = 10,
}: {
  x: number;
  y: number;
  children: ReactNode;
  end?: boolean;
  middle?: boolean;
  ink?: boolean;
  italic?: boolean;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={end ? "end" : middle ? "middle" : "start"}
      dominantBaseline="central"
      fontStyle={italic ? "italic" : undefined}
      className={ink ? "fill-foreground" : label}
    >
      {children}
    </text>
  );
}

function Hatch({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width={5}
      height={5}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={5}
        className="stroke-card"
        strokeWidth={1.6}
      />
    </pattern>
  );
}

const points = (list: readonly (readonly [number, number])[]) =>
  list.map(([x, y]) => `${x},${y}`).join(" ");

/* ---------------------------------------------------------------- row */

const ROWS = [
  { name: "Online", y: 28, to: 262 },
  { name: "Store", y: 56, to: 168, all: 236 },
  { name: "Phone", y: 84, to: 196 },
  { name: "Refund", y: 112, to: 76 },
  { name: "+3 more", y: 140, to: 142, other: true },
];

const row: Schematic = {
  width: 300,
  height: 166,
  label: "A row chart with five category rows",
  draw: () => (
    <>
      {ROWS.map((r) => (
        <g key={r.name}>
          <Text x={64} y={r.y + 9} end ink={!r.other} italic={r.other}>
            {r.name}
          </Text>
          {r.all && (
            <rect
              x={100}
              y={r.y}
              width={r.all - 100}
              height={18}
              rx={2}
              className={faint}
            />
          )}
          <rect
            x={Math.min(100, r.to)}
            y={r.y}
            width={Math.abs(r.to - 100)}
            height={18}
            rx={2}
            className={mark}
          />
        </g>
      ))}
      <line x1={100} y1={22} x2={100} y2={162} className={axis} />
    </>
  ),
  anchors: {
    label: a(26, 37, 10, 37),
    bar: a(262, 37, 288, 37),
    filtered: a(214, 65, 288, 65),
    zero: a(100, 24, 124, 10),
    other: a(32, 149, 10, 149),
  },
};

/* --------------------------------------------------------------- line */

const LINE_X = [56, 96, 136, 176, 216, 256, 296];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const SERIES = [104, 82, 94, null, 88, 70, 76];
const AREA = [134, 128, 126, 130, 124, 118, 121];

const line: Schematic = {
  width: 330,
  height: 186,
  label: "A line chart over seven months with a line and an area",
  draw: () => {
    const left = SERIES.slice(0, 3).map((y, i) => [LINE_X[i]!, y!] as const);
    const right = SERIES.slice(4).map((y, i) => [LINE_X[i + 4]!, y!] as const);
    const area = [
      [LINE_X[0]!, 150] as const,
      ...AREA.map((y, i) => [LINE_X[i]!, y] as const),
      [LINE_X[6]!, 150] as const,
    ];
    return (
      <>
        <polygon points={points(area)} className={alt} opacity={0.25} />
        <polyline
          points={points(AREA.map((y, i) => [LINE_X[i]!, y]))}
          fill="none"
          className={altLine}
          strokeWidth={1.5}
        />
        {[left, right].map((part, i) => (
          <polyline
            key={i}
            points={points(part)}
            fill="none"
            className={markLine}
            strokeWidth={2}
          />
        ))}
        {[...left, ...right].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={3} className={mark} />
        ))}
        <line x1={40} y1={150} x2={312} y2={150} className={axis} />
        <line x1={40} y1={30} x2={40} y2={150} className={axis} />
        <line
          x1={312}
          y1={30}
          x2={312}
          y2={150}
          className={axis}
          strokeDasharray="3 3"
        />
        {LINE_X.map((x, i) => (
          <g key={x}>
            <line x1={x} y1={150} x2={x} y2={154} className={axis} />
            <Text x={x} y={164} middle size={9}>
              {MONTHS[i]}
            </Text>
          </g>
        ))}
      </>
    );
  },
  anchors: {
    period: a(56, 154, 20, 166),
    line: a(96, 82, 96, 58),
    gap: a(176, 92, 176, 64),
    area: a(236, 138, 236, 138),
    right: a(312, 64, 322, 40),
  },
};

/* ---------------------------------------------------------- retention */

const COHORTS = [
  { name: "Jan 6", size: 120, rates: [1, 0.48, 0.4, 0.36, 0.3] },
  { name: "Jan 13", size: 98, rates: [1, 0.52, 0.41, 0.34] },
  { name: "Jan 20", size: 105, rates: [1, 0.44, 0.38] },
  { name: "Jan 27", size: 87, rates: [1, 0.5] },
];
const ALL_RATES = [1, 0.49, 0.4, 0.35, 0.3];
const CELL_X = 112;
const CELL_W = 42;

function RateCell({
  x,
  y,
  rate,
  hatch,
  all,
}: {
  x: number;
  y: number;
  rate: number;
  hatch?: string;
  all?: boolean;
}) {
  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={CELL_W - 2}
        height={20}
        rx={2}
        className={mark}
        opacity={0.12 + rate * 0.88}
      />
      {hatch && (
        <rect
          x={x + 1}
          y={y + 1}
          width={CELL_W - 2}
          height={20}
          rx={2}
          fill={`url(#${hatch})`}
        />
      )}
      {all && (
        <rect
          x={x + 1}
          y={y + 1}
          width={CELL_W - 2}
          height={20}
          rx={2}
          fill="none"
          className="stroke-foreground/40"
        />
      )}
      <text
        x={x + CELL_W / 2}
        y={y + 11}
        fontSize={9}
        fontWeight={all ? 600 : undefined}
        textAnchor="middle"
        dominantBaseline="central"
        className={rate > 0.6 ? "fill-background" : "fill-foreground"}
      >
        {Math.round(rate * 100)}%
      </text>
    </g>
  );
}

const retention: Schematic = {
  width: 340,
  height: 208,
  label: "A retention grid of four weekly cohorts over five weeks",
  draw: (id) => (
    <>
      <defs>
        <Hatch id={`${id}-hatch`} />
        <linearGradient id={`${id}-scale`}>
          <stop
            offset="0"
            className="[stop-color:var(--docs-accent)]"
            stopOpacity={0.12}
          />
          <stop offset="1" className="[stop-color:var(--docs-accent)]" />
        </linearGradient>
      </defs>
      <Text x={31} y={30}>
        Cohort
      </Text>
      <Text x={104} y={30} end>
        Size
      </Text>
      {ALL_RATES.map((_, p) => (
        <Text key={p} x={CELL_X + p * CELL_W + CELL_W / 2} y={30} middle>
          {p}
        </Text>
      ))}
      {COHORTS.map((c, i) => {
        const y = 40 + i * 24;
        return (
          <g key={c.name}>
            <Text x={31} y={y + 11} ink>
              {c.name}
            </Text>
            <Text x={104} y={y + 11} end>
              {c.size}
            </Text>
            {c.rates.map((rate, p) => (
              <RateCell
                key={p}
                x={CELL_X + p * CELL_W}
                y={y}
                rate={rate}
                hatch={p === c.rates.length - 1 ? `${id}-hatch` : undefined}
              />
            ))}
          </g>
        );
      })}
      <text
        x={31}
        y={151}
        fontSize={10}
        fontWeight={600}
        dominantBaseline="central"
        className="fill-foreground"
      >
        All
      </text>
      {ALL_RATES.map((rate, p) => (
        <RateCell key={p} x={CELL_X + p * CELL_W} y={140} rate={rate} all />
      ))}
      <rect
        x={CELL_X + 1}
        y={176}
        width={5 * CELL_W - 2}
        height={7}
        rx={2}
        fill={`url(#${id}-scale)`}
      />
      <Text x={CELL_X - 4} y={180} end size={9}>
        0%
      </Text>
      <Text x={CELL_X + 5 * CELL_W + 4} y={180} size={9}>
        100%
      </Text>
    </>
  ),
  anchors: {
    cohort: a(27, 51, 10, 51),
    size: a(96, 130, 96, 151),
    period: a(CELL_X + CELL_W / 2, 22, CELL_X + CELL_W / 2 + 24, 10),
    cell: a(CELL_X + 3 * CELL_W - 6, 80, CELL_X + 3.5 * CELL_W, 99),
    partial: a(CELL_X + 5 * CELL_W - 2, 51, CELL_X + 5 * CELL_W + 12, 51),
    blank: a(CELL_X + 4.5 * CELL_W, 123, CELL_X + 4.5 * CELL_W, 123),
    all: a(27, 151, 10, 151),
    scale: a(CELL_X + 3 * CELL_W, 183, CELL_X + 3 * CELL_W, 200),
  },
};

/* ------------------------------------------------------------ boxplot */

function Box({
  x,
  q1,
  q3,
  med,
  lo,
  hi,
}: Record<"x" | "q1" | "q3" | "med" | "lo" | "hi", number>) {
  return (
    <g>
      <line x1={x} y1={hi} x2={x} y2={q3} className={axis} strokeWidth={1.2} />
      <line x1={x} y1={q1} x2={x} y2={lo} className={axis} strokeWidth={1.2} />
      <line
        x1={x - 10}
        y1={hi}
        x2={x + 10}
        y2={hi}
        className={axis}
        strokeWidth={1.2}
      />
      <line
        x1={x - 10}
        y1={lo}
        x2={x + 10}
        y2={lo}
        className={axis}
        strokeWidth={1.2}
      />
      <rect
        x={x - 18}
        y={q3}
        width={36}
        height={q1 - q3}
        rx={2}
        className={mark}
        opacity={0.35}
      />
      <rect
        x={x - 18}
        y={q3}
        width={36}
        height={q1 - q3}
        rx={2}
        fill="none"
        className={markLine}
        strokeWidth={1.4}
      />
      <line
        x1={x - 18}
        y1={med}
        x2={x + 18}
        y2={med}
        className={markLine}
        strokeWidth={2.5}
      />
    </g>
  );
}

const JITTER = [
  [-8, 66],
  [6, 74],
  [-3, 82],
  [10, 88],
  [-11, 94],
  [2, 99],
  [8, 106],
  [-6, 112],
  [4, 120],
] as const;

const boxplot: Schematic = {
  width: 320,
  height: 200,
  label:
    "Two box plots side by side, the second with a violin and its observations",
  draw: () => (
    <>
      <line x1={40} y1={16} x2={40} y2={176} className={axis} />
      <line x1={40} y1={176} x2={300} y2={176} className={axis} />
      <Box x={90} q3={72} q1={122} med={96} lo={152} hi={40} />
      <circle
        cx={90}
        cy={24}
        r={3}
        fill="none"
        className={markLine}
        strokeWidth={1.4}
      />
      <circle
        cx={90}
        cy={166}
        r={3}
        fill="none"
        className={markLine}
        strokeWidth={1.4}
      />
      <path
        d="M230 44 C 246 64, 262 84, 256 104 C 252 122, 238 134, 230 150 C 222 134, 208 122, 204 104 C 198 84, 214 64, 230 44 Z"
        className={faint}
      />
      <Box x={230} q3={78} q1={118} med={100} lo={146} hi={50} />
      {JITTER.map(([dx, y]) => (
        <circle
          key={y}
          cx={230 + dx}
          cy={y}
          r={2}
          className="fill-foreground/70"
        />
      ))}
      <Text x={90} y={188} middle ink>
        Group A
      </Text>
      <Text x={230} y={188} middle ink>
        Group B
      </Text>
    </>
  ),
  anchors: {
    box: a(108, 80, 150, 72),
    median: a(108, 96, 150, 100),
    whisker: a(100, 40, 150, 40),
    outlier: a(93, 166, 150, 166),
    violin: a(255, 100, 290, 100),
    observations: a(240, 88, 290, 64),
  },
};

/* ------------------------------------------------------------- funnel */

const STEPS = [
  { name: "Visit", y: 36, n: 1000, text: "1,000 · 100%" },
  { name: "Sign-up", y: 76, n: 420, text: "420 · 42% · 42%" },
  { name: "Purchase", y: 116, n: 180, text: "180 · 18% · 43%" },
];
const stepX = (n: number) => 80 + n * 0.15;

const funnel: Schematic = {
  width: 330,
  height: 170,
  label: "A funnel of three steps from visit to purchase",
  draw: () => (
    <>
      {STEPS.map((s, i) => (
        <g key={s.name}>
          <Text x={72} y={s.y + 11} end ink>
            {s.name}
          </Text>
          {i > 0 && (
            <rect
              x={stepX(s.n)}
              y={s.y}
              width={stepX(STEPS[i - 1]!.n) - stepX(s.n)}
              height={22}
              className={mark}
              opacity={0.2}
            />
          )}
          <rect
            x={80}
            y={s.y}
            width={stepX(s.n) - 80}
            height={22}
            className={mark}
          />
          <Text x={238} y={s.y + 11} size={9}>
            {s.text}
          </Text>
        </g>
      ))}
    </>
  ),
  anchors: {
    step: a(30, 87, 12, 87),
    bar: a(95, 133, 95, 158),
    dropped: a(190, 92, 190, 158),
    numbers: a(262, 41, 262, 18),
  },
};

/* -------------------------------------------------------------- donut */

const arcPath = (r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, t: number) =>
    `${(100 + r * Math.sin(t)).toFixed(1)} ${(92 - r * Math.cos(t)).toFixed(1)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)} A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
};
const SLICES = [
  { name: "Online", share: 0.4, className: mark },
  { name: "Store", share: 0.25, className: alt },
  { name: "Phone", share: 0.15, className: "fill-[var(--eda-dsl-keyword)]" },
  { name: "Partner", share: 0.12, className: "fill-[var(--eda-dsl-key)]" },
  { name: "Other", share: 0.08, className: faint },
];

const donut: Schematic = {
  width: 320,
  height: 184,
  label: "A donut of five slices with a total in the center and a legend",
  draw: () => {
    let start = 0;
    return (
      <>
        {SLICES.map((s, i) => {
          const end = start + s.share * Math.PI * 2;
          const d = arcPath(44, 72, start, end);
          start = end;
          return (
            <g key={s.name}>
              <path
                d={d}
                className={`${s.className} stroke-card`}
                strokeWidth={1.5}
              />
              <rect
                x={204}
                y={38 + i * 22}
                width={10}
                height={10}
                rx={2}
                className={s.className}
              />
              <Text x={220} y={43 + i * 22} ink={i < 4} italic={i === 4}>
                {s.name}
              </Text>
              <Text x={300} y={43 + i * 22} end>
                {`${Math.round(s.share * 100)}%`}
              </Text>
            </g>
          );
        })}
        <text
          x={100}
          y={88}
          fontSize={16}
          fontWeight={600}
          textAnchor="middle"
          className="fill-foreground"
        >
          1,240
        </text>
        <Text x={100} y={102} middle size={9}>
          rows
        </Text>
      </>
    );
  },
  anchors: {
    slice: a(150, 70, 178, 40),
    center: a(100, 120, 100, 120),
    order: a(102, 22, 130, 8),
    legend: a(204, 43, 190, 22),
    other: a(82, 23, 50, 12),
  },
};

/* ------------------------------------------------------------ heatmap */

const HEAT_ROWS = ["Ohio", "Texas", "Utah", "Iowa"];
const HEAT_COLS = ["W1", "W2", "W3", "W4", "W5"];
const HEAT = [
  [0.3, 0.8, 0.5, 0.2, 0.1],
  [0.5, 1, 0.7, 0.4, 0.2],
  [0.1, 0.4, 0.9, 0.6, 0.3],
  [0.2, 0.3, 0.5, 0.8, 0.4],
];

const heatmap: Schematic = {
  width: 320,
  height: 176,
  label: "A heatmap of four rows by five columns",
  draw: () => (
    <>
      {HEAT_COLS.map((c, j) => (
        <Text key={c} x={95 + j * 40} y={20} middle>
          {c}
        </Text>
      ))}
      {HEAT.map((cells, i) => (
        <g key={HEAT_ROWS[i]}>
          <Text x={68} y={42 + i * 28} end ink>
            {HEAT_ROWS[i]}
          </Text>
          {cells.map((v, j) => (
            <g key={j}>
              <rect
                x={76 + j * 40}
                y={29 + i * 28}
                width={38}
                height={26}
                rx={2}
                className={mark}
                opacity={0.1 + v * 0.9}
              />
              {
                <text
                  x={95 + j * 40}
                  y={42 + i * 28}
                  fontSize={9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={v > 0.6 ? "fill-background" : "fill-foreground"}
                >
                  {Math.round(v * 120)}
                </text>
              }
            </g>
          ))}
        </g>
      ))}
      <rect
        x={156}
        y={85}
        width={38}
        height={26}
        rx={2}
        fill="none"
        className="stroke-foreground"
        strokeWidth={2}
      />
      <Text x={76} y={154} size={9}>
        + 12 rows with other values not shown
      </Text>
    </>
  ),
  anchors: {
    rows: a(34, 70, 12, 70),
    cell: a(270, 125, 300, 125),
    values: a(270, 42, 300, 42),
    selected: a(194, 98, 300, 84),
    limit: a(71, 154, 50, 154),
  },
};

/* ----------------------------------------------------------- calendar */

const calendar: Schematic = {
  width: 340,
  height: 112,
  label: "A calendar heatmap of one year, one column per week",
  draw: () => {
    const cells = [];
    for (let w = 0; w < 53; w++) {
      for (let d = 0; d < 7; d++) {
        if ((w === 0 && d < 3) || (w === 52 && d > 3)) continue;
        const v = ((w * 37 + d * 11 + w * d) % 13) / 12;
        cells.push(
          <rect
            key={`${w}-${d}`}
            x={30 + w * 5.6}
            y={30 + d * 5.6}
            width={4.8}
            height={4.8}
            rx={0.8}
            className={mark}
            opacity={d === 0 || d === 6 ? 0.08 + v * 0.3 : 0.15 + v * 0.85}
          />
        );
      }
    }
    return (
      <>
        <text
          x={30}
          y={12}
          fontSize={11}
          fontWeight={600}
          dominantBaseline="central"
          className="fill-foreground"
        >
          2026
        </text>
        {["Jan", "Apr", "Jul", "Oct"].map((m, i) => (
          <Text key={m} x={30 + i * 13 * 5.6} y={24} size={8}>
            {m}
          </Text>
        ))}
        {["Mon", "Wed", "Fri"].map((d, i) => (
          <Text key={d} x={26} y={33 + (1 + i * 2) * 5.6} end size={7}>
            {d}
          </Text>
        ))}
        {cells}
        <rect
          x={30 + 20 * 5.6 - 0.8}
          y={29.2}
          width={6.4}
          height={40}
          rx={1}
          fill="none"
          className="stroke-foreground"
          strokeWidth={1.2}
        />
      </>
    );
  },
  anchors: {
    year: a(58, 12, 76, 12),
    week: a(30 + 20 * 5.6 + 2.4, 69, 30 + 20 * 5.6 + 2.4, 92),
    cell: a(30 + 33 * 5.6 + 2.4, 30 + 2 * 5.6 + 2.4, 30 + 33 * 5.6 + 2.4, 92),
  },
};

/* ----------------------------------------------------------- timeline */

const timeline: Schematic = {
  width: 320,
  height: 150,
  label: "A timeline of three lanes with bars over time",
  draw: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-open`}>
          <stop
            offset="0"
            className="[stop-color:var(--docs-accent)]"
            stopOpacity={0.55}
          />
          <stop
            offset="1"
            className="[stop-color:var(--docs-accent)]"
            stopOpacity={0.15}
          />
        </linearGradient>
      </defs>
      {["Alice", "Ben", "Cara"].map((lane, i) => (
        <g key={lane}>
          <Text x={56} y={41 + i * 32} end ink>
            {lane}
          </Text>
          <line
            x1={64}
            y1={56 + i * 32}
            x2={300}
            y2={56 + i * 32}
            className="stroke-border"
          />
        </g>
      ))}
      <rect
        x={76}
        y={31}
        width={90}
        height={20}
        rx={2}
        className={mark}
        opacity={0.7}
      />
      <rect
        x={136}
        y={31}
        width={80}
        height={20}
        rx={2}
        className={mark}
        opacity={0.7}
      />
      <rect x={100} y={63} width={110} height={20} rx={2} className={alt} />
      <rect
        x={180}
        y={95}
        width={120}
        height={20}
        rx={2}
        fill={`url(#${id}-open)`}
      />
      <line
        x1={300}
        y1={95}
        x2={300}
        y2={115}
        className={markLine}
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <line x1={64} y1={128} x2={300} y2={128} className={axis} />
      {["Mar 1", "Mar 8", "Mar 15", "Mar 22"].map((t, i) => (
        <g key={t}>
          <line
            x1={76 + i * 72}
            y1={128}
            x2={76 + i * 72}
            y2={132}
            className={axis}
          />
          <Text x={76 + i * 72} y={141} middle size={9}>
            {t}
          </Text>
        </g>
      ))}
    </>
  ),
  anchors: {
    lane: a(27, 41, 10, 41),
    bar: a(96, 31, 96, 14),
    overlap: a(150, 31, 150, 14),
    color: a(210, 73, 250, 73),
    open: a(300, 105, 312, 86),
  },
};

/* ---------------------------------------------------------- waterfall */

const wx = (v: number) => 90 + v * 2;

const waterfall: Schematic = {
  width: 320,
  height: 176,
  label: "A waterfall from plan to actual through three steps in two groups",
  draw: () => {
    const totals = [
      { name: "Plan", y: 20, v: 60 },
      { name: "Actual", y: 140, v: 85 },
    ];
    const steps = [
      { name: "North", y: 44, from: 60, to: 75 },
      { name: "South", y: 68, from: 75, to: 65 },
      { name: "Online", y: 112, from: 65, to: 85 },
    ];
    return (
      <>
        <line x1={90} y1={14} x2={90} y2={160} className={axis} />
        {totals.map((t) => (
          <g key={t.name}>
            <Text x={80} y={t.y + 7} end ink>
              {t.name}
            </Text>
            <line
              x1={90}
              y1={t.y + 7}
              x2={wx(t.v)}
              y2={t.y + 7}
              className="stroke-foreground"
              strokeWidth={1.5}
            />
            <circle
              cx={wx(t.v)}
              cy={t.y + 7}
              r={4}
              className="fill-foreground"
            />
          </g>
        ))}
        {steps.map((s, i) => (
          <g key={s.name}>
            <Text x={80} y={s.y + 7} end ink>
              {s.name}
            </Text>
            <rect
              x={wx(Math.min(s.from, s.to))}
              y={s.y}
              width={Math.abs(s.to - s.from) * 2}
              height={14}
              rx={1.5}
              className={s.to > s.from ? mark : alt}
            />
            <line
              x1={wx(s.from)}
              y1={(i === 0 ? 20 : steps[i - 1]!.y) + 7}
              x2={wx(s.from)}
              y2={s.y}
              className="stroke-foreground/60"
              strokeDasharray="2 2"
            />
          </g>
        ))}
        <line
          x1={wx(85)}
          y1={119}
          x2={wx(85)}
          y2={140}
          className="stroke-foreground/60"
          strokeDasharray="2 2"
        />
        <line
          x1={30}
          y1={88}
          x2={300}
          y2={88}
          className="stroke-foreground/40"
          strokeWidth={0.75}
        />
        <path
          d={`M${wx(65)} 91 l4 4 l-4 4 l-4 -4 Z`}
          className="fill-foreground"
        />
      </>
    );
  },
  anchors: {
    start: a(wx(60), 27, 282, 27),
    step: a(wx(71), 51, 282, 51),
    falling: a(wx(68), 75, 282, 75),
    connector: a(wx(65) - 1, 104, 170, 106),
    subtotal: a(wx(65) + 4, 95, 282, 99),
    end: a(wx(85), 147, 282, 147),
  },
};

/* ------------------------------------------------------------- sankey */

const SANKEY_NODES = [
  { x: 40, y0: 30, y1: 100, name: "Online", c: mark },
  { x: 40, y0: 110, y1: 140, name: "Store", c: alt },
  { x: 160, y0: 30, y1: 80, name: "North", c: "fill-foreground/50" },
  { x: 160, y0: 90, y1: 122, name: "South", c: "fill-foreground/50" },
  { x: 160, y0: 132, y1: 150, name: "Other", c: "fill-foreground/30" },
  { x: 280, y0: 30, y1: 105, name: "Paid", c: "fill-foreground/50" },
  { x: 280, y0: 115, y1: 140, name: "Refunded", c: "fill-foreground/50" },
];
const SANKEY_FLOWS: [number, number, number, number, number, string][] = [
  [50, 30, 70, 30, 70, mark],
  [50, 70, 90, 90, 110, mark],
  [50, 90, 100, 132, 142, mark],
  [50, 110, 120, 70, 80, alt],
  [50, 120, 132, 110, 122, alt],
  [50, 132, 140, 142, 150, alt],
  [170, 30, 75, 30, 75, "fill-foreground"],
  [170, 75, 80, 115, 120, "fill-foreground"],
  [170, 90, 112, 75, 97, "fill-foreground"],
  [170, 112, 122, 120, 130, "fill-foreground"],
  [170, 132, 140, 97, 105, "fill-foreground"],
  [170, 140, 150, 130, 140, "fill-foreground"],
];

const sankey: Schematic = {
  width: 340,
  height: 166,
  label: "A Sankey diagram with three stages of category values",
  draw: () => (
    <>
      {["Channel", "Region", "Status"].map((s, i) => (
        <Text key={s} x={45 + i * 120} y={14} middle>
          {s}
        </Text>
      ))}
      {SANKEY_FLOWS.map(([x0, s0, s1, t0, t1, c], i) => {
        const x1 = x0 + 110;
        const xm = x0 + 55;
        return (
          <path
            key={i}
            d={`M${x0} ${s0} C${xm} ${s0} ${xm} ${t0} ${x1} ${t0} L${x1} ${t1} C${xm} ${t1} ${xm} ${s1} ${x0} ${s1} Z`}
            className={c}
            opacity={c === "fill-foreground" ? 0.12 : 0.35}
          />
        );
      })}
      {SANKEY_NODES.map((n) => (
        <g key={n.name}>
          <rect
            x={n.x}
            y={n.y0}
            width={10}
            height={n.y1 - n.y0}
            className={n.c}
          />
          <Text
            x={n.x === 40 ? 36 : n.x + 14}
            y={(n.y0 + n.y1) / 2}
            end={n.x === 40}
            ink={n.name !== "Other"}
            italic={n.name === "Other"}
            size={9}
          >
            {n.name}
          </Text>
        </g>
      ))}
    </>
  ),
  anchors: {
    stage: a(186, 14, 206, 14),
    flow: a(105, 52, 105, 52),
    other: a(170, 146, 222, 156),
  },
};

/* --------------------------------------------------------------- ecdf */

const ey = (p: number) => 160 - p * 130;
const stepPath = (xs: number[]) => {
  let d = `M40 ${ey(0)}`;
  xs.forEach((x, i) => {
    d += ` H${x} V${ey((i + 1) / xs.length).toFixed(1)}`;
  });
  return `${d} H300`;
};
const ECDF_A = [60, 75, 90, 110, 135, 170, 215];
const ECDF_B = [95, 125, 150, 170, 195, 230, 270];

const ecdf: Schematic = {
  width: 320,
  height: 186,
  label: "An ECDF with two group curves and a dashed curve for all rows",
  draw: () => (
    <>
      {[0.5, 0.9].map((p) => (
        <line
          key={p}
          x1={40}
          y1={ey(p)}
          x2={300}
          y2={ey(p)}
          className="stroke-border"
          strokeDasharray="2 3"
        />
      ))}
      <path
        d={stepPath([...ECDF_A, ...ECDF_B].sort((x, y) => x - y))}
        fill="none"
        className="stroke-foreground/50"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <path
        d={stepPath(ECDF_A)}
        fill="none"
        className={markLine}
        strokeWidth={2}
      />
      <path
        d={stepPath(ECDF_B)}
        fill="none"
        className={altLine}
        strokeWidth={2}
      />
      {[
        [110, 0.5, mark],
        [170, 0.5, alt],
        [215, 0.9, mark],
        [270, 0.9, alt],
      ].map(([x, p, c]) => (
        <circle
          key={`${x}`}
          cx={x as number}
          cy={ey(p as number)}
          r={3.5}
          className={`${c} stroke-card`}
          strokeWidth={1.5}
        />
      ))}
      <line x1={40} y1={30} x2={40} y2={160} className={axis} />
      <line x1={40} y1={160} x2={300} y2={160} className={axis} />
      {[0, 0.5, 0.9].map((p) => (
        <Text key={p} x={34} y={ey(p)} end size={9}>
          {`${p * 100}%`}
        </Text>
      ))}
      <Text x={34} y={ey(1) - 4} end size={9}>
        100%
      </Text>
      <Text x={170} y={174} middle size={9}>
        Delivery days
      </Text>
    </>
  ),
  anchors: {
    curve: a(75, ey(1 / 7), 75, 108),
    split: a(230, ey(5 / 7), 262, 108),
    all: a(160, ey(8 / 14), 140, 120),
    quantile: a(215, ey(0.9), 190, 18),
  },
};

/* ---------------------------------------------------------- hierarchy */

const BRANCHES = [
  { x: 40, w: 156, c: mark, name: "North" },
  { x: 196, w: 66, c: alt, name: "South" },
  { x: 262, w: 38, c: "fill-foreground/45", name: "West" },
];
const LEAVES = [
  { x: 40, y: 36, w: 156, h: 66, c: mark, o: 0.85, name: "Shoes" },
  { x: 40, y: 102, w: 80, h: 58, c: mark, o: 0.65, name: "Bags" },
  { x: 120, y: 102, w: 76, h: 58, c: mark, o: 0.5, name: "Hats" },
  { x: 196, y: 36, w: 66, h: 76, c: alt, o: 0.85, name: "Shoes" },
  { x: 196, y: 112, w: 66, h: 48, c: alt, o: 0.6, name: "Bags" },
  {
    x: 262,
    y: 36,
    w: 38,
    h: 124,
    c: "fill-foreground/45",
    o: 0.7,
    name: "Hats",
  },
];

const hierarchy: Schematic = {
  width: 320,
  height: 172,
  label: "A treemap of three first-level branches, each split into its parts",
  draw: () => (
    <>
      {BRANCHES.map((b) => (
        <g key={b.name}>
          <rect
            x={b.x}
            y={20}
            width={b.w}
            height={16}
            className={`${b.c} stroke-card`}
            strokeWidth={2}
          />
          <text
            x={b.x + 5}
            y={28}
            fontSize={9}
            fontWeight={600}
            dominantBaseline="central"
            className="fill-background"
          >
            {b.name}
          </text>
        </g>
      ))}
      {LEAVES.map((t, i) => (
        <g key={i}>
          <rect
            x={t.x}
            y={t.y}
            width={t.w}
            height={t.h}
            className={`${t.c} stroke-card`}
            opacity={t.o}
            strokeWidth={2}
          />
          <text
            x={t.x + 5}
            y={t.y + 11}
            fontSize={8.5}
            dominantBaseline="central"
            className="fill-foreground"
          >
            {t.name}
          </text>
        </g>
      ))}
    </>
  ),
  anchors: {
    level: a(42, 28, 20, 28),
    size: a(158, 135, 158, 135),
    color: a(229, 140, 229, 140),
  },
};

/* --------------------------------------------------- parallel coords */

const PC_X = [50, 130, 210, 290];
const PC_LINES = [
  [0.9, 0.8, 0.7, 0.3],
  [0.8, 0.7, 0.9, 0.2],
  [0.7, 0.6, 0.6, 0.4],
  [0.3, 0.4, 0.3, 0.7],
  [0.2, 0.3, 0.1, 0.9],
  [0.4, 0.2, 0.2, 0.8],
  [0.6, 0.5, 0.8, 0.5],
  [0.1, 0.1, 0.4, 0.6],
];
// The third axis runs high-to-low, so it draws 1 - value.
const pcy = (v: number, axisIndex: number) =>
  150 - (axisIndex === 2 ? 1 - v : v) * 120;

const parallel: Schematic = {
  width: 320,
  height: 176,
  label: "Parallel coordinates with four axes, the third drawn high-to-low",
  draw: () => (
    <>
      {PC_LINES.map((line, i) => (
        <polyline
          key={i}
          points={points(line.map((v, j) => [PC_X[j]!, pcy(v, j)]))}
          fill="none"
          className={markLine}
          strokeOpacity={0.45}
          strokeWidth={1.5}
        />
      ))}
      {["Price", "Units", "Rating", "Days"].map((name, j) => (
        <g key={name}>
          <line
            x1={PC_X[j]}
            y1={30}
            x2={PC_X[j]}
            y2={150}
            className="stroke-foreground/60"
          />
          <Text x={PC_X[j]!} y={16} middle ink>
            {name}
          </Text>
          <Text x={PC_X[j]! + 4} y={34} size={8}>
            {j === 2 ? "low" : "high"}
          </Text>
          <Text x={PC_X[j]! + 4} y={146} size={8}>
            {j === 2 ? "high" : "low"}
          </Text>
        </g>
      ))}
    </>
  ),
  anchors: {
    order: a(70, 16, 90, 16),
    flipped: a(236, 146, 258, 164),
    opacity: a(90, 50, 104, 52),
  },
};

/* ---------------------------------------------------- scatter matrix */

const SM_FIELDS = ["Price", "Units", "Rating"];
const SM_POINTS = [
  [0.1, 0.2],
  [0.2, 0.35],
  [0.3, 0.3],
  [0.4, 0.5],
  [0.5, 0.45],
  [0.6, 0.7],
  [0.7, 0.6],
  [0.8, 0.85],
  [0.9, 0.75],
];
const SM_HIST = [0.3, 0.7, 1, 0.6, 0.3];
const smX = (i: number) => 60 + i * 76;

const scatterMatrix: Schematic = {
  width: 300,
  height: 260,
  label:
    "A scatter matrix of three fields: points below the diagonal, correlations above, histograms on it",
  draw: () => (
    <>
      {SM_FIELDS.map((f, i) => (
        <g key={f}>
          <Text x={smX(i) + 35} y={12} middle ink>
            {f}
          </Text>
          <Text x={54} y={smX(i) - 40 + 35} end ink>
            {f}
          </Text>
        </g>
      ))}
      {SM_FIELDS.map((_, r) =>
        SM_FIELDS.map((__, c) => {
          const x = smX(c);
          const y = smX(r) - 40;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={70}
                height={70}
                rx={2}
                fill="none"
                className="stroke-border"
              />
              {r === c &&
                SM_HIST.map((h, k) => (
                  <rect
                    key={k}
                    x={x + 6 + k * 12}
                    y={y + 64 - h * 52}
                    width={10}
                    height={h * 52}
                    className={mark}
                    opacity={0.75}
                  />
                ))}
              {r > c &&
                SM_POINTS.map(([px, py], k) => (
                  <circle
                    key={k}
                    cx={x + 6 + px! * 58}
                    cy={y + 64 - py! * 58}
                    r={2.4}
                    className={mark}
                    opacity={0.8}
                  />
                ))}
              {r < c && (
                <>
                  <rect
                    x={x}
                    y={y}
                    width={70}
                    height={70}
                    rx={2}
                    className={mark}
                    opacity={0.08 + (r + c) * 0.1}
                  />
                  <text
                    x={x + 35}
                    y={y + 35}
                    fontSize={13}
                    fontWeight={600}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-foreground"
                  >
                    {["0.82", "0.41", "0.37"][r + c - 1]}
                  </text>
                </>
              )}
            </g>
          );
        })
      )}
    </>
  ),
  anchors: {
    order: a(smX(1) + 35, 4, smX(1) + 60, 4),
    lower: a(smX(0) + 40, smX(1) - 10, 22, smX(1) + 18),
    upper: a(smX(2) + 50, smX(0) - 20, 290, smX(0) - 20),
    diagonal: a(smX(2) + 30, smX(2) - 10, 290, smX(2) - 40),
  },
};

/* -------------------------------------------------- joint missingness */

const JM_FIELDS = ["Email", "Phone", "Age", "Zip"];
const JM_MISSING = [0.3, 0.9, 0.35, 0.5];
const JM_ROWS = [
  { name: "All present", miss: [] as number[], n: 640 },
  { name: "", miss: [1], n: 210 },
  { name: "", miss: [1, 3], n: 95 },
  { name: "", miss: [0, 2, 3], n: 30 },
];
const jmX = (i: number) => 100 + i * 30;

const jointMissingness: Schematic = {
  width: 330,
  height: 168,
  label:
    "Joint missingness: four patterns of missing fields with their row counts",
  draw: () => (
    <>
      {JM_FIELDS.map((f, i) => (
        <g key={f}>
          <rect
            x={jmX(i) - 6}
            y={34 - JM_MISSING[i]! * 22}
            width={12}
            height={JM_MISSING[i]! * 22}
            className="fill-foreground/45"
          />
          <Text x={jmX(i)} y={44} middle size={9}>
            {f}
          </Text>
        </g>
      ))}
      {JM_ROWS.map((row, r) => {
        const y = 66 + r * 24;
        const miss = row.miss;
        return (
          <g key={r}>
            {row.name && (
              <Text x={84} y={y} end ink>
                {row.name}
              </Text>
            )}
            {miss.length > 1 && (
              <line
                x1={jmX(miss[0]!)}
                y1={y}
                x2={jmX(miss[miss.length - 1]!)}
                y2={y}
                className="stroke-foreground"
                strokeWidth={2}
              />
            )}
            {JM_FIELDS.map((_, i) => (
              <circle
                key={i}
                cx={jmX(i)}
                cy={y}
                r={4.5}
                className={
                  miss.includes(i)
                    ? "fill-foreground"
                    : "fill-muted-foreground/20"
                }
              />
            ))}
            <rect
              x={210}
              y={y - 7}
              width={(row.n / 640) * 80}
              height={14}
              rx={1.5}
              className={mark}
            />
            <Text x={214 + (row.n / 640) * 80} y={y} size={9}>
              {row.n}
            </Text>
          </g>
        );
      })}
    </>
  ),
  anchors: {
    field: a(jmX(1) + 6, 20, jmX(1) + 34, 12),
    all: a(30, 66, 14, 66),
    pattern: a(jmX(1), 90, 54, 102),
    line: a(115, 138, 115, 157),
    bar: a(250, 59, 250, 44),
  },
};

/* --------------------------------------------------------- 3d scatter */

const P3 = [
  [120, 112, 4, mark],
  [150, 96, 6, mark],
  [176, 120, 4, mark],
  [200, 84, 7, alt],
  [218, 106, 4, mark],
  [236, 74, 5, alt],
  [160, 70, 4, alt],
  [134, 134, 5, mark],
  [250, 98, 3, mark],
] as const;

const threeD: Schematic = {
  width: 320,
  height: 196,
  label: "A 3D scatter of points over a floor grid and back walls",
  draw: () => {
    const grid = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      grid.push(
        <line
          key={`a${k}`}
          x1={70 + t * 150}
          y1={160 + t * 20}
          x2={130 + t * 150}
          y2={120 + t * 20}
          className="stroke-border"
        />,
        <line
          key={`b${k}`}
          x1={70 + t * 60}
          y1={160 - t * 40}
          x2={220 + t * 60}
          y2={180 - t * 40}
          className="stroke-border"
        />,
        <line
          key={`c${k}`}
          x1={130 + t * 150}
          y1={120 + t * 20}
          x2={130 + t * 150}
          y2={30 + t * 20}
          className="stroke-border"
        />,
        <line
          key={`d${k}`}
          x1={130}
          y1={120 - t * 90}
          x2={280}
          y2={140 - t * 90}
          className="stroke-border"
        />
      );
    }
    return (
      <>
        <polygon
          points="70,160 220,180 280,140 130,120"
          className="fill-muted-foreground/10"
        />
        <polygon
          points="130,120 280,140 280,50 130,30"
          className="fill-muted-foreground/5"
        />
        {grid}
        <line
          x1={70}
          y1={160}
          x2={220}
          y2={180}
          className="stroke-foreground/70"
        />
        <line
          x1={70}
          y1={160}
          x2={130}
          y2={120}
          className="stroke-foreground/70"
        />
        <line
          x1={130}
          y1={120}
          x2={130}
          y2={30}
          className="stroke-foreground/70"
        />
        <Text x={150} y={184} middle size={9}>
          X
        </Text>
        <Text x={92} y={132} middle size={9}>
          Z
        </Text>
        <Text x={122} y={40} end size={9}>
          Y
        </Text>
        {P3.map(([x, y, r, c], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            className={`${c} stroke-card`}
            strokeWidth={1}
            opacity={0.9}
          />
        ))}
        <path
          d="M30 44 A58 18 0 0 1 142 40"
          fill="none"
          className="stroke-foreground/70"
          strokeWidth={1.5}
        />
        <path d="M142 40 l-6 -7 l8 -1 Z" className="fill-foreground/70" />
      </>
    );
  },
  anchors: {
    point: a(176, 120, 176, 150),
    encode: a(200, 84, 230, 40),
    orbit: a(62, 29, 22, 16),
    grid: a(110, 160, 60, 182),
  },
};

export const SCHEMATICS: Record<string, Schematic> = {
  row,
  line,
  retention,
  boxplot,
  funnel,
  donut,
  heatmap,
  calendar,
  timeline,
  waterfall,
  sankey,
  ecdf,
  hierarchy,
  "parallel-coordinates": parallel,
  "scatter-matrix": scatterMatrix,
  "joint-missingness": jointMissingness,
  "3d-scatter": threeD,
};
