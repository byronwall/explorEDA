/** Starts the local server on this machine's loopback address only. */
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import type { AddressInfo } from "node:net";
import { createRequestHandler, type HandlerOptions } from "./handler";

export interface StartedServer {
  server: Server;
  port: number;
  url: string;
  close(): Promise<void>;
}

function listen(server: Server, port: number, host: string) {
  return new Promise<number>((resolve, reject) => {
    const failed = (error: Error) => {
      server.off("listening", listening);
      reject(error);
    };
    const listening = () => {
      server.off("error", failed);
      resolve((server.address() as AddressInfo).port);
    };
    server.once("error", failed);
    server.once("listening", listening);
    server.listen(port, host);
  });
}

/**
 * Listens on `port`, or the next free one of the following `tries`. Port 0
 * picks any free port.
 */
export function startServer(
  options: HandlerOptions & { port: number; tries?: number }
): Promise<StartedServer> {
  const handle = createRequestHandler(options);
  return startHttpServer({
    handle,
    port: options.port,
    tries: options.tries,
    host: "127.0.0.1",
    link: (port) =>
      `http://127.0.0.1:${port}/?token=${encodeURIComponent(options.token)}`,
  });
}

export async function startHttpServer(options: {
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  port: number;
  host: string;
  tries?: number;
  /** The address to print for a port. */
  link: (port: number) => string;
}): Promise<StartedServer> {
  const server = createServer((req, res) => {
    void options.handle(req, res);
  });
  const tries = options.port === 0 ? 1 : (options.tries ?? 20);
  let lastError: unknown;
  for (let offset = 0; offset < tries; offset++) {
    try {
      const port = await listen(server, options.port + offset, options.host);
      return {
        server,
        port,
        url: options.link(port),
        close: () =>
          new Promise((resolve) => {
            server.closeAllConnections?.();
            server.close(() => resolve());
          }),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EADDRINUSE") {
        throw error;
      }
      lastError = error;
    }
  }
  throw lastError;
}
