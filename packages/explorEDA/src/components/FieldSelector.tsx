import { CalculatedFieldBadge } from "./calculations/CalculatedFieldBadge";
import { Button } from "@/components/ui/button";
import { ComboBox } from "./ComboBox";
import { Label } from "./ui/label";
import { X } from "lucide-react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { FieldMetadata, resolveFieldProfile } from "./FieldMetadata";

interface FieldSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export function FieldSelector({
  label,
  value,
  onChange,
  placeholder = "Select field",
  allowClear = false,
}: FieldSelectorProps) {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const availableFields = getColumnNames();
  const calculations = useDataLayer((state) => state.calculations);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);

  const fieldOptions = availableFields.map((field) => ({
    value: field,
    label: field,
  }));

  const selectedOption = fieldOptions.find((option) => option.value === value);

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={label}>{label}</Label>
          <CalculatedFieldBadge field={value} />
        </div>
        <ComboBox
          value={selectedOption}
          options={fieldOptions}
          onChange={(option) => onChange(option?.value || value)}
          optionToString={(option) => getFieldLabel(option.value)}
          aria-label={label}
          optionToNode={(option) => (
            <span className="flex min-w-0 items-center gap-1">
              {calculations.some(
                (calc) => calc.resultColumnName === option.value
              ) && (
                <span
                  className="eda-calc-symbol mr-2"
                  aria-label="Calculated field"
                >
                  ƒx
                </span>
              )}
              <FieldMetadata
                profile={resolveFieldProfile(
                  option.value,
                  fieldProfiles,
                  getColumnData
                )}
                label={getFieldLabel(option.value)}
                compact
              />
            </span>
          )}
          placeholder={placeholder}
        />
      </div>
      {allowClear && value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Clear ${label}`}
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
