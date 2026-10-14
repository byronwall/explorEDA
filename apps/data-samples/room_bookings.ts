/**
 * Writes the synthetic room bookings used by the timeline demo: four weeks
 * of bookings across 12 fictional rooms, one row per booking. Most are short
 * weekday meetings, with multi-day workshops in the large rooms.
 *
 * The bookings keep the mess real calendars have, so the timeline has
 * something to show: some rooms are double-booked, some bookings were
 * cancelled, and a few holds have no end yet. The fixed seed makes the file
 * stable.
 *
 *   node --experimental-strip-types room_bookings.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "room-bookings.csv";

let state = 0x726f6f6d;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(random() * items.length)]!;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const START = Date.UTC(2025, 2, 3);
const DAYS = 28;

interface Room {
  name: string;
  floor: number;
  seats: number;
  /** Bookings on a typical weekday. */
  load: number;
}

const rooms: Room[] = [
  { name: "Atlas", floor: 1, seats: 20, load: 2.2 },
  { name: "Birch", floor: 1, seats: 8, load: 3.4 },
  { name: "Cedar", floor: 1, seats: 6, load: 3.8 },
  { name: "Delta", floor: 2, seats: 12, load: 2.8 },
  { name: "Ember", floor: 2, seats: 4, load: 4.2 },
  { name: "Fjord", floor: 2, seats: 4, load: 3.9 },
  { name: "Grove", floor: 2, seats: 10, load: 2.4 },
  { name: "Harbor", floor: 3, seats: 30, load: 1.4 },
  { name: "Iris", floor: 3, seats: 6, load: 3.1 },
  { name: "Juniper", floor: 3, seats: 8, load: 2.6 },
  { name: "Kestrel", floor: 3, seats: 4, load: 3.6 },
  { name: "Lab 4", floor: 4, seats: 12, load: 1.2 },
];
const teams = [
  "Design",
  "Engineering",
  "Finance",
  "Marketing",
  "Operations",
  "Research",
  "Sales",
];

interface Booking {
  room: Room;
  team: string;
  start: number;
  end: number | null;
  status: "Confirmed" | "Cancelled" | "Hold";
  attendees: number;
}

const bookings: Booking[] = [];
const slot = (time: number) => Math.round(time / (HOUR / 2)) * (HOUR / 2);

for (let day = 0; day < DAYS; day += 1) {
  const date = START + day * DAY;
  const weekday = new Date(date).getUTCDay();
  if (weekday === 0 || weekday === 6) continue;
  for (const room of rooms) {
    const count = Math.max(0, Math.round(room.load * (0.6 + random() * 0.8)));
    // Spread bookings through the working day, 8:00 to 18:00.
    let cursor = date + 8 * HOUR + slot(random() * 2 * HOUR);
    for (let index = 0; index < count; index += 1) {
      const length =
        slot(HOUR / 2 + random() * random() * 3 * HOUR) || HOUR / 2;
      const start = cursor;
      const end = start + length;
      if (end > date + 18 * HOUR) break;
      const roll = random();
      bookings.push({
        room,
        team: pick(teams),
        start,
        end,
        status: roll < 0.07 ? "Cancelled" : "Confirmed",
        attendees: Math.max(1, Math.round(room.seats * (0.3 + random() * 0.7))),
      });
      // Some bookings land on top of the one before: a double booking.
      cursor =
        random() < 0.06
          ? start + slot(length / 2)
          : end + slot(random() * 1.5 * HOUR);
    }
  }
}

// Multi-day workshops in the large rooms.
for (const [room, firstDay, days, team] of [
  ["Harbor", 1, 3, "Sales"],
  ["Atlas", 8, 2, "Engineering"],
  ["Harbor", 15, 2, "Marketing"],
  ["Lab 4", 9, 4, "Research"],
  ["Atlas", 22, 3, "Design"],
] as const) {
  const target = rooms.find((item) => item.name === room)!;
  bookings.push({
    room: target,
    team,
    start: START + firstDay * DAY + 9 * HOUR,
    end: START + (firstDay + days - 1) * DAY + 17 * HOUR,
    status: "Confirmed",
    attendees: Math.round(target.seats * 0.8),
  });
}

// Holds with no end yet.
for (const [room, day, hour, team] of [
  ["Lab 4", 20, 9, "Research"],
  ["Delta", 24, 13, "Operations"],
  ["Ember", 26, 10, "Finance"],
] as const) {
  bookings.push({
    room: rooms.find((item) => item.name === room)!,
    team,
    start: START + day * DAY + hour * HOUR,
    end: null,
    status: "Hold",
    attendees: 2,
  });
}

bookings.sort(
  (a, b) => a.start - b.start || a.room.name.localeCompare(b.room.name)
);
const iso = (time: number) => new Date(time).toISOString().replace(".000", "");
const rows = ["booking_id,room,floor,team,start,end,status,attendees"];
bookings.forEach((item, index) => {
  rows.push(
    [
      `B${String(index + 1).padStart(4, "0")}`,
      item.room.name,
      item.room.floor,
      item.team,
      iso(item.start),
      item.end === null ? "" : iso(item.end),
      item.status,
      item.attendees,
    ].join(",")
  );
});

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} bookings written to ${output}`);
