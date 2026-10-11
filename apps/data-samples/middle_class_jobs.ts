/**
 * Writes illustrative figures for the "changing nature of middle-class
 * jobs" slope-chart demo: for ten occupation groups, several occupations
 * each, the jobs per 1,000 middle-class jobs in 1980 and in 2012, and the
 * occupation's share of women. The values are read approximately from the
 * New York Times graphic by Gregor Aisch and Robert Gebeloff (2015). Only
 * the five occupations it labels are named; the rest are numbered.
 *
 *   node --experimental-strip-types middle_class_jobs.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "middle-class-jobs.csv";

// An unnamed occupation has an empty name and is numbered in its group.
type Job = [name: string, y1980: number, y2012: number, women: number];
const groups: { group: string; order: number; change: number; jobs: Job[] }[] =
  [
    {
      group: "Professionals",
      order: 1,
      change: 80,
      jobs: [
        ["Registered nurses", 19.2, 39.1, 92],
        ["", 41.2, 50.5, 70],
        ["", 20, 15, 10],
        ["", 5.8, 25.2, 30],
        ["", 16.7, 11.8, 50],
        ["", 7, 19.5, 70],
        ["", 3, 6.7, 50],
        ["", 11.3, 18, 50],
      ],
    },
    {
      group: "Managers",
      order: 2,
      change: 40,
      jobs: [
        ["", 70, 84, 30],
        ["", 14.6, 22.7, 50],
        ["", 9.6, 9, 30],
        ["", 6, 10.2, 70],
        ["", 3, 9, 50],
        ["", 1, 5.4, 30],
      ],
    },
    {
      group: "Service and sales",
      order: 3,
      change: 23,
      jobs: [
        ["", 43, 37.5, 10],
        ["", 18, 34.2, 30],
        ["", 15.5, 13.4, 50],
        ["", 14.3, 11, 10],
        ["", 6.2, 9.7, 30],
        ["", 4.2, 11, 70],
        ["", 1, 1.6, 92],
      ],
    },
    {
      group: "Technicians",
      order: 4,
      change: 13,
      jobs: [
        ["Health technologists", 8.2, 20.8, 75],
        ["", 16.6, 10.4, 10],
        ["", 10.2, 12.2, 30],
        ["", 2, 6.3, 92],
        ["", 0.7, 1, 30],
      ],
    },
    {
      group: "Police, fire, military",
      order: 5,
      change: 3,
      jobs: [
        ["Police and detectives", 13.8, 18.1, 10],
        ["", 10.2, 8.5, 10],
        ["", 5.4, 4.5, 10],
        ["", 4.7, 5, 30],
        ["", 0.4, 0.9, 30],
      ],
    },
    {
      group: "Admin support",
      order: 6,
      change: -3,
      jobs: [
        ["Secretaries", 25.3, 26.2, 97],
        ["", 22.7, 16, 10],
        ["", 18, 15, 70],
        ["", 15.4, 10.3, 10],
        ["", 13, 15, 50],
        ["", 10.5, 9.3, 92],
        ["", 6.6, 21.8, 70],
        ["", 5.4, 2.7, 30],
        ["", 3.4, 4.6, 92],
      ],
    },
    {
      group: "Transportation",
      order: 7,
      change: -26,
      jobs: [
        ["", 38.7, 31.1, 10],
        ["", 25, 6.8, 10],
        ["", 14.4, 9.2, 10],
        ["", 7.2, 9.2, 10],
        ["", 4.6, 4.3, 30],
        ["", 0.7, 2.5, 10],
      ],
    },
    {
      group: "Construction",
      order: 8,
      change: -31,
      jobs: [
        ["", 38.2, 22.4, 10],
        ["", 31.2, 23.8, 10],
        ["", 13.9, 11.8, 10],
        ["", 13, 9.8, 10],
        ["", 11.2, 9, 10],
        ["", 9.6, 8.5, 10],
        ["", 7.9, 8.1, 10],
        ["", 2.9, 3.6, 10],
      ],
    },
    {
      group: "Skilled production",
      order: 9,
      change: -38,
      jobs: [
        ["Production supervisors", 33.3, 10.6, 10],
        ["", 14.7, 5.6, 10],
        ["", 10.2, 6.7, 30],
        ["", 3.1, 2, 10],
        ["", 2.5, 1.4, 10],
        ["", 1, 1.1, 10],
        ["", 0.6, 0.6, 10],
      ],
    },
    {
      group: "Machine operators",
      order: 10,
      change: -62,
      jobs: [
        ["", 50.8, 17.6, 10],
        ["", 15.4, 6.3, 30],
        ["", 12.9, 6, 30],
        ["", 11, 5, 10],
        ["", 5.7, 2, 10],
        ["", 3.5, 1, 50],
      ],
    },
  ];

const rows: string[] = [
  "Group,Group order,Group change,Occupation,Year,Jobs per 1000,Women share,Women minus men",
];
for (const { group, order, change, jobs } of groups)
  for (const [index, [name, y1980, y2012, women]] of jobs.entries())
    for (const [year, value] of [
      [1980, y1980],
      [2012, y2012],
    ] as const)
      rows.push(
        `"${group}",${order},${change},"${name || `${group} ${index + 1}`}",${year},${value},${women},${2 * women - 100}`
      );
writeFileSync(output, `${rows.join("\n")}\n`);
