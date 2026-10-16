import {
  BookOpen,
  Code,
  Database,
  FolderOpen,
  Users,
  type LucideIcon,
} from "lucide-react";
import { docsPath } from "../docs/paths";

/** One way to run explorEDA, shown on the landing page and the docs home. */
export type Workflow = {
  title: string;
  /** Where it runs, in a few words. */
  where: string;
  body: string;
  /** A command to copy, when the path starts with one. */
  command?: string;
  to: string;
  icon: LucideIcon;
};

export const WORKFLOWS: readonly Workflow[] = [
  {
    title: "Work in a project folder",
    where: "Your computer",
    body: "Turn a folder of CSV and JSON files into a project. Analyses save as text files you can read, diff, and commit.",
    command: "npx exploreda",
    to: `${docsPath("project-folders")}#try-it-with-the-sample-project`,
    icon: FolderOpen,
  },
  {
    title: "Read from a database",
    where: "Your computer or a team server",
    body: "Read SQLite, DuckDB, PostgreSQL, MySQL, or SQL Server into a saved copy. It reads again only when you choose Refresh.",
    to: `${docsPath("database-sources")}#try-it-with-a-sample-database`,
    icon: Database,
  },
  {
    title: "Write a notebook",
    where: "Your computer or a team server",
    body: "Write Markdown with eda blocks between the paragraphs. Editing a chart in the page changes the same file.",
    to: docsPath("notebooks"),
    icon: BookOpen,
  },
  {
    title: "Run a team server",
    where: "Your server, with Docker",
    body: "Authors build analyses and colleagues sign in to explore them. Accounts and projects stay on your server.",
    to: docsPath("team-server"),
    icon: Users,
  },
  {
    title: "Embed it in React",
    where: "Your app",
    body: "Pass your rows as data and store the settings it hands back. Your app owns the data and where it's saved.",
    command: "pnpm add exploreda",
    to: `${docsPath("developers")}#quick-start`,
    icon: Code,
  },
];
