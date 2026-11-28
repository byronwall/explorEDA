/**
 * The MCP protocol over the tools in `./tools`: `initialize`, `tools/list`,
 * and `tools/call`, one JSON-RPC message in and one out. The `/mcp` route
 * loads this module on its first call, so the `exploreda` command starts
 * without chart code.
 */
import type { ProjectFiles } from "@/lib/project/files";
import {
  check,
  deleteEda,
  describe,
  FEEDBACK_KINDS,
  fields,
  format,
  project,
  readEda,
  reference,
  renameEda,
  submitFeedback,
  summarize,
  ToolError,
  writeEda,
  type ToolOptions,
} from "./tools";
import { addData } from "./addData";

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS = `explorEDA builds dashboards from .eda text in this project folder. A person may have the app open on it; every save shows there.
Steps: project (sources, queries, files; an empty folder, or data files project lists as unsourced, start with add_data), fields (each query's fields), reference (the grammar; reference topic=<chart word> for one chart's settings), then write_eda. Each save returns every problem with its line and a fix; repeat until complete is true. check does the same without saving. summarize gives a query's real numbers, grouped, to check a chart or to cite in prose.
Rules that save rounds:
- Several tables that share keys (orders.customer_id and customers.id, run_id in runs and jobs) need a relate line for each link in the project text. add_data and project list suggestedLinks from key names and matching values: add the right ones before writing analyses.
- An analysis starts with eda query=<id>, and names fields as fields lists them, such as orders.amount.
- Alias, calc, and group lines reach every view in the file, so give each file one query. Put a view on another query in its own file.
- Write aliases (amount:num=orders.amount), calc, and group lines above the views, not inside a view body.
- Give every chart a title= that says what it shows; check notes repeated titles.
- To change a file that exists, call read_eda and send its version. A stale version is refused: read again and merge, because a person may have edited it.
When a tool fails in a way you can't fix, gives a confusing result, or lacks something you need, call submit_feedback once, after you finish or give up.`;

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
          "project, notebook, composition, axes (settings every chart takes), or a chart word such as hist. Omit for dashboard text."
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
        path: text(
          "A path inside the folder, such as returns.eda. exploreda.eda is the project text."
        ),
        text: text("The whole file's text."),
        version: text(
          "The version read_eda gave. Required when the file exists; omit for a new file."
        ),
      },
      required: ["path", "text"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: "add_data",
    title: "Add data",
    description:
      "Starts a project from data, or adds more: copies a local CSV or JSON file in (from), writes rows you send (rows), or fetches a CSV or JSON address (url). With only path, it adds a source for a data file already in the folder. Adds the source to the project text and returns its fields, and suggestedLinks: relate lines to the other sources whose keys its values match. Refuses files over 100 MB, web pages, and replacing a file.",
    inputSchema: {
      type: "object",
      properties: {
        path: text(
          "Where the file goes in the folder, such as data/sales.csv."
        ),
        from: text("An absolute path to a CSV or JSON file to copy in."),
        rows: {
          description:
            "CSV text with a header row, JSON text, or an array of row objects (for a .json path).",
          anyOf: [
            { type: "string" },
            { type: "array", items: { type: "object" } },
          ],
        },
        url: text("An http or https address of a CSV or JSON file."),
        source: text("The source ID. Default: from the file's name."),
      },
      required: ["path"],
    },
    annotations: { readOnlyHint: false, openWorldHint: true },
  },
  {
    name: "summarize",
    title: "Summarize a query",
    description:
      "A query's real numbers: rows grouped by a field and measured (count, or sum, average, max, min of a field), largest first, with an optional where filter. Use it to check that a chart shows what you meant, or to cite figures in prose. It reads the query's own fields, not an analysis's calc lines.",
    inputSchema: {
      type: "object",
      properties: {
        query: text("The query's ID, such as order-lines."),
        by: text(
          "A field to group by, such as orders.channel. Omit for one total."
        ),
        measure: text(
          "A field to measure, such as orders.amount. Omit to count rows."
        ),
        aggregation: {
          type: "string",
          enum: ["count", "sum", "average", "max", "min"],
          description: "Default: sum with a measure, count without.",
        },
        where: text(
          'Keep rows where this holds, as "orders.amount > 100" or "orders.channel = Web".'
        ),
        limit: {
          type: "number",
          description: "Most groups to return. Default 20.",
        },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "project",
    title: "Show the project",
    description:
      "The folder at a glance: where its project text is, each source with its file and row count, the queries an analysis can chart, every analysis and notebook with chart and problem counts, the data files, and suggestedLinks: relate lines the data suggests that the project text lacks.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "read_eda",
    title: "Read a file",
    description:
      "Returns an analysis, notebook, or the project text (exploreda.eda), with the version that write_eda, rename_eda, and delete_eda need.",
    inputSchema: {
      type: "object",
      properties: { path: text("Such as orders.eda or exploreda.eda.") },
      required: ["path"],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "rename_eda",
    title: "Rename an analysis",
    description:
      "Moves an analysis or notebook to a free path. Needs the version read_eda gave.",
    inputSchema: {
      type: "object",
      properties: {
        from: text("The file's path now."),
        to: text("The new path, with the same extension."),
        version: text("The version read_eda gave."),
      },
      required: ["from", "to", "version"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: "delete_eda",
    title: "Delete an analysis",
    description:
      "Deletes an analysis or notebook, never the project text. Needs the version read_eda gave.",
    inputSchema: {
      type: "object",
      properties: {
        path: text("The file's path."),
        version: text("The version read_eda gave."),
      },
      required: ["path", "version"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: "format",
    title: "Format text",
    description:
      "Indents by brace depth and tidies spacing, as the app saves it. Send text, or a path to format that file's text. Saves nothing.",
    inputSchema: {
      type: "object",
      properties: {
        path: text("A file to format, or where text would live."),
        text: text("Text to format instead of the file's."),
      },
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "describe",
    title: "Describe what built",
    description:
      "Every view of each analysis and notebook: its query, row count, and chart titles; each chart with the word that starts it and its line; charts that were skipped; and every problem. path limits it to one file.",
    inputSchema: {
      type: "object",
      properties: {
        path: text("One analysis or notebook. Omit for the whole folder."),
      },
    },
    annotations: { readOnlyHint: true },
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

/** add_data's rows: text or an array, or a refusal that says so. */
function rowsArg(rows: unknown) {
  if (rows === undefined || typeof rows === "string" || Array.isArray(rows)) {
    return rows as string | unknown[] | undefined;
  }
  throw new ToolError(
    "rows must be CSV text, JSON text, or an array of row objects."
  );
}

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
  options: ToolOptions,
  onWrite?: (paths: string[]) => void
): Promise<unknown> {
  switch (name) {
    case "project":
      return project(files);
    case "summarize":
      return summarize(files, {
        query: need(args, "query"),
        by: str(args, "by"),
        measure: str(args, "measure"),
        aggregation: str(args, "aggregation"),
        where: str(args, "where"),
        limit: typeof args.limit === "number" ? args.limit : undefined,
      });
    case "add_data": {
      const result = await addData(
        files,
        {
          path: need(args, "path"),
          from: str(args, "from"),
          rows: rowsArg(args.rows),
          url: str(args, "url"),
          source: str(args, "source"),
        },
        options
      );
      onWrite?.([result.saved, result.projectPath]);
      return result;
    }
    case "describe":
      return describe(files, { path: str(args, "path") });
    case "read_eda":
      return readEda(files, { path: need(args, "path") }, options);
    case "format":
      return format(files, {
        path: str(args, "path"),
        text: str(args, "text"),
      });
    case "rename_eda": {
      const result = await renameEda(files, {
        from: need(args, "from"),
        to: need(args, "to"),
        version: str(args, "version"),
      });
      onWrite?.([result.renamed, result.to]);
      return result;
    }
    case "delete_eda": {
      const result = await deleteEda(files, {
        path: need(args, "path"),
        version: str(args, "version"),
      });
      onWrite?.([result.deleted]);
      return result;
    }
    case "fields":
      return fields(files, { query: str(args, "query") });
    case "reference":
      return reference({ topic: str(args, "topic"), brief: true });
    case "check":
      return check(
        files,
        { path: str(args, "path"), text: need(args, "text") },
        options
      );
    case "write_eda": {
      const result = await writeEda(
        files,
        {
          path: need(args, "path"),
          text: need(args, "text"),
          version: str(args, "version"),
        },
        options
      );
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
  /** `--hidden`: a new project keeps its text in `.exploreda/`. */
  hidden?: boolean;
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
          { hidden: context.hidden },
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
