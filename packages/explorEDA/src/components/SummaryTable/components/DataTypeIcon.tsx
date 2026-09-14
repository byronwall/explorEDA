import { Calendar, Hash, HelpCircle, ToggleLeft, Type } from "lucide-react";
import { DataType } from "../utils/dataTypeDetection";

interface DataTypeIconProps {
  type: DataType | "unknown";
}

export function DataTypeIcon({ type }: DataTypeIconProps) {
  const iconMap: Record<DataType | "unknown", { icon: typeof Hash }> = {
    numeric: { icon: Hash },
    datetime: { icon: Calendar },
    categorical: { icon: Type },
    boolean: { icon: ToggleLeft },
    unknown: { icon: HelpCircle },
  };

  const { icon: Icon } = iconMap[type];

  return <Icon className="h-4 w-4" />;
}
