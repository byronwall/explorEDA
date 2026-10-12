/**
 * Writes a synthetic research lab's operating budget: for each quarter and
 * line item, the planned and actual amount in thousands of dollars. Funding
 * is positive and spending negative, so a scenario's total is the lab's net
 * position. Actual rows also carry the amount's size, with no sign, for
 * shares of where the money came from and went. Each line's actual differs from plan by a fixed share per
 * quarter, so the file is the same on every run.
 *
 *   node --experimental-strip-types lab_budget.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "lab-budget.csv";

/** Annual plan in $K, and actual over plan in each quarter. */
const lines: [group: string, line: string, plan: number, drift: number[]][] = [
  ["Funding", "Federal grants", 2400, [0, -0.04, -0.08, -0.06]],
  ["Funding", "Industry contracts", 900, [0.05, 0.12, 0.18, 0.2]],
  ["Funding", "Internal funds", 600, [0, 0, 0, 0]],
  ["Funding", "Licensing", 150, [-0.2, -0.1, 0.3, 0.5]],
  ["Staff", "Salaries", -1800, [0.01, 0.02, 0.03, 0.03]],
  ["Staff", "Benefits", -450, [0.02, 0.03, 0.04, 0.05]],
  ["Staff", "Postdoc stipends", -360, [-0.1, -0.08, 0, 0]],
  ["Operations", "Equipment", -520, [0.15, 0.35, 0.1, 0.05]],
  ["Operations", "Consumables", -310, [0.08, 0.1, 0.12, 0.14]],
  ["Operations", "Compute", -240, [-0.05, 0.1, 0.25, 0.3]],
  ["Operations", "Travel", -90, [-0.3, -0.2, -0.15, -0.1]],
  ["Operations", "Facilities", -180, [0, 0, 0.02, 0.02]],
];
const weights = [0.24, 0.25, 0.25, 0.26];

const rows: string[] = [
  "Quarter,Group,Line item,Scenario,Amount ($K),Actual size ($K)",
];
weights.forEach((weight, quarter) => {
  for (const [group, line, plan, drift] of lines) {
    const planned = Math.round(plan * weight);
    const actual = Math.round(planned * (1 + drift[quarter]!));
    const label = `Q${quarter + 1}`;
    rows.push(`${label},${group},${line},Plan,${planned},`);
    rows.push(`${label},${group},${line},Actual,${actual},${Math.abs(actual)}`);
  }
});
writeFileSync(output, `${rows.join("\n")}\n`);
