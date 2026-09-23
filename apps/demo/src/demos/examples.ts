import {
  penguinDashboard,
  shopDashboard,
  largeShopDashboard,
  calculationDashboard,
  scatterTraceDashboard,
  activityDashboard,
} from "./dashboardSettings";
import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "exploreda";
import {
  BarChart,
  Calculator,
  Bird,
  Gamepad2,
  Globe,
  LineChart,
  LucideIcon,
  Palette,
  ScatterChart,
  ShoppingCart,
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
  dashboard?: boolean;
  icon: LucideIcon;
  data: string; // path to the data file
  savedData?: SavedDataStructure;
}

export const examples: ExampleData[] = [
  {
    id: "scatter-trace",
    title: "Trace a scatter point",
    dashboard: true,
    recommended: true,
    description:
      "Follow a point from raw order values through calculations, filters, scales, color, and final position.",
    icon: ScatterChart,
    data: "/explorEDA/datasets/scatter-trace.csv",
    savedData: scatterTraceDashboard,
  },
  {
    id: "calculated-orders",
    title: "From orders to contribution",
    dashboard: true,
    recommended: true,
    description:
      "14 calculated fields across 10,000 synthetic orders. Inspect chains, preview a rule change, and apply it across linked views.",
    icon: Calculator,
    data: "/explorEDA/datasets/shop-10000.csv",
    savedData: calculationDashboard,
  },
  {
    id: "shop-10000",
    title: "10,000 orders · 15 linked views",
    dashboard: true,
    description:
      "Explore 16 fields across linked charts, tables, and regional facets. Deterministic synthetic orders.",
    icon: ShoppingCart,
    data: "/explorEDA/datasets/shop-10000.csv",
    savedData: largeShopDashboard,
  },
  {
    id: "product-activity",
    title: "90 days of product activity",
    dashboard: true,
    description:
      "Explore a release through traffic, conversion, and response time. Synthetic daily observations.",
    icon: LineChart,
    data: "/explorEDA/datasets/product-activity.csv",
    savedData: activityDashboard,
  },
  {
    id: "palmer-penguins",
    title: "Penguin field notes",
    dashboard: true,
    savedData: penguinDashboard,
    description:
      "Seven linked views of species, body size, bill shape, and island populations.",
    icon: Bird,
    data: "/explorEDA/datasets/palmer-penguins.csv",
  },
  {
    id: "shop-operations",
    title: "Inside the order book",
    dashboard: true,
    savedData: shopDashboard,
    description:
      "Follow orders from revenue and margin to delivery, channels, and individual records.",
    icon: ShoppingCart,
    data: "/explorEDA/datasets/shop-operations.csv",
  },
  {
    id: "lorenz-3d",
    title: "How quickly do nearby Lorenz runs diverge?",
    description: "Inspect a saved 2D brush across coordinated 3D views.",
    recommended: true,
    icon: ScatterChart,
    data: "/explorEDA/lorenz_3d_small.csv",
    savedData: demoSettings,
  },
  {
    id: "box-plot",
    title: "Box Plot with Beeswarm",
    description: "Compare distributions with sampled individual observations.",
    icon: BarChart,
    data: "/explorEDA/correlated_medium.csv",
    savedData: boxPlotSettings,
  },
  {
    id: "categorical-charts",
    title: "What drives categorical product counts?",
    description: "Compare category totals with stock and size facets.",
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
    title: "How does square-root growth slow?",
    description: "Follow one labeled transform across an ordered sequence.",
    icon: LineChart,
    data: "/explorEDA/basic_numbers_medium.csv",
    savedData: lineChartSettings,
  },
  {
    id: "tables",
    title: "Which product rows match a search?",
    description: "Inspect fields, then browse sorted Sports rows.",
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
