import React from "react";
import { type Expression } from "@/lib/calculations/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationError {
  type: "error" | "warning";
  message: string;
  location?: {
    start: number;
    end: number;
  };
}

interface ValidationPanelProps {
  expression: Expression;
  errors: ValidationError[];
}

export function ValidationPanel({ expression, errors }: ValidationPanelProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2 p-2">
        {errors.map((error, index) => (
          <Alert
            key={index}
            variant={error.type === "error" ? "destructive" : "default"}
          >
            {error.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle className="capitalize">{error.type}</AlertTitle>
            <AlertDescription className="mt-1">
              <p>{error.message}</p>
              {error.location && (
                <pre className="mt-2 text-sm bg-muted p-2 rounded overflow-auto">
                  {expression.expression.slice(0, error.location.start)}
                  <span className="bg-destructive/10 px-1">
                    {expression.expression.slice(
                      error.location.start,
                      error.location.end
                    )}
                  </span>
                  {expression.expression.slice(error.location.end)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </ScrollArea>
  );
}
