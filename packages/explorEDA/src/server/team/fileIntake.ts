/**
 * Data files that reach a team server project from outside: uploads from
 * an author's browser, and files the server downloads from a URL. Both
 * stream to a temporary file beside the target and are renamed into place
 * only when complete, so a failed or oversized transfer leaves the earlier
 * copy as it was.
 */
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import { createWriteStream, promises as fs } from "node:fs";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import path from "node:path";
import type { Readable } from "node:stream";
import { normalizeProjectPath } from "../../lib/project/files";
import { isDataFile } from "../../lib/project/tables";

/** The largest upload or download, unless the server sets another. */
export const DEFAULT_UPLOAD_LIMIT = 100 * 1024 * 1024;

/** Refuses an upload whose declared size is over the limit before reading it. */
export function checkDeclaredSize(header: string | undefined, limit: number) {
  const declared = Number(header);
  if (header !== undefined && Number.isFinite(declared) && declared > limit) {
    throw new IntakeError(
      413,
      `The file is larger than this server's ${megabytes(limit)} limit.`
    );
  }
}
/** How long a download may take, start to finish. */
export const FETCH_TIMEOUT_MS = 60_000;
const MAX_REDIRECTS = 5;

/** Where the server records what it downloaded, inside each project. */
export const FETCHED_FILE = ".exploreda/fetched.json";

export interface FetchedRecord {
  url: string;
  /** When the copy on disk was downloaded, as an ISO time. */
  fetchedAt: string;
  bytes: number;
  etag?: string;
}

export class IntakeError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "IntakeError";
  }
}

/** A project path for a data file, or an error saying why it can't be one. */
export function dataPath(requested: string) {
  const normalized = normalizeProjectPath(requested);
  if (!normalized || normalized.startsWith(".exploreda/")) {
    throw new IntakeError(400, `${requested} isn't a path in this project.`);
  }
  if (!isDataFile(normalized)) {
    throw new IntakeError(400, "Add a .csv or .json file.");
  }
  return normalized;
}

/** A file name from a URL, as `data/<name>`, defaulting to CSV. */
export function pathForUrl(url: string) {
  let name = "download.csv";
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (last) {
      name = decodeURIComponent(last);
    }
  } catch {
    // The URL is checked later; keep the default name.
  }
  name = name.replace(/[^\w.-]+/g, "-").replace(/^-+/, "") || "download";
  return `data/${isDataFile(name) ? name : `${name}.csv`}`;
}

function megabytes(bytes: number) {
  const value = bytes / 1024 / 1024;
  return `${value >= 1 ? Math.round(value) : value.toFixed(2)} MB`;
}

/**
 * Streams `source` into `target`, refusing more than `limit` bytes, and
 * returns how many bytes it wrote.
 */
export async function streamIntoPlace(
  source: Readable,
  target: string,
  limit: number
) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  let bytes = 0;
  try {
    await new Promise<void>((resolve, reject) => {
      const out = createWriteStream(temporary);
      source.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > limit) {
          // Stop writing, but let the rest arrive and be dropped, so the
          // reply can still reach the sender.
          source.unpipe(out);
          source.removeAllListeners("data");
          source.resume();
          out.destroy();
          reject(
            new IntakeError(
              413,
              `The file is larger than this server's ${megabytes(limit)} limit.`
            )
          );
        }
      });
      source.on("error", (error) => {
        out.destroy();
        reject(error);
      });
      out.on("error", reject);
      out.on("finish", resolve);
      source.pipe(out);
    });
    await fs.rename(temporary, target);
    return bytes;
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

/**
 * Addresses a download may never reach: this machine, link-local
 * addresses, and cloud metadata services. Company addresses such as
 * 10.0.0.0/8 are allowed, because internal exports are the point.
 */
const BLOCKED = new BlockList();
BLOCKED.addSubnet("0.0.0.0", 8, "ipv4");
BLOCKED.addSubnet("127.0.0.0", 8, "ipv4");
BLOCKED.addSubnet("169.254.0.0", 16, "ipv4");
BLOCKED.addAddress("100.100.100.200", "ipv4");
BLOCKED.addAddress("::", "ipv6");
BLOCKED.addAddress("::1", "ipv6");
BLOCKED.addSubnet("fe80::", 10, "ipv6");
BLOCKED.addAddress("fd00:ec2::254", "ipv6");

