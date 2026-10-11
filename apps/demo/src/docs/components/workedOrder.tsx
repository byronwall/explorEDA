import { labelClass } from "./chrome";

const RAW = [
  ["Units", "2"],
  ["Unit Price", "40"],
  ["Discount", "5"],
  ["Cost", "45"],
  ["Channel", "Online"],
] as const;

/** Order T-001 from the scatter trace example, from raw row to point. */
export function WorkedOrder() {
  return (
    <div className="mt-4 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)_minmax(0,3fr)]">
      <div className="border-b border-border p-4 md:border-b-0 md:border-r">
        <p className={labelClass}>Raw row T-001</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {RAW.map(([name, value]) => (
            <div key={name} className="contents">
              <dt className="text-muted-foreground">{name}</dt>
              <dd className="text-right font-mono tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-b border-border p-4 md:border-b-0 md:border-r">
        <p className={labelClass}>Calculations</p>
        <ol className="mt-3 space-y-1.5 font-mono text-sm">
          <li>
            <span className="font-semibold">Gross sales</span>{" "}
            <span className="text-muted-foreground">= 2 × 40 =</span> 80
          </li>
          <li>
            <span className="font-semibold">Net sales</span>{" "}
            <span className="text-muted-foreground">= 80 − 5 =</span> 75
          </li>
          <li>
            <span className="font-semibold">Contribution</span>{" "}
            <span className="text-muted-foreground">= 75 − 45 =</span> 30
          </li>
        </ol>
      </div>
      <div className="flex flex-col justify-center bg-muted/50 p-4">
        <p className={labelClass}>Scatter point</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
          (75, 30)
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          X = Net sales, Y = Contribution
        </p>
      </div>
    </div>
  );
}
