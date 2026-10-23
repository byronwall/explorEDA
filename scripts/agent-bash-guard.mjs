// Claude Code PreToolUse hook: refuses Bash calls that wait in the foreground.
// Exit code 2 blocks the call and shows stderr to the agent.
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const { command = "", run_in_background: background } = input.tool_input ?? {};

const waits = [
  [/(^|[;&|(]\s*)sleep\s+\d/, "a foreground `sleep`"],
  [/\bgh\s+pr\s+checks\b[^\n]*--watch/, "`gh pr checks --watch`"],
  [/\bgh\s+run\s+watch\b/, "`gh run watch`"],
];

const hit = background
  ? undefined
  : waits.find(([pattern]) => pattern.test(command));
if (hit) {
  process.stderr.write(
    `Blocked ${hit[1]}: it holds the session for minutes. ` +
      "Run the wait with run_in_background, or wait on a condition with Monitor. " +
      "In the desktop app the PR monitor already reports CI. See docs/agent-guide.md#traps.\n"
  );
  process.exit(2);
}
