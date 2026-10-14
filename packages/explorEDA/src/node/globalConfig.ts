/**
 * Preferences shared by every project on this machine. They live in
 * `~/.config/exploreda/config.json` (or `$XDG_CONFIG_HOME/exploreda`), and
 * `%APPDATA%\exploreda\config.json` on Windows. Nothing about a project is
 * kept here; that belongs in the project's own folder.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export type ThemePreference = "system" | "light" | "dark";

export interface GlobalConfig {
  theme: ThemePreference;
}

export const DEFAULT_CONFIG: GlobalConfig = { theme: "system" };

const THEMES = new Set<ThemePreference>(["system", "light", "dark"]);

export function configDir(env = process.env, platform = process.platform) {
  if (platform === "win32") {
    return path.join(
      env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"),
      "exploreda"
    );
  }
  return path.join(
    env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"),
    "exploreda"
  );
}

/** Only known keys with valid values survive; the rest take defaults. */
export function cleanConfig(value: unknown): GlobalConfig {
  const theme = (value as { theme?: unknown } | null)?.theme;
  return {
    theme: THEMES.has(theme as ThemePreference)
      ? (theme as ThemePreference)
      : DEFAULT_CONFIG.theme,
  };
}

export interface ConfigStore {
  read(): Promise<GlobalConfig>;
  write(change: Partial<GlobalConfig>): Promise<GlobalConfig>;
}

export function globalConfigStore(directory = configDir()): ConfigStore {
  const file = path.join(directory, "config.json");
  const read = async () => {
    try {
      return cleanConfig(JSON.parse(await fs.readFile(file, "utf8")));
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  };
  return {
    read,
    async write(change) {
      const next = cleanConfig({ ...(await read()), ...change });
      await fs.mkdir(directory, { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`);
      await fs.rename(temporary, file);
      return next;
    },
  };
}
