/**
 * The MCP protocol over the tools in `./tools`: `initialize`, `tools/list`,
 * and `tools/call`, one JSON-RPC message in and one out. The `/mcp` route
 * loads this module on its first call, so the `exploreda` command starts
 * without chart code.
 */
import type { ProjectFiles } from "@/lib/project/files";
import {
  check,
  FEEDBACK_KINDS,
  fields,
  reference,
  submitFeedback,
  ToolError,
  writeEda,
} from "./tools";

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS = `explorEDA builds dashboards from .eda text in this project folder.
Loop: call fields to see each query's fields, reference for the grammar (and reference with a chart type for its settings), then write_eda to save an analysis. write_eda returns every problem with its line and a fix; repeat until complete is true. check does the same without saving.
When a tool fails in a way you can't fix, gives a confusing result, or lacks something you need, call submit_feedback once with what happened and the change you propose, after you finish or give up on the request.`;

const text = (description: string) => ({ type: "string", description });

const TOOLS = [
  {
    name: "fields",
    title: "List fields",
    description:
      "Lists each query's fields with type, missing count, and example values, named as an analysis writes them (orders.amount). Call it before writing an analysis.",
    inputSchema: {
      type: "object",
      properties: {
        query: text(
          "One query's ID, such as order-lines. Omit for every query."
        ),
      },
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "reference",
    title: "Read the grammar",
    description:
      "Returns the dashboard grammar as text. topic=project or notebook gives those files' grammar, composition its parts, and a chart type (bar, hist, scatter, …) every setting it takes.",
    inputSchema: {
      type: "object",
      properties: {
        topic: text(
          "project, notebook, composition, or a chart type. Omit for dashboard text."
        ),
      },
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "check",
    title: "Check an analysis",
    description:
      "Builds analysis text against the project's data and returns its views, chart count, and problems, each with line, column, and a fix. Saves nothing.",
    inputSchema: {
      type: "object",
      properties: {
        path: text(
          "Where the text would live, such as returns.eda or notes.eda.md. Default check.eda."
        ),
        text: text("The whole analysis text."),
      },
      required: ["text"],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "write_eda",
    title: "Save an analysis",
    description:
      "Saves the whole text of an analysis (.eda) or notebook (.eda.md) in the project folder, replacing the file, then returns what check returns. The open app shows it.",
    inputSchema: {
      type: "object",
      properties: {
        path: text("A path inside the folder, such as returns.eda."),
        text: text("The whole file's text."),
      },
      required: ["path", "text"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: "submit_feedback",
    title: "Report a tool problem",
    description:
      "Tells the explorEDA developer about a problem with these tools or something they lack, with a proposed fix. Saves one file under .exploreda/feedback/. Use it for the tools (a wrong result, an unclear problem or fix, a missing tool or setting), not for the data.",
    inputSchema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: [...FEEDBACK_KINDS],
          description:
            "bug = wrong result or failure; confusing = unclear description, problem, or fix; missing = a tool or setting you needed",
        },
        summary: text(
          "One line, such as 'check gives no fix for an unknown field'."
        ),
        tool: text("The tool this is about, when there is one."),
        happened: text(
          "What you called (inputs, trimmed), what came back, and what you expected."
        ),
        proposedFix: text(
          "The change you suggest: new wording, a new field or tool, or a behavior change."
        ),
      },
      required: ["kind", "summary", "happened", "proposedFix"],
    },
    annotations: { readOnlyHint: false },
  },
];

type Args = Record<string, unknown>;

const str = (args: Args, key: string) =>
  typeof args[key] === "string" ? (args[key] as string) : undefined;

function need(args: Args, key: string) {
  const value = str(args, key);
  if (value === undefined) {
    throw new ToolError(`${key} is required and must be text.`);
  }
  return value;
}

async function callTool(
  files: ProjectFiles,
  name: string,
  args: Args,
  onWrite?: (paths: string[]) => void
): Promise<unknown> {
  switch (name) {
    case "fields":
      return fields(files, { query: str(args, "query") });
    case "reference":
      return reference({ topic: str(args, "topic") });
    case "check":
      return check(files, {
        path: str(args, "path"),
        text: need(args, "text"),
      });
    case "write_eda": {
      const result = await writeEda(files, {
        path: need(args, "path"),
        text: need(args, "text"),
      });
      onWrite?.([result.saved]);
      return result;
    }
    case "submit_feedback":
      return submitFeedback(files, {
        kind: need(args, "kind") as never,
        summary: need(args, "summary"),
        tool: str(args, "tool"),
        happened: need(args, "happened"),
        proposedFix: need(args, "proposedFix"),
      });
    default:
      throw new ToolError(
        `No tool is named ${name}.`,
        `Use one of: ${TOOLS.map((tool) => tool.name).join(", ")}.`
      );
  }
}

interface JsonRpcMessage {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

export interface McpContext {
  files: ProjectFiles;
  version: string;
  /** Called with the paths a tool wrote, so the open app reloads them. */
  onWrite?: (paths: string[]) => void;
}

/**
 * Answers one JSON-RPC message. Returns undefined for a notification or a
 * response, which get no reply.
 */
export async function handleMcpMessage(
  message: JsonRpcMessage,
  context: McpContext
): Promise<object | undefined> {
  if (message.id === undefined || !message.method) {
    return undefined;
  }
  const reply = (result: unknown) => ({
    jsonrpc: "2.0",
    id: message.id,
    result,
  });
  const error = (code: number, text: string) => ({
    jsonrpc: "2.0",
    id: message.id,
    error: { code, message: text },
  });
  switch (message.method) {
    case "initialize": {
      const asked = message.params?.protocolVersion;
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked as string)
          ? asked
          : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: "exploreda", version: context.version },
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      const name = String(message.params?.name ?? "");
      const args = (message.params?.arguments ?? {}) as Args;
      try {
        const result = await callTool(
          context.files,
          name,
          args,
          context.onWrite
        );
        return reply({
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        });
      } catch (caught) {
        // Every failure comes back as this call's result, so the agent
        // never waits on a reply it can't match. Don't test the class:
        // the command and this bundle each have their own copy of it.
        const fix = (caught as { fix?: string }).fix;
        return reply({
          content: [
            {
              type: "text",
              text: `${caught instanceof Error ? caught.message : String(caught)}${fix ? `\nfix: ${fix}` : ""}`,
            },
          ],
          isError: true,
        });
      }
    }
    default:
      return error(-32601, `No method ${message.method}.`);
  }
}
