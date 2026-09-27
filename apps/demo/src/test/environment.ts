import { builtinEnvironments, type Environment } from "vitest/environments";

export default {
  ...builtinEnvironments.jsdom,
  async setup(global, options) {
    // React Router uses Node's Request, which requires Node's AbortSignal.
    const { AbortController, AbortSignal } = global;
    const environment = await builtinEnvironments.jsdom.setup(global, options);
    Object.assign(global, { AbortController, AbortSignal });
    return environment;
  },
} satisfies Environment;
