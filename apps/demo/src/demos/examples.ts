import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "exploreda";
import {
  BarChart,
  Gamepad2,
  Globe,
  LineChart,
  LucideIcon,
  Palette,
  ScatterChart,
  Table2,
} from "lucide-react";
import { boxPlotSettings } from "./boxPlotSettings";
import { categoricalChartSettings } from "./categoricalChartSettings";
import { categoricalSmallSettings } from "./categoricalSmallSettings";
import { colorLegendSettings } from "./colorLegendSettings";
import { fifaSettings } from "./fifaSettings";
import { lineChartSettings } from "./lineChartSettings";
import { nbaStatsSettings } from "./nbaStatsSettings";
import { worldBankPopulationSettings } from "./worldBankPopulationSettings";

export interface ExampleData {
  id: string;
  title: string;
  description: string;
  recommended?: boolean;
  icon: LucideIcon;
  data: string; // path to the data file
  savedData: SavedDataStructure;
}

export const examples: ExampleData[] = [
  {
    id: "lorenz-3d",
    title: "Lorenz attractor: coordinated 2D and 3D views",
    description: "Brush one chart to filter every related view.",
    recommended: true,
    icon: ScatterChart,
    data: "/explorEDA/lorenz_3d_small.csv",
    savedData: demoSettings,
  },
  {
    id: "box-plot",
    title: "Box Plot",
    description: "Compare distributions and spot outliers.",
    icon: BarChart,
    data: "/explorEDA/correlated_medium.csv",
    savedData: boxPlotSettings,
  },
  {
    id: "categorical-charts",
    title: "Pivot + Categorical Charts",
    description: "Group categories, then compare their totals.",
    icon: BarChart,
    data: "/explorEDA/categorical_medium.csv",
    savedData: categoricalChartSettings,
  },
  {
    id: "color-legend",
    title: "Color Legend",
    description: "Use a shared color scale across categorical views.",
    icon: Palette,
    data: "/explorEDA/categorical_medium.csv",
    savedData: colorLegendSettings,
  },

  {
    id: "line-chart",
    title: "Line Chart",
    description: "Follow trends across a numeric sequence.",
    icon: LineChart,
    data: "/explorEDA/basic_numbers_medium.csv",
    savedData: lineChartSettings,
  },
  {
    id: "tables",
    title: "Summary Table + Data Table",
    description: "Inspect distributions and browse the source rows.",
    icon: Table2,
    data: "/explorEDA/categorical_small.csv",
    savedData: categoricalSmallSettings,
  },
  {
    id: "fifa",
    title: "Fifa",
    description: "Explore player ratings, roles, and nationalities.",
    icon: Gamepad2,
    data: "/explorEDA/all_fc_24_players.csv",
    savedData: fifaSettings,
  },
  {
    id: "world-bank-population",
    title: "World Bank Population",
    description: "Compare population trends across countries.",
    icon: Globe,
    data: "/explorEDA/world_bank_population.csv",
    savedData: worldBankPopulationSettings,
  },

  {
    id: "nba-stats",
    title: "NBA Stats",
    description: "Compare team and player performance metrics.",
    icon: BarChart,
    data: "/explorEDA/nba_stats.csv",
    savedData: nbaStatsSettings,
  },
];
