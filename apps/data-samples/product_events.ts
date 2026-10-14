/**
 * Writes the synthetic product event log used by the funnel and retention
 * demos: about 2,000 visitors to a fictional app from January to June 2025,
 * one row per event. Visitors move through visit → signup → create_project →
 * invite_team → upgrade at rates that differ by channel, and signed-up users
 * come back in later weeks less often as time passes.
 *
 * The log keeps the mess real logs have, so the funnel rules have something
 * to get right: repeated visits, a few invites sent before a first project,
 * upgrades that skip the invite, and some anonymous visits with no user.
 * The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types product_events.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "product-events.csv";

let state = 0x66756e6c;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(items: readonly T[]) =>
  items[Math.floor(random() * items.length)]!;

const START = Date.UTC(2025, 0, 6);
const END = Date.UTC(2025, 5, 30, 23, 59);
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

interface Channel {
  name: string;
  share: number;
  /** Chance of each next step, given the one before. */
  signup: number;
  project: number;
  invite: number;
  upgrade: number;
  /** Chance a signed-up user is active in their first week back. */
  retain: number;
}

const channels: Channel[] = [
  {
    name: "Search",
    share: 0.38,
    signup: 0.55,
    project: 0.72,
    invite: 0.48,
    upgrade: 0.42,
    retain: 0.62,
  },
  {
    name: "Social",
    share: 0.27,
    signup: 0.42,
    project: 0.6,
    invite: 0.38,
    upgrade: 0.3,
    retain: 0.45,
  },
  {
    name: "Referral",
    share: 0.2,
    signup: 0.7,
    project: 0.8,
    invite: 0.62,
    upgrade: 0.5,
    retain: 0.74,
  },
  {
    name: "Email",
    share: 0.15,
    signup: 0.5,
    project: 0.66,
    invite: 0.4,
    upgrade: 0.46,
    retain: 0.58,
  },
];
const devices = ["Desktop", "Desktop", "Desktop", "Mobile", "Mobile", "Tablet"];

function channelFor() {
  let roll = random();
  for (const channel of channels) {
    roll -= channel.share;
    if (roll < 0) return channel;
  }
  return channels[0]!;
}

const iso = (time: number) =>
  new Date(Math.round(time / 60_000) * 60_000)
    .toISOString()
    .replace(".000", "");

interface Event {
  user: string;
  event: string;
  at: number;
  channel: string;
  device: string;
}

const events: Event[] = [];
const VISITORS = 2000;

for (let index = 1; index <= VISITORS; index += 1) {
  const user = `U${String(index).padStart(4, "0")}`;
  const channel = channelFor();
  const device = pick(devices);
  const push = (event: string, at: number) => {
    if (at <= END)
      events.push({ user, event, at, channel: channel.name, device });
  };
  // Arrivals grow over the half year.
  const arrival = START + Math.sqrt(random()) * (END - START - 2 * DAY);
  let time = arrival + random() * 10 * HOUR;
  push("visit", time);
  // Repeat visits before deciding.
  while (random() < 0.35) {
    time += random() * 3 * DAY;
    push("visit", time);
  }
  if (random() >= channel.signup) continue;
  time += 5 * 60_000 + random() * 2 * DAY;
  const signedUp = time;
  push("signup", time);

  const project = random() < channel.project;
  const invite = project && random() < channel.invite;
  // A few users invite a teammate before creating their first project.
  const inviteFirst = invite && random() < 0.08;
  if (project) {
    const projectAt = time + random() * 4 * DAY;
    if (inviteFirst) {
      push("invite_team", projectAt - (1 + random() * 12) * HOUR);
      push("create_project", projectAt);
    } else {
      push("create_project", projectAt);
      if (invite) push("invite_team", projectAt + random() * 9 * DAY);
    }
    time = projectAt;
  }
  // Upgrades usually follow an invite, but some users skip it.
  const upgradeChance = invite
    ? channel.upgrade
    : project
      ? channel.upgrade * 0.25
      : 0.02;
  if (random() < upgradeChance) {
    push("upgrade", time + (2 + random() * 26) * DAY);
  }

  // Return visits: each later calendar week (Monday to Sunday, UTC), a
  // falling chance of coming back.
  const signupDay = Math.floor(signedUp / DAY) * DAY;
  const signupWeek =
    signupDay - ((new Date(signupDay).getUTCDay() + 6) % 7) * DAY;
  for (let week = 1; signedUp + week * WEEK < END; week += 1) {
    const chance = channel.retain * Math.pow(0.86, week - 1) + 0.04;
    if (random() >= chance) continue;
    const sessions = 1 + Math.floor(random() * 3);
    for (let session = 0; session < sessions; session += 1) {
      push("session", signupWeek + week * WEEK + random() * WEEK);
    }
  }
}

// Anonymous visits that never got a user.
for (let index = 0; index < 60; index += 1) {
  const at = START + random() * (END - START);
  events.push({
    user: "",
    event: "visit",
    at,
    channel: pick(channels).name,
    device: pick(devices),
  });
}

events.sort((a, b) => a.at - b.at);
const rows = ["user_id,event,at,channel,device"];
for (const item of events) {
  rows.push(
    `${item.user},${item.event},${iso(item.at)},${item.channel},${item.device}`
  );
}

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} events written to ${output}`);
