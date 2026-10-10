/**
 * Writes the synthetic message log used by the composition demo: about
 * 10,000 messages between one mailbox and 12 fictional correspondents over
 * six years. Each correspondent has an active span and a few busy months, so
 * monthly strips show distinct shapes. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types message_log.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "message-log.csv";

let state = 0x6d61696c;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Correspondent {
  name: string;
  role: string;
  /** Months from January 2019. */
  start: number;
  end: number;
  /** Typical messages in an active month. */
  rate: number;
  /** Months with a burst of messages. */
  peaks: number[];
  sentShare: number;
}

const correspondents: Correspondent[] = [
  { name: "Avery Lin", role: "Counsel", start: 0, end: 71, rate: 26, peaks: [30, 31, 52], sentShare: 0.45 },
  { name: "Mara Okafor", role: "Researcher", start: 4, end: 66, rate: 19, peaks: [20, 44], sentShare: 0.55 },
  { name: "Jonas Weber", role: "Banker", start: 10, end: 71, rate: 15, peaks: [58, 59, 60], sentShare: 0.7 },
  { name: "Priya Raman", role: "Executive", start: 0, end: 40, rate: 16, peaks: [12, 13], sentShare: 0.4 },
  { name: "Tomás Ruiz", role: "Publicist", start: 18, end: 71, rate: 12, peaks: [36], sentShare: 0.5 },
  { name: "Hana Sato", role: "Architect", start: 24, end: 60, rate: 12, peaks: [41, 42], sentShare: 0.6 },
  { name: "Elliot Park", role: "Investor", start: 2, end: 34, rate: 10, peaks: [8], sentShare: 0.35 },
  { name: "Grace Mensah", role: "Physician", start: 30, end: 71, rate: 9, peaks: [62, 63], sentShare: 0.5 },
  { name: "Lukas Novak", role: "Pilot", start: 6, end: 71, rate: 6, peaks: [26, 50], sentShare: 0.65 },
  { name: "Sofia Romano", role: "Gallerist", start: 40, end: 71, rate: 8, peaks: [55], sentShare: 0.45 },
  { name: "Dev Kapoor", role: "Engineer", start: 14, end: 48, rate: 6, peaks: [22], sentShare: 0.5 },
  { name: "Iris Holm", role: "Assistant", start: 0, end: 71, rate: 4, peaks: [], sentShare: 0.3 },
];

const rows: string[] = ["Date,Correspondent,Role,Direction,Words"];
for (const person of correspondents) {
  for (let month = person.start; month <= person.end; month += 1) {
    // Quiet months are common; activity rises toward the middle of a span.
    if (random() < 0.12) continue;
    const span = person.end - person.start || 1;
    const shape = 0.5 + Math.sin(((month - person.start) / span) * Math.PI);
    const peak = person.peaks.includes(month) ? 4 + random() * 3 : 1;
    const count = Math.round(person.rate * shape * peak * (0.5 + random()) * 1.15);
    const year = 2019 + Math.floor(month / 12);
    const monthIndex = month % 12;
    const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    for (let index = 0; index < count; index += 1) {
      const day = 1 + Math.floor(random() * days);
      const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const direction = random() < person.sentShare ? "Sent" : "Received";
      const words = Math.max(3, Math.round(-Math.log(1 - random()) * 120));
      rows.push(`${date},${person.name},${person.role},${direction},${words}`);
    }
  }
}

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} messages written to ${output}`);
