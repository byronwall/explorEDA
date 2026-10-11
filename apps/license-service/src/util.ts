const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** A short, readable random ID such as `lic_k3m9x2p7q4ra`. */
export function randomId(prefix: string, length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return `${prefix}_${id}`;
}

/** An unguessable token for links in emails. */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The same calendar day a number of months later, in UTC. */
export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isEmail(text: unknown): text is string {
  return (
    typeof text === "string" &&
    text.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())
  );
}

/** Compares two strings in time that doesn't depend on where they differ. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index++) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}
