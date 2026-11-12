import { useEffect, useState, useSyncExternalStore } from "react";

// Page-wide layers such as the confirm dialog and the toaster read global
// stores, so every workspace on a page would draw its own copy. Each copy
// stacks another dim backdrop, and a docs page with five examples turns
// the screen black. Only the first mounted host of a kind renders.
const hosts = new Map<string, symbol[]>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True for the one mounted component that should draw the `kind` layer. */
export function useSingleHost(kind: string): boolean {
  const [token] = useState(() => Symbol(kind));

  useEffect(() => {
    hosts.set(kind, [...(hosts.get(kind) ?? []), token]);
    notify();
    return () => {
      hosts.set(
        kind,
        (hosts.get(kind) ?? []).filter((host) => host !== token)
      );
      notify();
    };
  }, [kind, token]);

  return useSyncExternalStore(
    subscribe,
    () => hosts.get(kind)?.[0] === token,
    () => false
  );
}