const BLOCKED_NAMES = new Set(["metadata", "metadata.google.internal"]);

/** True when a download must not connect to this address. */
export function isBlockedAddress(address: string) {
  const family = isIP(address);
  if (family === 4) {
    return BLOCKED.check(address, "ipv4");
  }
  if (family === 6) {
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)?.[1];
    return mapped
      ? BLOCKED.check(mapped, "ipv4")
      : BLOCKED.check(address, "ipv6");
  }
  return true;
}

/** Resolves a host name and refuses it if any address is blocked. */
export const guardedLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) {
      callback(error, "", 0);
      return;
    }
    const list = addresses as unknown as LookupAddress[];
    const blocked = list.find((entry) => isBlockedAddress(entry.address));
    if (blocked || !list.length) {
      callback(
        new IntakeError(
          403,
          `${hostname} points at an address this server doesn't download from.`
        ) as NodeJS.ErrnoException,
        "",
        0
      );
      return;
    }
    if ((options as { all?: boolean }).all) {
      (callback as unknown as (e: null, a: LookupAddress[]) => void)(
        null,
        list
      );
    } else {
      callback(null, list[0]!.address, list[0]!.family);
    }
  });
};

export interface Download {
  body: IncomingMessage;
  etag?: string;
}

/**
 * Starts a GET of `url`, following redirects. Every connection checks the
 * address it resolves to, so a redirect or a changed DNS answer can't
 * reach a blocked address.
 */
export function download(
  url: string,
  { timeoutMs = FETCH_TIMEOUT_MS, redirects = MAX_REDIRECTS } = {},
  lookup: LookupFunction = guardedLookup
): Promise<Download> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Promise.reject(
      new IntakeError(400, "Enter a full http or https address.")
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Promise.reject(
      new IntakeError(400, "Only http and https addresses can be downloaded.")
    );
  }
  if (BLOCKED_NAMES.has(parsed.hostname.toLowerCase())) {
    return Promise.reject(
      new IntakeError(
        403,
        `${parsed.hostname} isn't an address this server downloads from.`
      )
    );
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isBlockedAddress(host)) {
    return Promise.reject(
      new IntakeError(
        403,
        `${host} isn't an address this server downloads from.`
      )
    );
  }
  return new Promise((resolve, reject) => {
    const send = parsed.protocol === "https:" ? httpsRequest : httpRequest;
    const req = send(
      parsed,
      {
        method: "GET",
        lookup,
        timeout: timeoutMs,
        headers: { "user-agent": "explorEDA team server", accept: "*/*" },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          if (redirects <= 0) {
            reject(
              new IntakeError(502, "The address redirected too many times.")
            );
            return;
          }
          const next = new URL(res.headers.location, parsed).href;
          download(next, { timeoutMs, redirects: redirects - 1 }, lookup).then(
            resolve,
            reject
          );
          return;
        }
        if (status < 200 || status >= 300) {
          res.resume();
          reject(
            new IntakeError(
              502,
              `The address answered ${status} ${res.statusMessage ?? ""}`.trim() +
                "."
            )
          );
          return;
        }
        const etag = res.headers.etag;
        resolve({ body: res, ...(etag ? { etag } : {}) });
      }
    );
    req.on("timeout", () => {
      req.destroy(new IntakeError(504, "The address took too long to answer."));
    });
    req.on("error", (error) => {
      reject(
        error instanceof IntakeError
          ? error
          : new IntakeError(502, `Couldn't download it: ${error.message}`)
      );
    });
    req.end();
  });
}

export async function readFetched(folder: string) {
  try {
    return JSON.parse(
      await fs.readFile(path.join(folder, FETCHED_FILE), "utf8")
    ) as Record<string, FetchedRecord>;
  } catch {
    return {};
  }
}

export async function writeFetched(
  folder: string,
  records: Record<string, FetchedRecord>
) {
  const target = path.join(folder, FETCHED_FILE);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(records, null, 2)}\n`);
  await fs.rename(temporary, target);
}
