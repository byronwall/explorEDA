import {
  ChartDefinition,
  ChartSettings,
  ChartType,
  ChartSettingsPanelProps,
  BaseChartProps,
} from "@/types/ChartTypes";
import { createElement } from "react";

function isSettingsForType<T extends ChartSettings>(
  settings: ChartSettings,
  type: T["type"]
): settings is T {
  return settings.type === type;
}

function registerable<T extends ChartSettings>(
  definition: ChartDefinition<T>
): ChartDefinition<ChartSettings> {
  const component = (props: BaseChartProps<ChartSettings>) => {
    if (!isSettingsForType<T>(props.settings, definition.type)) {
      return null;
    }
    return createElement(definition.component, {
      ...props,
      settings: props.settings,
    });
  };
  const settingsPanel = (props: ChartSettingsPanelProps<ChartSettings>) => {
    if (!isSettingsForType<T>(props.settings, definition.type)) {
      return null;
    }
    return createElement(definition.settingsPanel, {
      ...props,
      settings: props.settings,
    });
  };

  return {
    ...definition,
    component,
    settingsPanel,
    createDefaultSettings: definition.createDefaultSettings,
    validateSettings: (settings) =>
      isSettingsForType<T>(settings, definition.type) &&
      definition.validateSettings(settings),
    getFilterFunction: (settings, fieldGetter) =>
      isSettingsForType<T>(settings, definition.type)
        ? definition.getFilterFunction(settings, fieldGetter)
        : () => false,
  };
}

export interface ChartRegistry {
  register<TSettings extends ChartSettings>(
    definition: ChartDefinition<TSettings>
  ): void;
  get(type: ChartType): ChartDefinition<ChartSettings> | undefined;
  getAll(): ChartDefinition<ChartSettings>[];
  has(type: ChartType): boolean;
}

export class ChartRegistryImpl implements ChartRegistry {
  private definitions = new Map<ChartType, ChartDefinition<ChartSettings>>();

  register<TSettings extends ChartSettings>(
    definition: ChartDefinition<TSettings>
  ): void {
    if (this.definitions.has(definition.type)) {
      return;
    }
    this.definitions.set(definition.type, registerable(definition));
  }

  get(type: ChartType): ChartDefinition<ChartSettings> | undefined {
    return this.definitions.get(type);
  }

  getAll(): ChartDefinition<ChartSettings>[] {
    return Array.from(this.definitions.values());
  }

  has(type: ChartType): boolean {
    return this.definitions.has(type);
  }
}

// Singleton instance
export const chartRegistry = new ChartRegistryImpl();

// Helper functions
export function registerChart<TSettings extends ChartSettings>(
  definition: ChartDefinition<TSettings>
): void {
  chartRegistry.register(definition);
}

export function getChartDefinition(
  type: ChartType
): ChartDefinition<ChartSettings> {
  const def = chartRegistry.get(type);
  if (!def) {
    throw new Error(`Chart type ${type} not registered`);
  }
  return def;
}

export function useChartDefinition(type: ChartType) {
  const definition = chartRegistry.get(type);

  if (!definition) {
    throw new Error(`Chart type ${type} not registered`);
  }

  return definition;
}
